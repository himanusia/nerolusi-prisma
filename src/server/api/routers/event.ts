import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  userProcedure,
} from "~/server/api/trpc";

export const eventRouter = createTRPCRouter({
  getAllEvents: userProcedure
    .input(
      z
        .object({
          upcoming: z.boolean().optional(),
          limit: z.number().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.session.user.classid) {
        return [];
      }

      const now = new Date();
      const whereClause = input?.upcoming
        ? {
            OR: [
              { endTime: { gte: now } },
              { endTime: null }, // Include events without end time
            ],
            classId: ctx.session.user.classid
          }
        : {};

      const events = await ctx.db.event.findMany({
        where: whereClause,
        orderBy: [{ startTime: "asc" }, { createdAt: "desc" }],
        take: input?.limit,
      });

      return events;
    }),

  // Get event by ID
  getEventById: userProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const event = await ctx.db.event.findUnique({
        where: { id: input.id },
      });

      if (!event) {
        throw new Error("Event not found");
      }

      return event;
    }),
});
