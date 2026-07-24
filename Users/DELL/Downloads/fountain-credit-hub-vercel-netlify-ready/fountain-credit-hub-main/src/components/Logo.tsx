import { Link } from "@tanstack/react-router";
import logo from "@/assets/fountain-credit-logo.png";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  withText = true,
  to = "/",
}: {
  className?: string;
  withText?: boolean;
  to?: string;
}) {
  return (
    <Link to={to} className={cn("flex items-center gap-2.5", className)}>
      <img
        src={logo}
        alt="Fountain Credit logo"
        width={40}
        height={40}
        className="h-10 w-10 rounded-xl object-contain"
      />
      {withText && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-bold tracking-tight">Fountain Credit</span>
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Fast · Fair · Reliable
          </span>
        </span>
      )}
    </Link>
  );
}
