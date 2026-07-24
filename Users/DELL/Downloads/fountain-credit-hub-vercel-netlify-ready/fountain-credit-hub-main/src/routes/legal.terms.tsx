import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — Fountain Credit" },
      { name: "description", content: "Read the Terms & Conditions for using Fountain Credit." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions">
      <p>
        These Terms &amp; Conditions ("Terms") govern your access to and use of the Fountain
        Credit platform and services. By creating an account or applying for a loan, you agree
        to be bound by these Terms.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 18 years old, resident in Nigeria, and provide accurate personal,
        identity and financial information, including a valid Bank Verification Number (BVN),
        to use our services.
      </p>

      <h2>2. Loan Applications</h2>
      <p>
        All loan applications are subject to review, verification and approval at our sole
        discretion. Submission of an application does not guarantee approval or disbursement.
      </p>

      <h2>3. Interest, Fees & Repayment</h2>
      <p>
        The applicable interest rate, fees and repayment schedule will be disclosed to you
        before you accept a loan offer. You agree to repay the total repayable amount on or
        before the due date by transfer to our designated central account and to upload valid
        proof of payment for verification.
      </p>

      <h2>4. Late Payment & Default</h2>
      <p>
        Failure to repay on time may result in additional charges, reporting to credit bureaus,
        and recovery actions in accordance with our Debt Recovery Policy.
      </p>

      <h2>5. Your Responsibilities</h2>
      <p>
        You are responsible for keeping your login credentials secure and for all activity on
        your account. You must provide truthful information and promptly update any changes.
      </p>

      <h2>6. Suspension & Termination</h2>
      <p>
        We may suspend or terminate your access if we suspect fraud, misuse, or breach of these
        Terms, without prejudice to any outstanding obligations you owe us.
      </p>

      <h2>7. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by law, Fountain Credit shall not be liable for any
        indirect or consequential loss arising from your use of the platform.
      </p>

      <h2>8. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the platform after changes
        take effect constitutes acceptance of the revised Terms.
      </p>

      <h2>9. Contact</h2>
      <p>
        For questions about these Terms, contact us at support@fountaincredit.ng or 08033708798.
      </p>
    </LegalLayout>
  );
}
