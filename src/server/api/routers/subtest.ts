import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const subtestRouter = createTRPCRouter({
  getByPackage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.subtest.findMany({
        where: {
          package: {
            id: input.id,
          },
        },
        select: {
          id: true,
          type: true,
          duration: true,
        },
      });
    }),
});
