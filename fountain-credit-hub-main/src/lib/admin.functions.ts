import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const subAdminSchema = z.object({
  email: z.string().trim().email().max(255),
});

export const grantSubAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => subAdminSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isSuperAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });

    if (roleError) return { ok: false as const, message: roleError.message };
    if (!isSuperAdmin) return { ok: false as const, message: "Only the Super Admin can create sub admins" };

    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("id, email, full_name")
      .ilike("email", data.email)
      .maybeSingle();

    if (profileError) return { ok: false as const, message: profileError.message };
    if (!profile) {
      return {
        ok: false as const,
        message: "No user found with that email. Ask them to create an account first, then add them as Sub Admin.",
      };
    }

    const { error: insertError } = await context.supabase.from("user_roles").insert({
      user_id: profile.id,
      role: "sub_admin",
    });

    if (insertError && insertError.code !== "23505") {
      return { ok: false as const, message: insertError.message };
    }

    return { ok: true as const, name: profile.full_name ?? profile.email ?? data.email };
  });