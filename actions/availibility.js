"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import {
  addDays,
  addMinutes,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
export const getUserAvailibility = async () => {
  // Implement your logic here to fetch user availability from a database or API
  const { userId } = auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      availibility: {
        include: { days: true },
      },
    },
  });

  if (!user || !user.availibility) {
    return null;
  }

  // Transform the availability data into the format expected by the form
  const availabilityData = { timeGap: user.availibility.timeGap };

  [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ].forEach((day) => {
    const dayAvailibility = user.availibility.days.find(
      (d) => d.day === day.toUpperCase()
    );

    availabilityData[day] = {
      isAvailible: !!dayAvailibility,
      startTime: dayAvailibility
        ? dayAvailibility.startTime.toISOString().slice(11, 16)
        : "09:00",
      endTime: dayAvailibility
        ? dayAvailibility.endTime.toISOString().slice(11, 16)
        : "17:00",
    };
  });

  return availabilityData;
};

export const updateAvailibility = async (data) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      availibility: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }
  const availabilityData = Object.entries(data).flatMap(
    ([day, { isAvailible, startTime, endTime }]) => {
      if (isAvailible) {
        const baseDate = new Date().toISOString().split("T")[0];

        return [
          {
            day: day.toUpperCase(),
            startTime: new Date(`${baseDate}T${startTime}:00Z`),
            endTime: new Date(`${baseDate}T${endTime}:00Z`),
          },
        ];
      }
      return [];
    }
  );
  if (user.availibility) {
    await db.availibility.update({
      where: { id: user.availibility.id },
      data: {
        timeGap: data.timeGap,
        days: {
          deleteMany: {},
          create: availabilityData,
        },
      },
    });
  } else {
    await db.availibility.create({
      data: {
        userId: user.id,
        timeGap: data.timeGap,
        days: {
          create: availabilityData,
        },
      },
    });
  }

  return { success: true };
};

export const getEventAvailability = async (eventId) => {
  const event = await db.event.findUnique({
    where: {
      id: eventId,
    },
    include: {
      user: {
        include: {
          availibility: {
            select: {
              days: true,
              timeGap: true,
            },
          },
          bookings: {
            select: {
              startTime: true,
              endTime: true,
            },
          },
        },
      },
    },
  });
  if (!event || !event.user.availibility) {
    return [];
  }
  const { availibility, bookings } = event.user;

  const startDate = startOfDay(new Date());
  const endDate = addDays(startDate, 30);

  const availableDays = [];

  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const dayOfWeek = format(date, "EEEE").toUpperCase();
    const dayAvailability = availibility.days.find((d) => d.day === dayOfWeek);

    if (dayAvailability) {
      const dateStr = format(date, "yyyy-MM-dd");

      const slots = generateAvailableTimeSlots(
        dayAvailability.startTime,
        dayAvailability.endTime,
        event.duration,
        bookings,
        dateStr,
        availibility.timeGap
      );

      availableDays.push({
        date: dateStr,
        slots,
      });
    }
  }
  return availableDays;
};

const generateAvailableTimeSlots = (
  startTime,
  endTime,
  duration,
  bookings,
  dateStr,
  timeGap = 0
) => {
  const slots = [];

  let currentTime = parseISO(
    `${dateStr}T${startTime.toISOString().slice(11, 16)}`
  );
  const slotEndTime = parseISO(
    `${dateStr}T${endTime.toISOString().slice(11, 16)}`
  );

  const now = new Date();

  if (format(now, "yyyy-MM-dd") === dateStr) {
    currentTime = isBefore(currentTime, now)
      ? addMinutes(now, timeGap)
      : currentTime;
  }

  while (currentTime <= slotEndTime) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);

    const isSlotAvailable = !bookings.some((booking) => {
      const bookingStart = booking.startTime;
      const bookingEnd = booking.endTime;

      return (
        (currentTime >= bookingStart && currentTime < bookingEnd) ||
        (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
        (currentTime <= bookingStart && slotEnd >= bookingEnd)
      );
    });

    if (isSlotAvailable) {
      slots.push(format(currentTime, "HH:mm"));
    }
    currentTime = slotEnd;
  }
  return slots;
};
