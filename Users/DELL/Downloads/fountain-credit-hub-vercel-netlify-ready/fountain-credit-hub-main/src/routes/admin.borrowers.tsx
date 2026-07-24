import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Phone, Mail, ShieldCheck, ShieldAlert } from "lucide-react";
import { StaffProtected } from "@/components/StaffProtected";
import { AdminShell } from "@/components/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { Input } from "@/components/ui/input";
import { useAdminBorrowers } from "@/lib/admin-queries";
import { naira, formatDate } from "@/lib/format";

export const Route = createFileRoute("/admin/borrowers")({
  head: () => ({ meta: [{ title: "Borrowers — Fountain Credit" }] }),
  component: () => (
    <StaffProtected>
      <Borrowers />
    </StaffProtected>
  ),
});

function Borrowers() {
  const { data: borrowers = [] } = useAdminBorrowers();
  const [q, setQ] = useState("");

  const filtered = borrowers.filter((b) => {
    const t = `${b.full_name ?? ""} ${b.email ?? ""} ${b.phone ?? ""}`.toLowerCase();
    return t.includes(q.toLowerCase());
  });

  return (
    <AdminShell title="Borrowers">
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, email or phone"
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No borrowers found.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{b.full_name ?? "Unnamed borrower"}</p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {b.email && (
                      <a href={`mailto:${b.email}`} className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {b.email}
                      </a>
                    )}
                    {b.phone && (
                      <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {b.phone}
                      </a>
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    b.bvn_verification === "verified"
                      ? "bg-success/15 text-success"
                      : "bg-warning/20 text-warning-foreground"
                  }`}
                >
                  {b.bvn_verification === "verified" ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <ShieldAlert className="h-3 w-3" />
                  )}
                  BVN {b.bvn_verification ?? "unverified"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3 text-sm sm:grid-cols-4">
                <Meta label="Occupation" value={b.occupation ?? "—"} />
                <Meta label="Monthly income" value={b.monthly_income ? naira(Number(b.monthly_income)) : "—"} />
                <Meta label="Bank" value={b.bank_name ?? "—"} />
                <Meta label="Joined" value={formatDate(b.created_at)} />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <StatusBadge status={b.account_status ?? "active"} />
                {b.registration_complete ? (
                  <span className="text-xs text-success">KYC complete</span>
                ) : (
                  <span className="text-xs text-warning-foreground">KYC incomplete</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
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
