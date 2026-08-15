"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { requireDbUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";

export async function getCurrentBudget(accountId) {
  try {
    const user = await requireDbUser();

    const budget = await db.budget.findFirst({
      where: {
        userId: user.id,
      },
    });

    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );

    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59
    );

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
        ...(accountId ? { accountId } : {}),
      },
      _sum: {
        amount: true,
      },
    });

    return {
      budget: budget ? { ...budget, amount: budget.amount.toNumber() } : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    unstable_rethrow(error);
    throw new Error(error.message);
  }
}

export async function updateBudget(amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await requireDbUser();

    const budget = await db.budget.upsert({
      where: {
        userId: user.id,
      },
      update: {
        amount,
      },
      create: {
        userId: user.id,
        amount,
      },
    });

    revalidatePath("/", "layout");

    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all category budget limits and calculate current month expenses dynamically
 */
export async function getCategoryBudgets() {
  try {
    const user = await requireDbUser();

    // 1. Fetch saved limits
    const categoryBudgets = await db.categoryBudget.findMany({
      where: { userId: user.id },
    });

    // 2. Calculate current month start and end
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 3. Fetch expenses by category for current month across all accounts
    const currentMonthExpenses = await db.transaction.groupBy({
      by: ["category"],
      where: {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Create a map of category -> spent amount
    const spentMap = currentMonthExpenses.reduce((acc, curr) => {
      acc[curr.category] = curr._sum.amount ? curr._sum.amount.toNumber() : 0;
      return acc;
    }, {});

    // Combine limits with spent amounts
    const result = categoryBudgets.map((cb) => ({
      id: cb.id,
      category: cb.category,
      limit: cb.amount.toNumber(),
      spent: spentMap[cb.category] || 0,
    }));

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Set or update a category budget limit
 */
export async function setCategoryBudget(category, amount) {
  try {
    const user = await requireDbUser();
    const limitNum = parseFloat(amount);

    if (isNaN(limitNum) || limitNum <= 0) {
      throw new Error("Budget limit must be a positive number");
    }

    const categoryBudget = await db.categoryBudget.upsert({
      where: {
        userId_category: {
          userId: user.id,
          category,
        },
      },
      update: {
        amount: limitNum,
      },
      create: {
        userId: user.id,
        category,
        amount: limitNum,
      },
    });

    revalidatePath("/analytics");

    return {
      success: true,
      data: { ...categoryBudget, amount: categoryBudget.amount.toNumber() },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a category budget limit
 */
export async function deleteCategoryBudget(category) {
  try {
    const user = await requireDbUser();

    await db.categoryBudget.deleteMany({
      where: {
        userId: user.id,
        category,
      },
    });

    revalidatePath("/analytics");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
