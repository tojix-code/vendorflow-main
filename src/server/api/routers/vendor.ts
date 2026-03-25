import { and, desc, eq, isNull, ne } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { vendorProfile, user } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const vendorRouter = createTRPCRouter({
	// ── Business: get all active vendors ──
	getAll: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.vendorProfile.findMany({
			where: and(
				eq(vendorProfile.businessId, ctx.session.user.id),
				isNull(vendorProfile.deletedAt),
			),
			orderBy: [desc(vendorProfile.createdAt)],
		});
	}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const vendor = await ctx.db.query.vendorProfile.findFirst({
				where: eq(vendorProfile.id, input.id),
				with: {
					orders: { orderBy: [desc(vendorProfile.createdAt)] },
					payments: true,
				},
			});
			if (!vendor) throw new TRPCError({ code: "NOT_FOUND" });
			return vendor;
		}),

	// ── Business: create vendor ──
	create: protectedProcedure
		.input(z.object({
			vendorName: z.string().min(1),
			contactName: z.string().optional(),
			email: z.string().email().optional().or(z.literal("")),
			phone: z.string().optional(),
			address: z.string().optional(),
			services: z.string().optional(),
			paymentTerms: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "business") {
				throw new TRPCError({ code: "FORBIDDEN" });
			}
			const newVendorId = nanoid();
			await ctx.db.insert(vendorProfile).values({
				id: newVendorId,
				businessId: ctx.session.user.id,
				vendorName: input.vendorName,
				contactName: input.contactName ?? null,
				email: input.email || null,
				phone: input.phone ?? null,
				address: input.address ?? null,
				services: input.services ?? null,
				paymentTerms: input.paymentTerms ?? null,
			});
			// If a vendor user with this email already exists, link them immediately
			if (input.email) {
				const existingUser = await ctx.db.query.user.findFirst({
					where: eq(user.email, input.email),
					columns: { id: true, role: true },
				});
				// ts-expect-error — additionalFields
				if (existingUser && (existingUser.role as string) === "vendor") {
					await ctx.db.update(vendorProfile)
						.set({ userId: existingUser.id, updatedAt: new Date() })
						.where(eq(vendorProfile.id, newVendorId));
				}
			}
		}),

	// ── Business: update vendor ──
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			vendorName: z.string().min(1),
			contactName: z.string().optional(),
			email: z.string().email().optional().or(z.literal("")),
			phone: z.string().optional(),
			address: z.string().optional(),
			services: z.string().optional(),
			paymentTerms: z.string().optional(),
			isActive: z.boolean().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.vendorProfile.findFirst({
				where: and(
					eq(vendorProfile.id, input.id),
					eq(vendorProfile.businessId, ctx.session.user.id),
				),
			});
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			await ctx.db.update(vendorProfile)
				.set({
					vendorName: input.vendorName,
					contactName: input.contactName ?? null,
					email: input.email || null,
					phone: input.phone ?? null,
					address: input.address ?? null,
					services: input.services ?? null,
					paymentTerms: input.paymentTerms ?? null,
					isActive: input.isActive ?? existing.isActive,
					updatedAt: new Date(),
				})
				.where(eq(vendorProfile.id, input.id));
		}),

	// ── Business: soft delete vendor ──
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.vendorProfile.findFirst({
				where: and(
					eq(vendorProfile.id, input.id),
					eq(vendorProfile.businessId, ctx.session.user.id),
				),
			});
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			await ctx.db.update(vendorProfile)
				.set({ isActive: false, deletedAt: new Date(), updatedAt: new Date() })
				.where(eq(vendorProfile.id, input.id));
		}),

	// ── Vendor: get own profile ──
	getMyProfile: protectedProcedure.query(async ({ ctx }) => {
		return ctx.db.query.vendorProfile.findFirst({
			where: eq(vendorProfile.userId, ctx.session.user.id),
		});
	}),

	// ── Vendor: auto-link ALL unlinked profiles matching this vendor's email ──
	// Removed early-return on "alreadyLinked" — a vendor can have multiple
	// profiles across different businesses, all needing to be linked.
	linkMyProfile: protectedProcedure.mutation(async ({ ctx }) => {
		// ts-expect-error — additionalFields
		if ((ctx.session.user.role as string) !== "vendor") return;

		// Get vendor's login email
		const currentUser = await ctx.db.query.user.findFirst({
			where: eq(user.id, ctx.session.user.id),
			columns: { email: true },
		});
		if (!currentUser?.email) return;

		// Find ALL unlinked profiles matching this email
		// (no early return — even if some are already linked, others may not be)
		const unlinkedProfiles = await ctx.db.query.vendorProfile.findMany({
			where: and(
				eq(vendorProfile.email, currentUser.email),
				isNull(vendorProfile.userId),
				isNull(vendorProfile.deletedAt),
			),
		});

		// Link each one
		for (const profile of unlinkedProfiles) {
			await ctx.db.update(vendorProfile)
				.set({ userId: ctx.session.user.id, updatedAt: new Date() })
				.where(eq(vendorProfile.id, profile.id));
		}
	}),
});