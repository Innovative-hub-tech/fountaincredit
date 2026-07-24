import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPasswordByPhone } from "@/lib/password-reset.functions";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup", "forgot"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Sign in — Fountain Credit" }] }),
  component: AuthPage,
});

const credSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid phone number")
  .max(20, "Phone number is too long")
  .regex(/^[0-9+\-\s()]+$/, "Phone number can only contain digits and + - ( )");



function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading, isStaff } = useAuth();
  const resetPassword = useServerFn(resetPasswordByPhone);
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [isForgotPassword, setIsForgotPassword] = useState(mode === "forgot");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user && !isForgotPassword)
      navigate({ to: isStaff ? "/admin" : "/dashboard", replace: true });
  }, [loading, user, isStaff, navigate, isForgotPassword]);

  const resetForgotState = () => {
    setNewPassword("");
    setConfirmPassword("");
    setPhone("");
  };

  const handleForgotSubmit = async () => {
    const emailParsed = z.string().trim().email("Enter a valid email").max(255).safeParse(email);
    if (!emailParsed.success) return toast.error(emailParsed.error.issues[0].message);
    const phoneParsed = phoneSchema.safeParse(phone);
    if (!phoneParsed.success) return toast.error(phoneParsed.error.issues[0].message);
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");

    setSubmitting(true);
    try {
      const result = await resetPassword({
        data: { email: emailParsed.data, phone: phoneParsed.data, newPassword },
      });
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success("Password updated. Please sign in with your new password.");
      setIsForgotPassword(false);
      setIsSignup(false);
      resetForgotState();
      setPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) return handleForgotSubmit();

    const parsed = credSchema.safeParse({ email, password });
    if (!parsed.success) return toast.error(parsed.error.issues[0].message);

    if (isSignup) {
      if (fullName.trim().length < 2) return toast.error("Please enter your full name");
      const phoneParsed = phoneSchema.safeParse(phone);
      if (!phoneParsed.success) return toast.error(phoneParsed.error.issues[0].message);
    }

    setSubmitting(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim(), phone: phone.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created! You're all set.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const heading = isForgotPassword
    ? "Reset your password"
    : isSignup
      ? "Create your account"
      : "Welcome back";

  const subheading = isForgotPassword
    ? "Confirm your email and registered phone number, then set a new password."
    : isSignup
      ? "Start your loan application in minutes."
      : "Sign in to manage your loans and repayments.";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="gradient-brand px-5 py-8">
        <div className="mx-auto max-w-md">
          <Logo to="/" />
        </div>
      </div>

      <div className="mx-auto -mt-6 w-full max-w-md flex-1 px-5">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h1 className="font-display text-2xl font-bold">{heading}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subheading}</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignup && !isForgotPassword && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adaeze Okafor"
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    autoComplete="tel"
                  />
                </div>
              </>
            )}

            {(!isForgotPassword) && (
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            )}

            {!isForgotPassword && (
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                />
              </div>
            )}

            {isForgotPassword && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="reset-phone">Registered phone number</Label>
                  <Input
                    id="reset-phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  We verify by matching the phone number saved on your account. No email link needed.
                </p>
              </>
            )}

            {!isSignup && !isForgotPassword && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    resetForgotState();
                  }}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting
                ? "Please wait…"
                : isForgotPassword
                  ? "Update password"
                  : isSignup
                    ? "Create account"
                    : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isForgotPassword
              ? "Remembered your password?"
              : isSignup
                ? "Already have an account?"
                : "New to Fountain Credit?"}{" "}
            <button
              type="button"
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                  setIsSignup(false);
                  resetForgotState();
                  return;
                }
                setIsSignup((v) => !v);
              }}
              className="font-semibold text-primary hover:underline"
            >
              {isForgotPassword ? "Sign in" : isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>

        <p className="mx-auto mt-5 max-w-md text-center text-xs text-muted-foreground">
          By continuing you agree to our{" "}
          <Link to="/legal/terms" className="underline">Terms</Link> and{" "}
          <Link to="/legal/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
