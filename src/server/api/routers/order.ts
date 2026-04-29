import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { order, orderItem, notification, vendorProfile } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";

const itemSchema = z.object({
	itemName: z.string().min(1),
	quantity: z.number().positive(),
	unitPrice: z.number().positive(),
});

export const orderRouter = createTRPCRouter({
	// ── Business: get all orders ──
	getAll: protectedProcedure
		.input(z.object({
			status: z.string().optional(),
			vendorId: z.string().optional(),
		}).optional())
		.query(async ({ ctx, input }) => {
			const orders = await ctx.db.query.order.findMany({
				where: eq(order.businessId, ctx.session.user.id),
				orderBy: [desc(order.createdAt)],
				with: {
					vendor: { columns: { vendorName: true, contactName: true } },
					items: true,
				},
			});
			let result = orders;
			if (input?.status) result = result.filter((o) => o.status === input.status);
			if (input?.vendorId) result = result.filter((o) => o.vendorId === input.vendorId);
			return result;
		}),

	getById: protectedProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const o = await ctx.db.query.order.findFirst({
				where: eq(order.id, input.id),
				with: {
					vendor: true,
					business: true,
					items: true,
					payments: true,
				},
			});
			if (!o) throw new TRPCError({ code: "NOT_FOUND" });
			return o;
		}),

	// ── Vendor: get assigned orders across ALL linked profiles ──
	getMyOrders: protectedProcedure
		.input(z.object({ status: z.string().optional() }).optional())
		.query(async ({ ctx, input }) => {
			// Get ALL vendor profiles linked to this user (not just the first one)
			const myProfiles = await ctx.db.query.vendorProfile.findMany({
				where: eq(vendorProfile.userId, ctx.session.user.id),
				columns: { id: true },
			});
			if (myProfiles.length === 0) return [];

			const profileIds = myProfiles.map((p) => p.id);

			const orders = await ctx.db.query.order.findMany({
				where: inArray(order.vendorId, profileIds),
				orderBy: [desc(order.createdAt)],
				with: {
					items: true,
					payments: true,
					vendor: { columns: { vendorName: true } },
				},
			});

			if (input?.status) return orders.filter((o) => o.status === input.status);
			return orders;
		}),

	// ── Business: create order ──
	create: protectedProcedure
		.input(z.object({
			vendorId: z.string(),
			items: z.array(itemSchema).min(1),
			dueDate: z.date().optional(),
			notes: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			// ts-expect-error — additionalFields
			if ((ctx.session.user.role as string) !== "business") throw new TRPCError({ code: "FORBIDDEN" });

			const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
			const orderRef = `ORD-${Date.now()}`;
			const orderId = nanoid();

			await ctx.db.insert(order).values({
				id: orderId,
				businessId: ctx.session.user.id,
				vendorId: input.vendorId,
				orderRef,
				totalAmount: totalAmount.toFixed(2),
				dueDate: input.dueDate ?? null,
				notes: input.notes ?? null,
			});

			await ctx.db.insert(orderItem).values(
				input.items.map((item) => ({
					id: nanoid(),
					orderId,
					itemName: item.itemName,
					quantity: item.quantity.toFixed(2),
					unitPrice: item.unitPrice.toFixed(2),
					totalPrice: (item.quantity * item.unitPrice).toFixed(2),
				})),
			);

			// Notify vendor if they have an account
			const vendor = await ctx.db.query.vendorProfile.findFirst({
				where: eq(vendorProfile.id, input.vendorId),
				columns: { userId: true, vendorName: true },
			});
			if (vendor?.userId) {
				await ctx.db.insert(notification).values({
					id: nanoid(),
					userId: vendor.userId,
					type: "order",
					message: `New order ${orderRef} has been placed for you.`,
					entityId: orderId,
				});
			}
		}),

	// ── Business: update order ──
	update: protectedProcedure
		.input(z.object({
			id: z.string(),
			dueDate: z.date().optional(),
			notes: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.order.findFirst({ where: eq(order.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.status === "delivered") throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot update a delivered order" });
			await ctx.db.update(order)
				.set({
					dueDate: input.dueDate ?? existing.dueDate,
					notes: input.notes ?? existing.notes,
					updatedAt: new Date(),
				})
				.where(eq(order.id, input.id));
		}),

	// ── Business: cancel order ──
	cancel: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.order.findFirst({ where: eq(order.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (!["pending", "in_progress"].includes(existing.status)) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Only pending or in-progress orders can be cancelled" });
			}
			await ctx.db.update(order)
				.set({ status: "cancelled", updatedAt: new Date() })
				.where(eq(order.id, input.id));

			const vendor = await ctx.db.query.vendorProfile.findFirst({
				where: eq(vendorProfile.id, existing.vendorId),
				columns: { userId: true },
			});
			if (vendor?.userId) {
				await ctx.db.insert(notification).values({
					id: nanoid(),
					userId: vendor.userId,
					type: "order",
					message: `Order ${existing.orderRef} has been cancelled.`,
					entityId: input.id,
				});
			}
		}),

	// ── Vendor: accept/reject order ──
	respondToOrder: protectedProcedure
		.input(z.object({
			id: z.string(),
			action: z.enum(["accepted", "rejected"]),
			rejectReason: z.string().optional(),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.order.findFirst({ where: eq(order.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (input.action === "rejected" && !input.rejectReason?.trim()) {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Rejection reason is required" });
			}
			await ctx.db.update(order)
				.set({
					status: input.action,
					rejectReason: input.rejectReason ?? null,
					updatedAt: new Date(),
				})
				.where(eq(order.id, input.id));

			await ctx.db.insert(notification).values({
				id: nanoid(),
				userId: existing.businessId,
				type: "order",
				message: `Order ${existing.orderRef} has been ${input.action} by vendor.`,
				entityId: input.id,
			});
		}),

	// ── Vendor: update order status ──
	updateStatus: protectedProcedure
		.input(z.object({
			id: z.string(),
			status: z.enum(["in_progress", "delivered"]),
		}))
		.mutation(async ({ ctx, input }) => {
			const existing = await ctx.db.query.order.findFirst({ where: eq(order.id, input.id) });
			if (!existing) throw new TRPCError({ code: "NOT_FOUND" });
			if (existing.status === "delivered") {
				throw new TRPCError({ code: "BAD_REQUEST", message: "Order already delivered" });
			}
			await ctx.db.update(order)
				.set({ status: input.status, updatedAt: new Date() })
				.where(eq(order.id, input.id));

			await ctx.db.insert(notification).values({
				id: nanoid(),
				userId: existing.businessId,
				type: "order",
				message: `Order ${existing.orderRef} status updated to ${input.status.replace("_", " ")}.`,
				entityId: input.id,
			});
		}),
});