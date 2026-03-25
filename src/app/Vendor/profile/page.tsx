"use client";

import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BuildingIcon, PencilIcon, SaveIcon, Trash2Icon, TruckIcon, UserIcon } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/server/better-auth/client";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", businessName: "", phone: "", address: "" });

  const { data: profile, isLoading, refetch } = api.profile.get.useQuery();

  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name ?? "",
        businessName: profile.businessName ?? "",
        phone: profile.phone ?? "",
        address: profile.address ?? "",
      });
    }
  }, [profile]);

  const update = api.profile.update.useMutation({
    onSuccess: () => { setEditing(false); void refetch(); toast.success("Profile updated!"); },
    onError: (e) => toast.error(e.message),
  });

  const deleteAccount = api.profile.deleteAccount.useMutation({
    onSuccess: async () => {
      toast.success("Account deleted");
      await authClient.signOut();
      router.push("/login");
    },
    onError: (e) => toast.error(e.message),
  });

  const isVendor = profile?.role === "vendor";
  const initials = (profile?.name ?? "?").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* HEADER CARD */}
      <Card className="border-black/[0.07] bg-white">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1b3a5c]/10 text-2xl font-bold text-[#1b3a5c]">
              {initials}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[#1b3a5c]">{profile?.name}</h1>
                <Badge className={`border-0 capitalize ${isVendor ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>
                  {profile?.role}
                </Badge>
              </div>
              {profile?.businessName && <p className="mt-0.5 text-sm text-muted-foreground">{profile.businessName}</p>}
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
            </div>
            <div>
              {editing ? (
                <div className="flex gap-2">
                  <Button size="sm" className="bg-[#1b3a5c] text-white hover:bg-[#2a5580]" disabled={update.isPending} onClick={() => update.mutate(form)}>
                    <SaveIcon className="mr-1.5 h-3.5 w-3.5" />{update.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button size="sm" variant="outline" className="border-black/10" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" className="border-black/10" onClick={() => setEditing(true)}>
                  <PencilIcon className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DETAILS */}
      <Card className="border-black/[0.07] bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-[#1a1a2e]">
            {isVendor ? <TruckIcon className="h-4 w-4" /> : <BuildingIcon className="h-4 w-4" />}
            Profile Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-2">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>{isVendor ? "Company Name" : "Business Name"}</Label>
                  <Input value={form.businessName} onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {[
                { label: isVendor ? "Company Name" : "Business Name", value: profile?.businessName },
                { label: "Phone", value: profile?.phone },
                { label: "Address", value: profile?.address },
                { label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : undefined },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{f.label}</p>
                  <p className="mt-1 text-sm text-[#444]">{f.value ?? <span className="italic text-muted-foreground/60">Not provided</span>}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* DANGER ZONE — vendor only */}
      {isVendor && (
        <Card className="border-red-200 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1a1a2e]">Delete Account</p>
                <p className="text-xs text-muted-foreground">Your account will be deactivated. Orders and payments are retained.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-red-200 text-red-500 hover:bg-red-50">
                    <Trash2Icon className="mr-1.5 h-3.5 w-3.5" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>This will deactivate your account. All linked orders and payments will still be visible to the business.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => deleteAccount.mutate()}>Delete Account</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}