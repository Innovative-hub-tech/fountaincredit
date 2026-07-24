import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/legal/bvn-consent")({
  head: () => ({
    meta: [
      { title: "BVN Verification Consent — Fountain Credit" },
      { name: "description", content: "Your consent for BVN verification with Fountain Credit." },
    ],
  }),
  component: BvnConsentPage,
});

function BvnConsentPage() {
  return (
    <LegalLayout title="BVN Verification Consent">
      <p>
        This notice explains how Fountain Credit uses your Bank Verification Number (BVN) and the
        consent you provide when applying for a loan.
      </p>

      <h2>1. Purpose of BVN Verification</h2>
      <p>
        We use your BVN solely to confirm your identity and reduce the risk of fraud. This helps
        us ensure that loans are issued to the correct, verified individual.
      </p>

      <h2>2. What We Access</h2>
      <p>
        BVN verification confirms identity details such as your name and date of birth associated
        with your BVN. It does <strong>not</strong> give us access to your bank accounts, balances
        or transaction history.
      </p>

      <h2>3. Your Consent</h2>
      <p>
        By providing your BVN and submitting a loan application, you expressly consent to Fountain
        Credit and its authorised verification partners processing your BVN for identity
        verification in accordance with our Privacy Policy.
      </p>

      <h2>4. Data Protection</h2>
      <p>
        Your BVN is handled securely and only used for the purposes described here. We retain it
        only as long as necessary to meet legal and regulatory obligations.
      </p>

      <h2>5. Withdrawing Consent</h2>
      <p>
        You may withdraw your consent by contacting us; however, we may be unable to process your
        loan application without successful identity verification.
      </p>

      <h2>6. Contact</h2>
      <p>
        For questions about BVN verification, contact support@fountaincredit.ng or 08033708798.
      </p>
    </LegalLayout>
  );
}
