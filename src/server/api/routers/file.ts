import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const fileRouter = createTRPCRouter({
  getAllFiles: protectedProcedure.query(async ({ ctx }) => {
    const files = await ctx.db.file.findMany();
    return files ?? null;
  }),

  uploadFile: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        url: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.file.create({
        data: {
          title: input.title,
          description: input.description,
          url: input.url,
        },
      });

      return result;
    }),
});
