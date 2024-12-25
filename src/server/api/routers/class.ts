import { z } from "zod";
import {
  createTRPCRouter,
  teacherProcedure,
  userProcedure,
} from "~/server/api/trpc";

export const classRouter = createTRPCRouter({
  getAllClasses: userProcedure.query(async ({ ctx }) => {
    const classes = await ctx.db.class.findMany({
      select: {
        id: true,
        name: true,
      },
    });
    return classes ?? null;
  }),

  createClass: teacherProcedure
    .input(
      z.object({
        name: z.string().min(1, "Class name is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const newClass = await ctx.db.class.create({
        data: {
          name: input.name,
        },
      });
      return newClass;
    }),
});
