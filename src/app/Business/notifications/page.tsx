"use client";

import { api } from "@/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BellIcon, BellOffIcon, CheckCheckIcon, PackageIcon, ShieldAlertIcon, WalletIcon } from "lucide-react";
import { toast } from "sonner";

type TypeConfig = { icon: React.ReactNode; color: string; bg: string };

const TYPE_CONFIG: Record<string, TypeConfig> = {
  order: { icon: <PackageIcon className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-50" },
  payment: { icon: <WalletIcon className="h-4 w-4" />, color: "text-green-600", bg: "bg-green-50" },
  vendor: { icon: <BellIcon className="h-4 w-4" />, color: "text-purple-600", bg: "bg-purple-50" },
  system: { icon: <ShieldAlertIcon className="h-4 w-4" />, color: "text-orange-600", bg: "bg-orange-50" },
};
const FALLBACK: TypeConfig = { icon: <BellIcon className="h-4 w-4" />, color: "text-gray-600", bg: "bg-gray-50" };

export default function NotificationsPage() {
  const { data: notifications, isLoading, refetch } = api.notification.getAll.useQuery();
  const markRead = api.notification.markRead.useMutation({ onSuccess: () => void refetch() });
  const markAllRead = api.notification.markAllRead.useMutation({
    onSuccess: () => { void refetch(); toast.success("All marked as read"); },
  });
  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1b3a5c]">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && <Badge className="bg-[#e07b39] px-3 py-1 text-white hover:bg-[#e07b39]">{unreadCount} Unread</Badge>}
          <Button variant="outline" size="sm" className="border-black/10" disabled={unreadCount === 0 || markAllRead.isPending} onClick={() => markAllRead.mutate()}>
            <CheckCheckIcon className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
      ) : notifications?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/[0.1] bg-white py-24">
          <BellOffIcon className="mb-3 h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm font-medium text-muted-foreground">No notifications yet</p>
          <p className="text-xs text-muted-foreground/70">Order and payment updates will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications?.map((n) => {
            const config = TYPE_CONFIG[n.type] ?? FALLBACK;
            return (
              <Card key={n.id} className={`border-black/[0.07] transition hover:shadow-sm ${!n.isRead ? "bg-white" : "bg-[#f8f7f4]"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color}`}>{config.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!n.isRead ? "font-semibold text-[#1a1a2e]" : "text-[#6b6b80]"}`}>{n.message}</p>
                        <div className="flex shrink-0 items-center gap-2">
                          {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#e07b39]" />}
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      {!n.isRead && (
                        <button type="button" onClick={() => markRead.mutate({ id: n.id })} className="mt-1.5 text-[11px] font-medium text-[#1b3a5c] hover:underline">
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}