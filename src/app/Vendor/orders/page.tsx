"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckIcon, PackageIcon, XIcon } from "lucide-react";
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

export default function VendorOrdersPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const { data: orders, isLoading, refetch } = api.order.getMyOrders.useQuery();

  const respond = api.order.respondToOrder.useMutation({
    onSuccess: () => { setRejectOpen(false); setRejectReason(""); void refetch(); toast.success("Response sent!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatus = api.order.updateStatus.useMutation({
    onSuccess: () => { void refetch(); toast.success("Status updated!"); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = orders?.filter((o) => statusFilter === "all" || o.status === statusFilter) ?? [];

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1b3a5c]">My Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage your assigned orders</p>
      </div>

      {/* REJECT DIALOG */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl text-[#1b3a5c]">Reject Order</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Reason for Rejection *</Label>
              <Input placeholder="Explain why you're rejecting this order..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
            <Button className="w-full bg-red-500 text-white hover:bg-red-600" disabled={!rejectReason.trim() || respond.isPending} onClick={() => respond.mutate({ id: rejectId, action: "rejected", rejectReason })}>
              {respond.isPending ? "Submitting..." : "Reject Order"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-44"><SelectValue placeholder="Filter status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="accepted">Accepted</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="rejected">Rejected</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
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
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#1a1a2e]">{o.orderRef}</p>
                      <Badge className={`border-0 capitalize ${STATUS_COLORS[o.status] ?? ""}`}>{o.status.replace("_", " ")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{o.items.length} item{o.items.length !== 1 ? "s" : ""}</p>
                    <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-[#1b3a5c]">₹{Number(o.totalAmount).toLocaleString()}</span>
                      {o.dueDate && <span>Due: {new Date(o.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>}
                    </div>
                    {o.rejectReason && <p className="mt-1 text-xs text-red-500">Reason: {o.rejectReason}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/Vendor/orders/${o.id}`}>
                      <Button variant="outline" size="sm" className="border-black/10">View</Button>
                    </Link>
                    {o.status === "pending" && (
                      <>
                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" disabled={respond.isPending} onClick={() => respond.mutate({ id: o.id, action: "accepted" })}>
                          <CheckIcon className="mr-1 h-3.5 w-3.5" /> Accept
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-200 text-red-500 hover:bg-red-50" onClick={() => { setRejectId(o.id); setRejectOpen(true); }}>
                          <XIcon className="mr-1 h-3.5 w-3.5" /> Reject
                        </Button>
                      </>
                    )}
                    {o.status === "accepted" && (
                      <Button size="sm" className="bg-purple-600 text-white hover:bg-purple-700" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: o.id, status: "in_progress" })}>
                        Start Progress
                      </Button>
                    )}
                    {o.status === "in_progress" && (
                      <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: o.id, status: "delivered" })}>
                        Mark Delivered
                      </Button>
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