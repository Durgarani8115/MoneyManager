"use server";

import { db } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

function serializePlace(p) {
  if (!p) return null;
  return {
    ...p,
    estimatedCost: parseFloat(p.estimatedCost || 0),
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : null,
  };
}

function serializeSplit(s) {
  if (!s) return null;
  return {
    ...s,
    amount: parseFloat(s.amount),
    createdAt: s.createdAt ? new Date(s.createdAt).toISOString() : null,
    settledAt: s.settledAt ? new Date(s.settledAt).toISOString() : null,
  };
}

function serializeExpense(e) {
  if (!e) return null;
  return {
    ...e,
    amount: parseFloat(e.amount),
    createdAt: e.createdAt ? new Date(e.createdAt).toISOString() : null,
    splits: e.splits ? e.splits.map((s) => serializeSplit(s)) : [],
  };
}

function serializeTrip(trip) {
  if (!trip) return null;
  const budget = parseFloat(trip.budget);

  const places = trip.places
    ? trip.places.map((p) => serializePlace(p))
    : [];

  const expenses = trip.expenses
    ? trip.expenses.map((e) => serializeExpense(e))
    : [];

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    ...trip,
    budget,
    totalSpent,
    places,
    expenses,
    startDate: trip.startDate ? new Date(trip.startDate).toISOString() : null,
    endDate: trip.endDate ? new Date(trip.endDate).toISOString() : null,
    createdAt: trip.createdAt ? new Date(trip.createdAt).toISOString() : null,
    updatedAt: trip.updatedAt ? new Date(trip.updatedAt).toISOString() : null,
  };
}

/**
 * Fetch all trips for the authenticated user
 */
