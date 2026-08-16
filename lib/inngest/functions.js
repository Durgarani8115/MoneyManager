import { inngest } from "./client";
import { db } from "@/lib/prisma";
import EmailTemplate from "@/emails/template";
import { sendEmail } from "@/actions/send-email";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { addDays, addWeeks, addMonths, addYears, isBefore, isToday } from "date-fns";

/**
 * 1. Process individual recurring transaction safely in a Prisma Transaction
 */
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    triggers: [{ event: "transaction.recurring.process" }],
    throttle: {
      limit: 10, // Process 10 transactions
      period: "1m", // per minute
      key: "event.data.userId", // Throttle per user
    },
  },
  async ({ event, step }) => {
    // Validate event data
    if (!event?.data?.transactionId || !event?.data?.userId) {
      console.error("Invalid event data:", event);
      return { error: "Missing required event data" };
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findFirst({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: {
          bankAccount: true,
        },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      // Create new transaction copy & update account balance atomically
      await db.$transaction(async (tx) => {
        // Create new transaction entry
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: `${transaction.description || "Recurring"} (Auto)`,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            bankAccountId: transaction.bankAccountId,
            isRecurring: false, // process copy as standard completed transaction
            status: "COMPLETED",
          },
        });

        // Update account balance
        const balanceChange =
          transaction.type === "EXPENSE"
            ? -transaction.amount.toNumber()
            : transaction.amount.toNumber();

        await tx.bankAccount.update({
          where: { id: transaction.bankAccountId },
          data: { balance: { increment: balanceChange } },
        });

        // Update last processed date and next recurring date safely
        const nextDate = calculateNextRecurringDate(
          new Date(),
          transaction.recurringInterval
        );

        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: nextDate,
          },
        });
      });
    });
  }
);

/**
 * Trigger batch processing of all due recurring transactions (Runs daily at midnight UTC)
 */
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
    triggers: [{ cron: "0 0 * * *" }],
  },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              {
                nextRecurringDate: {
                  lte: new Date(),
                },
              },
            ],
          },
        });
      }
    );

    // Send event for each due recurring transaction
    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));

      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

/**
 * 2. Monthly Financial Insights & Report Email (Runs 1st of every month at midnight UTC)
 */
async function generateFinancialInsights(stats, month) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return [
        "Track your recurring expenses regularly to spot easy savings.",
        "Consider setting up category budgets to control monthly spending.",
        "Review your highest expense categories at the start of each month.",
      ];
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Analyze this financial data and provide 3 concise, actionable insights.
      Focus on spending patterns and practical advice. Keep it friendly and encouraging.

      Financial Data for ${month}:
      - Total Income: $${stats.totalIncome}
      - Total Expenses: $${stats.totalExpenses}
      - Net Income: $${stats.totalIncome - stats.totalExpenses}
      - Expense Categories: ${Object.entries(stats.byCategory)
        .map(([category, amount]) => `${category}: $${amount}`)
        .join(", ")}

      Format the response strictly as a JSON array of 3 strings e.g. ["insight 1", "insight 2", "insight 3"].
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating AI insights:", error);
    return [
      "Your highest expense category this month might need attention.",
      "Consider setting up a category budget for better spending control.",
      "Track your recurring subscriptions to identify unused services.",
    ];
  }
}

export const generateMonthlyReports = inngest.createFunction(
  {
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
    triggers: [{ cron: "0 0 1 * *" }],
  },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      return await db.user.findMany({
        include: { bankAccounts: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        const stats = await getMonthlyStats(user.id, lastMonth);
        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
        });

        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Trakex Monthly Report - ${monthName}`,
          react: EmailTemplate({
            userName: user.name || "User",
            type: "monthly-report",
            data: {
              stats,
              month: monthName,
              insights,
            },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);

/**
 * 3. Budget Alert Check (Runs every 6 hours)
 */
export const checkBudgetAlerts = inngest.createFunction(
  {
    id: "check-budget-alerts",
    name: "Check Budget Alerts",
    triggers: [{ cron: "0 */6 * * *" }],
  },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              bankAccounts: {
                where: {
                  isDefault: true,
                },
              },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      const defaultAccount = budget.user.bankAccounts[0];
      if (!defaultAccount) continue;

      await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1);

        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            bankAccountId: defaultAccount.id,
            type: "EXPENSE",
            date: {
              gte: startDate,
            },
          },
          _sum: {
            amount: true,
          },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount = budget.amount.toNumber();
        const percentageUsed = (totalExpenses / budgetAmount) * 100;

        if (
          percentageUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), new Date()))
        ) {
          await sendEmail({
            to: budget.user.email,
            subject: `Trakex Budget Alert: ${percentageUsed.toFixed(0)}% Used`,
            react: EmailTemplate({
              userName: budget.user.name || "User",
              type: "budget-alert",
              data: {
                percentageUsed,
                budgetAmount: budgetAmount.toFixed(2),
                totalExpenses: totalExpenses.toFixed(2),
                accountName: defaultAccount.name,
              },
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: new Date() },
          });
        }
      });
    }
  }
);

// ── Utility Helpers ──

function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  const today = new Date();
  const nextDue = new Date(transaction.nextRecurringDate);
  return isBefore(nextDue, today) || isToday(nextDue);
}

function calculateNextRecurringDate(date, interval) {
  const base = new Date(date);
  switch (interval) {
    case "DAILY":
      return addDays(base, 1);
    case "WEEKLY":
      return addWeeks(base, 1);
    case "MONTHLY":
      return addMonths(base, 1);
    case "YEARLY":
      return addYears(base, 1);
    default:
      return addMonths(base, 1);
  }
}

function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

  const transactions = await db.transaction.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();
      if (t.type === "EXPENSE") {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] || 0) + amount;
      } else {
        stats.totalIncome += amount;
      }
      return stats;
    },
    {
      totalExpenses: 0,
      totalIncome: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}
