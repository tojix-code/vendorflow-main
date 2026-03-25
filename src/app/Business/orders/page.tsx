"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PackageIcon, PlusIcon, Trash2Icon, XCircleIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
	pending: "bg-yellow-50 text-yellow-700",
	accepted: "bg-blue-50 text-blue-700",
	in_progress: "bg-purple-50 text-purple-700",
	delivered: "bg-green-50 text-green-700",
	cancelled: "bg-gray-50 text-gray-600",
	rejected: "bg-red-50 text-red-600",
};

type OrderItem = { id: number; itemName: string; quantity: number; unitPrice: number };

let nextId = 1;
function makeItem(): OrderItem {
	nextId += 1;
	return { id: nextId, itemName: "", quantity: 1, unitPrice: 0 };
}

export default function BusinessOrdersPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [statusFilter, setStatusFilter] = useState("all");
	const [vendorFilter, setVendorFilter] = useState("all");
	const [items, setItems] = useState<OrderItem[]>([{ id: 1, itemName: "", quantity: 1, unitPrice: 0 }]);
	const [form, setForm] = useState({ vendorId: "", dueDate: "", notes: "" });

	const { data: orders, isLoading, refetch } = api.order.getAll.useQuery();
	const { data: vendors } = api.vendor.getAll.useQuery();

	const create = api.order.create.useMutation({
		onSuccess: () => {
			setCreateOpen(false);
			setForm({ vendorId: "", dueDate: "", notes: "" });
			setItems([makeItem()]);
			void refetch();
			toast.success("Order created!");
		},
		onError: (e) => toast.error(e.message),
	});

	const cancel = api.order.cancel.useMutation({
		onSuccess: () => { void refetch(); toast.success("Order cancelled!"); },
		onError: (e) => toast.error(e.message),
	});

	const filtered = orders?.filter((o) => {
		if (statusFilter !== "all" && o.status !== statusFilter) return false;
		if (vendorFilter !== "all" && o.vendorId !== vendorFilter) return false;
		return true;
	}) ?? [];

	function addItem() {
		setItems((p) => [...p, makeItem()]);
	}

	function removeItem(id: number) {
		setItems((p) => p.filter((item) => item.id !== id));
	}

	function updateItem(id: number, field: keyof OrderItem, value: string | number) {
		setItems((p) =>
			p.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
		);
	}

	const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-[#1b3a5c]">Orders</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Track and manage vendor orders
					</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button className="bg-[#1b3a5c] text-white hover:bg-[#2a5580]">
							<PlusIcon className="mr-2 h-4 w-4" /> Create Order
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-2xl">
						<DialogHeader>
							<DialogTitle className="text-xl text-[#1b3a5c]">Create Order</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-2">
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label>Vendor *</Label>
									<Select
										value={form.vendorId}
										onValueChange={(v) => setForm((p) => ({ ...p, vendorId: v }))}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select vendor" />
										</SelectTrigger>
										<SelectContent>
											{vendors?.map((v) => (
												<SelectItem key={v.id} value={v.id}>
													{v.vendorName}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label>Due Date</Label>
									<Input
										type="date"
										value={form.dueDate}
										onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
									/>
								</div>
							</div>

							{/* ORDER ITEMS */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<Label>Items *</Label>
									<Button
										type="button"
										size="sm"
										variant="outline"
										className="border-black/10 text-xs"
										onClick={addItem}
									>
										+ Add Item
									</Button>
								</div>

								{items.map((item) => (
									<div key={item.id} className="grid grid-cols-12 gap-2">
										<Input
											className="col-span-5"
											placeholder="Item name"
											value={item.itemName}
											onChange={(e) => updateItem(item.id, "itemName", e.target.value)}
										/>
										<Input
											className="col-span-2"
											min={1}
											placeholder="Qty"
											type="number"
											value={item.quantity}
											onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))}
										/>
										<Input
											className="col-span-3"
											min={0}
											placeholder="Unit price"
											type="number"
											value={item.unitPrice}
											onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))}
										/>
										<div className="col-span-1 flex items-center justify-end text-xs text-muted-foreground">
											₹{(item.quantity * item.unitPrice).toFixed(0)}
										</div>
										{items.length > 1 && (
											<button
												className="col-span-1 text-red-400 hover:text-red-600"
												type="button"
												onClick={() => removeItem(item.id)}
											>
												<Trash2Icon className="h-4 w-4" />
											</button>
										)}
									</div>
								))}

								<div className="text-right text-sm font-semibold text-[#1b3a5c]">
									Total: ₹{total.toFixed(2)}
								</div>
							</div>

							<div className="space-y-1.5">
								<Label>Notes</Label>
								<Input
									placeholder="Optional notes..."
									value={form.notes}
									onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
								/>
							</div>

							<Button
								className="w-full bg-[#1b3a5c] text-white hover:bg-[#2a5580]"
								disabled={!form.vendorId || items.some((i) => !i.itemName) || create.isPending}
								onClick={() =>
									create.mutate({
										vendorId: form.vendorId,
										items,
										dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
										notes: form.notes || undefined,
									})
								}
							>
								{create.isPending ? "Creating..." : "Create Order"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* FILTERS */}
			<div className="flex flex-wrap gap-3">
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-40">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="accepted">Accepted</SelectItem>
						<SelectItem value="in_progress">In Progress</SelectItem>
						<SelectItem value="delivered">Delivered</SelectItem>
						<SelectItem value="cancelled">Cancelled</SelectItem>
						<SelectItem value="rejected">Rejected</SelectItem>
					</SelectContent>
				</Select>
				<Select value={vendorFilter} onValueChange={setVendorFilter}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="Vendor" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Vendors</SelectItem>
						{vendors?.map((v) => (
							<SelectItem key={v.id} value={v.id}>
								{v.vendorName}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* LIST */}
			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3, 4].map((i) => (
						<Skeleton key={i} className="h-24 rounded-xl" />
					))}
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
					<PackageIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">No orders found</p>
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((o) => (
						<Card key={o.id} className="border-black/[0.07] bg-white">
							<CardContent className="p-5">
								<div className="flex items-center justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<p className="font-semibold text-[#1a1a2e]">{o.orderRef}</p>
											<Badge className={`border-0 capitalize ${STATUS_COLORS[o.status] ?? ""}`}>
												{o.status.replace("_", " ")}
											</Badge>
										</div>
										<p className="mt-0.5 text-sm text-muted-foreground">
											{o.vendor.vendorName}
										</p>
										<div className="mt-1 flex gap-4 text-xs text-muted-foreground">
											<span>
												{o.items.length} item{o.items.length !== 1 ? "s" : ""}
											</span>
											{o.dueDate && (
												<span>
													Due:{" "}
													{new Date(o.dueDate).toLocaleDateString("en-US", {
														month: "short",
														day: "numeric",
														year: "numeric",
													})}
												</span>
											)}
										</div>
									</div>
									<div className="flex items-center gap-3">
										<p className="text-lg font-bold text-[#1b3a5c]">
											₹{Number(o.totalAmount).toLocaleString()}
										</p>
										<Link href={`/Business/orders/${o.id}`}>
											<Button variant="outline" size="sm" className="border-black/10">
												View
											</Button>
										</Link>
										{["pending", "in_progress"].includes(o.status) && (
											<AlertDialog>
												<AlertDialogTrigger asChild>
													<Button
														variant="outline"
														size="sm"
														className="border-orange-200 text-orange-500 hover:bg-orange-50"
													>
														<XCircleIcon className="h-4 w-4" />
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Cancel Order?</AlertDialogTitle>
														<AlertDialogDescription>
															This order will be marked as cancelled.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Go Back</AlertDialogCancel>
														<AlertDialogAction
															className="bg-orange-500 hover:bg-orange-600"
															onClick={() => cancel.mutate({ id: o.id })}
														>
															Cancel Order
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										)}
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}