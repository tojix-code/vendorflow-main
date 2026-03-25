"use client";

import { useRef, useState } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CheckCircleIcon, UploadIcon, WalletIcon } from "lucide-react";
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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function VendorPaymentsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const { data: payments, isLoading, refetch } = api.payment.getMyPayments.useQuery();

  const uploadInvoice = api.payment.uploadInvoice.useMutation({
    onSuccess: () => { setInvoiceOpen(false); setFileName(""); void refetch(); toast.success("Invoice uploaded!"); },
    onError: (e) => toast.error(e.message),
  });
  const updateStatus = api.payment.updateStatus.useMutation({
    onSuccess: () => { void refetch(); toast.success("Payment confirmed!"); },
    onError: (e) => toast.error(e.message),
  });

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File must be under 5MB"); return; }
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      setFileName(file.name);
      uploadInvoice.mutate({ id: invoiceId, invoiceFile: base64 });
    } catch { toast.error("Failed to read file"); }
    finally { setUploading(false); }
  }

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1b3a5c]">My Payments</h1>
        <p className="mt-1 text-sm text-muted-foreground">View and manage your payment records</p>
      </div>

      {/* INVOICE UPLOAD DIALOG */}
      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-xl text-[#1b3a5c]">Upload Invoice</DialogTitle></DialogHeader>
          <div className="py-4">
            <button
              type="button"
              className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-black/[0.1] bg-[#f8f7f4] px-6 py-12 transition hover:border-[#1b3a5c]/30 hover:bg-[#f0ede8]"
              onClick={() => fileInputRef.current?.click()}
            >
              {fileName ? (
                <>
                  <CheckCircleIcon className="mb-2 h-8 w-8 text-green-500" />
                  <p className="text-sm font-medium text-[#1a1a2e]">{fileName}</p>
                  <p className="text-xs text-[#1b3a5c]">Click to change</p>
                </>
              ) : (
                <>
                  <UploadIcon className="mb-2 h-8 w-8 text-muted-foreground/40" />
                  <p className="text-sm font-medium text-[#1a1a2e]">Click to upload invoice</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG, PNG — max 5MB</p>
                </>
              )}
            </button>
            <input ref={fileInputRef} type="file" className="hidden" accept="application/pdf,image/png,image/jpeg,image/jpg" onChange={handleFileSelect} />
          </div>
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : payments?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
          <WalletIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No payments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments?.map((p) => (
            <Card key={p.id} className="border-black/[0.07] bg-white">
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-[#1a1a2e]">{p.invoiceRef ?? `PAY-${p.id.slice(0, 6).toUpperCase()}`}</p>
                      <Badge className={`border-0 capitalize ${STATUS_COLORS[p.status] ?? ""}`}>{p.status}</Badge>
                      {p.invoiceFile && <Badge className="border-0 bg-blue-50 text-blue-700">Invoice Uploaded</Badge>}
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                      <span>{METHOD_LABELS[p.method] ?? p.method}</span>
                      {p.order && <span>Order: {p.order.orderRef}</span>}
                      <span>{new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                    {p.remarks && <p className="mt-1 text-xs text-[#6b6b80]">{p.remarks}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-bold text-[#1b3a5c]">₹{Number(p.amount).toLocaleString()}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-black/10 text-xs" onClick={() => { setInvoiceId(p.id); setFileName(""); setInvoiceOpen(true); }}>
                        <UploadIcon className="mr-1 h-3.5 w-3.5" /> Invoice
                      </Button>
                      {p.status === "pending" && (
                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ id: p.id, status: "confirmed" })}>
                          <CheckCircleIcon className="mr-1 h-3.5 w-3.5" /> Confirm
                        </Button>
                      )}
                    </div>
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