"use server";

import { eventSchema } from "@/app/lib/validator";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const createEvent = async (data) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorised");
  }

  const validateData = eventSchema.parse(data);

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const event = await db.event.create({
    data: {
      ...validateData,
      UserId: user.id,
    },
  });

  return event;
};

export const getUserEvent = async (data) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorised");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const events = await db.event.findMany({
    where: {
      UserId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: { bookings: true },
      },
    },
  });

  return { events, userName: user.userName };
};

export const deleteEvent = async (eventId) => {
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorised");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const event = await db.event.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!event || event.UserId !== user.id) {
    throw new Error("Event not found or unauthorised");
  }
  await db.event.delete({
    where: { id: eventId },
  });
  return { success: true };
};

export const getEventDetails = async (userName, eventId) => {
  const event = await db.event.findFirst({
    where: {
      id: eventId,
      user: {
        userName: userName,
      },
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          userName: true,
          imageUrl: true,
        },
      },
    },
  });
  return event;
};
