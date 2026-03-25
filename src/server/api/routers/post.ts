import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  getLatest: publicProcedure.query(() => {
    return {
      title: "Latest Post",
      content: "Hello from VendorFlow 🚀",
    };
  }),
});