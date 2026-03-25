import { eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { user, vendorProfile } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const profileRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.user.findFirst({
      where: eq(user.id, ctx.session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        businessName: true,
        phone: true,
        address: true,
        image: true,
        createdAt: true,
      },
    });
  }),

  update: protectedProcedure
    .input(z.object({
      name: z.string().min(1).optional(),
      businessName: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(user)
        .set({
          name: input.name ?? undefined,
          businessName: input.businessName ?? undefined,
          phone: input.phone ?? undefined,
          address: input.address ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.session.user.id));
    }),

  // Vendor only: soft delete account
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    // ts-expect-error — additionalFields
    if ((ctx.session.user.role as string) !== "vendor") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    await ctx.db.update(user)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(user.id, ctx.session.user.id));
    // Also soft delete their vendor profile
    await ctx.db.update(vendorProfile)
      .set({ isActive: false, deletedAt: new Date() })
      .where(eq(vendorProfile.userId, ctx.session.user.id));
  }),
});