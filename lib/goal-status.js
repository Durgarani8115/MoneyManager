import { startOfDay } from "date-fns";

/**
 * Deterministic Goal Status calculation:
 * 1. COMPLETED: currentAmount >= targetAmount
 * 2. OVERDUE: today (startOfDay) > targetDate AND currentAmount < targetAmount
 * 3. ACTIVE: otherwise
 */
export function calculateGoalStatus(currentAmount, targetAmount, targetDate) {
  const current = typeof currentAmount === "number" ? currentAmount : parseFloat(currentAmount);
  const target = typeof targetAmount === "number" ? targetAmount : parseFloat(targetAmount);

  if (current >= target) {
    return "COMPLETED";
  }

  const today = startOfDay(new Date());
  const targetDay = startOfDay(new Date(targetDate));

  if (today > targetDay) {
    return "OVERDUE";
  }

  return "ACTIVE";
}

/**
 * Safely serializes goal object for Next.js Server Action boundary
 */
export function serializeGoal(goal) {
  if (!goal) return null;
  const currentAmount = parseFloat(goal.currentAmount);
  const targetAmount = parseFloat(goal.targetAmount);
  const status = calculateGoalStatus(currentAmount, targetAmount, goal.targetDate);

  return {
    ...goal,
    targetAmount,
    currentAmount,
    status,
    targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString() : null,
    createdAt: goal.createdAt ? new Date(goal.createdAt).toISOString() : null,
    updatedAt: goal.updatedAt ? new Date(goal.updatedAt).toISOString() : null,
    contributions: goal.contributions
      ? goal.contributions.map((c) => ({
          ...c,
          amount: parseFloat(c.amount),
          createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : null,
        }))
      : [],
  };
}
