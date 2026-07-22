import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type AdminLoan = {
  id: string;
  borrower_id: string;
  amount: number;
  purpose: string;
  duration_months: number;
  duration_days: number;
  schedule: string;
  status: string;
  interest_rate: number;
  total_repayable: number | null;
  amount_repaid: number;
  rejection_reason: string | null;
  disbursed_amount: number | null;
  disbursed_at: string | null;
  disbursement_reference: string | null;
  due_date: string | null;
  created_at: string;
  borrower_name: string | null;
  borrower_phone: string | null;
  borrower_email: string | null;
};

async function attachBorrowers<T extends { borrower_id: string }>(rows: T[]) {
  const ids = [...new Set(rows.map((r) => r.borrower_id))];
  if (ids.length === 0) return new Map<string, { full_name: string | null; phone: string | null; email: string | null }>();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, phone, email")
    .in("id", ids);
  const map = new Map<string, { full_name: string | null; phone: string | null; email: string | null }>();
  (data ?? []).forEach((p) =>
    map.set(p.id, { full_name: p.full_name, phone: p.phone, email: p.email }),
  );
  return map;
}

export function useAdminLoans() {
  const { isStaff } = useAuth();
  return useQuery({
    queryKey: ["admin", "loans"],
    enabled: isStaff,
    queryFn: async (): Promise<AdminLoan[]> => {
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      const map = await attachBorrowers(rows);
      return rows.map((l) => {
        const p = map.get(l.borrower_id);
        return {
          ...l,
          borrower_name: p?.full_name ?? null,
          borrower_phone: p?.phone ?? null,
          borrower_email: p?.email ?? null,
        } as AdminLoan;
      });
    },
  });
}

export type AdminRepayment = {
  id: string;
  loan_id: string;
  borrower_id: string;
  amount: number;
  reference_number: string | null;
  proof_url: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  loans: { amount: number; purpose: string; total_repayable: number | null } | null;
  borrower_name: string | null;
};

export function useAdminRepayments() {
  const { isStaff } = useAuth();
  return useQuery({
    queryKey: ["admin", "repayments"],
    enabled: isStaff,
    queryFn: async (): Promise<AdminRepayment[]> => {
      const { data, error } = await supabase
        .from("repayments")
        .select("*, loans(amount, purpose, total_repayable)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      const map = await attachBorrowers(rows);
      return rows.map((r) => ({
        ...r,
        borrower_name: map.get(r.borrower_id)?.full_name ?? null,
      })) as AdminRepayment[];
    },
  });
}

export function useAdminBorrowers() {
  const { isStaff } = useAuth();
  return useQuery({
    queryKey: ["admin", "borrowers"],
    enabled: isStaff,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
