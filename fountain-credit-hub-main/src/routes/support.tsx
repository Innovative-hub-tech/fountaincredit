import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MessageCircle, Clock, HelpCircle } from "lucide-react";
import { Protected } from "@/components/Protected";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Support — Fountain Credit" }] }),
  component: () => (
    <Protected>
      <SupportPage />
    </Protected>
  ),
});

const SUPPORT_PHONE = "08033708798";
const SUPPORT_EMAIL = "support@fountaincredit.ng";

const faqs = [
  {
    q: "How do I apply for a loan?",
    a: "Complete your profile and KYC, then go to Loans → Apply. Tell us the amount, purpose and duration, accept the terms, and submit. Our team reviews every application.",
  },
  {
    q: "How long does approval take?",
    a: "Most applications are reviewed within one business day. You'll receive a notification once a decision is made.",
  },
  {
    q: "How do I repay my loan?",
    a: "Go to Repayments, transfer to our central account, then upload your payment proof so we can verify and update your balance.",
  },
  {
    q: "Why was my repayment not reflected immediately?",
    a: "Repayments are verified manually after you upload proof. Once confirmed by our finance team, your loan balance is updated automatically.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. Your documents are stored privately and your information is protected with bank-grade security. See our Privacy Policy for details.",
  },
];

function SupportPage() {
  const waLink = `https://wa.me/234${SUPPORT_PHONE.replace(/^0/, "")}`;

  return (
    <AppShell title="Support">
      <div className="gradient-brand mb-5 rounded-2xl p-5 text-white shadow-soft">
        <p className="font-display text-lg font-bold">We're here to help</p>
        <p className="mt-1 text-sm text-white/80">
          Reach our team for anything about your account, loans or repayments.
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm text-white/80">
          <Clock className="h-4 w-4" /> Mon–Sat, 8am–6pm WAT
        </div>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <a
          href={waLink}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:bg-muted/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">WhatsApp</p>
            <p className="text-sm text-muted-foreground">Chat with us</p>
          </div>
        </a>
        <a
          href={`tel:${SUPPORT_PHONE}`}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:bg-muted/50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Call us</p>
            <p className="text-sm text-muted-foreground">{SUPPORT_PHONE}</p>
          </div>
        </a>
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-colors hover:bg-muted/50 sm:col-span-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-sm text-muted-foreground">{SUPPORT_EMAIL}</p>
          </div>
        </a>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold">Frequently asked questions</h2>
      </div>
      <div className="rounded-2xl border border-border bg-card px-4 shadow-card">
        <Accordion type="single" collapsible>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-semibold">
                {f.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-6 text-center">
        <Button asChild variant="outline">
          <a href={waLink} target="_blank" rel="noreferrer">
            <MessageCircle className="mr-1 h-4 w-4" /> Start a WhatsApp chat
          </a>
        </Button>
      </div>
    </AppShell>
  );
}
