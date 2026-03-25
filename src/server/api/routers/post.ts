import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const postRouter = createTRPCRouter({
  
  // ✅ ADD THIS
  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // example (adjust based on your DB)
      return ctx.db.post.create({
        data: {
          name: input.name,
        },
      });
    }),

});