export async function getUserTrips() {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const trips = await db.trip.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        places: true,
        expenses: {
          include: {
            splits: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    return {
      success: true,
      data: trips.map((t) => serializeTrip(t)),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get detailed trip by ID
 */
export async function getTripDetails(tripId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const trip = await db.trip.findFirst({
      where: { id: tripId, userId: user.id },
      include: {
        places: { orderBy: { createdAt: "asc" } },
        expenses: {
          include: { splits: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!trip) return { success: false, error: "Trip not found" };

    return {
      success: true,
      data: serializeTrip(trip),
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new trip
 */
export async function createTrip(data) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    if (!db.trip) {
      throw new Error("Database client is updating. Please restart your dev server (npm run dev).");
    }

    const budgetFloat = parseFloat(data.budget);
    if (isNaN(budgetFloat) || budgetFloat <= 0) {
      throw new Error("Budget must be a positive number");
    }

    const trip = await db.trip.create({
      data: {
        name: data.name,
        destination: data.destination,
        budget: budgetFloat,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        userId: user.id,
      },
      include: {
        places: true,
        expenses: {
          include: { splits: true },
        },
      },
    });

    revalidatePath("/trips");

    return { success: true, data: serializeTrip(trip) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a trip
 */
export async function deleteTrip(tripId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const existing = await db.trip.findFirst({
      where: { id: tripId, userId: user.id },
    });
    if (!existing) throw new Error("Trip not found");

    await db.trip.delete({ where: { id: tripId } });

    revalidatePath("/trips");

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Add a place to visit
 */
export async function addTripPlace(tripId, data) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const trip = await db.trip.findFirst({
      where: { id: tripId, userId: user.id },
    });
    if (!trip) throw new Error("Trip not found");

    const place = await db.tripPlace.create({
      data: {
        name: data.name,
        estimatedCost: parseFloat(data.estimatedCost || 0),
        tripId,
      },
    });

    revalidatePath(`/trips/${tripId}`);

    return { success: true, data: serializePlace(place) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Toggle place visited checkmark
 */
export async function togglePlaceVisited(placeId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const place = await db.tripPlace.findUnique({
      where: { id: placeId },
      include: { trip: true },
    });
    if (!place || place.trip.userId !== user.id) {
      throw new Error("Place not found");
    }

    const updated = await db.tripPlace.update({
      where: { id: placeId },
      data: { visited: !place.visited },
    });

    revalidatePath(`/trips/${place.tripId}`);

    return { success: true, data: serializePlace(updated) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete place to visit
 */
export async function deleteTripPlace(placeId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const place = await db.tripPlace.findUnique({
      where: { id: placeId },
      include: { trip: true },
    });
    if (!place || place.trip.userId !== user.id) {
      throw new Error("Place not found");
    }

    await db.tripPlace.delete({ where: { id: placeId } });

    revalidatePath(`/trips/${place.tripId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Add a trip expense with optional equal splitting across participants
 */
export async function addTripExpense(tripId, data) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const trip = await db.trip.findFirst({
      where: { id: tripId, userId: user.id },
    });
    if (!trip) throw new Error("Trip not found");

    const amountFloat = parseFloat(data.amount);
    if (isNaN(amountFloat) || amountFloat <= 0) {
      throw new Error("Amount must be a positive number");
    }

    const splitType = data.splitType === "EQUAL" ? "EQUAL" : "NONE";
    const participants = Array.isArray(data.participants) ? data.participants : [];

    if (splitType === "EQUAL" && participants.length === 0) {
      throw new Error("Please select at least 1 participant to split with");
    }

    const expense = await db.$transaction(async (tx) => {
      const createdExpense = await tx.tripExpense.create({
        data: {
          title: data.title,
          amount: amountFloat,
          paidBy: data.paidBy || "Me",
          category: data.category || "other-expense",
          splitType,
          splitCount: splitType === "EQUAL" ? participants.length : null,
          tripId,
        },
      });

      if (splitType === "EQUAL" && participants.length > 0) {
        // Integer math in paise to prevent rounding errors
        const totalCents = Math.round(amountFloat * 100);
        const count = participants.length;
        const baseCents = Math.floor(totalCents / count);
        const remainderCents = totalCents % count;

        const splitsData = participants.map((p, index) => {
          const personCents = baseCents + (index < remainderCents ? 1 : 0);
          const personAmount = personCents / 100;
          const isMe = !p.friendId || p.friendId === "me";

          return {
            amount: personAmount,
            settled: isMe, // "Me" portion is marked auto-settled
            settledAt: isMe ? new Date() : null,
            friendName: p.friendName || (isMe ? "Me" : "Friend"),
            friendUpiId: p.friendUpiId || null,
            expenseId: createdExpense.id,
            friendId: isMe ? null : p.friendId,
          };
        });

        await tx.expenseSplitEntry.createMany({
          data: splitsData,
        });
      }

      return await tx.tripExpense.findUnique({
        where: { id: createdExpense.id },
        include: { splits: true },
      });
    });

    revalidatePath(`/trips/${tripId}`);

    return { success: true, data: serializeExpense(expense) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Toggle settled state for a split entry
 */
export async function toggleSplitSettled(splitEntryId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const entry = await db.expenseSplitEntry.findUnique({
      where: { id: splitEntryId },
      include: {
        expense: {
          include: { trip: true },
        },
      },
    });

    if (!entry || entry.expense.trip.userId !== user.id) {
      throw new Error("Split entry not found");
    }

    const nextSettled = !entry.settled;

    const updated = await db.expenseSplitEntry.update({
      where: { id: splitEntryId },
      data: {
        settled: nextSettled,
        settledAt: nextSettled ? new Date() : null,
      },
    });

    revalidatePath(`/trips/${entry.expense.tripId}`);

    return { success: true, data: serializeSplit(updated) };
  } catch (error) {
    return { success: false, error: error.message };
  }
}


/**
 * Delete trip expense
 */
export async function deleteTripExpense(expenseId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const expense = await db.tripExpense.findUnique({
      where: { id: expenseId },
      include: { trip: true },
    });
    if (!expense || expense.trip.userId !== user.id) {
      throw new Error("Expense not found");
    }

    await db.tripExpense.delete({ where: { id: expenseId } });

    revalidatePath(`/trips/${expense.tripId}`);

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate AI Trip Itinerary & Budget Advice using Gemini 1.5
 */
export async function generateAiTripPlan(tripId) {
  try {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");
    const user = session.user;

    const trip = await db.trip.findFirst({
      where: { id: tripId, userId: user.id },
      include: {
        places: true,
        expenses: true,
      },
    });

    if (!trip) throw new Error("Trip not found");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const totalBudget = parseFloat(trip.budget);
    const currentExpensesSum = trip.expenses.reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    );

    const placesList = trip.places
      .map((p) => `- ${p.name} (Est. ₹${parseFloat(p.estimatedCost)})`)
      .join("\n");

    const expensesList = trip.expenses
      .map(
        (e) =>
          `- ${e.title}: ₹${parseFloat(e.amount)} (Paid by: ${e.paidBy || "Me"})`
      )
      .join("\n");

    const isOverBudget = currentExpensesSum > totalBudget;

    const prompt = `
      You are an expert AI Travel & Expense Assistant for Trakex.
      Generate a customized trip advice & day-by-day itinerary plan for this trip.

      Trip Details:
      - Name: ${trip.name}
      - Destination: ${trip.destination}
      - Total Budget: ₹${totalBudget}
      - Total Spent So Far: ₹${currentExpensesSum}
      - Over Budget Alert: ${isOverBudget ? "YES - Budget Exceeded!" : "No, within budget"}

      Places to Visit Checklist:
      ${placesList || "No places added yet."}

      Recorded Expenses:
      ${expensesList || "No expenses recorded yet."}

      Task:
      Provide 3 sections formatted in markdown:
      1. **Budget Health & Overview**: Comment on spending progress. ${
        isOverBudget
          ? "CRITICAL: The budget has been exceeded! Suggest 2 specific actionable ways to cut expenses or optimize spending."
          : "Provide a helpful tip on managing money for this destination."
      }
      2. **Recommended Places & Hidden Gems**: Suggest 2-3 famous or nearby places to explore in ${trip.destination}.
      3. **Suggested Day-by-Day Itinerary**: A simple 2-day sample itinerary incorporating their places to visit.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return { success: true, plan: text };
  } catch (error) {
    console.error("generateAiTripPlan error:", error);
    return { success: false, error: error.message };
  }
}
