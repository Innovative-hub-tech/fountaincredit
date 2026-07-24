import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout } from "@/components/LegalLayout";

export const Route = createFileRoute("/legal/borrower-agreement")({
  head: () => ({
    meta: [
      { title: "Borrower Agreement — Fountain Credit" },
      { name: "description", content: "The agreement between you and Fountain Credit for each loan." },
    ],
  }),
  component: BorrowerAgreementPage,
});

function BorrowerAgreementPage() {
  return (
    <LegalLayout title="Borrower Agreement">
      <p>
        This Borrower Agreement ("Agreement") is entered into between you ("the Borrower") and
        Fountain Credit ("the Lender") and applies to every loan you accept on the platform.
      </p>

      <h2>1. The Loan</h2>
      <p>
        Upon approval, the Lender agrees to disburse the approved principal amount to the
        Borrower's nominated bank account. The specific amount, interest, fees, total repayable
        amount and due date are set out in your loan offer.
      </p>

      <h2>2. Repayment Obligation</h2>
      <p>
        The Borrower agrees to repay the total repayable amount in full on or before the due
        date by transfer to the Lender's central account, and to upload accurate proof of each
        payment for verification.
      </p>

      <h2>3. Use of Funds</h2>
      <p>
        The Borrower confirms that the loan will be used for a lawful purpose and that all
        information provided in the application is true and complete.
      </p>

      <h2>4. Late Payment</h2>
      <p>
        If the Borrower fails to repay by the due date, late fees and recovery costs may apply,
        and the outstanding amount may be reported to credit bureaus.
      </p>

      <h2>5. Early Repayment</h2>
      <p>
        The Borrower may repay the loan in full before the due date. Any applicable adjustments
        will be communicated by the Lender.
      </p>

      <h2>6. Representations</h2>
      <p>
        The Borrower represents that they are legally capable of entering into this Agreement and
        that accepting a loan offer constitutes a binding commitment to repay.
      </p>

      <h2>7. Governing Law</h2>
      <p>
        This Agreement is governed by the laws of the Federal Republic of Nigeria.
      </p>

      <h2>8. Acceptance</h2>
      <p>
        By accepting a loan offer on the platform, the Borrower acknowledges that they have read,
        understood and agreed to this Agreement.
      </p>
    </LegalLayout>
  );
}
