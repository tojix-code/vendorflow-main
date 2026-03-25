"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { authClient } from "@/server/better-auth/client";
import { BuildingIcon, EyeIcon, EyeOffIcon, Loader2Icon, TruckIcon } from "lucide-react";

type Role = "business" | "vendor";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("business");
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    address: "",
    password: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
        // @ts-expect-error — additionalFields
        role,
        businessName: form.businessName,
        phone: form.phone,
        address: form.address,
      });
      if (error) { toast.error(error.message ?? "Registration failed"); return; }
      toast.success("Account created! Please sign in.");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#1b3a5c]">VendorFlow</h1>
          <p className="mt-1 text-sm text-[#7a7a8c]">Create your account</p>
        </div>
        <Card className="border-black/[0.07] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-[#1a1a2e]">Get started</CardTitle>
            <CardDescription>Choose your role and fill in your details</CardDescription>
          </CardHeader>
          <CardContent>
            {/* ROLE SELECTOR */}
            <div className="mb-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("business")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${role === "business" ? "border-[#1b3a5c] bg-[#1b3a5c]/5" : "border-black/[0.08] hover:border-[#1b3a5c]/30"}`}
              >
                <BuildingIcon className={`h-6 w-6 ${role === "business" ? "text-[#1b3a5c]" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${role === "business" ? "text-[#1b3a5c]" : "text-muted-foreground"}`}>Business</span>
              </button>
              <button
                type="button"
                onClick={() => setRole("vendor")}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition ${role === "vendor" ? "border-[#e07b39] bg-[#e07b39]/5" : "border-black/[0.08] hover:border-[#e07b39]/30"}`}
              >
                <TruckIcon className={`h-6 w-6 ${role === "vendor" ? "text-[#e07b39]" : "text-muted-foreground"}`} />
                <span className={`text-sm font-medium ${role === "vendor" ? "text-[#e07b39]" : "text-muted-foreground"}`}>Vendor</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Contact Name</Label>
                  <Input placeholder="John Doe" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>
                <div className="space-y-1.5">
                  <Label>{role === "business" ? "Business Name" : "Company Name"}</Label>
                  <Input placeholder="Acme Corp" value={form.businessName} onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))} required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="you@company.com" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input placeholder="City, State" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    required
                    className="pr-10"
                  />
                  <button type="button" onClick={() => setShowPassword((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#1b3a5c] text-white hover:bg-[#2a5580]" disabled={loading}>
                {loading ? <><Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : "Create Account"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-[#1b3a5c] hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}