import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, ArrowRight, AlertCircle, Wallet, TrendingUp, CheckCircle2 } from "lucide-react";
import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useProfile, useLoans } from "@/lib/queries";
import { naira, formatDate, LOAN_STATUS_LABEL } from "@/lib/format";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Fountain Credit" }] }),
  component: () => (
    <Protected>
      <Dashboard />
    </Protected>
  ),
});

function Dashboard() {
  const { user, isStaff } = useAuth();
  const { data: profile } = useProfile();
  const { data: loans = [] } = useLoans();

  const activeLoan = loans.find((l) =>
    ["disbursed", "active", "partially_repaid"].includes(l.status),
  );
  const totalBorrowed = loans
    .filter((l) => ["disbursed", "active", "partially_repaid", "fully_repaid"].includes(l.status))
    .reduce((s, l) => s + Number(l.disbursed_amount ?? l.amount), 0);
  const totalRepaid = loans.reduce((s, l) => s + Number(l.amount_repaid ?? 0), 0);
  const outstanding = activeLoan
    ? Number(activeLoan.total_repayable ?? activeLoan.amount) - Number(activeLoan.amount_repaid ?? 0)
    : 0;

  const greeting = profile?.full_name?.split(" ")[0] ?? user?.email?.split("@")[0] ?? "there";
  const needsKyc = !profile?.registration_complete;

  return (
    <AppShell>
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="font-display text-2xl font-bold capitalize">{greeting} 👋</h1>
      </div>

      {isStaff && (
        <Link
          to="/admin"
          className="mb-5 flex items-center justify-between rounded-2xl border border-primary/40 bg-primary/10 p-4"
        >
          <div>
            <p className="font-semibold text-primary">Admin Console</p>
            <p className="text-sm text-muted-foreground">Manage loans, repayments & borrowers.</p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary" />
        </Link>
      )}


      {needsKyc && (
        <Link
          to="/profile"
          className="mb-5 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 p-4"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-warning-foreground" />
          <div className="flex-1">
            <p className="font-semibold">Complete your profile</p>
            <p className="text-sm text-muted-foreground">
              Finish your KYC and verification to apply for a loan.
            </p>
          </div>
          <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" />
        </Link>
      )}

      {/* Active loan card */}
      <div className="gradient-brand mb-5 rounded-2xl p-5 text-white shadow-soft">
        <p className="text-sm text-white/70">Outstanding balance</p>
        <p className="mt-1 font-display text-3xl font-extrabold">{naira(outstanding)}</p>
        {activeLoan ? (
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-white/80">
              {LOAN_STATUS_LABEL[activeLoan.status]} · due {formatDate(activeLoan.due_date)}
            </span>
            <Button asChild size="sm" variant="secondary">
              <Link to="/repayments">Repay</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-3">
            <Button asChild size="sm" variant="secondary">
              <Link to="/loans/apply">
                <Plus className="mr-1 h-4 w-4" /> Apply for a loan
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <Stat icon={Wallet} label="Total borrowed" value={naira(totalBorrowed)} />
        <Stat icon={CheckCircle2} label="Total repaid" value={naira(totalRepaid)} />
      </div>

      {/* Recent loans */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold">Recent loans</h2>
        <Link to="/loans" className="text-sm font-semibold text-primary">
          View all
        </Link>
      </div>

      {loans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <TrendingUp className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No loans yet</p>
          <p className="text-sm text-muted-foreground">Apply for your first loan to get started.</p>
          <Button asChild className="mt-4" size="sm">
            <Link to="/loans/apply">Apply now</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.slice(0, 4).map((loan) => (
            <Link
              key={loan.id}
              to="/loans/$loanId"
              params={{ loanId: loan.id }}
              className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <div>
                <p className="font-semibold">{naira(loan.amount)}</p>
                <p className="text-sm text-muted-foreground">{loan.purpose}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={loan.status} label={LOAN_STATUS_LABEL[loan.status]} />
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(loan.created_at)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
