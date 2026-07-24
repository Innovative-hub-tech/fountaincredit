import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/legal/sla")({
  head: () => ({
    meta: [
      { title: "Service Level Agreement — Fountain Credit" },
      { name: "description", content: "Service standards and response times you can expect." },
    ],
  }),
  component: SlaPage,
});

function SlaPage() {
  return (
    <LegalLayout title="Service Level Agreement">
      <p>
        This Service Level Agreement ("SLA") sets out the service standards you can expect from
        Fountain Credit. We aim to be transparent about how and when we respond to you.
      </p>

      <h2>1. Loan Application Review</h2>
      <p>
        We aim to review and respond to loan applications within one (1) business day of
        submission, provided your profile and verification are complete.
      </p>

      <h2>2. Disbursement</h2>
      <p>
        Approved loans are typically disbursed within one (1) business day of approval to your
        nominated bank account.
      </p>

      <h2>3. Repayment Verification</h2>
      <p>
        After you upload proof of payment, we aim to verify and update your loan balance within
        one (1) business day.
      </p>

      <h2>4. Support Response Times</h2>
      <p>
        Our support team operates Monday to Saturday, 8am–6pm WAT. We aim to respond to WhatsApp
        and phone enquiries within a few hours during business hours, and to emails within one
        (1) business day.
      </p>

      <h2>5. Platform Availability</h2>
      <p>
        We strive to keep the platform available at all times, save for scheduled maintenance
        which we will communicate in advance where possible.
      </p>

      <h2>6. Exceptions</h2>
      <p>
        Timelines may be affected by incomplete information, verification delays, public holidays,
        bank processing times or events beyond our reasonable control.
      </p>

      <h2>7. Contact</h2>
      <p>
        For service-related concerns, contact support@fountaincredit.ng or 08033708798.
      </p>
    </LegalLayout>
  );
}
