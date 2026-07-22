import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, FileText } from "lucide-react";
import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { useLoans } from "@/lib/queries";
import { naira, formatDate, formatLoanDuration, LOAN_STATUS_LABEL } from "@/lib/format";

export const Route = createFileRoute("/loans/")({
  head: () => ({ meta: [{ title: "My Loans — Fountain Credit" }] }),
  component: () => (
    <Protected>
      <LoansPage />
    </Protected>
  ),
});

function LoansPage() {
  const { data: loans = [] } = useLoans();
  return (
    <AppShell title="My Loans">
      <Button asChild className="mb-5 w-full" size="lg">
        <Link to="/loans/apply">
          <Plus className="mr-1 h-4 w-4" /> Apply for a new loan
        </Link>
      </Button>

      {loans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No loans yet</p>
          <p className="text-sm text-muted-foreground">Your loan applications will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {loans.map((loan) => (
            <Link
              key={loan.id}
              to="/loans/$loanId"
              params={{ loanId: loan.id }}
              className="block rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:bg-muted/40"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold">{naira(loan.amount)}</p>
                  <p className="text-sm text-muted-foreground">{loan.purpose}</p>
                </div>
                <StatusBadge status={loan.status} label={LOAN_STATUS_LABEL[loan.status]} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-sm">
                <Meta label="Duration" value={formatLoanDuration(loan.duration_days, loan.duration_months)} />
                <Meta label="Schedule" value={loan.schedule.replace(/_/g, " ")} />
                <Meta label="Applied" value={formatDate(loan.created_at)} />
              </div>
              {loan.status === "rejected" && loan.rejection_reason && (
                <p className="mt-3 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
                  Reason: {loan.rejection_reason}
                </p>
              )}
              <p className="mt-3 text-center text-xs font-semibold text-primary">
                View breakdown & history →
              </p>
            </Link>
          ))}

        </div>
      )}
    </AppShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium capitalize">{value}</p>
    </div>
  );
}
