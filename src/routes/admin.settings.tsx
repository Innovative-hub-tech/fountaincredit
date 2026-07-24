import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { StaffProtected } from "@/components/StaffProtected";
import { AdminShell } from "@/components/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { grantSubAdmin } from "@/lib/admin.functions";
import { useSettings } from "@/lib/queries";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — Fountain Credit" }] }),
  component: () => (
    <StaffProtected>
      <SettingsAdmin />
    </StaffProtected>
  ),
});

function SettingsAdmin() {
  const { roles } = useAuth();
  const { data: settings } = useSettings();
  const qc = useQueryClient();
  const isSuperAdmin = roles.includes("super_admin");

  const [form, setForm] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    whatsapp_number: "",
    primary_email: "",
    secondary_email: "",
    default_interest_rate: "",
    late_penalty_rate: "",
    max_loan_duration_days: "",
  });
  const grantSubAdminFn = useServerFn(grantSubAdmin);
  const [subAdminEmail, setSubAdminEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [subAdminBusy, setSubAdminBusy] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        bank_name: settings.bank_name ?? "",
        account_number: settings.account_number ?? "",
        account_name: settings.account_name ?? "",
        whatsapp_number: settings.whatsapp_number ?? "",
        primary_email: settings.primary_email ?? "",
        secondary_email: settings.secondary_email ?? "",
        default_interest_rate: String(settings.default_interest_rate ?? 18),
        late_penalty_rate: String(settings.late_penalty_rate ?? 5),
        max_loan_duration_days: String(settings.max_loan_duration_days ?? 30),
      });
    }
  }, [settings]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setBusy(true);
    const { default_interest_rate, late_penalty_rate, max_loan_duration_days, ...rest } = form;
    const { error } = await supabase
      .from("app_settings")
      .update({
        ...rest,
        default_interest_rate: Number(default_interest_rate) || 0,
        late_penalty_rate: Number(late_penalty_rate) || 0,
        max_loan_duration_days: Number(max_loan_duration_days) || 30,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
    qc.invalidateQueries({ queryKey: ["app_settings"] });
  };

  const addSubAdmin = async () => {
    if (!subAdminEmail.trim()) return toast.error("Enter the sub admin email");
    setSubAdminBusy(true);
    try {
      const res = await grantSubAdminFn({ data: { email: subAdminEmail.trim() } });
      if (!res.ok) return toast.error(res.message);
      toast.success(`${res.name} is now a Sub Admin`);
      setSubAdminEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create sub admin");
    } finally {
      setSubAdminBusy(false);
    }
  };

  return (
    <AdminShell title="Settings">
      {!isSuperAdmin && (
        <p className="mb-4 rounded-xl border border-warning/40 bg-warning/10 p-3 text-sm">
          Only a Super Admin can change these settings.
        </p>
      )}

      <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-base font-bold">Central collection account</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bank name"><Input value={form.bank_name} onChange={set("bank_name")} disabled={!isSuperAdmin} /></Field>
            <Field label="Account number"><Input value={form.account_number} onChange={set("account_number")} disabled={!isSuperAdmin} /></Field>
            <Field label="Account name"><Input value={form.account_name} onChange={set("account_name")} disabled={!isSuperAdmin} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-4 text-base font-bold">Support contacts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp number"><Input value={form.whatsapp_number} onChange={set("whatsapp_number")} disabled={!isSuperAdmin} /></Field>
            <Field label="Primary email"><Input value={form.primary_email} onChange={set("primary_email")} disabled={!isSuperAdmin} /></Field>
            <Field label="Secondary email"><Input value={form.secondary_email} onChange={set("secondary_email")} disabled={!isSuperAdmin} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-1 text-base font-bold">Lending configuration</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            The interest rate is applied when approving loans and shown to borrowers. The late
            penalty is added to an overdue amount for each period past its due date (after a
            24-hour grace).
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Default interest rate (%)"><Input type="number" inputMode="decimal" value={form.default_interest_rate} onChange={set("default_interest_rate")} disabled={!isSuperAdmin} /></Field>
            <Field label="Late payment penalty (%)"><Input type="number" inputMode="decimal" value={form.late_penalty_rate} onChange={set("late_penalty_rate")} disabled={!isSuperAdmin} /></Field>
            <Field label="Max borrower loan duration (days)"><Input type="number" inputMode="numeric" value={form.max_loan_duration_days} onChange={set("max_loan_duration_days")} disabled={!isSuperAdmin} /></Field>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-1 text-base font-bold">Sub admin</h2>
          <p className="mb-4 text-xs text-muted-foreground">
            Sub admins can view borrowers, loans, repayments and daily operations, but money-made reporting stays hidden.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <Field label="Sub admin email">
              <Input
                type="email"
                value={subAdminEmail}
                onChange={(e) => setSubAdminEmail(e.target.value)}
                placeholder="staff@example.com"
                disabled={!isSuperAdmin}
              />
            </Field>
            <Button onClick={addSubAdmin} disabled={!isSuperAdmin || subAdminBusy} className="self-end">
              {subAdminBusy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <UserPlus className="mr-1 h-4 w-4" />}
              Add Sub Admin
            </Button>
          </div>
        </section>


        {isSuperAdmin && (
          <Button onClick={save} disabled={busy} size="lg">
            {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Save changes
          </Button>
        )}
      </div>
    </AdminShell>
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
