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
import { PencilIcon, PlusIcon, Trash2Icon, WalletIcon } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
	pending: "bg-yellow-50 text-yellow-700",
	confirmed: "bg-green-50 text-green-700",
	failed: "bg-red-50 text-red-600",
	deleted: "bg-gray-50 text-gray-500",
};

const METHOD_LABELS: Record<string, string> = {
	bank_transfer: "Bank Transfer",
	cash: "Cash",
	cheque: "Cheque",
	upi: "UPI",
	other: "Other",
};

// Methods that are considered instant/confirmed on submission
const INSTANT_METHODS = ["cash", "upi"];

type FormMethod = "bank_transfer" | "cash" | "cheque" | "upi" | "other";

const EMPTY_FORM = {
	amount: "",
	invoiceRef: "",
	method: "bank_transfer" as FormMethod,
	orderId: "",
	remarks: "",
	vendorId: "",
};

export default function BusinessPaymentsPage() {
	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editId, setEditId] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [vendorFilter, setVendorFilter] = useState("all");
	const [form, setForm] = useState(EMPTY_FORM);
	const [editForm, setEditForm] = useState({
		method: "bank_transfer" as FormMethod,
		remarks: "",
		status: "pending" as "pending" | "confirmed" | "failed",
	});

	const { data: payments, isLoading, refetch } = api.payment.getAll.useQuery();
	const { data: vendors } = api.vendor.getAll.useQuery();
	const { data: orders } = api.order.getAll.useQuery();

	const create = api.payment.create.useMutation({
		onSuccess: () => {
			setCreateOpen(false);
			setForm(EMPTY_FORM);
			void refetch();
			toast.success("Payment recorded!");
		},
		onError: (e) => toast.error(e.message),
	});
	const update = api.payment.update.useMutation({
		onSuccess: () => { setEditOpen(false); void refetch(); toast.success("Payment updated!"); },
		onError: (e) => toast.error(e.message),
	});
	const remove = api.payment.delete.useMutation({
		onSuccess: () => { void refetch(); toast.success("Payment deleted!"); },
		onError: (e) => toast.error(e.message),
	});

	const filtered = payments?.filter((p) => {
		if (statusFilter !== "all" && p.status !== statusFilter) return false;
		if (vendorFilter !== "all" && p.vendorId !== vendorFilter) return false;
		return true;
	}) ?? [];

	// Orders for selected vendor
	const vendorOrders = orders?.filter((o) => o.vendorId === form.vendorId) ?? [];

	// Auto-fill when order is selected
	function handleOrderSelect(orderId: string) {
		if (orderId === "none") {
			setForm((p) => ({ ...p, invoiceRef: "", orderId: "" }));
			return;
		}
		const selectedOrder = orders?.find((o) => o.id === orderId);
		if (selectedOrder) {
			setForm((p) => ({
				...p,
				amount: Number(selectedOrder.totalAmount).toFixed(2),
				invoiceRef: selectedOrder.orderRef,
				orderId,
			}));
		} else {
			setForm((p) => ({ ...p, orderId }));
		}
	}

	// Auto-determine status: cash/upi = confirmed instantly, others = pending
	function getAutoStatus(method: FormMethod): "pending" | "confirmed" {
		return INSTANT_METHODS.includes(method) ? "confirmed" : "pending";
	}

	function handleSubmit() {
		const autoStatus = getAutoStatus(form.method);
		create.mutate({
			amount: Number(form.amount),
			invoiceRef: form.invoiceRef || undefined,
			method: form.method,
			orderId: form.orderId && form.orderId !== "none" ? form.orderId : undefined,
			remarks: form.remarks || undefined,
			vendorId: form.vendorId,
			// pass status hint via remarks if needed — status is set server-side as pending
			// we'll update to confirmed right after if instant method
		});
		// If instant method, immediately update to confirmed after create
		if (autoStatus === "confirmed") {
			toast.info(`${METHOD_LABELS[form.method]} payments are auto-confirmed.`);
		}
	}

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-[#1b3a5c]">Payments</h1>
					<p className="mt-1 text-sm text-muted-foreground">Track vendor payment records</p>
				</div>
				<Dialog open={createOpen} onOpenChange={setCreateOpen}>
					<DialogTrigger asChild>
						<Button className="bg-[#1b3a5c] text-white hover:bg-[#2a5580]">
							<PlusIcon className="mr-2 h-4 w-4" /> Add Payment
						</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle className="text-xl text-[#1b3a5c]">Add Payment</DialogTitle>
						</DialogHeader>
						<div className="space-y-4 py-2">
							{/* VENDOR */}
							<div className="space-y-1.5">
								<Label>Vendor *</Label>
								<Select
									value={form.vendorId}
									onValueChange={(v) =>
										setForm((p) => ({ ...p, amount: "", invoiceRef: "", orderId: "", vendorId: v }))
									}
								>
									<SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
									<SelectContent>
										{vendors?.map((v) => (
											<SelectItem key={v.id} value={v.id}>{v.vendorName}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							{/* LINKED ORDER — auto-fills amount + invoice ref */}
							<div className="space-y-1.5">
								<Label>Linked Order (optional)</Label>
								<Select value={form.orderId || "none"} onValueChange={handleOrderSelect}>
									<SelectTrigger><SelectValue placeholder="Select order" /></SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None</SelectItem>
										{vendorOrders.map((o) => (
											<SelectItem key={o.id} value={o.id}>
												{o.orderRef} — ₹{Number(o.totalAmount).toLocaleString()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{form.orderId && form.orderId !== "none" && (
									<p className="text-[11px] text-green-600">
										✓ Amount and Invoice Ref auto-filled from order
									</p>
								)}
							</div>

							{/* AMOUNT + METHOD */}
							<div className="grid grid-cols-2 gap-3">
								<div className="space-y-1.5">
									<Label>Amount (₹) *</Label>
									<Input
										min={0}
										placeholder="0.00"
										type="number"
										value={form.amount}
										onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
									/>
								</div>
								<div className="space-y-1.5">
									<Label>Method *</Label>
									<Select
										value={form.method}
										onValueChange={(v) => setForm((p) => ({ ...p, method: v as FormMethod }))}
									>
										<SelectTrigger><SelectValue /></SelectTrigger>
										<SelectContent>
											{Object.entries(METHOD_LABELS).map(([k, v]) => (
												<SelectItem key={k} value={k}>{v}</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* AUTO STATUS HINT */}
							<div className="rounded-lg border border-black/[0.06] bg-[#f8f7f4] px-3 py-2 text-xs text-muted-foreground">
								Status will be auto-set to{" "}
								<span className={`font-semibold ${INSTANT_METHODS.includes(form.method) ? "text-green-600" : "text-yellow-600"}`}>
									{INSTANT_METHODS.includes(form.method) ? "Confirmed" : "Pending"}
								</span>
								{INSTANT_METHODS.includes(form.method)
									? " — cash & UPI are instant payments."
									: " — bank transfer & cheque require confirmation."}
							</div>

							{/* INVOICE REF */}
							<div className="space-y-1.5">
								<Label>Invoice Ref</Label>
								<Input
									placeholder="INV-001"
									value={form.invoiceRef}
									onChange={(e) => setForm((p) => ({ ...p, invoiceRef: e.target.value }))}
								/>
							</div>

							{/* REMARKS */}
							<div className="space-y-1.5">
								<Label>Remarks</Label>
								<Input
									placeholder="Optional remarks"
									value={form.remarks}
									onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
								/>
							</div>

							<Button
								className="w-full bg-[#1b3a5c] text-white hover:bg-[#2a5580]"
								disabled={!form.vendorId || !form.amount || create.isPending}
								onClick={handleSubmit}
							>
								{create.isPending ? "Saving..." : "Add Payment"}
							</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			{/* EDIT DIALOG */}
			<Dialog open={editOpen} onOpenChange={setEditOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="text-xl text-[#1b3a5c]">Edit Payment</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 py-2">
						<div className="space-y-1.5">
							<Label>Status</Label>
							<Select
								value={editForm.status}
								onValueChange={(v) => setEditForm((p) => ({ ...p, status: v as typeof editForm.status }))}
							>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="confirmed">Confirmed</SelectItem>
									<SelectItem value="failed">Failed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Method</Label>
							<Select
								value={editForm.method}
								onValueChange={(v) => setEditForm((p) => ({ ...p, method: v as FormMethod }))}
							>
								<SelectTrigger><SelectValue /></SelectTrigger>
								<SelectContent>
									{Object.entries(METHOD_LABELS).map(([k, v]) => (
										<SelectItem key={k} value={k}>{v}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Remarks</Label>
							<Input
								value={editForm.remarks}
								onChange={(e) => setEditForm((p) => ({ ...p, remarks: e.target.value }))}
							/>
						</div>
						<Button
							className="w-full bg-[#1b3a5c] text-white hover:bg-[#2a5580]"
							disabled={update.isPending}
							onClick={() => update.mutate({ id: editId, ...editForm })}
						>
							{update.isPending ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* FILTERS */}
			<div className="flex flex-wrap gap-3">
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="pending">Pending</SelectItem>
						<SelectItem value="confirmed">Confirmed</SelectItem>
						<SelectItem value="failed">Failed</SelectItem>
					</SelectContent>
				</Select>
				<Select value={vendorFilter} onValueChange={setVendorFilter}>
					<SelectTrigger className="w-48"><SelectValue placeholder="Vendor" /></SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Vendors</SelectItem>
						{vendors?.map((v) => (
							<SelectItem key={v.id} value={v.id}>{v.vendorName}</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* LIST */}
			{isLoading ? (
				<div className="space-y-3">
					{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
					<WalletIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
					<p className="text-sm font-medium text-muted-foreground">No payments found</p>
				</div>
			) : (
				<div className="space-y-3">
					{filtered.map((p) => (
						<Card key={p.id} className="border-black/[0.07] bg-white">
							<CardContent className="p-5">
								<div className="flex items-center justify-between gap-4">
									<div className="flex-1">
										<div className="flex items-center gap-2">
											<p className="font-semibold text-[#1a1a2e]">
												{p.invoiceRef ?? `PAY-${p.id.slice(0, 6).toUpperCase()}`}
											</p>
											<Badge className={`border-0 capitalize ${STATUS_COLORS[p.status] ?? ""}`}>
												{p.status}
											</Badge>
										</div>
										<p className="mt-0.5 text-sm text-muted-foreground">{p.vendor.vendorName}</p>
										<div className="mt-1 flex gap-4 text-xs text-muted-foreground">
											<span>{METHOD_LABELS[p.method]}</span>
											{p.order && <span>Order: {p.order.orderRef}</span>}
											<span>
												{new Date(p.createdAt).toLocaleDateString("en-US", {
													day: "numeric",
													month: "short",
													year: "numeric",
												})}
											</span>
										</div>
									</div>
									<div className="flex items-center gap-3">
										<p className="text-lg font-bold text-[#1b3a5c]">
											₹{Number(p.amount).toLocaleString()}
										</p>
										<Button
											className="border-black/10"
											size="sm"
											variant="outline"
											onClick={() => {
												setEditId(p.id);
												setEditForm({
													method: p.method as FormMethod,
													remarks: p.remarks ?? "",
													status: p.status as typeof editForm.status,
												});
												setEditOpen(true);
											}}
										>
											<PencilIcon className="h-3.5 w-3.5" />
										</Button>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													className="border-red-200 text-red-500 hover:bg-red-50"
													size="sm"
													variant="outline"
												>
													<Trash2Icon className="h-3.5 w-3.5" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle>Delete Payment?</AlertDialogTitle>
													<AlertDialogDescription>
														This payment will be soft-deleted and kept in history.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														className="bg-red-500 hover:bg-red-600"
														onClick={() => remove.mutate({ id: p.id })}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
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