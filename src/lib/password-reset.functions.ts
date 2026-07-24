import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(20),
  newPassword: z.string().min(8).max(72),
});

function normalizePhone(p: string) {
  return p.replace(/[^0-9]/g, "");
}

export const resetPasswordByPhone = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("id, phone, email")
      .ilike("email", data.email)
      .maybeSingle();

    if (profileError) return { ok: false as const, message: profileError.message };
    if (!profile || !profile.phone) {
      return { ok: false as const, message: "No account found matching that email and phone number." };
    }

    if (normalizePhone(profile.phone) !== normalizePhone(data.phone)) {
      return { ok: false as const, message: "No account found matching that email and phone number." };
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
      password: data.newPassword,
    });

    if (updateError) return { ok: false as const, message: updateError.message };

    return { ok: true as const };
  });
