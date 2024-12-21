import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        class: true, // Include class data if needed
      },
    });
    return users ?? null;
  }),

  updateRole: protectedProcedure
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
  updateClass: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        classId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      await ctx.db.user.update({
        where: { id: input.userId },
        data: { classid: input.classId }, // Update classid
      });
    }),
});
