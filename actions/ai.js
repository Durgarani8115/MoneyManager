"use server";

import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defaultCategories } from "@/data/categories";
import { convertVoiceAmountToInr } from "@/lib/voice-currency";
import { parseVoiceTransactionFallback } from "@/lib/voice-transaction-fallback";

let voiceQuotaRetryAt = 0;

function rememberVoiceQuotaDelay(error) {
  const details = Array.isArray(error.errorDetails) ? error.errorDetails : [];
  const retryInfo = details.find(
    (detail) => detail?.["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
  );
  const delay = retryInfo?.retryDelay;
  const seconds = /^\d+(?:\.\d+)?s$/.test(delay) ? Number.parseFloat(delay) : 15;
  const retryAt = Date.now() + Math.max(1, Math.min(seconds, 86400)) * 1000;
  voiceQuotaRetryAt = Math.max(voiceQuotaRetryAt, retryAt);
}

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not configured in environment variables");
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Predict category based on transaction description
 */
export async function predictCategory(description) {
  try {
    if (!description || description.trim().length < 2) {
      return { success: false, error: "Description too short" };
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const categoriesList = defaultCategories
      .filter((c) => c.type === "EXPENSE")
      .map((c) => `${c.id} (${c.name})`)
      .join(", ");

    const prompt = `
      You are an AI financial assistant. Given a transaction description, predict the most appropriate category ID.
      Available expense category IDs: ${categoriesList}.
      Description: "${description}"

      Return ONLY a raw JSON object with a single key "category" containing the matching category ID from the list provided.
      Example format: {"category": "food"}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const matchingCat = defaultCategories.find((c) => c.id === parsed.category);

    return {
      success: true,
      category: matchingCat ? matchingCat.id : "other-expense",
      categoryName: matchingCat ? matchingCat.name : "Other Expenses",
    };
  } catch (error) {
    console.error("predictCategory error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate 3 human-readable financial insights for the Dashboard
 */
export async function getDashboardAIInsights() {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const accounts = (await db.bankAccount?.findMany({ where: { userId: user.id } })) || [];
    const goals = db.goal ? await db.goal.findMany({ where: { userId: user.id } }) : [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startOfMonth },
      },
    });

    const income = thisMonthTransactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const expense = thisMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const categoryBreakdown = thisMonthTransactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount.toNumber();
        return acc;
      }, {});

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Analyze this user's current month financial summary and provide 3 short, friendly, actionable insights (max 1-2 sentences each).
      All monetary values in this summary are in INR. Use the ₹ symbol when displaying them.

      Summary:
      - Total Accounts: ${accounts.length}
      - Total Net Worth: ₹${accounts.reduce((s, a) => s + a.balance.toNumber(), 0).toFixed(2)}
      - This Month Income: ₹${income.toFixed(2)}
      - This Month Expenses: ₹${expense.toFixed(2)}
      - Expenses by Category: ${JSON.stringify(categoryBreakdown)}
      - Active Goals: ${goals.map((g) => `${g.name}: ₹${g.currentAmount.toNumber()}/₹${g.targetAmount.toNumber()}`).join(", ")}

      Return ONLY a raw JSON array of 3 strings e.g. ["Insight 1", "Insight 2", "Insight 3"].
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    const insights = JSON.parse(cleaned);

    return { success: true, data: insights };
  } catch (error) {
    console.error("getDashboardAIInsights error:", error);
    return {
      success: true,
      data: [
        "Tracking your expenses daily is the best way to reach your savings goals faster.",
        "Check your Analytics page to review your 6-month cashflow trends and category limits.",
        "Your active financial goals are set up — contribute regularly to stay on track!",
      ],
    };
  }
}

/**
 * Natural language chat with AI Financial Advisor
 */
export async function chatWithAIAdvisor(messages) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const accounts = (await db.bankAccount?.findMany({ where: { userId: user.id } })) || [];
    const goals = db.goal ? await db.goal.findMany({ where: { userId: user.id } }) : [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const recentTx = await db.transaction.findMany({
      where: { userId: user.id, date: { gte: startOfMonth } },
      orderBy: { date: "desc" },
      take: 20,
    });

    const income = recentTx
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const expense = recentTx
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const context = `
      User Context:
      - Name: ${user.name || "User"}
      - Accounts: ${accounts.map((a) => `${a.name} (₹${a.balance.toNumber().toFixed(2)})`).join(", ")}
      - Total Net Worth: ₹${accounts.reduce((s, a) => s + a.balance.toNumber(), 0).toFixed(2)}
      - This Month Income: ₹${income.toFixed(2)}
      - This Month Expenses: ₹${expense.toFixed(2)}
      - Active Savings Goals: ${goals.map((g) => `${g.name} (Saved: ₹${g.currentAmount.toNumber()}/Target: ₹${g.targetAmount.toNumber()})`).join(", ")}
      - Recent Transactions: ${recentTx.map((t) => `${t.date.toISOString().split("T")[0]}: ${t.description || "Tx"} - ₹${t.amount.toNumber()} (${t.type})`).join("; ")}
    `;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      You are Trakex AI — an expert, friendly personal finance advisor. 
      Answer the user's questions clearly, concisely, and accurately based on their real financial context provided below.
      The amounts in the financial context are in INR. Use the ₹ symbol when displaying these values.
      Keep responses brief (max 2-3 short paragraphs).

      ${context}
    `;

    const formattedHistory = messages
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${systemPrompt}\n\nConversation History:\n${formattedHistory}\n\nAssistant:`;

    const result = await model.generateContent(fullPrompt);
    const reply = result.response.text();

    return { success: true, reply };
  } catch (error) {
    console.error("chatWithAIAdvisor error:", error);
    return {
      success: false,
      error: "I'm having trouble connecting right now. Please try asking again in a moment.",
    };
  }
}

/**
 * Parse spoken transcript into structured transaction data using Gemini AI
 * e.g. "Spent 450 on groceries" or "Spent 20 US dollars on a book"
 */
export async function parseVoiceTransaction(transcript) {
  try {
    if (typeof transcript !== "string" || !transcript.trim()) {
      return { success: false, error: "Speech transcript empty" };
    }

    let parsed;
    let aiStatus = 429;
    if (Date.now() >= voiceQuotaRetryAt) {
      try {
        parsed = await parseVoiceWithGemini(transcript);
      } catch (error) {
        aiStatus = error?.status;
        if (aiStatus === 429) {
          rememberVoiceQuotaDelay(error);
        } else if (![500, 502, 503, 504].includes(aiStatus)) {
          throw error;
        }
      }
    }

    if (parsed === undefined) {
      parsed = parseVoiceTransactionFallback(transcript);
      if (!parsed) {
        const quotaExceeded = aiStatus === 429;
        const reason = quotaExceeded ? "Gemini’s request limit was reached." : "Gemini is temporarily unavailable.";
        return {
          success: false,
          code: quotaExceeded ? "VOICE_AI_QUOTA" : "VOICE_AI_UNAVAILABLE",
          error: `${reason} Try a simple phrase like “Spent 450 on groceries” or enter the details manually.`,
        };
      }
    }

    const currency = typeof parsed?.currency === "string" ? parsed.currency.trim().toUpperCase() : "";
    const originalAmount = String(parsed?.amount ?? "").trim();
    if (!/^[A-Z]{3}$/.test(currency)) {
      return {
        success: false,
        code: "CURRENCY_CONVERSION_FAILED",
        error: "Say the full currency name or code, such as US dollars or USD.",
      };
    }
    if (
      !/^\d+(?:\.\d+)?$/.test(originalAmount) ||
      !Number.isFinite(Number(originalAmount)) ||
      Number(originalAmount) <= 0
    ) {
      return {
        success: false,
        ...(currency === "INR" ? {} : { code: "CURRENCY_CONVERSION_FAILED" }),
        error: "Say a positive amount for the transaction.",
      };
    }

    const { type, description, category } = parsed;
    const amountOnly = parsed.amountOnly === true;
    if (currency === "INR") {
      return {
        success: true,
        data: { amount: originalAmount, type, description, category, amountOnly, conversion: null },
      };
    }

    const converted = await convertVoiceAmountToInr(originalAmount, currency);
    if (converted.error) {
      return { success: false, code: "CURRENCY_CONVERSION_FAILED", error: converted.error };
    }

    return { success: true, data: { ...converted, type, description, category, amountOnly } };
  } catch (error) {
    console.error("Voice transaction parsing failed", { name: error?.name, status: error?.status });
    return { success: false, error: "Failed to parse speech" };
  }
}

async function parseVoiceWithGemini(transcript) {
  const categoriesList = defaultCategories
    .map((category) => `${category.id} (${category.name}, ${category.type})`)
    .join(", ");
  const genAI = getGenAI();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are an AI speech parser for a financial app. Convert this spoken text into structured JSON.
    Spoken text: ${JSON.stringify(transcript)}

    Available category IDs: ${categoriesList}

    Extract:
    - amount: the stated total paid or received, or the value explicitly labeled "Amount". Write it as a decimal string without currency symbols or grouping separators (e.g. "450.00"). Return JSON null if the amount is missing or ambiguous. Never infer an amount or convert a currency.
    - currency: the three-letter ISO 4217 code for the currency of that amount. Default to "INR" if the amount has no currency or uses Indian rupees. Preserve any explicitly stated foreign currency, for example USD, EUR, GBP, AED, or JPY. Interpret unqualified dollars or $ as USD and unqualified pounds or £ as GBP. Honor specific qualifiers such as Australian dollars (AUD) and Canadian dollars (CAD). Return JSON null if an explicit currency is ambiguous or has no ISO 4217 currency code. A merchant or location alone does not specify a currency.
    - amountOnly: true if the text only specifies an amount (in digits or number words, with optional currency), or starts with "Amount:". Otherwise false. Examples of amount-only text: "four hundred and fifty", "10 dollars", "Amount: 12.50".
    - type: "EXPENSE" or "INCOME" (default "EXPENSE")
    - description: brief description (e.g. "Groceries at Walmart")
    - category: matching category ID from the list (e.g. "groceries")

    Return ONLY a raw JSON object formatted like:
    {"amount": "450.00", "currency": "INR", "amountOnly": false, "type": "EXPENSE", "description": "Groceries", "category": "groceries"}
  `;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return JSON.parse(text.replace(/```(?:json)?\n?/g, "").trim());
}

