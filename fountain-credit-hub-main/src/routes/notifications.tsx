import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNotifications } from "@/lib/queries";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Fountain Credit" }] }),
  component: () => (
    <Protected>
      <NotificationsPage />
    </Protected>
  ),
});

const typeMeta: Record<
  string,
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  success: { icon: CheckCircle2, tone: "text-success" },
  warning: { icon: AlertTriangle, tone: "text-warning-foreground" },
  error: { icon: XCircle, tone: "text-destructive" },
  info: { icon: Info, tone: "text-primary" },
};

function NotificationsPage() {
  const { data: notifications = [] } = useNotifications();
  const qc = useQueryClient();

  const unread = notifications.filter((n) => !n.read);

  const markAllRead = async () => {
    if (unread.length === 0) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .in(
        "id",
        unread.map((n) => n.id),
      );
    if (!error) qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  const markRead = async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id);
    if (!error) qc.invalidateQueries({ queryKey: ["notifications"] });
  };

  return (
    <AppShell title="Notifications">
      {unread.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {unread.length} unread notification{unread.length > 1 ? "s" : ""}
          </p>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-1 h-4 w-4" /> Mark all read
          </Button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No notifications yet</p>
          <p className="text-sm text-muted-foreground">
            Updates about your loans and repayments will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const meta = typeMeta[n.type ?? "info"] ?? typeMeta.info;
            const Icon = meta.icon;
            return (
              <button
                key={n.id}
                onClick={() => !n.read && markRead(n.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-card transition-colors",
                  n.read
                    ? "border-border bg-card"
                    : "border-primary/30 bg-primary/5",
                )}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", meta.tone)} />
                <div className="flex-1">
                  <p className="font-semibold">{n.title}</p>
                  {n.body && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(n.created_at)}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
