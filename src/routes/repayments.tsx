import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, Upload, Receipt, Loader2 } from "lucide-react";
import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useLoans, useRepayments, useSettings } from "@/lib/queries";
import { naira, formatDate } from "@/lib/format";

export const Route = createFileRoute("/repayments")({
  head: () => ({ meta: [{ title: "Repayments — Fountain Credit" }] }),
  component: () => (
    <Protected>
      <RepaymentsPage />
    </Protected>
  ),
});

function RepaymentsPage() {
  const { user } = useAuth();
  const { data: settings } = useSettings();
  const { data: loans = [] } = useLoans();
  const { data: repayments = [] } = useRepayments();
  const qc = useQueryClient();

  const repayable = loans.filter((l) =>
    ["approved", "disbursed", "active", "partially_repaid"].includes(l.status),
  );
  const [loanId, setLoanId] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!loanId) return toast.error("Select the loan you are repaying");
    if (!amount || Number(amount) <= 0) return toast.error("Enter the amount paid");
    setSubmitting(true);
    try {
      let proofPath: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop();
        proofPath = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("repayment-proofs")
          .upload(proofPath, file, { upsert: true });
        if (upErr) throw upErr;
      }
      const { error } = await supabase.from("repayments").insert({
        loan_id: loanId,
        borrower_id: user.id,
        amount: Number(amount),
        reference_number: reference || null,
        proof_url: proofPath,
        status: "pending",
      });
      if (error) throw error;
      toast.success("Repayment submitted for verification");
      setLoanId(""); setAmount(""); setReference(""); setFile(null);
      qc.invalidateQueries({ queryKey: ["repayments"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell title="Repayments">
      {/* Central account */}
      <div className="gradient-brand mb-5 rounded-2xl p-5 text-white shadow-soft">
        <p className="text-sm text-white/70">Pay into our central account</p>
        <div className="mt-3 space-y-2">
          <Row label="Bank" value={settings?.bank_name ?? "Opay"} onCopy={copy} />
          <Row label="Account number" value={settings?.account_number ?? "8033708798"} onCopy={copy} />
          <Row label="Account name" value={settings?.account_name ?? "Fountain Credit"} onCopy={copy} />
        </div>
        <p className="mt-3 text-xs text-white/70">
          After transferring, upload your proof below so we can verify and update your loan.
        </p>
      </div>

      {/* Upload proof */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-base font-bold">Upload repayment proof</h2>
        <div className="space-y-1.5">
          <Label>Loan</Label>
          <Select value={loanId} onValueChange={setLoanId}>
            <SelectTrigger><SelectValue placeholder="Select loan" /></SelectTrigger>
            <SelectContent>
              {repayable.length === 0 && <SelectItem value="none" disabled>No active loans</SelectItem>}
              {repayable.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {naira(l.amount)} — {l.purpose.slice(0, 24)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Amount paid (₦)</Label>
          <Input type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Transaction reference</Label>
          <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. FT2026..." />
        </div>
        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-border p-4 hover:bg-muted/50">
          <span className="flex items-center gap-3 text-sm font-medium">
            <Upload className="h-5 w-5 text-muted-foreground" />
            {file ? file.name : "Receipt / screenshot"}
          </span>
          <span className="text-xs font-semibold text-primary">Choose</span>
          <input
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null}
          Submit repayment
        </Button>
      </form>

      <h2 className="mb-3 text-lg font-bold">Repayment history</h2>
      {repayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <Receipt className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No repayments recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {repayments.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-card">
              <div>
                <p className="font-semibold">{naira(r.amount)}</p>
                <p className="text-xs text-muted-foreground">
                  {r.reference_number ?? "No ref"} · {formatDate(r.created_at)}
                </p>
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function Row({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/70">{label}</span>
      <button type="button" onClick={() => onCopy(value)} className="flex items-center gap-2 font-semibold">
        {value} <Copy className="h-3.5 w-3.5 text-white/60" />
      </button>
    </div>
  );
}
