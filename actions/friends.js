"use server";

import { db } from "@/lib/prisma";
import { requireDbUser } from "@/lib/checkUser";
import { revalidatePath } from "next/cache";

const UPI_REGEX = /^[\w.\-]+@[\w]+$/;

/**
 * Fetch all friends/contacts for the authenticated user
 */
export async function getUserFriends() {
  try {
    const user = await requireDbUser();

    if (!db.friend) {
      throw new Error("Database client updated. Please restart your dev server (Ctrl+C and npm run dev).");
    }

    const friends = await db.friend.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: friends,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new friend contact
 */
export async function createFriend(data) {
  try {
    const user = await requireDbUser();

    if (!db.friend) {
      throw new Error("Database client updated. Please restart your dev server (Ctrl+C and npm run dev).");
    }

    const name = data.name?.trim();
    if (!name) {
      throw new Error("Friend name is required");
    }

    let upiId = data.upiId?.trim() || null;
    if (upiId && !UPI_REGEX.test(upiId)) {
      throw new Error("Invalid UPI ID format (e.g. name@upi)");
    }

    const phone = data.phone?.trim() || null;

    const friend = await db.friend.create({
      data: {
        name,
        upiId,
        phone,
        userId: user.id,
      },
    });

    revalidatePath("/friends");
    revalidatePath("/trips");

    return { success: true, data: friend };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing friend
 */
export async function updateFriend(friendId, data) {
  try {
    const user = await requireDbUser();

    if (!db.friend) {
      throw new Error("Database client updated. Please restart your dev server (Ctrl+C and npm run dev).");
    }

    const existing = await db.friend.findFirst({
      where: { id: friendId, userId: user.id },
    });
    if (!existing) throw new Error("Friend not found");

    const name = data.name?.trim();
    if (!name) throw new Error("Friend name is required");

    let upiId = data.upiId?.trim() || null;
    if (upiId && !UPI_REGEX.test(upiId)) {
      throw new Error("Invalid UPI ID format (e.g. name@upi)");
    }

    const phone = data.phone?.trim() || null;

    const updated = await db.friend.update({
      where: { id: friendId },
      data: {
        name,
        upiId,
        phone,
      },
    });

    revalidatePath("/friends");
    revalidatePath("/trips");

    return { success: true, data: updated };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a friend contact
 */
export async function deleteFriend(friendId) {
  try {
    const user = await requireDbUser();

    if (!db.friend) {
      throw new Error("Database client updated. Please restart your dev server (Ctrl+C and npm run dev).");
    }

    const existing = await db.friend.findFirst({
      where: { id: friendId, userId: user.id },
    });
    if (!existing) throw new Error("Friend not found");

    await db.friend.delete({ where: { id: friendId } });

    revalidatePath("/friends");
    revalidatePath("/trips");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
