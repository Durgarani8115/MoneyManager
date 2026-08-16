"use server";

import aj from "@/lib/arcjet";
import { auth } from "@/auth";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";

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

export async function getUserAccounts() {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const accounts = await db.bankAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
    });

    // Serialize accounts before sending to client
    const serializedAccounts = accounts.map(serializeTransaction);

    return serializedAccounts;
  } catch (error) {
    unstable_rethrow(error);
    console.error("getUserAccounts failed:", error);
    return [];
  }
}

export async function createAccount(data) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId: user.id,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    // Convert balance to float before saving
    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) {
      throw new Error("Invalid balance amount");
    }

    // Check if this is the user's first account
    const existingAccounts = await db.bankAccount.findMany({
      where: { userId: user.id },
    });

    // If it's the first account, make it default regardless of user input
    // If not, use the user's preference
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : data.isDefault;

    // If this account should be default, unset other default accounts
    if (shouldBeDefault) {
      await db.bankAccount.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create new account
    const account = await db.bankAccount.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault, // Override the isDefault based on our logic
      },
    });

    // Serialize the account before returning
    const serializedAccount = serializeTransaction(account);

    revalidatePath("/", "layout");
    return { success: true, data: serializedAccount };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getDashboardData(bankAccountId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    // Get all user transactions, optionally filtered by accountId
    const where = { userId: user.id };
    if (bankAccountId) {
      where.bankAccountId = bankAccountId;
    }

    const transactions = await db.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
  } catch (error) {
    unstable_rethrow(error);
    console.error("getDashboardData failed:", error);
    return [];
  }
}
