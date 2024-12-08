import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { userRouter } from "./routers/user";
import { classRouter } from "./routers/class";
import { packageRouter } from "./routers/package";
import { videoRouter } from "./routers/video";
import { fileRouter } from "./routers/file";
import { answerRouter } from "./routers/answer";
import { questionsRouter } from "./routers/question";
import { subtestRouter } from "./routers/subtest";
import { quizRouter } from "./routers/quiz";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: userRouter,
  class: classRouter,
  package: packageRouter,
  video: videoRouter,
  file: fileRouter,
  question: questionsRouter,
  answer: answerRouter,
  subtest: subtestRouter,
  quiz: quizRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
