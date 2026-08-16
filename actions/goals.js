"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { serializeGoal } from "@/lib/goal-status";

/**
 * Fetch all goals for the logged in user
 */
export async function getUserGoals() {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { targetDate: "asc" },
      include: {
        _count: {
          select: { contributions: true },
        },
      },
    });

    return {
      success: true,
      data: goals.map((g) => serializeGoal(g)),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Fetch single goal with full contribution history
 */
export async function getGoalDetails(goalId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const goal = await db.goal.findFirst({
      where: { id: goalId, userId: user.id },
      include: {
        contributions: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!goal) return { success: false, error: "Goal not found" };

    return {
      success: true,
      data: serializeGoal(goal),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new goal
 */
export async function createGoal(data) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const targetFloat = parseFloat(data.targetAmount);
    if (isNaN(targetFloat) || targetFloat <= 0) {
      throw new Error("Target amount must be a positive number");
    }

    const goal = await db.goal.create({
      data: {
        name: data.name,
        targetAmount: targetFloat,
        targetDate: new Date(data.targetDate),
        color: data.color || "#10b981",
        userId: user.id,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/goals");

    return { success: true, data: serializeGoal(goal) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing goal
 */
export async function updateGoal(goalId, data) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const existing = await db.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!existing) throw new Error("Goal not found");

    const targetFloat = parseFloat(data.targetAmount);
    if (isNaN(targetFloat) || targetFloat <= 0) {
      throw new Error("Target amount must be a positive number");
    }

    const updatedGoal = await db.goal.update({
      where: { id: goalId },
      data: {
        name: data.name,
        targetAmount: targetFloat,
        targetDate: new Date(data.targetDate),
        color: data.color,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/goals");
    revalidatePath(`/goals/${goalId}`);

    return { success: true, data: serializeGoal(updatedGoal) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a goal (cascades contributions)
 */
export async function deleteGoal(goalId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const existing = await db.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!existing) throw new Error("Goal not found");

    await db.goal.delete({ where: { id: goalId } });

    revalidatePath("/", "layout");
    revalidatePath("/goals");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Add or withdraw funds to a goal with Idempotency Key & Atomic Increment
 */
export async function addContribution(goalId, { amount, idempotencyKey }) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    // 1. Verify goal ownership
    const goal = await db.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!goal) throw new Error("Goal not found");

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      throw new Error("Amount must be a non-zero number");
    }

    const currentTotal = parseFloat(goal.currentAmount);

    // 2. Prevent negative goal balance
    if (numAmount < 0 && currentTotal + numAmount < 0) {
      throw new Error(
        `Cannot withdraw $${Math.abs(numAmount).toFixed(
          2
        )}. Goal balance is only $${currentTotal.toFixed(2)}.`
      );
    }

    // 3. Execute inside an atomic transaction
    try {
      const result = await db.$transaction(async (tx) => {
        // Record contribution
        const contribution = await tx.goalContribution.create({
          data: {
            amount: numAmount,
            idempotencyKey,
            goalId,
            userId: user.id,
          },
        });

        // Atomic update of currentAmount
        const updatedGoal = await tx.goal.update({
          where: { id: goalId },
          data: {
            currentAmount: {
              increment: numAmount,
            },
          },
        });

        return { contribution, updatedGoal };
      });

      revalidatePath("/", "layout");
      revalidatePath("/goals");
      revalidatePath(`/goals/${goalId}`);

      return { success: true, data: serializeGoal(result.updatedGoal) };
    } catch (err) {
      // 4. Catch idempotency unique constraint error (P2002)
      if (err.code === "P2002" || err.message?.includes("idempotencyKey")) {
        console.warn("Idempotency key duplicate caught. Returning existing state.");
        const currentGoalState = await db.goal.findUnique({ where: { id: goalId } });
        return { success: true, data: serializeGoal(currentGoalState) };
      }
      throw err;
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a specific contribution and adjust goal amount atomically
 */
export async function deleteContribution(contributionId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const contribution = await db.goalContribution.findFirst({
      where: { id: contributionId, userId: user.id },
    });
    if (!contribution) throw new Error("Contribution not found");

    const amountNum = parseFloat(contribution.amount);

    await db.$transaction(async (tx) => {
      await tx.goalContribution.delete({ where: { id: contributionId } });
      await tx.goal.update({
        where: { id: contribution.goalId },
        data: {
          currentAmount: {
            decrement: amountNum,
          },
        },
      });
    });

    revalidatePath("/", "layout");
    revalidatePath("/goals");
    revalidatePath(`/goals/${contribution.goalId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
