import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, FileText } from "lucide-react";
import { StaffProtected } from "@/components/StaffProtected";
import { AdminShell } from "@/components/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useAdminRepayments, type AdminRepayment } from "@/lib/admin-queries";
import { naira, formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/repayments")({
  head: () => ({ meta: [{ title: "Repayment Verification — Fountain Credit" }] }),
  component: () => (
    <StaffProtected>
      <RepaymentsAdmin />
    </StaffProtected>
  ),
});

async function notify(userId: string, title: string, body: string, type: string) {
  await supabase.from("notifications").insert({ user_id: userId, title, body, type });
}

type Row = AdminRepayment;

function RepaymentsAdmin() {
  const { data: repayments = [] } = useAdminRepayments();
  const groups = {
    pending: repayments.filter((r) => r.status === "pending"),
    verified: repayments.filter((r) => r.status === "verified"),
    rejected: repayments.filter((r) => r.status === "rejected"),
  };

  return (
    <AdminShell title="Repayment Verification">
      <Tabs defaultValue="pending">
        <TabsList className="mb-4 flex w-full">
          <TabsTrigger value="pending">Pending ({groups.pending.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({groups.verified.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({groups.rejected.length})</TabsTrigger>
        </TabsList>
        {(Object.keys(groups) as (keyof typeof groups)[]).map((key) => (
          <TabsContent key={key} value={key}>
            {groups[key].length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                Nothing here.
              </p>
            ) : (
              <div className="space-y-3">
                {groups[key].map((r) => <RepaymentCard key={r.id} row={r} />)}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </AdminShell>
  );
}

function RepaymentCard({ row }: { row: Row }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);

  const viewProof = async () => {
    if (!row.proof_url) return toast.error("No proof uploaded");
    const { data, error } = await supabase.storage
      .from("repayment-proofs")
      .createSignedUrl(row.proof_url, 300);
    if (error || !data) return toast.error("Could not open proof");
    window.open(data.signedUrl, "_blank");
  };

  const verify = async () => {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("repayments")
        .update({ status: "verified", verified_by: user?.id, verified_at: new Date().toISOString() })
        .eq("id", row.id);
      if (error) throw error;

      const { data: loan } = await supabase
        .from("loans")
        .select("amount_repaid, total_repayable, amount")
        .eq("id", row.loan_id)
        .single();
      if (loan) {
        const newRepaid = Number(loan.amount_repaid ?? 0) + Number(row.amount);
        const target = Number(loan.total_repayable ?? loan.amount);
        const newStatus = newRepaid >= target ? "fully_repaid" : "partially_repaid";
        await supabase
          .from("loans")
          .update({ amount_repaid: newRepaid, status: newStatus })
          .eq("id", row.loan_id);
      }
      await notify(
        row.borrower_id,
        "Repayment verified ✅",
        `Your repayment of ${naira(Number(row.amount))} has been confirmed.`,
        "repayment_verified",
      );
      toast.success("Repayment verified");
      qc.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("repayments")
        .update({ status: "rejected", verified_by: user?.id, verified_at: new Date().toISOString() })
        .eq("id", row.id);
      if (error) throw error;
      await notify(
        row.borrower_id,
        "Repayment not verified",
        `We could not verify your repayment of ${naira(Number(row.amount))}. Please re-check and resubmit.`,
        "repayment_rejected",
      );
      toast.success("Repayment rejected");
      qc.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold">{row.borrower_name ?? "Unknown"} · {naira(Number(row.amount))}</p>
          <p className="text-sm text-muted-foreground">
            {row.reference_number ?? "No ref"} · {formatDate(row.created_at)}
          </p>
        </div>
        <StatusBadge status={row.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
        {row.proof_url && (
          <Button size="sm" variant="outline" onClick={viewProof}>
            <FileText className="mr-1 h-4 w-4" /> View proof
          </Button>
        )}
        {row.status === "pending" && (
          <>
            <Button size="sm" onClick={verify} disabled={busy}>
              {busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Verify
            </Button>
            <Button size="sm" variant="destructive" onClick={reject} disabled={busy}>
              Reject
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
