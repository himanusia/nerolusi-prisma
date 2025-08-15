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
});
