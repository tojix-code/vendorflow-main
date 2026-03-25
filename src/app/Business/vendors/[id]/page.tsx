"use client";

import { use } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon, MailIcon, MapPinIcon, PackageIcon, PhoneIcon, WalletIcon } from "lucide-react";
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

export default function BusinessVendorDetailPage({ params }: Props) {
  const { id } = use(params);
  const { data: vendor, isLoading } = api.vendor.getById.useQuery({ id });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>;
  }
  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-sm text-muted-foreground">Vendor not found</p>
        <Button asChild variant="outline" size="sm" className="mt-3"><Link href="/Business/vendors">Go back</Link></Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <Button asChild variant="outline" size="sm" className="border-black/10">
        <Link href="/Business/vendors"><ArrowLeftIcon className="mr-1.5 h-4 w-4" /> Back</Link>
      </Button>

      <Card className="border-black/[0.07] bg-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1b3a5c]">{vendor.vendorName}</h1>
                <Badge className={`border-0 ${vendor.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                  {vendor.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              {vendor.contactName && <p className="mt-1 text-sm text-muted-foreground">{vendor.contactName}</p>}
              <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                {vendor.email && <div className="flex items-center gap-2"><MailIcon className="h-4 w-4" />{vendor.email}</div>}
                {vendor.phone && <div className="flex items-center gap-2"><PhoneIcon className="h-4 w-4" />{vendor.phone}</div>}
                {vendor.address && <div className="flex items-center gap-2"><MapPinIcon className="h-4 w-4" />{vendor.address}</div>}
              </div>
            </div>
            <div className="space-y-1 text-right text-sm">
              {vendor.services && <p><span className="text-muted-foreground">Services: </span>{vendor.services}</p>}
              {vendor.paymentTerms && <p><span className="text-muted-foreground">Payment Terms: </span>{vendor.paymentTerms}</p>}
              <p className="text-xs text-muted-foreground">Added {new Date(vendor.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ORDERS */}
      <Card className="border-black/[0.07] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a1a2e]">
            <PackageIcon className="h-4 w-4" /> Orders ({vendor.orders?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!vendor.orders?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-2">
              {vendor.orders.map((o) => (
                <Link key={o.id} href={`/Business/orders/${o.id}`}>
                  <div className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-4 py-3 transition hover:bg-[#f0ede8]">
                    <div>
                      <p className="text-sm font-medium text-[#1a1a2e]">{o.orderRef}</p>
                      {o.dueDate && <p className="text-xs text-muted-foreground">Due: {new Date(o.dueDate).toLocaleDateString()}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-[#1b3a5c]">₹{Number(o.totalAmount).toLocaleString()}</p>
                      <Badge className={`border-0 capitalize ${STATUS_COLORS[o.status] ?? ""}`}>{o.status.replace("_", " ")}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* PAYMENTS */}
      <Card className="border-black/[0.07] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a1a2e]">
            <WalletIcon className="h-4 w-4" /> Payments ({vendor.payments?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!vendor.payments?.length ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No payments yet</p>
          ) : (
            <div className="space-y-2">
              {vendor.payments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-[#f8f7f4] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#1a1a2e]">{p.invoiceRef ?? `PAY-${p.id.slice(0, 6).toUpperCase()}`}</p>
                    <p className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-[#1b3a5c]">₹{Number(p.amount).toLocaleString()}</p>
                    <Badge className={`border-0 capitalize ${p.status === "confirmed" ? "bg-green-50 text-green-700" : p.status === "pending" ? "bg-yellow-50 text-yellow-700" : "bg-gray-50 text-gray-500"}`}>
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
  );
}