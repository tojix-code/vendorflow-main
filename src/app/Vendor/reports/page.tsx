"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { CheckCircleIcon, PackageIcon, TrendingUpIcon, WalletIcon } from "lucide-react";

const CHART_COLORS = ["#1b3a5c", "#e07b39", "#4f86c6", "#6cbb8a", "#f5c842", "#e05c5c"];

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

export default function VendorReportsPage() {
	const { data: orders, isLoading: oLoading } = api.order.getMyOrders.useQuery();
	const { data: payments, isLoading: pLoading } = api.payment.getMyPayments.useQuery();

	const totalOrders = orders?.length ?? 0;
	const deliveredOrders = orders?.filter((o) => o.status === "delivered").length ?? 0;
	const acceptanceRate =
		totalOrders > 0
			? Math.round(
					((orders?.filter((o) => o.status !== "rejected").length ?? 0) / totalOrders) * 100,
				)
			: 0;
	const deliveryRate =
		totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
	const totalConfirmed =
		payments
			?.filter((p) => p.status === "confirmed")
			.reduce((s, p) => s + Number(p.amount), 0) ?? 0;

	// ── Monthly order history ──
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

	// ── Status breakdown ──
	const statusData = ["pending", "accepted", "in_progress", "delivered", "cancelled", "rejected"]
		.map((s) => ({
			name: s.replace("_", " "),
			value: orders?.filter((o) => o.status === s).length ?? 0,
		}))
		.filter((d) => d.value > 0);

	if (oLoading || pLoading) {
		return (
			<div className="w-full space-y-6">
				<Skeleton className="h-10 w-48" />
				<div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-28 rounded-xl" />
					))}
				</div>
				<Skeleton className="h-72 rounded-xl" />
			</div>
		);
	}

	return (
		<div className="w-full space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-[#1b3a5c]">Reports & Analytics</h1>
				<p className="mt-1 text-sm text-muted-foreground">Your performance overview</p>
			</div>

			{/* STATS */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{[
					{
						bg: "bg-blue-50",
						color: "text-blue-600",
						icon: PackageIcon,
						label: "Total Orders",
						value: totalOrders,
					},
					{
						bg: "bg-green-50",
						color: "text-green-600",
						icon: CheckCircleIcon,
						label: "Acceptance Rate",
						value: `${acceptanceRate}%`,
					},
					{
						bg: "bg-purple-50",
						color: "text-purple-600",
						icon: TrendingUpIcon,
						label: "Delivery Rate",
						value: `${deliveryRate}%`,
					},
					{
						bg: "bg-orange-50",
						color: "text-orange-600",
						icon: WalletIcon,
						label: "Confirmed Payments",
						value: `₹${totalConfirmed.toLocaleString()}`,
					},
				].map((s) => (
					<Card key={s.label} className="border-black/[0.07] bg-white">
						<CardContent className="flex items-center gap-4 p-5">
							<div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
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

			{/* MONTHLY ORDER HISTORY */}
			<Card className="border-black/[0.07] bg-white">
				<CardHeader className="pb-2">
					<CardTitle className="text-base font-semibold text-[#1a1a2e]">
						Order History (Last 6 Months)
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
							<Bar dataKey="count" fill="#e07b39" name="Orders" radius={[4, 4, 0, 0]} />
						</BarChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				{/* STATUS PIE */}
				<Card className="border-black/[0.07] bg-white">
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-semibold text-[#1a1a2e]">
							Order Status Breakdown
						</CardTitle>
					</CardHeader>
					<CardContent>
						{statusData.length === 0 ? (
							<p className="py-10 text-center text-sm text-muted-foreground">
								No orders yet
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
										{statusData.map((entry) => (
											<Cell
												key={entry.name}
												fill={CHART_COLORS[statusData.indexOf(entry) % CHART_COLORS.length]}
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

				{/* PAYMENT HISTORY */}
				<Card className="border-black/[0.07] bg-white">
					<CardHeader className="pb-2">
						<CardTitle className="text-base font-semibold text-[#1a1a2e]">
							Payment History
						</CardTitle>
					</CardHeader>
					<CardContent>
						{!payments?.length ? (
							<p className="py-10 text-center text-sm text-muted-foreground">
								No payments yet
							</p>
						) : (
							<div className="max-h-52 space-y-2 overflow-y-auto">
								{payments.map((p) => (
									<div
										key={p.id}
										className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-4 py-2.5"
									>
										<div>
											<p className="text-sm font-medium text-[#1a1a2e]">
												{p.invoiceRef ?? `PAY-${p.id.slice(0, 6).toUpperCase()}`}
											</p>
											<p className="text-xs text-muted-foreground">
												{new Date(p.createdAt).toLocaleDateString("en-US", {
													day: "numeric",
													month: "short",
													year: "numeric",
												})}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<p className="text-sm font-semibold text-[#1b3a5c]">
												₹{Number(p.amount).toLocaleString()}
											</p>
											<Badge
												className={`border-0 capitalize text-xs ${
													p.status === "confirmed"
														? "bg-green-50 text-green-700"
														: p.status === "pending"
															? "bg-yellow-50 text-yellow-700"
															: "bg-gray-50 text-gray-500"
												}`}
											>
												{p.status}
											</Badge>
										</div>
									</div>
								))}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}