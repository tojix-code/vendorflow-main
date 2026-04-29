"use client";

import { use } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, CalendarIcon, PackageIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckIcon, XIcon } from "lucide-react";

type Props = { params: Promise<{ id: string }> };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  accepted: "bg-blue-50 text-blue-700",
  in_progress: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-gray-50 text-gray-600",
  rejected: "bg-red-50 text-red-600",
};

export default function VendorOrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const {
    data: order,
    isLoading,
    refetch,
  } = api.order.getById.useQuery({ id });

  const respond = api.order.respondToOrder.useMutation({
    onSuccess: () => {
      setRejectOpen(false);
      setRejectReason("");
      void refetch();
      toast.success("Response sent!");
    },
    onError: (e) => toast.error(e.message),
  });
  const updateStatus = api.order.updateStatus.useMutation({
    onSuccess: () => {
      void refetch();
      toast.success("Status updated!");
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Order not found</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link href="/Vendor/orders">Go back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Button asChild variant="outline" size="sm" className="border-black/10">
        <Link href="/Vendor/orders">
          <ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Back
        </Link>
      </Button>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#1b3a5c]">
              Reject Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Reason *</Label>
              <Input
                placeholder="Explain why..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <Button
              className="w-full bg-red-500 text-white hover:bg-red-600"
              disabled={!rejectReason.trim() || respond.isPending}
              onClick={() =>
                respond.mutate({
                  id: order.id,
                  action: "rejected",
                  rejectReason,
                })
              }
            >
              Reject Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="border-black/[0.07] bg-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#1b3a5c]">
                  {order.orderRef}
                </h1>
                <Badge
                  className={`border-0 capitalize ${STATUS_COLORS[order.status] ?? ""}`}
                >
                  {order.status.replace("_", " ")}
                </Badge>
              </div>
              {/* ✅ ADD THIS BLOCK */}
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-600">
                  Business:{" "}
                  <span className="font-medium">{order.business?.businessName}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Email:{" "}
                  <span className="font-medium">{order.business?.email}</span>
                </p>
              </div>
              {order.dueDate && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Due:{" "}
                  {new Date(order.dueDate).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
              {order.notes && (
                <p className="mt-2 text-sm text-[#6b6b80]">
                  Notes: {order.notes}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-3">
              <p className="text-3xl font-bold text-[#1b3a5c]">
                ₹{Number(order.totalAmount).toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-2">
                {order.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-700"
                      disabled={respond.isPending}
                      onClick={() =>
                        respond.mutate({ id: order.id, action: "accepted" })
                      }
                    >
                      <CheckIcon className="mr-1 h-3.5 w-3.5" /> Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-500 hover:bg-red-50"
                      onClick={() => setRejectOpen(true)}
                    >
                      <XIcon className="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                  </>
                )}
                {order.status === "accepted" && (
                  <Button
                    size="sm"
                    className="bg-purple-600 text-white hover:bg-purple-700"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({
                        id: order.id,
                        status: "in_progress",
                      })
                    }
                  >
                    Start Progress
                  </Button>
                )}
                {order.status === "in_progress" && (
                  <Button
                    size="sm"
                    className="bg-green-600 text-white hover:bg-green-700"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({ id: order.id, status: "delivered" })
                    }
                  >
                    Mark Delivered
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-black/[0.07] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a1a2e]">
            <PackageIcon className="h-4 w-4" /> Order Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.05] text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 pr-4">Item</th>
                  <th className="pb-3 pr-4 text-right">Qty</th>
                  <th className="pb-3 pr-4 text-right">Unit Price</th>
                  <th className="pb-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4 font-medium text-[#1a1a2e]">
                      {item.itemName}
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">
                      {Number(item.quantity)}
                    </td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">
                      ₹{Number(item.unitPrice).toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-semibold text-[#1b3a5c]">
                      ₹{Number(item.totalPrice).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black/[0.07]">
                  <td
                    colSpan={3}
                    className="pt-3 text-right font-semibold text-[#1a1a2e]"
                  >
                    Total
                  </td>
                  <td className="pt-3 text-right text-lg font-bold text-[#1b3a5c]">
                    ₹{Number(order.totalAmount).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
