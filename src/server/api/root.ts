import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { vendorRouter } from "@/server/api/routers/vendor";
import { orderRouter } from "@/server/api/routers/order";
import { paymentRouter } from "@/server/api/routers/payment";
import { notificationRouter } from "@/server/api/routers/notification";
import { profileRouter } from "@/server/api/routers/profile";
import { postRouter } from "./routers/post";

export const appRouter = createTRPCRouter({
  vendor: vendorRouter,
  order: orderRouter,
  payment: paymentRouter,
  notification: notificationRouter,
  profile: profileRouter,
  post: postRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);