"use client";

import {
  BarChart3Icon,
  BellIcon,
  BuildingIcon,
  LayoutDashboardIcon,
  PackageIcon,
  TruckIcon,
  UserIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { title: string; url: string; icon: React.ElementType };
type NavGroup = { title: string; items: NavItem[] };

const businessNav: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/Business/dashboard", icon: LayoutDashboardIcon },
    ],
  },
  {
    title: "Manage",
    items: [
      { title: "Vendors", url: "/Business/vendors", icon: UsersIcon },
      { title: "Orders", url: "/Business/orders", icon: PackageIcon },
      { title: "Payments", url: "/Business/payments", icon: WalletIcon },
    ],
  },
  {
    title: "Insights",
    items: [
      { title: "Reports", url: "/Business/reports", icon: BarChart3Icon },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Notifications", url: "/Business/notifications", icon: BellIcon },
      { title: "Profile", url: "/Business/profile", icon: UserIcon },
    ],
  },
];

const vendorNav: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/Vendor/dashboard", icon: LayoutDashboardIcon },
    ],
  },
  {
    title: "Work",
    items: [
      { title: "Orders", url: "/Vendor/orders", icon: PackageIcon },
      { title: "Payments", url: "/Vendor/payments", icon: WalletIcon },
    ],
  },
  {
    title: "Insights",
    items: [
      { title: "Reports", url: "/Vendor/reports", icon: BarChart3Icon },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Notifications", url: "/Vendor/notifications", icon: BellIcon },
      { title: "Profile", url: "/Vendor/profile", icon: UserIcon },
    ],
  },
];

export function AppSidebar({
  user,
}: {
  user: { name: string; email: string; avatar: string; role: string };
}) {
  const pathname = usePathname();
  const nav = user.role === "business" ? businessNav : vendorNav;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={user.role === "business" ? "/Business/dashboard" : "/Vendor/dashboard"}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1b3a5c] text-white">
                  {user.role === "business" ? (
                    <BuildingIcon className="h-4 w-4" />
                  ) : (
                    <TruckIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-[#1b3a5c]">VendorFlow</span>
                  <span className="truncate text-xs capitalize text-muted-foreground">{user.role}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {nav.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              {group.title}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => {
                const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={isActive ? "bg-[#1b3a5c] text-white hover:bg-[#1b3a5c] hover:text-white" : ""}
                    >
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}