"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = obj.balance.toNumber ? obj.balance.toNumber() : parseFloat(obj.balance);
  }
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = obj.amount.toNumber ? obj.amount.toNumber() : parseFloat(obj.amount);
  }
  return serialized;
};

export async function updateDefaultAccount(bankAccountId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    // Unset any existing default accounts for this user
    await db.bankAccount.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Ensure the account exists and belongs to the user
    const existing = await db.bankAccount.findUnique({ where: { id: bankAccountId } });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Account not found");
    }

    const account = await db.bankAccount.update({
      where: { id: bankAccountId },
      data: { isDefault: true },
    });

    revalidatePath("/", "layout");

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateAccount(bankAccountId, data) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    // Verify ownership
    const existing = await db.bankAccount.findUnique({ where: { id: bankAccountId } });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Account not found");
    }

    // If setting as default, unset all other defaults first
    if (data.isDefault) {
      await db.bankAccount.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.bankAccount.update({
      where: { id: bankAccountId },
      data: {
        name: data.name,
        type: data.type,
        isDefault: data.isDefault,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/accounts");
    revalidatePath(`/account/${bankAccountId}`);

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(bankAccountId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    // Verify ownership
    const existing = await db.bankAccount.findUnique({ where: { id: bankAccountId } });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Account not found");
    }

    // Delete account (cascade deletes all linked transactions)
    await db.bankAccount.delete({ where: { id: bankAccountId } });

    // If deleted account was default, auto-assign the next available one
    if (existing.isDefault) {
      const nextAccount = await db.bankAccount.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (nextAccount) {
        await db.bankAccount.update({
          where: { id: nextAccount.id },
          data: { isDefault: true },
        });
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/accounts");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getAccountWithTransaction(bankAccountId) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const user = session.user;

  const account = await db.bankAccount.findFirst({
    where: { id: bankAccountId, userId: user.id },
    include: {
      transactions: {
        orderBy: { date: "desc" },
      },
      _count: {
        select: { transactions: true },
      },
    },
  });

  if (!account) return null;

  return {
    ...serializeTransaction(account),
    transactions: account.transactions.map(serializeTransaction),
  };
}

export async function bulkDeleteTransactions(transactionIds) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const amount = transaction.amount.toNumber();
      const change = transaction.type === "EXPENSE" ? amount : -amount;
      acc[transaction.bankAccountId] = (acc[transaction.bankAccountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a DB transaction
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { id: { in: transactionIds }, userId: user.id },
      });
      for (const [bankAccountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.bankAccount.updateMany({
          where: { id: bankAccountId, userId: user.id },
          data: { balance: { increment: balanceChange } },
        });
      }
    });

    revalidatePath("/", "layout");
    for (const bankAccountId of Object.keys(accountBalanceChanges)) {
      revalidatePath(`/account/${bankAccountId}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
