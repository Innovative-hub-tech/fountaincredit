import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ArrowLeft, Receipt, CheckCircle2, Clock, Plus, Loader2, AlertTriangle } from "lucide-react";
import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLoan, useLoanRepayments } from "@/lib/queries";
import { topUpLoan } from "@/lib/loans.functions";
import { naira, formatDate, formatLoanDuration, LOAN_STATUS_LABEL } from "@/lib/format";

const ACTIVE = ["disbursed", "active", "partially_repaid"];
const TOPUPABLE = ["pending", "approved", "disbursed", "active", "partially_repaid"];

export const Route = createFileRoute("/loans/$loanId")({
  head: () => ({ meta: [{ title: "Loan Details — Fountain Credit" }] }),
  component: () => (
    <Protected>
      <LoanDetailPage />
    </Protected>
  ),
  errorComponent: ({ error }) => (
    <AppShell title="Loan Details">
      <p role="alert" className="text-sm text-destructive">{error.message}</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell title="Loan Details">
      <p className="text-sm text-muted-foreground">Loan not found.</p>
    </AppShell>
  ),
});

const SCHEDULE_PER_MONTH: Record<string, number> = {
  weekly: 4,
  biweekly: 2,
  monthly: 1,
  one_off: 0,
  lump_sum: 0,
};

function buildSchedule(loan: NonNullable<ReturnType<typeof useLoan>["data"]>) {
  const total = Number(loan.total_repayable ?? loan.amount);
  const days = Number(loan.duration_days ?? (loan.duration_months || 1) * 30);
  const perMonth = SCHEDULE_PER_MONTH[loan.schedule] ?? 1;
  const count = perMonth === 0 ? 1 : Math.max(1, Math.ceil(days / Math.round(30 / perMonth)));
  const start = loan.disbursed_at ? new Date(loan.disbursed_at) : new Date(loan.created_at);
  const stepDays = perMonth === 0 ? days : Math.round(30 / perMonth);
  const per = Math.round(total / count);

  const penaltyRate = Number(loan.penalty_rate ?? 0);
  const graceMs = 24 * 60 * 60 * 1000;
  const now = Date.now();

  let repaid = Number(loan.amount_repaid ?? 0);
  return Array.from({ length: count }, (_, i) => {
    const amount = i === count - 1 ? total - per * (count - 1) : per;
    const dueDate = new Date(start);
    dueDate.setDate(dueDate.getDate() + stepDays * (i + 1));
    const covered = Math.min(amount, Math.max(0, repaid));
    repaid -= amount;
    const paid = covered >= amount;
    const overdue = !paid && now > dueDate.getTime() + graceMs;
    const penalty = overdue ? Math.round((amount - covered) * (penaltyRate / 100)) : 0;
    return {
      index: i + 1,
      amount,
      penalty,
      dueDate: dueDate.toISOString(),
      status: paid ? "paid" : overdue ? "overdue" : covered > 0 ? "partial" : "upcoming",
    };
  });
}

