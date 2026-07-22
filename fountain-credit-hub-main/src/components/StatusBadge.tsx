import { cn } from "@/lib/utils";
import { statusTone } from "@/lib/format";

const toneClasses: Record<string, string> = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  danger: "bg-destructive/15 text-destructive",
  info: "bg-primary/15 text-primary",
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  const tone = statusTone(status);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize",
        toneClasses[tone],
      )}
    >
      {label ?? status.replace(/_/g, " ")}
    </span>
  );
}
