import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";

export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3">
          <Logo />
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-8">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated {new Date().toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
        </p>
        <div className="prose-legal mt-6 space-y-4 text-sm leading-relaxed text-foreground/90 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold">
          {children}
        </div>
      </main>
    </div>
  );
}
