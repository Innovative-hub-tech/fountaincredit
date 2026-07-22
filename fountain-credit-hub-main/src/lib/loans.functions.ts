import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ACTIVE = ["pending", "approved", "disbursed", "active", "partially_repaid"];

const inputSchema = z.object({
  loanId: z.string().uuid(),
  amount: z.number().min(1000, "Minimum top-up is ₦1,000").max(10000000, "Amount too large"),
});

/**
 * Top up an existing active loan. The new amount is added to the current
 * principal, interest is recalculated (reset) on the combined amount using the
 * loan's current interest rate, and the outstanding balance updates accordingly.
 */
export const topUpLoan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: loan, error: fetchErr } = await supabaseAdmin
      .from("loans")
      .select("*")
      .eq("id", data.loanId)
      .maybeSingle();

    if (fetchErr) return { ok: false as const, message: fetchErr.message };
    if (!loan) return { ok: false as const, message: "Loan not found" };
    if (loan.borrower_id !== userId)
      return { ok: false as const, message: "This is not your loan" };
    if (!ACTIVE.includes(loan.status))
      return {
        ok: false as const,
        message: "This loan can no longer be topped up",
      };
    const disbursed = ["disbursed", "active", "partially_repaid"].includes(loan.status);

    const rate = Number(loan.interest_rate ?? 0);
    const newAmount = Number(loan.amount) + data.amount;
    const newTotal = Math.round(newAmount * (1 + rate / 100));

    const { error: updErr } = await supabaseAdmin
      .from("loans")
      .update({
        amount: newAmount,
        total_repayable: newTotal,
        topup_count: Number(loan.topup_count ?? 0) + 1,
        topup_total: Number(loan.topup_total ?? 0) + data.amount,
        status: disbursed ? "active" : loan.status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.loanId);

    if (updErr) return { ok: false as const, message: updErr.message };

    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title: "Loan topped up",
      body: `₦${data.amount.toLocaleString()} was added to your loan. New total repayable is ₦${newTotal.toLocaleString()}.`,
      type: "loan_topup",
    });

    return { ok: true as const, newAmount, newTotal };
  });
