"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { MailIcon, MapPinIcon, PencilIcon, PhoneIcon, PlusIcon, SearchIcon, Trash2Icon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type FormState = { vendorName: string; contactName: string; email: string; phone: string; address: string; services: string; paymentTerms: string };
const EMPTY: FormState = { vendorName: "", contactName: "", email: "", phone: "", address: "", services: "", paymentTerms: "" };

function VendorForm({ form, setForm }: { form: FormState; setForm: React.Dispatch<React.SetStateAction<FormState>> }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Vendor Name *</Label><Input placeholder="Acme Supplies" value={form.vendorName} onChange={(e) => setForm((p) => ({ ...p, vendorName: e.target.value }))} /></div>
        <div className="space-y-1.5"><Label>Contact Name</Label><Input placeholder="John Doe" value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Email</Label><Input type="email" placeholder="vendor@company.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
        <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
      </div>
      <div className="space-y-1.5"><Label>Address</Label><Input placeholder="City, State" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5"><Label>Services</Label><Input placeholder="e.g. Raw Materials" value={form.services} onChange={(e) => setForm((p) => ({ ...p, services: e.target.value }))} /></div>
        <div className="space-y-1.5"><Label>Payment Terms</Label><Input placeholder="e.g. NET30" value={form.paymentTerms} onChange={(e) => setForm((p) => ({ ...p, paymentTerms: e.target.value }))} /></div>
      </div>
    </div>
  );
}

export default function BusinessVendorsPage() {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editForm, setEditForm] = useState<FormState>(EMPTY);

  const { data: vendors, isLoading, refetch } = api.vendor.getAll.useQuery();

  const create = api.vendor.create.useMutation({
    onSuccess: () => { setCreateOpen(false); setForm(EMPTY); void refetch(); toast.success("Vendor added!"); },
    onError: (e) => toast.error(e.message),
  });
  const update = api.vendor.update.useMutation({
    onSuccess: () => { setEditOpen(false); void refetch(); toast.success("Vendor updated!"); },
    onError: (e) => toast.error(e.message),
  });
  const remove = api.vendor.delete.useMutation({
    onSuccess: () => { void refetch(); toast.success("Vendor removed!"); },
    onError: (e) => toast.error(e.message),
  });

  const filtered = vendors?.filter((v) =>
    v.vendorName.toLowerCase().includes(search.toLowerCase()) ||
    v.contactName?.toLowerCase().includes(search.toLowerCase()) ||
    v.services?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1b3a5c]">Vendors</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your vendor relationships</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1b3a5c] text-white hover:bg-[#2a5580]"><PlusIcon className="mr-2 h-4 w-4" /> Add Vendor</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle className="text-xl text-[#1b3a5c]">Add Vendor</DialogTitle></DialogHeader>
            <div className="py-2">
              <VendorForm form={form} setForm={setForm} />
              <Button className="mt-4 w-full bg-[#1b3a5c] text-white hover:bg-[#2a5580]" disabled={!form.vendorName.trim() || create.isPending} onClick={() => create.mutate(form)}>
                {create.isPending ? "Adding..." : "Add Vendor"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="text-xl text-[#1b3a5c]">Edit Vendor</DialogTitle></DialogHeader>
          <div className="py-2">
            <VendorForm form={editForm} setForm={setEditForm} />
            <Button className="mt-4 w-full bg-[#1b3a5c] text-white hover:bg-[#2a5580]" disabled={!editForm.vendorName.trim() || update.isPending} onClick={() => update.mutate({ id: editId, ...editForm })}>
              {update.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search vendors..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-44 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-20">
          <UsersIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">{search ? "No vendors found" : "No vendors yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <Card key={v.id} className="border-black/[0.07] bg-white">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[#1a1a2e]">{v.vendorName}</h3>
                    {v.contactName && <p className="text-xs text-muted-foreground">{v.contactName}</p>}
                  </div>
                  <Badge className={`border-0 ${v.isActive ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                    {v.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  {v.email && <div className="flex items-center gap-1.5"><MailIcon className="h-3.5 w-3.5" />{v.email}</div>}
                  {v.phone && <div className="flex items-center gap-1.5"><PhoneIcon className="h-3.5 w-3.5" />{v.phone}</div>}
                  {v.address && <div className="flex items-center gap-1.5"><MapPinIcon className="h-3.5 w-3.5" />{v.address}</div>}
                  {v.services && <p className="mt-2 text-[#6b6b80]">Services: {v.services}</p>}
                  {v.paymentTerms && <p className="text-[#6b6b80]">Terms: {v.paymentTerms}</p>}
                </div>
                <div className="mt-4 flex gap-2 border-t border-black/[0.05] pt-3">
                  <Link href={`/Business/vendors/${v.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full border-black/10 text-xs">View</Button>
                  </Link>
                  <Button variant="outline" size="sm" className="border-black/10" onClick={() => { setEditId(v.id); setEditForm({ vendorName: v.vendorName, contactName: v.contactName ?? "", email: v.email ?? "", phone: v.phone ?? "", address: v.address ?? "", services: v.services ?? "", paymentTerms: v.paymentTerms ?? "" }); setEditOpen(true); }}>
                    <PencilIcon className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50"><Trash2Icon className="h-3.5 w-3.5" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Remove Vendor?</AlertDialogTitle><AlertDialogDescription>This vendor will be marked inactive. Linked orders and payments will be retained.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => remove.mutate({ id: v.id })}>Remove</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}