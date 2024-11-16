import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const packageRouter = createTRPCRouter({
  getOnePackage: protectedProcedure
    .input(
      z.object({
        packageId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const packageData = await ctx.db.package.findUnique({
        where: { id: Number(input.packageId) },
      });

      const questionsData = await ctx.db.question.findMany({
        where: { packageId: Number(input.packageId) },
      });

      return {
        ...packageData,
        questions: questionsData,
      };
    }),

  getAllPackages: protectedProcedure.query(async ({ ctx }) => {
    const packages = await ctx.db.package.findMany({
      orderBy: { id: "desc" },
    });
    return packages ?? null;
  }),

  addPackage: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, "Package name is required"),
        type: z.enum(["tryout", "drill"]),
        start: z.date().optional(),
        end: z.date().optional(),
        duration: z.string().optional(),
        classId: z.number().int(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, type, start, end, duration, classId } = input;

      const newPackage = await ctx.db.package.create({
        data: {
          id,
          name,
          type,
          TOstart: start ?? null,
          TOend: end ?? null,
          TOduration: duration ?? null,
          classId: classId,
        },
      });

      return newPackage;
    }),
});
