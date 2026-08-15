"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { requireDbUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = parseFloat(obj.balance);
  }
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = parseFloat(obj.amount);
  }
  return serialized;
};

export async function updateDefaultAccount(accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await requireDbUser();

    // Unset any existing default accounts for this user
    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    // Ensure the account exists and belongs to the user
    const existing = await db.account.findUnique({ where: { id: accountId } });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Account not found");
    }

    const account = await db.account.update({
      where: { id: accountId },
      data: { isDefault: true },
    });

    revalidatePath("/", "layout");

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateAccount(accountId, data) {
  try {
    const user = await requireDbUser();

    // Verify ownership
    const existing = await db.account.findUnique({ where: { id: accountId } });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Account not found");
    }

    // If setting as default, unset all other defaults first
    if (data.isDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.update({
      where: { id: accountId },
      data: {
        name: data.name,
        type: data.type,
        isDefault: data.isDefault,
      },
    });

    revalidatePath("/", "layout");
    revalidatePath("/accounts");
    revalidatePath(`/account/${accountId}`);

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteAccount(accountId) {
  try {
    const user = await requireDbUser();

    // Verify ownership
    const existing = await db.account.findUnique({ where: { id: accountId } });
    if (!existing || existing.userId !== user.id) {
      throw new Error("Account not found");
    }

    // Delete account (cascade deletes all linked transactions)
    await db.account.delete({ where: { id: accountId } });

    // If deleted account was default, auto-assign the next available one
    if (existing.isDefault) {
      const nextAccount = await db.account.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "asc" },
      });
      if (nextAccount) {
        await db.account.update({
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

export async function getAccountWithTransaction(accountId) {
  const user = await requireDbUser();

  const account = await db.account.findFirst({
    where: { id: accountId, userId: user.id },
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
    const user = await requireDbUser();

    const transactions = await db.transaction.findMany({
      where: {
        id: { in: transactionIds },
        userId: user.id,
      },
    });

    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const amount = transaction.amount.toNumber();
      const change = transaction.type === "EXPENSE" ? amount : -amount;
      acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
      return acc;
    }, {});

    // Delete transactions and update account balances in a DB transaction
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { id: { in: transactionIds }, userId: user.id },
      });
      for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
        await tx.account.updateMany({
          where: { id: accountId, userId: user.id },
          data: { balance: { increment: balanceChange } },
        });
      }
    });

    revalidatePath("/", "layout");
    for (const accountId of Object.keys(accountBalanceChanges)) {
      revalidatePath(`/account/${accountId}`);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
