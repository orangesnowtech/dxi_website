import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type BusinessProfilePayload = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
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
  isBusinessRegistered: string;
  needsRegistrationHelp: string;
  hasStaff: string;
  staffCount: string;
  isMakingSales: string;
  monthlyRevenue: string;
  salesChannels: string;
  onSocialMedia: string;
  socialMediaProfiles: Array<{
    platform: string;
    url: string;
  }>;
  wantsBusinessSupport: string;
  hasWebsite: string;
  websiteUrl: string;
  supportAreaNeeded: string;
  businessGoalsNextSixMonths: string;
  // Section G — financing history and needs. Only the two trigger questions are
  // required; the follow-ups stay optional so nobody is forced to disclose.
  hasActiveDebt: string;
  borrowedAmount: string;
  outstandingDebtAmount: string;
  debtRepaymentTerms: string;
  previousFinancingApplication: string;
  financingReceivedAmount: string;
  financingType: string;
  rejectionReason: string;
  financingSoughtNextYear: string;
  financingPurpose: string;
  hasCollateralOrGuarantors: string;
  preferredContactDay: string;
  preferredContactTime: string;
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

const contactMethods = new Set(["Phone Call", "WhatsApp", "Email", "SMS"]);

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
  "isBusinessRegistered",
  "hasStaff",
  "isMakingSales",
  "monthlyRevenue",
  "salesChannels",
  "onSocialMedia",
  "wantsBusinessSupport",
  "hasWebsite",
  "hasActiveDebt",
];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getMissingFields(payload: BusinessProfilePayload) {
  const missing: Array<keyof BusinessProfilePayload> = requiredStringFields.filter(
    (field) => !payload[field]?.trim()
  );

  // State is only collected for Nigeria — the form disables and clears it for
  // every other country, so requiring it unconditionally rejected them all.
  if (payload.country === "Nigeria" && !payload.state?.trim()) {
    missing.push("state");
  }

  // An active loan already establishes that they have applied for financing
  // before, so the form disables that question and the answer arrives empty.
  if (payload.hasActiveDebt !== "Yes" && !payload.previousFinancingApplication?.trim()) {
    missing.push("previousFinancingApplication");
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

  if (payload.hasWebsite === "Yes" && !payload.websiteUrl.trim()) {
    missing.push("websiteUrl");
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

  if (payload.hasWebsite === "Yes" && !isValidUrl(payload.websiteUrl)) {
    invalidFields.add("websiteUrl");
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

function getZeptoConfig() {
  const bounceAddress = (
    process.env.ZEPTOMAIL_BOUNCE_ADDRESS ||
    process.env.ZEPTOMAIL_SENDER_ADDRESS ||
    "info@dximarketing.com"
  ).trim();

  const fromAddress = (
    process.env.ZEPTOMAIL_SENDER_ADDRESS ||
    bounceAddress ||
    "info@dximarketing.com"
  ).trim();

  return {
    token: (process.env.ZEPTOMAIL_TOKEN || process.env.NEXT_PUBLIC_ZEPTOMAIL_TOKEN || "").trim(),
    bounceAddress,
    fromAddress,
    recipientEmail: (
      process.env.BUSINESS_PROFILE_RECIPIENT_EMAIL ||
      process.env.CONTACT_FORM_RECIPIENT_EMAIL ||
      "info@dximarketing.com"
    ).trim(),
  };
}

async function sendZeptoEmail(payload: Record<string, unknown>, token: string) {
  const response = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ZeptoMail error ${response.status}: ${errorText}`);
  }
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

    const submissionRef = await firestore.collection("businessProfileSubmissions").add({
      ...normalizedPayload,
      fullName,
      status: "new",
      source: "website",
      createdAt: FieldValue.serverTimestamp(),
      submittedAt: new Date().toISOString(),
    });

    const { token, bounceAddress, fromAddress, recipientEmail } = getZeptoConfig();

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
          <strong>Submitted By:</strong> ${escapeHtml(fullName)}
        </p>

        <h3 style="margin:20px 0 8px;">Contact Information</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;">
          <tr><td style="padding:6px 8px;"><strong>Email</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.emailAddress)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Phone</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.phoneNumber)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Preferred Contact Method</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.preferredContactMethod)}</td></tr>
        </table>

        <h3 style="margin:20px 0 8px;">Business Snapshot</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;">
          <tr><td style="padding:6px 8px;"><strong>Location</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.cityOrArea)}, ${escapeHtml(normalizedPayload.state)}, ${escapeHtml(normalizedPayload.country)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Offering</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.businessOffering)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Business Running</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.isBusinessRunning)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Duration</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.businessDuration)}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Monthly Revenue</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.monthlyRevenue || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Main Sales Channel</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.salesChannels)}</td></tr>
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
          <tr><td style="padding:6px 8px;"><strong>Active Loans / Debt</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.hasActiveDebt || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Amount Borrowed</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.borrowedAmount || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Outstanding Amount</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.outstandingDebtAmount || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Repayment Terms</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.debtRepaymentTerms || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Applied Before</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.previousFinancingApplication || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Amount Received</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.financingReceivedAmount || "Not provided")}</td></tr>
          <tr><td style="padding:6px 8px;"><strong>Financing Type</strong></td><td style="padding:6px 8px;">${escapeHtml(normalizedPayload.financingType || "Not provided")}</td></tr>
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
        <p style="margin:0;"><strong>Has Website:</strong> ${escapeHtml(normalizedPayload.hasWebsite)} (${escapeHtml(normalizedPayload.websiteUrl || "Not provided")})</p>
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

    try {
      await sendZeptoEmail(
        {
          from: {
            address: fromAddress,
            name: "DXI Marketing",
          },
          to: [
            {
              email_address: {
                address: normalizedPayload.emailAddress,
                name: fullName,
              },
            },
          ],
          subject: "We have received your business profile",
          htmlbody: `
            <div style="font-family:Arial,Helvetica,sans-serif;color:#111827;line-height:1.5;">
              <h2 style="margin:0 0 16px;color:#b91c1c;">Thank You For Your Submission</h2>
              <p>Hi ${escapeHtml(normalizedPayload.firstName)},</p>
              <p>We have received your business profile and our team will review it shortly.</p>
              <p>Here is a quick summary of what you submitted:</p>
              <ul>
                <li><strong>Support area:</strong> ${escapeHtml(normalizedPayload.supportAreaNeeded || "Not provided")}</li>
                <li><strong>Goals (next 6 months):</strong> ${escapeHtml(normalizedPayload.businessGoalsNextSixMonths || "Not provided")}</li>
                <li><strong>Preferred contact method:</strong> ${escapeHtml(normalizedPayload.preferredContactMethod)}</li>
                <li><strong>Preferred contact day:</strong> ${escapeHtml(normalizedPayload.preferredContactDay || "Not provided")}</li>
                <li><strong>Preferred contact time:</strong> ${escapeHtml(normalizedPayload.preferredContactTime || "Not provided")}</li>
              </ul>
              <p>If you need to update any detail, you can reply to this email.</p>
              <p style="margin-top:20px;">Best regards,<br />DXI Marketing</p>
            </div>
          `,
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