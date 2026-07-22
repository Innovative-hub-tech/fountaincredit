import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { ShieldCheck, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/queries";
import { verifyBvn } from "@/lib/bvn.functions";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "My Profile — Fountain Credit" }] }),
  component: () => (
    <Protected>
      <ProfilePage />
    </Protected>
  ),
});

type Form = Record<string, string>;

function ProfilePage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const verify = useServerFn(verifyBvn);

  const [form, setForm] = useState<Form>({});
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [bvnStatus, setBvnStatus] = useState<string>("unverified");

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? "",
        date_of_birth: profile.date_of_birth ?? "",
        gender: profile.gender ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? user?.email ?? "",
        address: profile.address ?? "",
        occupation: profile.occupation ?? "",
        employer: profile.employer ?? "",
        monthly_income: profile.monthly_income?.toString() ?? "",
        next_of_kin_name: profile.next_of_kin_name ?? "",
        next_of_kin_phone: profile.next_of_kin_phone ?? "",
        bank_name: profile.bank_name ?? "",
        bank_account_number: profile.bank_account_number ?? "",
        bvn: profile.bvn ?? "",
      });
      setBvnStatus(profile.bvn_verification ?? "unverified");
    }
  }, [profile, user]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const uploadDoc = async (file: File, kind: "passport" | "gov_id") => {
    if (!user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("borrower-documents").upload(path, file, {
      upsert: true,
    });
    if (error) {
      toast.error(`Upload failed: ${error.message}`);
      return;
    }
    const patch = kind === "passport" ? { passport_url: path } : { gov_id_url: path };
    await supabase.from("profiles").update(patch).eq("id", user.id);
    toast.success(`${kind === "passport" ? "Passport" : "ID"} uploaded`);
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const handleVerifyBvn = async () => {
    if (!/^\d{11}$/.test(form.bvn ?? "")) {
      toast.error("Enter a valid 11-digit BVN");
      return;
    }
    setVerifying(true);
    try {
      const res = await verify({
        data: {
          bvn: form.bvn,
          fullName: form.full_name || "",
          dateOfBirth: form.date_of_birth || "",
        },
      });
      setBvnStatus(res.status);
      if (res.ok) toast.success("BVN verified successfully");
      else toast.error("BVN verification failed. Check your details.");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Verification error");
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async (markComplete: boolean) => {
    if (!user) return;
    const required = ["full_name", "phone", "address", "bank_name", "bank_account_number"];
    if (markComplete && required.some((r) => !form[r]?.trim())) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        date_of_birth: form.date_of_birth || null,
        gender: (form.gender || null) as never,
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        occupation: form.occupation || null,
        employer: form.employer || null,
        monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
        next_of_kin_name: form.next_of_kin_name || null,
        next_of_kin_phone: form.next_of_kin_phone || null,
        bank_name: form.bank_name || null,
        bank_account_number: form.bank_account_number || null,
        registration_complete: markComplete ? true : profile?.registration_complete ?? false,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["profile"] });
    if (markComplete) navigate({ to: "/dashboard" });
  };

  if (isLoading) {
    return (
      <AppShell title="My Profile">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </AppShell>
    );
  }

  return (
    <AppShell title="My Profile">
      <Section title="Personal information">
        <Field label="Full name *" value={form.full_name} onChange={(v) => set("full_name", v)} />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Date of birth</Label>
            <Input type="date" value={form.date_of_birth ?? ""} onChange={(e) => set("date_of_birth", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <Select value={form.gender || undefined} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Field label="Phone number *" value={form.phone} onChange={(v) => set("phone", v)} />
        <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} />
        <div className="space-y-1.5">
          <Label>Residential address *</Label>
          <Textarea value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        </div>
      </Section>

      <Section title="Employment & income">
        <Field label="Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} />
        <Field label="Employer / business name" value={form.employer} onChange={(v) => set("employer", v)} />
        <Field label="Monthly income (₦)" type="number" value={form.monthly_income} onChange={(v) => set("monthly_income", v)} />
      </Section>

      <Section title="Next of kin">
        <Field label="Next of kin name" value={form.next_of_kin_name} onChange={(v) => set("next_of_kin_name", v)} />
        <Field label="Next of kin phone" value={form.next_of_kin_phone} onChange={(v) => set("next_of_kin_phone", v)} />
      </Section>

      <Section title="Bank details">
        <Field label="Bank name *" value={form.bank_name} onChange={(v) => set("bank_name", v)} />
        <Field label="Account number *" value={form.bank_account_number} onChange={(v) => set("bank_account_number", v)} />
      </Section>

      <Section title="BVN verification">
        <div className="flex items-center justify-between">
          <Label>Verification status</Label>
          <StatusBadge status={bvnStatus} />
        </div>
        <Field label="BVN (11 digits)" value={form.bvn} onChange={(v) => set("bvn", v)} />
        <Button
          type="button"
          variant="secondary"
          onClick={handleVerifyBvn}
          disabled={verifying || bvnStatus === "verified"}
          className="w-full"
        >
          {verifying ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : bvnStatus === "verified" ? (
            <CheckCircle2 className="mr-1 h-4 w-4" />
          ) : (
            <ShieldCheck className="mr-1 h-4 w-4" />
          )}
          {bvnStatus === "verified" ? "BVN verified" : "Verify BVN"}
        </Button>
      </Section>

      <Section title="Documents">
        <UploadField
          label="Passport photograph"
          done={!!profile?.passport_url}
          accept="image/*"
          onFile={(f) => uploadDoc(f, "passport")}
        />
        <UploadField
          label="Government ID"
          done={!!profile?.gov_id_url}
          accept="image/*,application/pdf"
          onFile={(f) => uploadDoc(f, "gov_id")}
        />
      </Section>

      <div className="sticky bottom-20 z-10 mt-6 flex gap-3 bg-background/80 py-2 backdrop-blur">
        <Button variant="outline" className="flex-1" onClick={() => handleSave(false)} disabled={saving}>
          Save draft
        </Button>
        <Button className="flex-1" onClick={() => handleSave(true)} disabled={saving}>
          {saving ? "Saving…" : "Save & complete"}
        </Button>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-5 shadow-card">
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function UploadField({
  label,
  done,
  accept,
  onFile,
}: {
  label: string;
  done: boolean;
  accept: string;
  onFile: (f: File) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-border p-4 transition-colors hover:bg-muted/50">
      <div className="flex items-center gap-3">
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Upload className="h-5 w-5 text-muted-foreground" />
        )}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="text-xs font-semibold text-primary">{done ? "Replace" : "Upload"}</span>
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
    </label>
  );
}
