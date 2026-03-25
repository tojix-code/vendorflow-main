"use client";

import { useEffect, useRef } from "react";
import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircleIcon, ClockIcon, PackageIcon, WalletIcon } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
	pending: "bg-yellow-50 text-yellow-700",
	accepted: "bg-blue-50 text-blue-700",
	in_progress: "bg-purple-50 text-purple-700",
	delivered: "bg-green-50 text-green-700",
	cancelled: "bg-gray-50 text-gray-600",
	rejected: "bg-red-50 text-red-600",
};

export default function VendorDashboard() {
	const utils = api.useUtils();
	const linked = useRef(false);

	const { mutate: linkMutate } = api.vendor.linkMyProfile.useMutation({
		onSuccess: () => {
			void utils.order.getMyOrders.invalidate();
			void utils.payment.getMyPayments.invalidate();
			void utils.notification.getUnreadCount.invalidate();
		},
	});

	// Run once on mount — useRef prevents double-fire in strict mode
	useEffect(() => {
		if (linked.current) return;
		linked.current = true;
		linkMutate();
	}, [linkMutate]);

	const { data: orders, isLoading: oLoading } = api.order.getMyOrders.useQuery();
	const { data: payments, isLoading: pLoading } = api.payment.getMyPayments.useQuery();
	const { data: notifications } = api.notification.getUnreadCount.useQuery();

	const assignedOrders =
		orders?.filter((o) => ["pending", "accepted", "in_progress"].includes(o.status)).length ?? 0;
	const completedOrders = orders?.filter((o) => o.status === "delivered").length ?? 0;
	const pendingPayments = payments?.filter((p) => p.status === "pending").length ?? 0;
	const unreadCount = notifications?.count ?? 0;
	const recentOrders = orders?.slice(0, 5) ?? [];

	const stats = [
		{
			bg: "bg-blue-50",
			color: "text-blue-600",
			href: "/Vendor/orders",
			icon: PackageIcon,
			loading: oLoading,
			title: "Assigned Orders",
			value: assignedOrders,
		},
		{
			bg: "bg-green-50",
			color: "text-green-600",
			href: "/Vendor/orders",
			icon: CheckCircleIcon,
			loading: oLoading,
			title: "Completed Orders",
			value: completedOrders,
		},
		{
			bg: "bg-orange-50",
			color: "text-orange-600",
			href: "/Vendor/payments",
			icon: WalletIcon,
			loading: pLoading,
			title: "Pending Payments",
			value: pendingPayments,
		},
		{
			bg: "bg-[#1b3a5c]/10",
			color: "text-[#1b3a5c]",
			href: "/Vendor/notifications",
			icon: ClockIcon,
			loading: false,
			title: "Notifications",
			value: unreadCount,
		},
	];

	return (
		<div className="w-full space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-[#1b3a5c]">Dashboard</h1>
				<p className="mt-1 text-sm text-muted-foreground">Your work overview</p>
			</div>

			{/* STATS */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Link href={stat.href} key={stat.title}>
						<Card className="cursor-pointer border-black/[0.07] bg-white transition hover:-translate-y-0.5 hover:shadow-md">
							<CardContent className="p-5">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm text-muted-foreground">{stat.title}</p>
										{stat.loading ? (
											<Skeleton className="mt-1 h-8 w-16" />
										) : (
											<p className="mt-1 text-3xl font-bold text-[#1a1a2e]">{stat.value}</p>
										)}
									</div>
									<div
										className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
									>
										<stat.icon className={`h-6 w-6 ${stat.color}`} />
									</div>
								</div>
							</CardContent>
						</Card>
					</Link>
				))}
			</div>

			{/* RECENT ORDERS */}
			<Card className="border-black/[0.07] bg-white">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a1a2e]">
							<ClockIcon className="h-4 w-4" /> Recent Orders
						</CardTitle>
						<Link
							className="text-xs font-medium text-[#1b3a5c] hover:underline"
							href="/Vendor/orders"
						>
							View all
						</Link>
					</div>
				</CardHeader>
				<CardContent>
					{oLoading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<Skeleton key={i} className="h-12 rounded-lg" />
							))}
						</div>
					) : recentOrders.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted-foreground">
							No orders assigned yet
						</p>
					) : (
						<div className="space-y-2">
							{recentOrders.map((o) => (
								<Link href={`/Vendor/orders/${o.id}`} key={o.id}>
									<div className="flex items-center justify-between rounded-lg border border-black/[0.05] bg-[#f8f7f4] px-4 py-3 transition hover:bg-[#f0ede8]">
										<div>
											<p className="text-sm font-medium text-[#1a1a2e]">{o.orderRef}</p>
											<p className="text-xs text-muted-foreground">
												{o.items.length} item{o.items.length !== 1 ? "s" : ""}
											</p>
										</div>
										<div className="flex items-center gap-3">
											<p className="text-sm font-semibold text-[#1a1a2e]">
												₹{Number(o.totalAmount).toLocaleString()}
											</p>
											<Badge
												className={`border-0 capitalize ${STATUS_COLORS[o.status] ?? ""}`}
											>
												{o.status.replace("_", " ")}
											</Badge>
										</div>
									</div>
								</Link>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}