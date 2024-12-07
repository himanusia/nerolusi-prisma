import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        usersToClasses: {
          include: {
            class: true,
          },
        },
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
});
