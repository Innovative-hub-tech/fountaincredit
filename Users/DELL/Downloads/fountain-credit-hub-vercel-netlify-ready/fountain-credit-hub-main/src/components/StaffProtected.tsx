import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";

export function StaffProtected({ children }: { children: ReactNode }) {
  const { user, loading, isStaff } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
    } else if (!isStaff) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [loading, user, isStaff, navigate]);

  if (loading || !user || !isStaff) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Logo withText={false} className="animate-pulse" />
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  return <>{children}</>;
}
