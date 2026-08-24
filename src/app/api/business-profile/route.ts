import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase/admin";
import {
  escapeHtml,
  getBusinessProfileRecipient,
  getZeptoConfig,
  sendZeptoEmail,
} from "@/lib/zeptomail";
import {
  APPLICANT_FROM_NAME,
  buildSubmissionConfirmationEmail,
} from "@/lib/emails/academy";
import { redeemReferralCode, REFERRAL_CODES_COLLECTION } from "@/lib/firebase/referral-codes";
import {
  REFERRAL_REJECTION_MESSAGES,
  formatNaira,
  normalizeReferralCode,
  type RedeemedReferral,
} from "@/lib/referral";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BusinessProfilePayload = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  alternatePhoneNumber: string;
  emailAddress: string;
  preferredContactMethod: string;
  country: string;
  state: string;
  cityOrArea: string;
  businessOffering: string;
  businessDescription: string;
  hasPhysicalLocation: string;
  locationType: string;
  isBusinessRunning: string;
  businessDuration: string;
  isFullTimeBusiness: string;
  businessTypeIfNotFullTime: string;
  salesLocation: string;
  onlineSalesChannel: string;
  otherPlatformName: string;
  websiteUrl: string;
  isBusinessRegistered: string;
  needsRegistrationHelp: string;
  hasStaff: string;
  staffCount: string;
  isMakingSales: string;
  monthlyRevenue: string;
  onSocialMedia: string;
  socialMediaProfiles: Array<{
    platform: string;
    url: string;
  }>;
  wantsBusinessSupport: string;
  supportAreaNeeded: string;
  businessGoalsNextSixMonths: string;
  // Section G — financing history and needs. Only the trigger question is
  // required; the follow-ups stay optional so nobody is forced to disclose.
  previousFinancingApplication: string;
  loanAmountRange: string;
  financingType: string;
  fundingInstitution: string;
  interestRate: string;
  isLoanRepaid: string;
  repaymentPeriod: string;
  outstandingDebtAmount: string;
  rejectionReason: string;
  financingSoughtNextYear: string;
  financingPurpose: string;
  hasCollateralOrGuarantors: string;
  preferredContactDay: string;
  preferredContactTime: string;
  /** Optional. Attributes the signup and may discount the membership fee. */
  referralCode?: string;
};

const monthlyRevenueRanges = new Set([
  "No revenue yet",
  "Under ₦50,000",
  "₦50,000 - ₦200,000",
  "₦200,001 - ₦500,000",
  "₦500,001 - ₦1,000,000",
  "₦1,000,001 - ₦2,500,000",
  "₦2,500,001 - ₦5,000,000",
  "Above ₦5,000,000",
]);

const contactMethods = new Set(["Phone", "WhatsApp", "Email"]);

const yesNoValues = new Set(["Yes", "No"]);

