/**
 * Review pipeline for Academy applications. Nothing is sold on submission —
 * a profile is reviewed first, and only an approved applicant is sent the
 * membership payment details.
 */
export const SUBMISSION_STATUSES: string[] = [
  "new",
  "under_review",
  "approved",
  "rejected",
  "archived",
];

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  new: "New",
  under_review: "Under review",
  approved: "Approved",
  rejected: "Rejected",
  archived: "Archived",
  // Retained so submissions created before the review flow existed still
  // render a sensible label instead of a raw key.
  contacted: "Contacted (legacy)",
  qualified: "Qualified (legacy)",
};

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  new: "#3b82f6",
  under_review: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
  archived: "#6b7280",
  contacted: "#6b7280",
  qualified: "#6b7280",
};

/**
 * What the dashboard shows when no status filter is chosen.
 *
 * Archiving is how a submission is cleared off the working list, so archived
 * ones are excluded by default and reachable through the filter. Legacy values
 * are included so submissions created before the review flow still appear.
 */
export const ACTIVE_SUBMISSION_STATUSES: string[] = [
  "new",
  "under_review",
  "approved",
  "rejected",
  "contacted",
  "qualified",
];
