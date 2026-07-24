import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/legal/debt-recovery")({
  head: () => ({
    meta: [
      { title: "Debt Recovery Policy — Fountain Credit" },
      { name: "description", content: "How Fountain Credit handles overdue loans and recovery." },
    ],
  }),
  component: DebtRecoveryPage,
});

function DebtRecoveryPage() {
  return (
    <LegalLayout title="Debt Recovery Policy">
      <p>
        This Debt Recovery Policy describes the steps Fountain Credit may take where a loan is not
        repaid by its due date. We are committed to fair, lawful and respectful recovery
        practices.
      </p>

      <h2>1. Friendly Reminders</h2>
      <p>
        Before and shortly after the due date, we will send reminders via in-app notifications,
        email, SMS or WhatsApp encouraging timely repayment.
      </p>

      <h2>2. Late Fees</h2>
      <p>
        Where a loan becomes overdue, applicable late payment charges as disclosed in your loan
        offer may be added to the outstanding balance.
      </p>

      <h2>3. Follow-Up Contact</h2>
      <p>
        Our team may contact you directly to understand your situation and agree a reasonable
        repayment plan where appropriate.
      </p>

      <h2>4. Credit Bureau Reporting</h2>
      <p>
        Persistent non-payment may be reported to licensed credit bureaus, which may affect your
        ability to access credit in the future.
      </p>

      <h2>5. Recovery Actions</h2>
      <p>
        For prolonged default, we may engage authorised recovery agents or take lawful steps to
        recover the outstanding amount, including legal action, always within the limits of
        applicable Nigerian law.
      </p>

      <h2>6. Fair Treatment</h2>
      <p>
        We do not engage in harassment, intimidation, or the unauthorised disclosure of your
        debt to third parties. Recovery is conducted with dignity and in line with regulatory
        guidelines.
      </p>

      <h2>7. Need Help?</h2>
      <p>
        If you are struggling to repay, contact us early at support@fountaincredit.ng or
        08033708798 so we can find a workable solution together.
      </p>
    </LegalLayout>
  );
}
