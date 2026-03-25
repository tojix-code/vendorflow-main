import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  // ts-expect-error — additionalFields
  const role = (session.user.role as string) ?? "vendor";
  if (role !== "vendor") redirect("/login");

  const user = {
    name: session.user.name,
    email: session.user.email,
    avatar: session.user.image ?? "",
    role,
  };

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-black/[0.07] bg-white px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-[#1b3a5c]" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <span className="text-sm font-semibold text-[#1a1a2e]">VendorFlow</span>
        </header>
        <main className="flex flex-1 flex-col bg-[#f8f7f4] p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}