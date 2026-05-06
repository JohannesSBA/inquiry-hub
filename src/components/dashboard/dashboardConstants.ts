/**
 * Shared presentation maps for inquiry badges (labels + colors).
 */

export const CATEGORY_MAP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PARTNERSHIP: { label: "Partnership", color: "#3c3489", bg: "#eeedfe" },
  SALES: { label: "Sales", color: "#085041", bg: "#e1f5ee" },
  INVESTMENT: { label: "Investment", color: "#0c447c", bg: "#e6f1fb" },
  SUPPORT: { label: "Support", color: "#993c1d", bg: "#faece7" },
  TALENT: { label: "Talent", color: "#72243e", bg: "#fbeaf0" },
  ONBOARDING: { label: "Onboarding", color: "#27500a", bg: "#eaf3de" },
  SPAM: { label: "Spam", color: "#444441", bg: "#f1efe8" },
  GENERAL: { label: "General", color: "#444441", bg: "#f1efe8" },
};

export const PRIORITY_MAP: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  HIGH: { label: "High", color: "#791f1f", bg: "#fcebeb" },
  MEDIUM: { label: "Medium", color: "#633806", bg: "#faeeda" },
  LOW: { label: "Low", color: "#444441", bg: "#f1efe8" },
};

export const STATUS_OPTIONS = [
  "NEW",
  "PROCESSING",
  "AWAITING_REPLY",
  "REPLIED",
  "FOLLOW_UP",
  "CLOSED",
];
