import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Zap, Scale, ArrowRight, Banknote, FileCheck2, Smartphone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import logo from "@/assets/fountain-credit-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Fountain Credit — Fast, Fair & Reliable Loans in Nigeria" },
      {
        name: "description",
        content:
          "Apply for a quick, fair loan with Fountain Credit. Secure BVN-verified onboarding, transparent terms, and easy repayments — built for Nigeria.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Zap, title: "Fast", text: "Apply in minutes and get a quick decision on your loan request." },
  { icon: Scale, title: "Fair", text: "Transparent terms with no hidden charges. What you see is what you pay." },
  { icon: ShieldCheck, title: "Reliable", text: "Bank-grade security and BVN verification keep your data protected." },
];

const steps = [
  { icon: Smartphone, title: "Create account", text: "Sign up and complete your secure profile." },
  { icon: FileCheck2, title: "Apply for a loan", text: "Tell us the amount, purpose and duration." },
  { icon: Banknote, title: "Get funded & repay", text: "Receive funds and repay to our central account." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/auth" search={{ mode: "signup" }}>
              Get started
            </Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="gradient-brand relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="text-white">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/90">
              Fast · Fair · Reliable
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight md:text-5xl">
              Loans built for{" "}
              <span className="text-gradient">everyday Nigerians</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-white/80">
              Get the funds you need with transparent terms, secure verification and a simple
              repayment process — all from your phone.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/auth" search={{ mode: "signup" }}>
                  Apply for a loan <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                <Link to="/auth">I already have an account</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="rounded-3xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/15">
              <img
                src={logo}
                alt="Fountain Credit"
                width={260}
                height={260}
                className="h-60 w-60 object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center font-display text-3xl font-bold">How it works</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl bg-card p-6 text-center shadow-card">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-white">
                  <s.icon className="h-6 w-6" />
                </div>
                <div className="mt-3 text-xs font-bold uppercase tracking-wider text-primary">
                  Step {i + 1}
                </div>
                <h3 className="mt-1 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild size="lg">
              <Link to="/auth" search={{ mode: "signup" }}>
                Get started now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <Logo />
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            Fountain Credit — Fast, Fair & Reliable loans for Nigeria.
          </p>
          <nav className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground sm:grid-cols-3">
            <Link to="/legal/terms" className="hover:text-foreground">Terms & Conditions</Link>
            <Link to="/legal/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link to="/legal/borrower-agreement" className="hover:text-foreground">Borrower Agreement</Link>
            <Link to="/legal/sla" className="hover:text-foreground">SLA</Link>
            <Link to="/legal/bvn-consent" className="hover:text-foreground">BVN Consent</Link>
            <Link to="/legal/debt-recovery" className="hover:text-foreground">Debt Recovery</Link>
          </nav>
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Fountain Credit. All rights reserved.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Designed by{" "}
              <a
                href="https://wa.me/2347013989898"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-foreground hover:underline"
              >
                Innovative Tech Hub
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
