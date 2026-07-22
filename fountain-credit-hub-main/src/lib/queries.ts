import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export function useProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useLoans() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["loans", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRepayments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["repayments", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repayments")
        .select("*, loans(amount, purpose)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useLoan(loanId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["loan", loanId, user?.id],
    enabled: !!user && !!loanId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loans")
        .select("*")
        .eq("id", loanId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useLoanRepayments(loanId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["loan-repayments", loanId, user?.id],
    enabled: !!user && !!loanId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repayments")
        .select("*")
        .eq("loan_id", loanId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["app_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}
