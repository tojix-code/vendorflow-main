"use client";

import { use } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, CalendarIcon, PackageIcon } from "lucide-react";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  accepted: "bg-blue-50 text-blue-700",
  in_progress: "bg-purple-50 text-purple-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-gray-50 text-gray-600",
  rejected: "bg-red-50 text-red-600",
};

export default function BusinessOrderDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: order, isLoading } = api.order.getById.useQuery({ id });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div>;
  }
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Order not found</p>
        <Button asChild variant="outline" size="sm" className="mt-3"><Link href="/Business/orders">Go back</Link></Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Button asChild variant="outline" size="sm" className="border-black/10">
        <Link href="/Business/orders"><ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Back</Link>
      </Button>

      <Card className="border-black/[0.07] bg-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#1b3a5c]">{order.orderRef}</h1>
                <Badge className={`border-0 capitalize ${STATUS_COLORS[order.status] ?? ""}`}>{order.status.replace("_", " ")}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Vendor: <span className="font-medium text-[#1a1a2e]">{order.vendor.vendorName}</span></p>
              {order.dueDate && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  Due: {new Date(order.dueDate).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                </p>
              )}
              {order.rejectReason && <p className="mt-2 text-sm text-red-500">Rejection reason: {order.rejectReason}</p>}
              {order.notes && <p className="mt-2 text-sm text-[#6b6b80]">Notes: {order.notes}</p>}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[#1b3a5c]">₹{Number(order.totalAmount).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ORDER ITEMS */}
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
                    <td className="py-3 pr-4 font-medium text-[#1a1a2e]">{item.itemName}</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">{Number(item.quantity)}</td>
                    <td className="py-3 pr-4 text-right text-muted-foreground">₹{Number(item.unitPrice).toLocaleString()}</td>
                    <td className="py-3 text-right font-semibold text-[#1b3a5c]">₹{Number(item.totalPrice).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black/[0.07]">
                  <td colSpan={3} className="pt-3 text-right font-semibold text-[#1a1a2e]">Total</td>
                  <td className="pt-3 text-right text-lg font-bold text-[#1b3a5c]">₹{Number(order.totalAmount).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* PAYMENTS */}
      {order.payments?.length > 0 && (
        <Card className="border-black/[0.07] bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-[#1a1a2e]">Linked Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {order.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-4 py-3">
                  <p className="text-sm font-medium text-[#1a1a2e]">{p.invoiceRef ?? `PAY-${p.id.slice(0, 6).toUpperCase()}`}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-[#1b3a5c]">₹{Number(p.amount).toLocaleString()}</p>
                    <Badge className={`border-0 capitalize ${p.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{p.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}