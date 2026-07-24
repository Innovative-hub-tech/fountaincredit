import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile, useLoans, useSettings } from "@/lib/queries";
import { formatLoanDuration, naira } from "@/lib/format";

const OPEN_STATUSES = ["pending", "approved", "disbursed", "active", "partially_repaid"];

export const Route = createFileRoute("/loans/apply")({
  head: () => ({ meta: [{ title: "Apply for a Loan — Fountain Credit" }] }),
  component: () => (
    <Protected>
      <ApplyPage />
    </Protected>
  ),
});

const schema = z.object({
  amount: z.number().min(5000, "Minimum is ₦5,000").max(10000000, "Amount too large"),
  purpose: z.string().trim().min(3, "Describe the purpose").max(300),
  durationDays: z.number().min(7).max(1095),
});

const BASE_DURATION_OPTIONS = [
  { days: 7, label: "1 week" },
  { days: 14, label: "2 weeks" },
  { days: 21, label: "3 weeks" },
  { days: 30, label: "1 month" },
];

function ApplyPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: loans = [] } = useLoans();
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [scheduleVal, setScheduleVal] = useState("lump_sum");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const ready = profile?.registration_complete;
  const openLoan = loans.find((l) => OPEN_STATUSES.includes(l.status));
  const rate = Number(settings?.default_interest_rate ?? 18);
  const maxLoanDurationDays = Number(settings?.max_loan_duration_days ?? 30);
  const durationOptions = BASE_DURATION_OPTIONS.filter((option) => option.days <= maxLoanDurationDays);
  const selectedDays = Number(durationDays);
  const estRepayable = amount ? Number(amount) * (1 + rate / 100) : 0;


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!consent) {
      toast.error("You must accept the agreements to continue");
      return;
    }
    const parsed = schema.safeParse({
      amount: Number(amount),
      purpose,
      durationDays: selectedDays,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("loans").insert({
      borrower_id: user.id,
      amount: parsed.data.amount,
      purpose: parsed.data.purpose,
      duration_months: Math.max(1, Math.ceil(parsed.data.durationDays / 30)),
      duration_days: parsed.data.durationDays,
      schedule: scheduleVal as never,
      interest_rate: rate,
      penalty_rate: Number(settings?.late_penalty_rate ?? 0),
      total_repayable: estRepayable,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Loan application submitted!");
    qc.invalidateQueries({ queryKey: ["loans"] });
    navigate({ to: "/loans" });
  };

  if (!ready) {
    return (
      <AppShell title="Apply for a Loan">
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-6 text-center">
          <p className="font-semibold">Complete your profile first</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You need to finish your KYC profile before applying for a loan.
          </p>
          <Button asChild className="mt-4">
            <Link to="/profile">Complete profile</Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  if (openLoan) {
    return (
      <AppShell title="Apply for a Loan">
        <div className="rounded-2xl border border-warning/40 bg-warning/10 p-6 text-center">
          <p className="font-semibold">You already have an open loan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You can only have one loan at a time. Finish repaying your current loan before
            applying again — or top it up to increase the amount.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Button asChild>
              <Link to="/loans/$loanId" params={{ loanId: openLoan.id }}>
                View current loan & top up
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/repayments">Make a repayment</Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }



  return (
    <AppShell title="Apply for a Loan">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
          <div className="space-y-1.5">
            <Label>Requested amount (₦)</Label>
            <Input
              type="number"
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="50000"
            />
            {amount && (
              <div className="mt-1 space-y-0.5 rounded-lg bg-muted p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Requested</span>
                  <span className="font-medium">{naira(Number(amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest rate</span>
                  <span className="font-medium">{rate}%</span>
                </div>
                <div className="flex justify-between border-t border-border pt-0.5">
                  <span className="text-muted-foreground">Est. total repayable</span>
                  <span className="font-bold">{naira(estRepayable)}</span>
                </div>
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Purpose</Label>
            <Textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="e.g. Business inventory, school fees…"
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Duration</Label>
              <Select value={durationDays} onValueChange={setDurationDays}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem key={option.days} value={String(option.days)}>
                      {option.label}
                    </SelectItem>
                  ))}
                  {maxLoanDurationDays > 30 && (
                    <SelectItem value={String(maxLoanDurationDays)}>
                      Admin extended limit · {formatLoanDuration(maxLoanDurationDays)}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Repayment schedule</Label>
              <Select value={scheduleVal} onValueChange={setScheduleVal}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="lump_sum">Lump sum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <label className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
          <span className="text-sm text-muted-foreground">
            I agree to the{" "}
            <Link to="/legal/terms" className="text-primary underline">Terms and Conditions</Link>,{" "}
            <Link to="/legal/privacy" className="text-primary underline">Privacy Policy</Link>,{" "}
            <Link to="/legal/borrower-agreement" className="text-primary underline">Borrower Agreement</Link>,{" "}
            <Link to="/legal/debt-recovery" className="text-primary underline">Debt Recovery Policy</Link>, and consent to{" "}
            <Link to="/legal/bvn-consent" className="text-primary underline">BVN verification</Link> and loan processing.
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={!consent || submitting}>
          {submitting ? "Submitting…" : "Submit application"}
        </Button>
      </form>
    </AppShell>
  );
}
