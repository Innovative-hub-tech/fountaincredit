import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/legal/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Fountain Credit" },
      { name: "description", content: "How Fountain Credit collects, uses and protects your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        This Privacy Policy explains how Fountain Credit collects, uses, stores and protects
        your personal information when you use our platform, in line with the Nigeria Data
        Protection Act.
      </p>

      <h2>1. Information We Collect</h2>
      <p>
        We collect your name, contact details, date of birth, address, BVN, identity documents,
        employment and income details, bank account information, and loan and repayment history.
      </p>

      <h2>2. How We Use Your Information</h2>
      <p>
        We use your information to verify your identity, assess loan eligibility, disburse and
        manage loans, process repayments, prevent fraud, comply with legal obligations and
        communicate with you about your account.
      </p>

      <h2>3. BVN Verification</h2>
      <p>
        With your consent, we use your BVN solely to confirm your identity. We do not gain access
        to your bank accounts or balances through your BVN.
      </p>

      <h2>4. Data Sharing</h2>
      <p>
        We may share your information with verification and payment service providers, credit
        bureaus, and regulatory or law enforcement authorities where required by law. We never
        sell your personal data.
      </p>

      <h2>5. Data Security</h2>
      <p>
        Your documents and sensitive data are stored in secure, access-controlled storage. We
        apply technical and organisational measures to protect your information from unauthorised
        access.
      </p>

      <h2>6. Data Retention</h2>
      <p>
        We retain your information for as long as your account is active and as required to meet
        legal, regulatory and accounting obligations.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        You may request access to, correction of, or deletion of your personal data, subject to
        legal limitations, by contacting us.
      </p>

      <h2>8. Contact</h2>
      <p>
        For privacy enquiries, contact support@fountaincredit.ng or 08033708798.
      </p>
    </LegalLayout>
  );
}