function LoanDetailPage() {
  const { loanId } = useParams({ from: "/loans/$loanId" });
  const { data: loan, isLoading } = useLoan(loanId);
  const { data: repayments = [] } = useLoanRepayments(loanId);

  if (isLoading) {
    return (
      <AppShell title="Loan Details">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </AppShell>
    );
  }

  if (!loan) {
    return (
      <AppShell title="Loan Details">
        <Link to="/loans" className="text-sm font-semibold text-primary">← Back to loans</Link>
        <p className="mt-4 text-sm text-muted-foreground">This loan could not be found.</p>
      </AppShell>
    );
  }

  const principal = Number(loan.amount);
  const total = Number(loan.total_repayable ?? loan.amount);
  const interest = total - principal;
  const repaid = Number(loan.amount_repaid ?? 0);
  const outstanding = Math.max(0, total - repaid);
  const progress = total > 0 ? Math.min(100, Math.round((repaid / total) * 100)) : 0;
  const schedule = buildSchedule(loan);
  const penaltyTotal = schedule.reduce((s, i) => s + i.penalty, 0);
  const outstandingWithPenalty = outstanding + penaltyTotal;
  const overdueCount = schedule.filter((s) => s.status === "overdue").length;
  const canTopUp = TOPUPABLE.includes(loan.status) && overdueCount <= 1;

  return (
    <AppShell>

      <Link to="/loans" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to loans
      </Link>

      {/* Summary */}
      <div className="gradient-brand mb-5 rounded-2xl p-5 text-white shadow-soft">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/70">Loan amount</p>
            <p className="mt-1 font-display text-3xl font-extrabold">{naira(principal)}</p>
            <p className="mt-1 text-sm text-white/80">{loan.purpose}</p>
          </div>
          <StatusBadge status={loan.status} label={LOAN_STATUS_LABEL[loan.status]} />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>Repaid {naira(repaid)}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-white" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Repayment breakdown */}
      <h2 className="mb-3 text-lg font-bold">Repayment breakdown</h2>
      <div className="mb-6 space-y-2 rounded-2xl border border-border bg-card p-5 shadow-card">
        <BreakRow label="Principal" value={naira(principal)} />
        <BreakRow label={`Interest${loan.interest_rate ? ` (${loan.interest_rate}%)` : ""}`} value={naira(interest)} />
        <div className="my-1 border-t border-border" />
        <BreakRow label="Total repayable" value={naira(total)} strong />
        <BreakRow label="Amount repaid" value={naira(repaid)} />
        {penaltyTotal > 0 && (
          <BreakRow label={`Late penalty (${loan.penalty_rate}%)`} value={naira(penaltyTotal)} />
        )}
        <BreakRow
          label="Outstanding"
          value={naira(penaltyTotal > 0 ? outstandingWithPenalty : outstanding)}
          strong
        />
        <div className="my-1 border-t border-border" />
        <BreakRow label="Schedule" value={loan.schedule.replace(/_/g, " ")} />
        <BreakRow label="Duration" value={formatLoanDuration(loan.duration_days, loan.duration_months)} />
        {loan.due_date && <BreakRow label="Final due date" value={formatDate(loan.due_date)} />}
      </div>

      {/* Installment sequence */}
      <h2 className="mb-3 text-lg font-bold">Repayment sequence</h2>
      <div className="mb-6 space-y-2">
        {schedule.map((s) => (
          <div key={s.index} className="flex items-center justify-between rounded-xl border border-border bg-card p-3.5 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                s.status === "paid" ? "bg-primary/15 text-primary"
                  : s.status === "overdue" ? "bg-destructive/15 text-destructive"
                  : "bg-muted text-muted-foreground"
              }`}>
                {s.status === "paid" ? <CheckCircle2 className="h-4 w-4" />
                  : s.status === "overdue" ? <AlertTriangle className="h-4 w-4" />
                  : s.index}
              </div>
              <div>
                <p className="text-sm font-semibold">Installment {s.index}</p>
                <p className="text-xs text-muted-foreground">Due {formatDate(s.dueDate)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">{naira(s.amount)}</p>
              {s.penalty > 0 && (
                <p className="text-xs font-medium text-destructive">+{naira(s.penalty)} penalty</p>
              )}
              <p className={`text-xs font-medium ${
                s.status === "paid" ? "text-primary"
                  : s.status === "overdue" ? "text-destructive"
                  : s.status === "partial" ? "text-warning-foreground" : "text-muted-foreground"
              }`}>
                {s.status === "paid" ? "Paid"
                  : s.status === "overdue" ? "Overdue"
                  : s.status === "partial" ? "Partial" : "Upcoming"}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 space-y-3">
        {ACTIVE.includes(loan.status) && (
          <div className="grid grid-cols-2 gap-3">
            <Button asChild size="lg">
              <Link to="/repayments">Make a repayment</Link>
            </Button>
            {canTopUp ? (
              <TopUpButton
                loanId={loan.id}
                currentAmount={principal}
                rate={Number(loan.interest_rate ?? 0)}
              />
            ) : (
              <Button size="lg" variant="outline" disabled>
                <Plus className="mr-1 h-4 w-4" /> Top up
              </Button>
            )}
          </div>
        )}

        {/* Top up available for pending/approved loans (no repayment yet) */}
        {!ACTIVE.includes(loan.status) && canTopUp && (
          <TopUpButton
            loanId={loan.id}
            currentAmount={principal}
            rate={Number(loan.interest_rate ?? 0)}
          />
        )}

        {overdueCount > 1 && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/40 bg-destructive/10 p-3.5 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-destructive">
              You have missed {overdueCount} repayments. Please pay up to your most recent schedule
              before you can top up this loan.
            </p>
          </div>
        )}
      </div>



      {/* Payment history for this loan */}
      <h2 className="mb-3 text-lg font-bold">Payment history</h2>
      {repayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No payments recorded for this loan yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {repayments.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">{naira(r.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.reference_number ?? "No ref"} · {formatDate(r.created_at)}
                  </p>
                </div>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function BreakRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm capitalize ${strong ? "font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={strong ? "font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}

function TopUpButton({
  loanId,
  currentAmount,
  rate,
}: {
  loanId: string;
  currentAmount: number;
  rate: number;
}) {
  const qc = useQueryClient();
  const topUp = useServerFn(topUpLoan);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  const add = Number(amount) || 0;
  const newTotal = Math.round((currentAmount + add) * (1 + rate / 100));

  const submit = async () => {
    if (add < 1000) return toast.error("Minimum top-up is ₦1,000");
    setBusy(true);
    try {
      const res = await topUp({ data: { loanId, amount: add } });
      if (!res.ok) return toast.error(res.message);
      toast.success("Loan topped up successfully");
      qc.invalidateQueries({ queryKey: ["loan"] });
      qc.invalidateQueries({ queryKey: ["loans"] });
      setOpen(false);
      setAmount("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Top-up failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="lg" className="w-full" onClick={() => setOpen(true)}>
        <Plus className="mr-1 h-4 w-4" /> Top up
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Top up this loan</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            The amount you add is combined with your current loan and interest ({rate}%) is
            recalculated on the new total.
          </p>
          <div className="mt-3 space-y-1.5">
            <Label>Amount to add (₦)</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="20000"
            />
          </div>
          {add > 0 && (
            <div className="mt-3 space-y-1 rounded-lg bg-muted p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">New principal</span>
                <span className="font-medium">{naira(currentAmount + add)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-1">
                <span className="text-muted-foreground">New total repayable</span>
                <span className="font-bold">{naira(newTotal)}</span>
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button onClick={submit} disabled={busy} className="w-full">
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Confirm top-up
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

