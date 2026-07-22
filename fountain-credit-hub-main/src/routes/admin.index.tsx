import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, FileCheck2, Clock, Receipt, Users, TrendingUp } from "lucide-react";
import { StaffProtected } from "@/components/StaffProtected";
import { AdminShell } from "@/components/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { useAdminLoans, useAdminRepayments, useAdminBorrowers } from "@/lib/admin-queries";
import { naira, formatDate, LOAN_STATUS_LABEL } from "@/lib/format";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Overview — Fountain Credit" }] }),
  component: () => (
    <StaffProtected>
      <Overview />
    </StaffProtected>
  ),
});

function Overview() {
  const { data: loans = [] } = useAdminLoans();
  const { data: repayments = [] } = useAdminRepayments();
  const { data: borrowers = [] } = useAdminBorrowers();
  const { roles } = useAuth();
  const canSeeProfit = roles.includes("super_admin");

  const pendingLoans = loans.filter((l) => l.status === "pending");
  const approvedAwaiting = loans.filter((l) => l.status === "approved");
  const pendingRepayments = repayments.filter((r) => r.status === "pending");
  const activeLoans = loans.filter((l) =>
    ["disbursed", "active", "partially_repaid"].includes(l.status),
  );
  const disbursedTotal = loans
    .filter((l) => l.disbursed_amount)
    .reduce((s, l) => s + Number(l.disbursed_amount), 0);
  const repaidTotal = repayments
    .filter((r) => r.status === "verified")
    .reduce((s, r) => s + Number(r.amount), 0);
  const reports = buildReports(loans);

  return (
    <AdminShell title="Overview">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon={Clock} label="Pending applications" value={String(pendingLoans.length)} tone="warning" />
        <Stat icon={FileCheck2} label="Awaiting disbursement" value={String(approvedAwaiting.length)} tone="info" />
        <Stat icon={Receipt} label="Repayments to verify" value={String(pendingRepayments.length)} tone="warning" />
        <Stat icon={Users} label="Borrowers" value={String(borrowers.length)} tone="neutral" />
        <Stat icon={Wallet} label="Total disbursed" value={naira(disbursedTotal)} tone="info" />
        <Stat icon={TrendingUp} label="Total repaid" value={naira(repaidTotal)} tone="success" />
        <Stat icon={FileCheck2} label="Active loans" value={String(activeLoans.length)} tone="neutral" />
        <Stat icon={Wallet} label="Outstanding" value={naira(disbursedTotal - repaidTotal)} tone="warning" />
      </div>

      {canSeeProfit && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Money loaned & money made</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {reports.map((report) => (
              <div key={report.label} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <p className="text-sm font-semibold">{report.label}</p>
                <div className="mt-3 space-y-2 text-sm">
                  <MoneyRow label="Loaned out" value={naira(report.loaned)} />
                  <MoneyRow label="Money made" value={naira(report.interest)} />
                  <MoneyRow label="Loans counted" value={String(report.count)} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Pending applications</h2>
          <Link to="/admin/loans" className="text-sm font-semibold text-primary">Review all</Link>
        </div>
        {pendingLoans.length === 0 ? (
          <Empty text="No applications waiting for review." />
        ) : (
          <div className="space-y-3">
            {pendingLoans.slice(0, 5).map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
                <div>
                  <p className="font-semibold">{l.borrower_name ?? "Unknown"} · {naira(l.amount)}</p>
                  <p className="text-sm text-muted-foreground">{l.purpose}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={l.status} label={LOAN_STATUS_LABEL[l.status]} />
                  <p className="mt-1 text-xs text-muted-foreground">{formatDate(l.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </AdminShell>
  );
}

function buildReports(loans: ReturnType<typeof useAdminLoans>["data"] | undefined) {
  const rows = loans ?? [];
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return [
    reportFor("This week", rows, startOfWeek),
    reportFor("This month", rows, startOfMonth),
    reportFor("This year", rows, startOfYear),
  ];
}

function reportFor(label: string, loans: NonNullable<ReturnType<typeof useAdminLoans>["data"]>, start: Date) {
  const counted = loans.filter((loan) => {
    if (!loan.disbursed_at) return false;
    return new Date(loan.disbursed_at).getTime() >= start.getTime();
  });

  return counted.reduce(
    (acc, loan) => {
      const principal = Number(loan.disbursed_amount ?? loan.amount);
      const total = Number(loan.total_repayable ?? loan.amount);
      acc.loaned += principal;
      acc.interest += Math.max(0, total - Number(loan.amount));
      acc.count += 1;
      return acc;
    },
    { label, loaned: 0, interest: 0, count: 0 },
  );
}

function MoneyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

const toneBg: Record<string, string> = {
  warning: "bg-warning/20 text-warning-foreground",
  info: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  neutral: "bg-muted text-muted-foreground",
};

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneBg[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
