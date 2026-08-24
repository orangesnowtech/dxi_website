/**
 * Academy membership and manual-deposit settings.
 *
 * Paystack has not approved the live account yet, so membership is settled by
 * direct bank transfer. When Paystack goes live, this file is where a hosted
 * payment link would replace the account details below.
 */

export const MEMBERSHIP_FEE_NAIRA = 50000;

export const MEMBERSHIP_FEE_LABEL = "₦50,000";

export const BANK_DETAILS = {
  bankName: "Zenith Bank",
  accountName: "Digital X Inter-ractive Limited",
  accountNumber: "1013741380",
};

/** How long applicants are told they have to complete the transfer. */
export const PAYMENT_WINDOW_LABEL = "7 days";

export function bankDetailsAreConfigured() {
  return Object.values(BANK_DETAILS).every(
    (value) => value.trim().length > 0 && !value.startsWith("REPLACE_ME")
  );
}
