import { z } from "zod";

export const usernameSchema = z.object({
  username: z
    .string()
    .min(5)
    .max(15)
    .regex(/^[a-z0-9_]{5,15}$/, {
      message:
        "Username can only contain lowercase letters, numbers, and underscores",
    }),
});

export const eventSchema = z.object({
  title: z
    .string()
    .min(3, "Title is required")
    .max(30, "Title must be 30 characters or less"),
  description: z
    .string()
    .min(10, "Description is required")
    .max(150, "Description must be 150 characters or less"),
  duration: z.number().int().positive("Duration must be a positive number"),

  isPrivate: z.boolean(),
});

// export const daySchema = z
//   .object({
//     isAvailible: z.boolean(),
//     startTime: z.string().optional(),
//     endTime: z.string().optional(),
//   })
//   .refine(
//     (data) => {
//       if (data.isAvailible) {
//         return data.startTime < data.endTime;
//       }
//       return true;
//     },
//     {
//       message: "end time must be more than start time",
//       path: ["endTime"],
//     }
//   );

export const daySchema = z
  .object({
    isAvailible: z.boolean(),
    startTime: z
      .string()
      .optional()
      .refine((val) => val !== undefined, {
        message: "Start time is required",
      }),
    endTime: z
      .string()
      .optional()
      .refine((val) => val !== undefined, {
        message: "End time is required",
      }),
  })
  .refine(
    (data) => {
      if (data.isAvailible) {
        return data.startTime && data.endTime && data.startTime < data.endTime;
      }
      return true;
    },
    {
      message: "End time must be greater than start time",
      path: ["endTime"],
    }
  );

export const availibilitySchema = z.object({
  monday: daySchema,
  tuesday: daySchema,
  wednesday: daySchema,
  thursday: daySchema,
  friday: daySchema,
  saturday: daySchema,
  sunday: daySchema,
  timeGap: z.number().min(0, "Time gap must be 0 or more minutes").int(),
  // isPrivate: z.boolean(),
});

export const bookingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid Email"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
  additionalInfo: z.string().optional(),
});
