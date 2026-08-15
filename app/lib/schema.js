import { z } from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1, "Initial balance is required"),
  isDefault: z.boolean().default(false),
});

export const editAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z
  .object({
    type: z.enum(["EXPENSE", "INCOME"]),
    amount: z.string().min(1, "Amount is required"),
    description: z.string().optional(),
    date: z.date({ required_error: "Date is required" }),
    accountId: z.string().min(1, "Account is required"),
    category: z.string().min(1, "Category is required"),
    isRecurring: z.boolean().default(false),
    recurringInterval: z
      .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isRecurring && !data.recurringInterval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Recurring interval is required if transaction is recurring",
        path: ["recurringInterval"],
      });
    }
  });

export const goalSchema = z
  .object({
    name: z.string().min(1, "Goal name is required"),
    targetAmount: z.string().min(1, "Target amount is required"),
    targetDate: z.date({ required_error: "Target date is required" }),
    color: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (data.targetDate && data.targetDate < today) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Target date must be in the future",
        path: ["targetDate"],
      });
    }
  });

export const editGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required"),
  targetAmount: z.string().min(1, "Target amount is required"),
  targetDate: z.date({ required_error: "Target date is required" }),
  color: z.string().optional(),
});

export const contributionSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  idempotencyKey: z.string().min(1, "Idempotency key required"),
});
