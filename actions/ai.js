"use server";

import { requireDbUser } from "@/lib/checkUser";
import { db } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { defaultCategories } from "@/data/categories";

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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const user = await requireDbUser();

    const accounts = (await db.account?.findMany({ where: { userId: user.id } })) || [];
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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Analyze this user's current month financial summary and provide 3 short, friendly, actionable insights (max 1-2 sentences each).

      Summary:
      - Total Accounts: ${accounts.length}
      - Total Net Worth: $${accounts.reduce((s, a) => s + a.balance.toNumber(), 0).toFixed(2)}
      - This Month Income: $${income.toFixed(2)}
      - This Month Expenses: $${expense.toFixed(2)}
      - Expenses by Category: ${JSON.stringify(categoryBreakdown)}
      - Active Goals: ${goals.map((g) => `${g.name}: $${g.currentAmount.toNumber()}/$${g.targetAmount.toNumber()}`).join(", ")}

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
    const user = await requireDbUser();

    const accounts = (await db.account?.findMany({ where: { userId: user.id } })) || [];
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
      - Accounts: ${accounts.map((a) => `${a.name} ($${a.balance.toNumber().toFixed(2)})`).join(", ")}
      - Total Net Worth: $${accounts.reduce((s, a) => s + a.balance.toNumber(), 0).toFixed(2)}
      - This Month Income: $${income.toFixed(2)}
      - This Month Expenses: $${expense.toFixed(2)}
      - Active Savings Goals: ${goals.map((g) => `${g.name} (Saved: $${g.currentAmount.toNumber()}/Target: $${g.targetAmount.toNumber()})`).join(", ")}
      - Recent Transactions: ${recentTx.map((t) => `${t.date.toISOString().split("T")[0]}: ${t.description || "Tx"} - $${t.amount.toNumber()} (${t.type})`).join("; ")}
    `;

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      You are Trakex AI — an expert, friendly personal finance advisor. 
      Answer the user's questions clearly, concisely, and accurately based on their real financial context provided below.
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
 * e.g. "Spent 50 dollars on groceries at Walmart"
 */
export async function parseVoiceTransaction(transcript) {
  try {
    if (!transcript || transcript.trim().length < 2) {
      return { success: false, error: "Speech transcript empty" };
    }

    const categoriesList = defaultCategories
      .map((c) => `${c.id} (${c.name}, ${c.type})`)
      .join(", ");

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an AI speech parser for a financial app. Convert this spoken text into structured JSON.
      Spoken text: "${transcript}"

      Available category IDs: ${categoriesList}

      Extract:
      - amount: string number (e.g. "50.00")
      - type: "EXPENSE" or "INCOME" (default "EXPENSE")
      - description: brief description (e.g. "Groceries at Walmart")
      - category: matching category ID from the list (e.g. "groceries")

      Return ONLY a raw JSON object formatted like:
      {"amount": "50.00", "type": "EXPENSE", "description": "Groceries", "category": "groceries"}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return { success: true, data: parsed };
  } catch (error) {
    console.error("parseVoiceTransaction error:", error);
    return { success: false, error: "Failed to parse speech" };
  }
}

