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

  return db.user.upsert({
    where: {
      clerkUserId: user.id,
    },
    update: {
      email,
      name,
      imageUrl: user.imageUrl,
    },
    create: {
      clerkUserId: user.id,
      name,
      imageUrl: user.imageUrl,
      email,
    },
  });
};

export const requireDbUser = async () => {
  const user = await checkUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
};
