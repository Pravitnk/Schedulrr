"use server";

import { db } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

export const updateUsername = async (userName) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("unauthorized");
  }

  const existingUsername = await db.user.findUnique({
    where: { userName },
  });

  if (existingUsername && existingUsername.id !== userId) {
    throw new Error("Username is already taken");
  }

  await db.user.update({
    where: { clerkUserId: userId },
    data: { userName },
  });

  await clerkClient.users.updateUser(userId, {
    userName,
  });

  return { success: true };
};

export const getUserByUserName = async (userName) => {
  const user = await db.user.findUnique({
    where: { userName },
    select: {
      id: true,
      name: true,
      email: true,
      imageUrl: true,
      events: {
        where: {
          isPrivate: false,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          duration: true,
          isPrivate: true,
          _count: {
            select: { bookings: true },
          },
        },
      },
    },
  });
  return user;
};
