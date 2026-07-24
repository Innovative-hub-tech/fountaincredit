import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * BVN verification.
 *
 * NOTE: This is a provider-ready stub. It currently performs structural
 * validation (11-digit BVN) and a name presence check, then records the
 * verification result on the borrower's profile.
 *
 * To go live, replace the `verifyWithProvider` block with a call to a
 * Nigerian BVN verification API (e.g. VerifyMe, Mono, Dojah, Flutterwave),
 * reading the API key from process.env inside this handler.
 */
const inputSchema = z.object({
  bvn: z.string().regex(/^\d{11}$/u, "BVN must be 11 digits"),
  fullName: z.string().trim().min(2).max(120),
  dateOfBirth: z.string().min(4).max(20),
});

export const verifyBvn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // --- verifyWithProvider (stub) ---------------------------------------
    // Replace with a real provider request. For now we accept any well-formed
    // BVN and treat the supplied name/DOB as the matched record.
    const providerResult = {
      valid: /^\d{11}$/u.test(data.bvn),
      nameMatch: data.fullName.trim().length >= 2,
      dobMatch: !!data.dateOfBirth,
    };
    // ---------------------------------------------------------------------

    const verified = providerResult.valid && providerResult.nameMatch && providerResult.dobMatch;

    const { error } = await supabase
      .from("profiles")
      .update({
        bvn: data.bvn,
        bvn_verification: verified ? "verified" : "failed",
      })
      .eq("id", userId);

    if (error) {
      return { ok: false as const, status: "failed" as const, message: error.message };
    }

    return {
      ok: verified,
      status: verified ? ("verified" as const) : ("failed" as const),
      checks: providerResult,
    };
  });
