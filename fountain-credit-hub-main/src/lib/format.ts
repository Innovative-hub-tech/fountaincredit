export const naira = (value: number | null | undefined) => {
  const n = typeof value === "number" ? value : 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(n);
};

export const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatLoanDuration = (days: number | null | undefined, months?: number | null) => {
  const d = Number(days ?? 0);
  if (d > 0) {
    if (d % 30 === 0) {
      const m = d / 30;
      return `${m} month${m === 1 ? "" : "s"}`;
    }
    if (d % 7 === 0) {
      const w = d / 7;
      return `${w} week${w === 1 ? "" : "s"}`;
    }
    return `${d} days`;
  }
  const m = Number(months ?? 1);
  return `${m} month${m === 1 ? "" : "s"}`;
};

export const LOAN_STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  disbursed: "Disbursed",
  active: "Active",
  partially_repaid: "Partially Repaid",
  fully_repaid: "Fully Repaid",
  defaulted: "Defaulted",
};

export const statusTone = (status: string): "neutral" | "success" | "warning" | "danger" | "info" => {
  switch (status) {
    case "approved":
    case "fully_repaid":
    case "verified":
      return "success";
    case "pending":
    case "partially_repaid":
      return "warning";
    case "rejected":
    case "defaulted":
      return "danger";
    case "disbursed":
    case "active":
      return "info";
    default:
      return "neutral";
  }
};
