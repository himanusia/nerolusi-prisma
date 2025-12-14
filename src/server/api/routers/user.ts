import { get } from "http";
import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  userProcedure,
} from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getSessionUser: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        image: true,
        name: true,
        email: true,
        role: true,
        class: {
          select: {
            name: true,
          },
        },
      },
    });
  }),

  getAllUsers: userProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        class: true,
      },
    });
    return users ?? null;
  }),

  updateRole: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.enum(["user", "teacher", "admin"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.id },
        data: { role: input.role },
      });
    }),

  // New mutation to update user's class
  updateClass: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        classId: z.number().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { classid: input.classId },
      });
    }),

  // New mutation to update enrolledUtbk
  updateEnrolledUtbk: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        enrolledUtbk: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { enrolledUtbk: input.enrolledUtbk },
      });
    }),

  // New mutation to update enrolledTka
  updateEnrolledTka: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        enrolledTka: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { enrolledTka: input.enrolledTka },
      });
    }),

  updateProfile: userProcedure
    .input(
      z.object({
        name: z.string().min(1, "Nama tidak boleh kosong").optional(),
        school: z.string().optional(),
        birthDate: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.school && { school: input.school }),
          ...(input.birthDate && { birthDate: input.birthDate }),
        },
      });
    }),

  // Get user profile with major choices
  getProfile: userProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        school: true,
        birthDate: true,
      },
    });

    const majorChoices = await ctx.db.userMajorChoice.findMany({
      where: { userId: ctx.session.user.id },
      include: {
        major: {
          include: {
            university: true,
          },
        },
      },
      orderBy: {
        choiceNumber: "asc",
      },
    });

    return {
      ...user,
      majorChoices,
    };
  }),

  // Update or create major choices
  updateMajorChoices: userProcedure
    .input(
      z.object({
        choices: z.array(
          z.object({
            choiceNumber: z.number().min(1).max(4),
            majorId: z.number(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.$transaction(async (tx) => {
        // Delete existing choices
        await tx.userMajorChoice.deleteMany({
          where: { userId: ctx.session.user.id },
        });

        // Create new choices
        if (input.choices.length > 0) {
          await tx.userMajorChoice.createMany({
            data: input.choices.map((choice) => ({
              userId: ctx.session.user.id,
              majorId: choice.majorId,
              choiceNumber: choice.choiceNumber,
            })),
          });
        }

        return true;
      });
    }),

  // Get all universities
  getAllUniversities: userProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.university.findMany({
        where: input.search
          ? {
              name: {
                contains: input.search,
                mode: "insensitive",
              },
            }
          : undefined,
        orderBy: {
          name: "asc",
        },
      });
    }),

  // Get majors by university
  getMajorsByUniversity: userProcedure
    .input(
      z.object({
        universityId: z.number(),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.major.findMany({
        where: {
          universityId: input.universityId,
          ...(input.search && {
            name: {
              contains: input.search,
              mode: "insensitive",
            },
          }),
        },
        include: {
          university: true,
        },
        orderBy: {
          name: "asc",
        },
      });
    }),

  getTopKegiatan: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.event.findMany({
      orderBy: {
        startTime: "asc",
      },
      take: 3,
    });
  }),

  getAllKegiatan: userProcedure.query(async ({ ctx }) => {
    return await ctx.db.event.findMany({
      orderBy: {
        startTime: "asc",
      },
    });
  }),
});
