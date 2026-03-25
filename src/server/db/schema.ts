import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	numeric,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

// ─────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────
export const userRoleEnum = pgEnum("user_role", ["business", "vendor"]);

export const orderStatusEnum = pgEnum("order_status", [
	"pending",
	"accepted",
	"rejected",
	"in_progress",
	"delivered",
	"cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
	"pending",
	"confirmed",
	"failed",
	"deleted",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
	"bank_transfer",
	"cash",
	"cheque",
	"upi",
	"other",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
	"order",
	"payment",
	"vendor",
	"system",
]);

// ─────────────────────────────────────────────
// BETTER AUTH TABLES (DO NOT RENAME)
// ─────────────────────────────────────────────
export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at")
		.$defaultFn(() => new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => new Date())
		.notNull(),
	role: userRoleEnum("role").default("business").notNull(),
	businessName: text("business_name"),
	phone: text("phone"),
	address: text("address"),
	deletedAt: timestamp("deleted_at"),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(() => new Date()),
	updatedAt: timestamp("updated_at").$defaultFn(() => new Date()),
});

// ─────────────────────────────────────────────
// VENDOR PROFILE
// ─────────────────────────────────────────────
export const vendorProfile = pgTable(
	"vendor_profile",
	{
		id: text("id").primaryKey(),
		businessId: text("business_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		userId: text("user_id").references(() => user.id, {
			onDelete: "set null",
		}),
		vendorName: text("vendor_name").notNull(),
		contactName: text("contact_name"),
		email: text("email"),
		phone: text("phone"),
		address: text("address"),
		services: text("services"),
		paymentTerms: text("payment_terms"),
		isActive: boolean("is_active")
			.$defaultFn(() => true)
			.notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
		deletedAt: timestamp("deleted_at"),
	},
	(t) => [
		index("vendor_profile_business_idx").on(t.businessId),
		index("vendor_profile_user_idx").on(t.userId),
		unique("vendor_name_per_business").on(t.businessId, t.vendorName),
	],
);

// ─────────────────────────────────────────────
// ORDERS
// ─────────────────────────────────────────────
export const order = pgTable(
	"order",
	{
		id: text("id").primaryKey(),
		businessId: text("business_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		vendorId: text("vendor_id")
			.notNull()
			.references(() => vendorProfile.id, { onDelete: "restrict" }),
		orderRef: text("order_ref").notNull().unique(),
		totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
		status: orderStatusEnum("status").notNull().default("pending"),
		dueDate: timestamp("due_date"),
		rejectReason: text("reject_reason"),
		notes: text("notes"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
	},
	(t) => [
		index("order_business_idx").on(t.businessId),
		index("order_vendor_idx").on(t.vendorId),
		index("order_status_idx").on(t.status),
		index("order_ref_idx").on(t.orderRef),
		index("order_due_date_idx").on(t.dueDate),
	],
);

// ─────────────────────────────────────────────
// ORDER ITEMS
// ─────────────────────────────────────────────
export const orderItem = pgTable(
	"order_item",
	{
		id: text("id").primaryKey(),
		orderId: text("order_id")
			.notNull()
			.references(() => order.id, { onDelete: "cascade" }),
		itemName: text("item_name").notNull(),
		quantity: numeric("quantity", { precision: 10, scale: 2 }).notNull(),
		unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
		totalPrice: numeric("total_price", { precision: 12, scale: 2 }).notNull(),
	},
	(t) => [index("order_item_order_idx").on(t.orderId)],
);

// ─────────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────────
export const payment = pgTable(
	"payment",
	{
		id: text("id").primaryKey(),
		businessId: text("business_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		vendorId: text("vendor_id")
			.notNull()
			.references(() => vendorProfile.id, { onDelete: "restrict" }),
		orderId: text("order_id").references(() => order.id, {
			onDelete: "set null",
		}),
		invoiceRef: text("invoice_ref"),
		amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
		method: paymentMethodEnum("method").notNull().default("bank_transfer"),
		status: paymentStatusEnum("status").notNull().default("pending"),
		remarks: text("remarks"),
		invoiceFile: text("invoice_file"),
		paidAt: timestamp("paid_at"),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: timestamp("updated_at")
			.$defaultFn(() => new Date())
			.notNull(),
		deletedAt: timestamp("deleted_at"),
	},
	(t) => [
		index("payment_business_idx").on(t.businessId),
		index("payment_vendor_idx").on(t.vendorId),
		index("payment_order_idx").on(t.orderId),
		index("payment_status_idx").on(t.status),
		index("payment_date_idx").on(t.createdAt),
	],
);

// ─────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────
export const notification = pgTable(
	"notification",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		type: notificationTypeEnum("type").notNull().default("system"),
		message: text("message").notNull(),
		entityId: text("entity_id"),
		isRead: boolean("is_read")
			.$defaultFn(() => false)
			.notNull(),
		createdAt: timestamp("created_at")
			.$defaultFn(() => new Date())
			.notNull(),
		readAt: timestamp("read_at"),
	},
	(t) => [
		index("notification_user_idx").on(t.userId),
		index("notification_read_idx").on(t.userId, t.isRead),
	],
);

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────
export const userRelations = relations(user, ({ many }) => ({
	account: many(account),
	session: many(session),
	vendorsAdded: many(vendorProfile, { relationName: "businessVendors" }),
	ordersPlaced: many(order, { relationName: "businessOrders" }),
	paymentsAdded: many(payment, { relationName: "businessPayments" }),
	notifications: many(notification),
	vendorProfiles: many(vendorProfile, { relationName: "vendorUserProfiles" }),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const vendorProfileRelations = relations(
	vendorProfile,
	({ one, many }) => ({
		business: one(user, {
			fields: [vendorProfile.businessId],
			references: [user.id],
			relationName: "businessVendors",
		}),
		vendorUser: one(user, {
			fields: [vendorProfile.userId],
			references: [user.id],
			relationName: "vendorUserProfiles",
		}),
		orders: many(order),
		payments: many(payment),
	}),
);

export const orderRelations = relations(order, ({ one, many }) => ({
	business: one(user, {
		fields: [order.businessId],
		references: [user.id],
		relationName: "businessOrders",
	}),
	vendor: one(vendorProfile, {
		fields: [order.vendorId],
		references: [vendorProfile.id],
	}),
	items: many(orderItem),
	payments: many(payment),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
	order: one(order, {
		fields: [orderItem.orderId],
		references: [order.id],
	}),
}));

export const paymentRelations = relations(payment, ({ one }) => ({
	business: one(user, {
		fields: [payment.businessId],
		references: [user.id],
		relationName: "businessPayments",
	}),
	vendor: one(vendorProfile, {
		fields: [payment.vendorId],
		references: [vendorProfile.id],
	}),
	order: one(order, {
		fields: [payment.orderId],
		references: [order.id],
	}),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
	user: one(user, { fields: [notification.userId], references: [user.id] }),
}));