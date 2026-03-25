"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { BarChart3Icon, PackageIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

const COLORS = ["#1b3a5c", "#e07b39", "#4f86c6", "#6cbb8a", "#f5c842", "#e05c5c"];

// ── Tooltip formatter with proper types ──
function currencyFormatter(value: unknown) {
	return [`₹${Number(value).toLocaleString()}`, "Amount"] as [string, string];
}

// ── Pie label renderer ──
function renderPieLabel({
	name,
	percent,
}: {
	name?: string;
	percent?: number;
}) {
	if (!name || percent === undefined) return "";
	return `${name} ${(percent * 100).toFixed(0)}%`;
}

export default function BusinessReportsPage() {
	const { data: orders, isLoading: oLoading } = api.order.getAll.useQuery();
	const { data: payments, isLoading: pLoading } = api.payment.getAll.useQuery();
	const { data: vendors } = api.vendor.getAll.useQuery();

	// ── Order status breakdown ──
	const statusData = ["pending", "accepted", "in_progress", "delivered", "cancelled", "rejected"]
		.map((s) => ({
			name: s.replace("_", " "),
			value: orders?.filter((o) => o.status === s).length ?? 0,
		}))
		.filter((d) => d.value > 0);

	// ── Monthly order volume (last 6 months) ──
	const monthlyOrders = (() => {
		const months: Record<string, number> = {};
		const now = new Date();
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
			months[key] = 0;
		}
		orders?.forEach((o) => {
			const key = new Date(o.createdAt).toLocaleDateString("en-US", {
				month: "short",
				year: "2-digit",
			});
			if (Object.prototype.hasOwnProperty.call(months, key)) {
				months[key] = (months[key] ?? 0) + 1;
			}
		});
		return Object.entries(months).map(([name, count]) => ({ count, name }));
	})();

	// ── Monthly payment amounts ──
	const monthlyPayments = (() => {
		const months: Record<string, number> = {};
		const now = new Date();
		for (let i = 5; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
			const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
			months[key] = 0;
		}
		payments?.forEach((p) => {
			const key = new Date(p.createdAt).toLocaleDateString("en-US", {
				month: "short",
				year: "2-digit",
			});
			if (Object.prototype.hasOwnProperty.call(months, key)) {
				months[key] = (months[key] ?? 0) + Number(p.amount);
			}
		});
		return Object.entries(months).map(([name, amount]) => ({
			amount: Math.round(amount),
			name,
		}));
	})();

	// ── Vendor order performance ──
	const vendorPerf =
		vendors
			?.map((v) => {
				const vendorOrders = orders?.filter((o) => o.vendorId === v.id) ?? [];
				const delivered = vendorOrders.filter((o) => o.status === "delivered").length;
				const total = vendorOrders.length;
				return {
					delivered,
					name: v.vendorName.length > 12 ? `${v.vendorName.slice(0, 12)}…` : v.vendorName,
					orders: total,
					rate: total > 0 ? Math.round((delivered / total) * 100) : 0,
				};
			})
			.filter((v) => v.orders > 0) ?? [];

	// ── Summary stats ──
	const totalRevenue =
		payments
			?.filter((p) => p.status === "confirmed")
			.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
	const pendingAmount =
		payments
			?.filter((p) => p.status === "pending")
			.reduce((s, p) => s + Number(p.amount), 0) ?? 0;
	const completionRate = orders?.length
		? Math.round(
				(orders.filter((o) => o.status === "delivered").length / orders.length) * 100,
			)
		: 0;

	if (oLoading || pLoading) {
		return (
			<div className="w-full space-y-6">
				<Skeleton className="h-10 w-48" />
				<div className="grid grid-cols-3 gap-4">
					{[1, 2, 3].map((i) => (
						<Skeleton key={i} className="h-28 rounded-xl" />
					))}
				</div>
				<Skeleton className="h-72 rounded-xl" />
				<Skeleton className="h-72 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-[#1b3a5c]">Reports & Analytics</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Insights into your vendor operations
				</p>
			</div>

			{/* SUMMARY STATS */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{[
					{
						bg: "bg-green-50",
						color: "text-green-600",
						icon: WalletIcon,
						label: "Total Confirmed Payments",
						value: `₹${totalRevenue.toLocaleString()}`,
					},
					{
						bg: "bg-orange-50",
						color: "text-orange-600",
						icon: TrendingUpIcon,
						label: "Pending Payments",
						value: `₹${pendingAmount.toLocaleString()}`,
					},
					{
						bg: "bg-blue-50",
						color: "text-blue-600",
						icon: PackageIcon,
						label: "Order Completion Rate",
						value: `${completionRate}%`,
					},
				].map((s) => (
					<Card key={s.label} className="border-black/[0.07] bg-white">
						<CardContent className="flex items-center gap-4 p-5">
							<div
								className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}
							>
								<s.icon className={`h-6 w-6 ${s.color}`} />
							</div>
							<div>
								<p className="text-sm text-muted-foreground">{s.label}</p>
								<p className="text-2xl font-bold text-[#1a1a2e]">{s.value}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* MONTHLY ORDERS */}
			<Card className="border-black/[0.07] bg-white">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a1a2e]">
						<BarChart3Icon className="h-4 w-4" /> Monthly Order Volume
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer height={250} width="100%">
						<BarChart
							data={monthlyOrders}
							margin={{ bottom: 5, left: -20, right: 10, top: 5 }}
						>
							<CartesianGrid stroke="#f0ede8" strokeDasharray="3 3" />
							<XAxis dataKey="name" tick={{ fill: "#7a7a8c", fontSize: 12 }} />
							<YAxis tick={{ fill: "#7a7a8c", fontSize: 12 }} />
							<Tooltip
								contentStyle={{
									border: "none",
									borderRadius: 8,
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								}}
							/>
							<Bar dataKey="count" fill="#1b3a5c" name="Orders" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			{/* MONTHLY PAYMENTS */}
			<Card className="border-black/[0.07] bg-white">
				<CardHeader className="pb-2">
					<CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a1a2e]">
						<WalletIcon className="h-4 w-4" /> Monthly Payment Amounts (₹)
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ResponsiveContainer height={250} width="100%">
						<LineChart
							data={monthlyPayments}
							margin={{ bottom: 5, left: -10, right: 10, top: 5 }}
						>
							<CartesianGrid stroke="#f0ede8" strokeDasharray="3 3" />
							<XAxis dataKey="name" tick={{ fill: "#7a7a8c", fontSize: 12 }} />
							<YAxis tick={{ fill: "#7a7a8c", fontSize: 12 }} />
							<Tooltip
								contentStyle={{
									border: "none",
									borderRadius: 8,
									boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
								}}
								formatter={currencyFormatter}
							/>
							<Line
								dataKey="amount"
								dot={{ fill: "#e07b39", r: 4 }}
								name="Amount"
								stroke="#e07b39"
								strokeWidth={2.5}
								type="monotone"
							/>
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* ORDER STATUS PIE */}
				<Card className="border-black/[0.07] bg-white">
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-semibold text-[#1a1a2e]">
							Order Status Breakdown
						</CardTitle>
					</CardHeader>
					<CardContent>
						{statusData.length === 0 ? (
							<p className="py-10 text-center text-sm text-muted-foreground">
								No order data yet
							</p>
						) : (
							<ResponsiveContainer height={220} width="100%">
								<PieChart>
									<Pie
										cx="50%"
										cy="50%"
										data={statusData}
										dataKey="value"
										label={renderPieLabel}
										labelLine={false}
										outerRadius={80}
									>
										{statusData.map((entry, i) => (
											<Cell
												key={entry.name}
												fill={COLORS[i % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											border: "none",
											borderRadius: 8,
											boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>

				{/* VENDOR PERFORMANCE */}
				<Card className="border-black/[0.07] bg-white">
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-semibold text-[#1a1a2e]">
							Vendor Delivery Rate (%)
						</CardTitle>
					</CardHeader>
					<CardContent>
						{vendorPerf.length === 0 ? (
							<p className="py-10 text-center text-sm text-muted-foreground">
								No vendor data yet
							</p>
						) : (
							<ResponsiveContainer height={220} width="100%">
								<BarChart
									data={vendorPerf}
									margin={{ bottom: 5, left: -20, right: 10, top: 5 }}
								>
									<CartesianGrid stroke="#f0ede8" strokeDasharray="3 3" />
									<XAxis dataKey="name" tick={{ fill: "#7a7a8c", fontSize: 11 }} />
									<YAxis domain={[0, 100]} tick={{ fill: "#7a7a8c", fontSize: 12 }} />
									<Tooltip
										contentStyle={{
											border: "none",
											borderRadius: 8,
											boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
										}}
									/>
									<Bar
										dataKey="rate"
										fill="#4f86c6"
										name="Delivery Rate %"
										radius={[4, 4, 0, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}