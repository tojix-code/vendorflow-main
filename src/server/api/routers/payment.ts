import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { payment, notification, vendorProfile } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

export const paymentRouter = createTRPCRouter({
	// ── Business: get all payments ──
	getAll: protectedProcedure
		.input(z.object({
			vendorId: z.string().optional(),
			status: z.string().optional(),
		}).optional())
		.query(async ({ ctx, input }) => {
			const payments = await ctx.db.query.payment.findMany({
				where: and(
					eq(payment.businessId, ctx.session.user.id),
					isNull(payment.deletedAt),
				),
				orderBy: [desc(payment.createdAt)],
				with: {
					vendor: { columns: { vendorName: true } },
					order: { columns: { orderRef: true } },
				},
			});
			let result = payments;
			if (input?.vendorId) result = result.filter((p) => p.vendorId === input.vendorId);
			if (input?.status) result = result.filter((p) => p.status === input.status);
			return result;
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const p = await ctx.db.query.payment.findFirst({
				where: eq(payment.id, input.id),
				with: { vendor: true, order: true },
			});
			if (!p) throw new TRPCError({ code: "NOT_FOUND" });
			return p;
		}),

	// ── Vendor: get own payments across ALL linked profiles ──
	getMyPayments: protectedProcedure.query(async ({ ctx }) => {
		// Get ALL vendor profiles linked to this user
		const myProfiles = await ctx.db.query.vendorProfile.findMany({
			where: eq(vendorProfile.userId, ctx.session.user.id),
			columns: { id: true },
		});
		if (myProfiles.length === 0) return [];

		const profileIds = myProfiles.map((p) => p.id);

		return ctx.db.query.payment.findMany({
			where: and(
				inArray(payment.vendorId, profileIds),
				isNull(payment.deletedAt),
			),
			orderBy: [desc(payment.createdAt)],
			with: { order: { columns: { orderRef: true } } },
		});
	}),

	// ── Business: add payment ──
	create: protectedProcedure
		.input(z.object({
			vendorId: z.string(),
			orderId: z.string().optional(),
			invoiceRef: z.string().optional(),
			amount: z.number().positive(),
			method: z.enum(["bank_transfer", "cash", "cheque", "upi", "other"]),
			remarks: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "business") throw new TRPCError({ code: "FORBIDDEN" });

			const paymentId = nanoid();
			await ctx.db.insert(payment).values({
				id: paymentId,
				businessId: ctx.session.user.id,
				vendorId: input.vendorId,
				orderId: input.orderId ?? null,
				invoiceRef: input.invoiceRef ?? null,
				amount: input.amount.toFixed(2),
				method: input.method,
				remarks: input.remarks ?? null,
				// cash & upi are instant — auto-confirm
				status: ["cash", "upi"].includes(input.method) ? "confirmed" : "pending",
				paidAt: ["cash", "upi"].includes(input.method) ? new Date() : null,
			});

			// Notify vendor
			const vendor = await ctx.db.query.vendorProfile.findFirst({
				where: eq(vendorProfile.id, input.vendorId),
				columns: { userId: true },
			});
			if (vendor?.userId) {
				await ctx.db.insert(notification).values({
					id: nanoid(),
					userId: vendor.userId,
					type: "payment",
					message: `A payment of ₹${input.amount} has been recorded for you.`,
					entityId: paymentId,
				});
			}
		}),

	// ── Business: update payment ──
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			status: z.enum(["pending", "confirmed", "failed"]).optional(),
			method: z.enum(["bank_transfer", "cash", "cheque", "upi", "other"]).optional(),
			remarks: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.payment.findFirst({ where: eq(payment.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			await ctx.db.update(payment)
				.set({
					status: input.status ?? existing.status,
					method: input.method ?? existing.method,
					remarks: input.remarks ?? existing.remarks,
					paidAt: input.status === "confirmed" ? new Date() : existing.paidAt,
					updatedAt: new Date(),
				})
				.where(eq(payment.id, input.id));
		}),

	// ── Business: soft delete payment ──
	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.payment.findFirst({ where: eq(payment.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			await ctx.db.update(payment)
				.set({ deletedAt: new Date(), status: "deleted", updatedAt: new Date() })
				.where(eq(payment.id, input.id));
		}),

	// ── Vendor: upload invoice ──
	uploadInvoice: protectedProcedure
		.input(z.object({
			id: z.string(),
			invoiceFile: z.string().min(1),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.payment.findFirst({ where: eq(payment.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			await ctx.db.update(payment)
				.set({ invoiceFile: input.invoiceFile, updatedAt: new Date() })
				.where(eq(payment.id, input.id));
		}),

	// ── Vendor: update payment status ──
	updateStatus: protectedProcedure
		.input(z.object({
			id: z.string(),
			status: z.enum(["confirmed"]),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.payment.findFirst({ where: eq(payment.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.status !== "pending") {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Only pending payments can be confirmed" });
			}
			await ctx.db.update(payment)
				.set({ status: "confirmed", paidAt: new Date(), updatedAt: new Date() })
				.where(eq(payment.id, input.id));

			await ctx.db.insert(notification).values({
				id: nanoid(),
				userId: existing.businessId,
				type: "payment",
				message: `Payment confirmed by vendor for invoice ${existing.invoiceRef ?? input.id}.`,
				entityId: input.id,
			});
		}),
});