const phonePattern = /^\+?[0-9\s()-]{7,20}$/;
const namePattern = /^[A-Za-z][A-Za-z' -]*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed);
  const candidate = hasProtocol ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    return Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

const requiredStringFields: Array<keyof Omit<BusinessProfilePayload, "socialMediaProfiles">> = [
  "firstName",
  "lastName",
  "phoneNumber",
  "emailAddress",
  "preferredContactMethod",
  "country",
  "cityOrArea",
  "businessOffering",
  "businessDescription",
  "hasPhysicalLocation",
  "isBusinessRunning",
  "businessDuration",
  "isFullTimeBusiness",
  "salesLocation",
  "isBusinessRegistered",
  "hasStaff",
  "isMakingSales",
  "monthlyRevenue",
  "onSocialMedia",
  "wantsBusinessSupport",
  "previousFinancingApplication",
];

function getMissingFields(payload: BusinessProfilePayload) {
  const missing: Array<keyof BusinessProfilePayload> = requiredStringFields.filter(
    (field) => !payload[field]?.trim()
  );

  // State is only collected for Nigeria — the form disables and clears it for
  // every other country, so requiring it unconditionally rejected them all.
  if (payload.country === "Nigeria" && !payload.state?.trim()) {
    missing.push("state");
  }

  if (payload.hasPhysicalLocation === "Yes" && !payload.locationType.trim()) {
    missing.push("locationType");
  }

  if (payload.isFullTimeBusiness === "No" && !payload.businessTypeIfNotFullTime.trim()) {
    missing.push("businessTypeIfNotFullTime");
  }

  if (payload.hasStaff === "Yes" && !payload.staffCount.trim()) {
    missing.push("staffCount");
  }

  // Selling online opens a follow-up chain: which channel, then the platform
  // name or the website address depending on the answer.
  if (payload.salesLocation === "Online" || payload.salesLocation === "Both") {
    if (!payload.onlineSalesChannel?.trim()) {
      missing.push("onlineSalesChannel");
    }
    if (
      payload.onlineSalesChannel === "Other third-party platform" &&
      !payload.otherPlatformName?.trim()
    ) {
      missing.push("otherPlatformName");
    }
    if (payload.onlineSalesChannel === "Website" && !payload.websiteUrl?.trim()) {
      missing.push("websiteUrl");
    }
  }

  if (payload.wantsBusinessSupport === "Yes") {
    if (!payload.supportAreaNeeded.trim()) {
      missing.push("supportAreaNeeded");
    }
    if (!payload.businessGoalsNextSixMonths.trim()) {
      missing.push("businessGoalsNextSixMonths");
    }
    if (!payload.preferredContactDay.trim()) {
      missing.push("preferredContactDay");
    }
    if (!payload.preferredContactTime.trim()) {
      missing.push("preferredContactTime");
    }
  }

  if (payload.isBusinessRegistered === "No" && !payload.needsRegistrationHelp.trim()) {
    missing.push("needsRegistrationHelp");
  }

  if (payload.onSocialMedia === "Yes") {
    if (!Array.isArray(payload.socialMediaProfiles) || payload.socialMediaProfiles.length === 0) {
      missing.push("socialMediaProfiles");
    } else {
      const hasInvalidProfile = payload.socialMediaProfiles.some(
        (profile) => !profile?.platform?.trim() || !profile?.url?.trim()
      );

      if (hasInvalidProfile) {
        missing.push("socialMediaProfiles");
      }
    }
  }

  return Array.from(new Set(missing));
}

function validateFields(payload: BusinessProfilePayload) {
  const invalidFields = new Set<string>();

  if (!namePattern.test(payload.firstName.trim())) {
    invalidFields.add("firstName");
  }

  if (!namePattern.test(payload.lastName.trim())) {
    invalidFields.add("lastName");
  }

  if (!phonePattern.test(payload.phoneNumber.trim())) {
    invalidFields.add("phoneNumber");
  }

  if (!emailPattern.test(payload.emailAddress.trim())) {
    invalidFields.add("emailAddress");
  }

  if (!contactMethods.has(payload.preferredContactMethod.trim())) {
    invalidFields.add("preferredContactMethod");
  }

  // Only shape-check state when one was actually given — it is absent by
  // design for countries other than Nigeria.
  if (payload.state?.trim() && !namePattern.test(payload.state.trim())) {
    invalidFields.add("state");
  }

  if (!namePattern.test(payload.cityOrArea.trim())) {
    invalidFields.add("cityOrArea");
  }

  if (payload.businessDescription.trim().length < 20 || payload.businessDescription.trim().length > 1000) {
    invalidFields.add("businessDescription");
  }

  if (!monthlyRevenueRanges.has(payload.monthlyRevenue.trim())) {
    invalidFields.add("monthlyRevenue");
  }

  if (
    payload.wantsBusinessSupport === "Yes" &&
    (payload.businessGoalsNextSixMonths.trim().length < 10 ||
      payload.businessGoalsNextSixMonths.trim().length > 500)
  ) {
    invalidFields.add("businessGoalsNextSixMonths");
  }

  if (!yesNoValues.has(payload.onSocialMedia.trim())) {
    invalidFields.add("onSocialMedia");
  }

  if (payload.websiteUrl?.trim() && !isValidUrl(payload.websiteUrl)) {
    invalidFields.add("websiteUrl");
  }

  if (payload.alternatePhoneNumber?.trim() && !phonePattern.test(payload.alternatePhoneNumber.trim())) {
    invalidFields.add("alternatePhoneNumber");
  }

  if (payload.onSocialMedia === "Yes") {
    const hasEmptyProfile = payload.socialMediaProfiles.some(
      (profile) => !profile.url || !profile.url.trim()
    );

    if (hasEmptyProfile) {
      invalidFields.add("socialMediaProfiles");
    }
  }

  if (payload.wantsBusinessSupport === "Yes" && payload.preferredContactDay.trim()) {
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const selectedDate = new Date(`${payload.preferredContactDay}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime()) || selectedDate < todayDateOnly) {
      invalidFields.add("preferredContactDay");
    }
  }

  return Array.from(invalidFields);
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as BusinessProfilePayload;
    const normalizedPayload = {
      ...payload,
      cityOrArea: payload.cityOrArea
        .trim()
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      socialMediaProfiles: Array.isArray(payload.socialMediaProfiles)
        ? payload.socialMediaProfiles.map((profile) => ({
            platform: profile.platform?.trim() || "",
            url: profile.url?.trim() || "",
          }))
        : [],
    };

    // The Academy only operates in Nigeria for now. The form stops at the
    // country question, but enforce it here too — a stale tab or a direct POST
    // would otherwise create submissions nobody can act on.
    if (normalizedPayload.country !== "Nigeria") {
      return NextResponse.json(
        {
          error:
            "The DXI Academy is only available to Nigerian businesses for now.",
          field: "country",
        },
        { status: 422 }
      );
    }

    const fullName = `${normalizedPayload.firstName.trim()} ${normalizedPayload.lastName.trim()}`;
    const missingFields = getMissingFields(normalizedPayload);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: "Missing required fields", missingFields },
        { status: 400 }
      );
    }

    const invalidFields = validateFields(normalizedPayload);

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: "Invalid field values", invalidFields },
        { status: 400 }
      );
    }

    // The code is claimed before the submission is written, because a claim is
    // the thing that can legitimately fail: a limited code may have run out
    // between the form checking it and this request arriving. Failing here
    // means nothing was saved and the applicant is told why, rather than being
    // quietly charged full price for a gift they were promised.
    const requestedCode = normalizeReferralCode(normalizedPayload.referralCode || "");
    let referral: RedeemedReferral | null = null;

    if (requestedCode) {
      const redemption = await redeemReferralCode(requestedCode);

      if (!redemption.ok) {
        return NextResponse.json(
          {
            error: REFERRAL_REJECTION_MESSAGES[redemption.reason],
            field: "referralCode",
          },
          { status: 422 }
        );
      }

      referral = redemption.referral;
    }

    let submissionRef;

    try {
      submissionRef = await firestore.collection("businessProfileSubmissions").add({
        ...normalizedPayload,
        referralCode: referral?.code || "",
        referral,
        fullName,
        status: "new",
        source: "website",
        createdAt: FieldValue.serverTimestamp(),
        submittedAt: new Date().toISOString(),
      });
    } catch (error) {
      // Give the use back rather than leave a limited code one short because
      // of a write that never landed.
      if (referral) {
        await firestore
          .collection(REFERRAL_CODES_COLLECTION)
          .doc(referral.code)
          .update({ usageCount: FieldValue.increment(-1) })
          .catch((releaseError) =>
            console.error(`Could not release referral code ${referral?.code}:`, releaseError)
          );
      }

      throw error;
    }

    const { token, bounceAddress, fromAddress } = getZeptoConfig();
    const recipientEmail = getBusinessProfileRecipient();

    if (!token || !bounceAddress || !fromAddress || !recipientEmail) {
      console.error("Business profile email configuration missing");
      return NextResponse.json(
        {
          message: "Business profile saved, but email notifications are not configured.",
          submissionId: submissionRef.id,
        },
        { status: 200 }
      );
    }

    const socialProfilesHtml =
      normalizedPayload.socialMediaProfiles.length > 0
        ? normalizedPayload.socialMediaProfiles
            .map(
              (profile) =>
                `<li>${escapeHtml(profile.platform)}: <a href="${escapeHtml(profile.url)}">${escapeHtml(profile.url)}</a></li>`
            )
            .join("")
        : "<li>Not provided</li>";

    const adminEmailBody = `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;">
        <h2 style="margin:0 0 16px;color:#b91c1c;">New Business Profile Submission</h2>
        <p style="margin:0 0 16px;">
          <strong>Submission ID:</strong> ${escapeHtml(submissionRef.id)}<br />
          <strong>Submitted By:</strong> ${escapeHtml(fullName)}<br />
          <strong>Referral Code:</strong> ${
            referral
              ? `${escapeHtml(referral.code)} (${escapeHtml(referral.label)}) &mdash; ${
                  referral.discountNaira > 0
                    ? `${escapeHtml(formatNaira(referral.discountNaira))} off, membership is ${escapeHtml(formatNaira(referral.finalFeeNaira))}`
                    : "no discount, tracking only"
                }`
              : "None"
          }
        </p>

        <h3 style="margin:20px 0 8px;">Contact Information</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;">
          <tr><td style="padding:6px 8px;"><strong>Email</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.emailAddress)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Phone</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.phoneNumber)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Alternate Phone</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.alternatePhoneNumber || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Preferred Contact Method</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.preferredContactMethod)}</td></tr>
        </table>

        <h3 style="margin:20px 0 8px;">Business Snapshot</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;">
          <tr><td style="padding:6px 8px;"><strong>Location</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.cityOrArea)}, ${escapeHtml(normalizedPayload.state)}, ${escapeHtml(normalizedPayload.country)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Offering</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.businessOffering)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Business Running</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.isBusinessRunning)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Duration</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.businessDuration)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Monthly Revenue</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.monthlyRevenue || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Sells Via</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.salesLocation)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Online Channel</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.onlineSalesChannel || "Not applicable")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Other Platform</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.otherPlatformName || "Not applicable")}</td></tr>
        </table>

        <h3 style="margin:20px 0 8px;">Support Request</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;">
          <tr><td style="padding:6px 8px;"><strong>Wants Support</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.wantsBusinessSupport)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Priority Area</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.supportAreaNeeded || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Goals (Next 6 Months)</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.businessGoalsNextSixMonths || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Preferred Contact Day</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.preferredContactDay || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Preferred Contact Time</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.preferredContactTime || "Not provided")}</td></tr>
        </table>

        <h3 style="margin:20px 0 8px;">Financing History &amp; Needs</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;">
          <tr><td style="padding:6px 8px;"><strong>Applied Before</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.previousFinancingApplication || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Loan Amount</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.loanAmountRange || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Financing Type</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.financingType || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Funding Institution</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.fundingInstitution || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Interest Rate</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.interestRate || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Loan Repaid</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.isLoanRepaid || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Repayment Period</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.repaymentPeriod || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Outstanding Amount</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.outstandingDebtAmount || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Rejection Reason</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.rejectionReason || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Sought (Next 12 Months)</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.financingSoughtNextYear || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Intended Use</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.financingPurpose || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Collateral / Guarantors</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.hasCollateralOrGuarantors || "Not provided")}</td></tr>
        </table>

        <h3 style="margin:20px 0 8px;">Additional Details</h3>
        <p style="margin:0 0 8px;"><strong>Business Description:</strong> ${escapeHtml(normalizedPayload.businessDescription)}</p>
        <p style="margin:0 0 8px;"><strong>Physical Location:</strong> ${escapeHtml(normalizedPayload.hasPhysicalLocation)} (${escapeHtml(normalizedPayload.locationType || "Not provided")})</p>
        <p style="margin:0 0 8px;"><strong>Full-time Business:</strong> ${escapeHtml(normalizedPayload.isFullTimeBusiness)} (${escapeHtml(normalizedPayload.businessTypeIfNotFullTime || "Not provided")})</p>
        <p style="margin:0 0 8px;"><strong>Business Registered:</strong> ${escapeHtml(normalizedPayload.isBusinessRegistered)} (${escapeHtml(normalizedPayload.needsRegistrationHelp || "Not provided")})</p>
        <p style="margin:0 0 8px;"><strong>Has Staff:</strong> ${escapeHtml(normalizedPayload.hasStaff)} (${escapeHtml(normalizedPayload.staffCount || "Not provided")})</p>
        <p style="margin:0 0 8px;"><strong>On Social Media:</strong> ${escapeHtml(normalizedPayload.onSocialMedia)}</p>
        <ul style="margin:0 0 8px 20px;">${socialProfilesHtml}</ul>
        <p style="margin:0;"><strong>Website:</strong> ${escapeHtml(normalizedPayload.websiteUrl || "Not provided")}</p>
      </div>
    `;

    try {
      await sendZeptoEmail(
        {
          from: {
            address: fromAddress,
            name: "DXI Business Profile Form",
          },
          to: [
            {
              email_address: {
                address: recipientEmail,
                name: "DXI Team",
              },
            },
          ],
          subject: `New Business Profile Submission - ${fullName}`,
          htmlbody: adminEmailBody,
        },
        token
      );
    } catch (error) {
      console.error("Failed to send business profile notification email:", error);
    }

    const confirmationEmail = buildSubmissionConfirmationEmail({
      firstName: normalizedPayload.firstName,
      referralCode: referral?.code,
      referralFinalFeeLabel: referral ? formatNaira(referral.finalFeeNaira) : undefined,
      referralDiscountLabel:
        referral && referral.discountNaira > 0 ? formatNaira(referral.discountNaira) : undefined,
      supportAreaNeeded: normalizedPayload.supportAreaNeeded,
      businessGoalsNextSixMonths: normalizedPayload.businessGoalsNextSixMonths,
      preferredContactMethod: normalizedPayload.preferredContactMethod,
      preferredContactDay: normalizedPayload.preferredContactDay,
      preferredContactTime: normalizedPayload.preferredContactTime,
    });

    try {
      await sendZeptoEmail(
        {
          from: {
            address: fromAddress,
            name: APPLICANT_FROM_NAME,
          },
          to: [
            {
              email_address: {
                address: normalizedPayload.emailAddress,
                name: fullName,
              },
            },
          ],
          subject: confirmationEmail.subject,
          htmlbody: confirmationEmail.html,
        },
        token
      );
    } catch (error) {
      console.error("Failed to send business profile confirmation email:", error);
    }

    return NextResponse.json(
      { message: "Business profile submitted successfully", submissionId: submissionRef.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Business profile submission error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}