import { redirect, unstable_rethrow } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { buildTransactionForecast } from "@/lib/transaction-forecast";
import { ActivityNavigation, resolveActivityAccountId } from "@/components/activity-navigation";
import { Card, CardContent } from "@/components/ui/card";
import { FutureInsights } from "./_components/future-insights";

export const dynamic = "force-dynamic";

const forecastPeriods = ["week", "month", "year"];

export default async function FutureInsightsPage({ searchParams }) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const period = forecastPeriods.includes(params?.period) ? params.period : "month";

  try {
    const accounts = await db.bankAccount.findMany({
      where: { userId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    const accountId = resolveActivityAccountId(params?.account, accounts);
    const now = new Date();
    const historyStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 26, 1));
    const transactions = accounts.length === 0 ? [] : await db.transaction.findMany({
      where: {
        userId,
        ...(accountId === "all" ? {} : { bankAccountId: accountId }),
        type: { in: ["EXPENSE", "INCOME"] },
        status: "COMPLETED",
        OR: [{ isRecurring: true }, { date: { gte: historyStart, lte: now } }],
      },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        date: true,
        description: true,
        category: true,
        bankAccountId: true,
        isRecurring: true,
        recurringInterval: true,
        nextRecurringDate: true,
      },
      orderBy: { date: "desc" },
    });
    const forecast = buildTransactionForecast({ transactions, accountId, period, now });

    return (
      <div className="space-y-6">
        <header className="border-b pb-2">
          <h1 className="gradient-title text-2xl font-extrabold tracking-tight">Future Insights</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            See expected income and expenses based on recurring transactions and your history.
          </p>
        </header>
        <ActivityNavigation current="future-insights" accountId={accountId} />
        <FutureInsights accounts={accounts} accountId={accountId} period={period} forecast={forecast} />
      </div>
    );
  } catch (error) {
    unstable_rethrow(error);
    console.error("Future Insights failed to load:", error);
    return (
      <div className="space-y-6">
        <h1 className="gradient-title text-2xl font-extrabold tracking-tight">Future Insights</h1>
        <ActivityNavigation current="future-insights" />
        <Card>
          <CardContent className="py-6 text-sm text-muted-foreground">
            Could not load the forecast. Refresh the page to try again.
          </CardContent>
        </Card>
      </div>
    );
  }
}
