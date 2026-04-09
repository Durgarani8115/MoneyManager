import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const email = user.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error("User email not available");
  }

  const firstName = user.firstName ?? "";
  const lastName = user.lastName ?? "";
  const name = `${firstName} ${lastName}`.trim() || email.split("@")[0];
  const userData = {
    clerkUserId: user.id,
    email,
    name,
    imageUrl: user.imageUrl,
  };

  const existingByClerkId = await db.user.findUnique({
    where: {
      clerkUserId: user.id,
    },
  });

  if (existingByClerkId) {
    return db.user.update({
      where: { id: existingByClerkId.id },
      data: userData,
    });
  }

  const existingByEmail = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (existingByEmail) {
    return db.user.update({
      where: { id: existingByEmail.id },
      data: userData,
    });
  }

  return db.user.create({
    data: userData,
  });
};

export const requireDbUser = async () => {
  const user = await checkUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};
