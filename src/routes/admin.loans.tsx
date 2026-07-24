import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Phone } from "lucide-react";
import { StaffProtected } from "@/components/StaffProtected";
import { AdminShell } from "@/components/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useAdminLoans, type AdminLoan } from "@/lib/admin-queries";
import { useSettings } from "@/lib/queries";
import { naira, formatDate, formatLoanDuration, LOAN_STATUS_LABEL } from "@/lib/format";

export const Route = createFileRoute("/admin/loans")({
  head: () => ({ meta: [{ title: "Loan Management — Fountain Credit" }] }),
  component: () => (
    <StaffProtected>
      <LoansAdmin />
    </StaffProtected>
  ),
});

async function notify(userId: string, title: string, body: string, type: string) {
  await supabase.from("notifications").insert({ user_id: userId, title, body, type });
}

function LoansAdmin() {
  const { data: loans = [] } = useAdminLoans();
  const groups = {
    pending: loans.filter((l) => l.status === "pending"),
    approved: loans.filter((l) => l.status === "approved"),
    active: loans.filter((l) =>
      ["disbursed", "active", "partially_repaid"].includes(l.status),
    ),
    closed: loans.filter((l) =>
      ["rejected", "fully_repaid", "defaulted"].includes(l.status),
    ),
  };

  return (
    <AdminShell title="Loan Management">
      <Tabs defaultValue="pending">
        <TabsList className="mb-4 flex w-full flex-wrap">
          <TabsTrigger value="pending">Pending ({groups.pending.length})</TabsTrigger>
          <TabsTrigger value="approved">To disburse ({groups.approved.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({groups.active.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({groups.closed.length})</TabsTrigger>
        </TabsList>
        {(Object.keys(groups) as (keyof typeof groups)[]).map((key) => (
          <TabsContent key={key} value={key}>
            {groups[key].length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Nothing here.
              </p>
            ) : (
              <div className="space-y-3">
                {groups[key].map((l) => <LoanCard key={l.id} loan={l} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AdminShell>
  );
}

function LoanCard({ loan }: { loan: AdminLoan }) {
  const [open, setOpen] = useState<null | "approve" | "reject" | "disburse">(null);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{loan.borrower_name ?? "Unknown borrower"}</p>
          <p className="text-sm text-muted-foreground">{loan.purpose}</p>
          {loan.borrower_phone && (
            <a
              href={`tel:${loan.borrower_phone}`}
              className="mt-1 inline-flex items-center gap-1 text-xs text-primary"
            >
              <Phone className="h-3 w-3" /> {loan.borrower_phone}
            </a>
          )}
        </div>
        <StatusBadge status={loan.status} label={LOAN_STATUS_LABEL[loan.status]} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-sm sm:grid-cols-4">
        <Meta label="Amount" value={naira(loan.amount)} />
        <Meta label="Duration" value={formatLoanDuration(loan.duration_days, loan.duration_months)} />
        <Meta label="Schedule" value={loan.schedule.replace(/_/g, " ")} />
        <Meta label="Applied" value={formatDate(loan.created_at)} />
        {loan.total_repayable != null && (
          <Meta label="Repayable" value={naira(Number(loan.total_repayable))} />
        )}
        {loan.interest_rate > 0 && <Meta label="Interest" value={`${loan.interest_rate}%`} />}
        {loan.amount_repaid > 0 && <Meta label="Repaid" value={naira(Number(loan.amount_repaid))} />}
        {loan.due_date && <Meta label="Due" value={formatDate(loan.due_date)} />}
      </div>

      {loan.rejection_reason && (
        <p className="mt-3 rounded-lg bg-destructive/10 p-2 text-xs text-destructive">
          Reason: {loan.rejection_reason}
        </p>
      )}

      {loan.status === "pending" && (
        <div className="mt-4 flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => setOpen("approve")}>Approve</Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpen("reject")}>
            Reject
          </Button>
        </div>
      )}
      {loan.status === "approved" && (
        <Button size="sm" className="mt-4 w-full" onClick={() => setOpen("disburse")}>
          Record disbursement
        </Button>
      )}

      {open === "approve" && <ApproveDialog loan={loan} onClose={() => setOpen(null)} />}
      {open === "reject" && <RejectDialog loan={loan} onClose={() => setOpen(null)} />}
      {open === "disburse" && <DisburseDialog loan={loan} onClose={() => setOpen(null)} />}
    </div>
  );
}

function ApproveDialog({ loan, onClose }: { loan: AdminLoan; onClose: () => void }) {
  const { user } = useAuth();
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const [rate, setRate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings && rate === "") setRate(String(settings.default_interest_rate ?? 18));
  }, [settings, rate]);

  const total = Number(loan.amount) * (1 + Number(rate || 0) / 100);

  const submit = async () => {
    if (!dueDate) return toast.error("Set a due date");
    setBusy(true);
    const { error } = await supabase
      .from("loans")
      .update({
        status: "approved",
        interest_rate: Number(rate),
        penalty_rate: Number(settings?.late_penalty_rate ?? 0),
        total_repayable: total,
        due_date: dueDate,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", loan.id);
    if (error) { setBusy(false); return toast.error(error.message); }
    await notify(
      loan.borrower_id,
      "Loan approved 🎉",
      `Your ${naira(loan.amount)} loan was approved. Total repayable: ${naira(total)}, due ${formatDate(dueDate)}.`,
      "loan_approved",
    );
    setBusy(false);
    toast.success("Loan approved");
    qc.invalidateQueries({ queryKey: ["admin"] });
    onClose();
  };

  return (
    <Shell title="Approve loan" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Interest rate (%)">
          <Input type="number" inputMode="decimal" value={rate} onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Due date">
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <div className="rounded-lg bg-muted p-3 text-sm">
          Total repayable: <span className="font-bold">{naira(total)}</span>
        </div>
      </div>
      <DialogFooter className="mt-4">
        <Button onClick={submit} disabled={busy} className="w-full">
          {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Approve loan
        </Button>
      </DialogFooter>
    </Shell>
  );
}

function RejectDialog({ loan, onClose }: { loan: AdminLoan; onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (reason.trim().length < 3) return toast.error("Add a reason");
    setBusy(true);
    const { error } = await supabase
      .from("loans")
      .update({
        status: "rejected",
        rejection_reason: reason.trim(),
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", loan.id);
    if (error) { setBusy(false); return toast.error(error.message); }
    await notify(
      loan.borrower_id,
      "Loan application update",
      `Your ${naira(loan.amount)} application was not approved. Reason: ${reason.trim()}`,
      "loan_rejected",
    );
    setBusy(false);
    toast.success("Loan rejected");
    qc.invalidateQueries({ queryKey: ["admin"] });
    onClose();
  };

  return (
    <Shell title="Reject loan" onClose={onClose}>
      <Field label="Reason for rejection">
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain why…" />
      </Field>
      <DialogFooter className="mt-4">
        <Button variant="destructive" onClick={submit} disabled={busy} className="w-full">
          {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Confirm rejection
        </Button>
      </DialogFooter>
    </Shell>
  );
}

function DisburseDialog({ loan, onClose }: { loan: AdminLoan; onClose: () => void }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState(String(loan.amount));
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!amount || Number(amount) <= 0) return toast.error("Enter the disbursed amount");
    if (!reference.trim()) return toast.error("Enter a transfer reference");
    setBusy(true);
    const { error } = await supabase
      .from("loans")
      .update({
        status: "disbursed",
        disbursed_amount: Number(amount),
        disbursement_reference: reference.trim(),
        disbursement_notes: notes.trim() || null,
        disbursed_at: new Date().toISOString(),
      })
      .eq("id", loan.id);
    if (error) { setBusy(false); return toast.error(error.message); }
    await notify(
      loan.borrower_id,
      "Funds disbursed 💸",
      `${naira(Number(amount))} has been disbursed to your account. Ref: ${reference.trim()}.`,
      "loan_disbursed",
    );
    setBusy(false);
    toast.success("Disbursement recorded");
    qc.invalidateQueries({ queryKey: ["admin"] });
    onClose();
  };

  return (
    <Shell title="Record disbursement" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Amount disbursed (₦)">
          <Input type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Transfer reference">
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. FT2026..." />
        </Field>
        <Field label="Notes (optional)">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
      </div>
      <DialogFooter className="mt-4">
        <Button onClick={submit} disabled={busy} className="w-full">
          {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Confirm disbursement
        </Button>
      </DialogFooter>
    </Shell>
  );
}

function Shell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
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
