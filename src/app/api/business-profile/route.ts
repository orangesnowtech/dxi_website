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
  annualRevenue: string;
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
  preferredContactDay: string;
  preferredContactTime: string;
};

const annualRevenueRanges = new Set([
  "No revenue yet",
  "Under ₦500,000",
  "₦500,000 - ₦2,000,000",
  "₦2,000,001 - ₦5,000,000",
  "₦5,000,001 - ₦10,000,000",
  "₦10,000,001 - ₦25,000,000",
  "₦25,000,001 - ₦50,000,000",
  "Above ₦50,000,000",
]);

const contactMethods = new Set(["Phone Call", "WhatsApp", "Email", "SMS"]);

const yesNoValues = new Set(["Yes", "No"]);

const urlPattern = /^https?:\/\/.+/i;
const phonePattern = /^\+?[0-9\s()-]{7,20}$/;
const namePattern = /^[A-Za-z][A-Za-z' -]*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const requiredStringFields: Array<keyof Omit<BusinessProfilePayload, "socialMediaProfiles">> = [
  "firstName",
  "lastName",
  "phoneNumber",
  "emailAddress",
  "preferredContactMethod",
  "country",
  "state",
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
  "annualRevenue",
  "salesChannels",
  "onSocialMedia",
  "wantsBusinessSupport",
  "hasWebsite",
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

  if (!namePattern.test(payload.state.trim())) {
    invalidFields.add("state");
  }

  if (!namePattern.test(payload.cityOrArea.trim())) {
    invalidFields.add("cityOrArea");
  }

  if (payload.businessDescription.trim().length < 20 || payload.businessDescription.trim().length > 1000) {
    invalidFields.add("businessDescription");
  }

  if (!annualRevenueRanges.has(payload.annualRevenue.trim())) {
    invalidFields.add("annualRevenue");
  }

  if (!yesNoValues.has(payload.onSocialMedia.trim())) {
    invalidFields.add("onSocialMedia");
  }

  if (payload.hasWebsite === "Yes" && !urlPattern.test(payload.websiteUrl.trim())) {
    invalidFields.add("websiteUrl");
  }

  if (payload.onSocialMedia === "Yes") {
    const hasInvalidProfileUrl = payload.socialMediaProfiles.some(
      (profile) => !urlPattern.test(profile.url.trim())
    );

    if (hasInvalidProfileUrl) {
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
  return {
    token: process.env.ZEPTOMAIL_TOKEN || process.env.NEXT_PUBLIC_ZEPTOMAIL_TOKEN,
    bounceAddress:
      process.env.ZEPTOMAIL_BOUNCE_ADDRESS || process.env.NEXT_PUBLIC_ZEPTOMAIL_BOUNCE_ADDRESS,
    recipientEmail:
      process.env.BUSINESS_PROFILE_RECIPIENT_EMAIL || process.env.NEXT_PUBLIC_CONTACT_FORM_RECIPIENT_EMAIL,
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

    const { token, bounceAddress, recipientEmail } = getZeptoConfig();

    if (!token || !bounceAddress || !recipientEmail) {
      console.error("Business profile email configuration missing");
      return NextResponse.json(
        {
          message: "Business profile saved, but email notifications are not configured.",
          submissionId: submissionRef.id,
        },
        { status: 200 }
      );
    }

    const adminEmailBody = `
      <h2>New Business Profile Submission</h2>
      <p><strong>Submission ID:</strong> ${escapeHtml(submissionRef.id)}</p>
      <p><strong>First Name:</strong> ${escapeHtml(normalizedPayload.firstName)}</p>
      <p><strong>Last Name:</strong> ${escapeHtml(normalizedPayload.lastName)}</p>
      <p><strong>Phone Number:</strong> ${escapeHtml(normalizedPayload.phoneNumber)}</p>
      <p><strong>Email Address:</strong> ${escapeHtml(normalizedPayload.emailAddress)}</p>
      <p><strong>Preferred Contact Method:</strong> ${escapeHtml(normalizedPayload.preferredContactMethod)}</p>
      <p><strong>Country:</strong> ${escapeHtml(normalizedPayload.country)}</p>
      <p><strong>State:</strong> ${escapeHtml(normalizedPayload.state)}</p>
      <p><strong>City or Area:</strong> ${escapeHtml(normalizedPayload.cityOrArea)}</p>
      <p><strong>Business Offering:</strong> ${escapeHtml(normalizedPayload.businessOffering)}</p>
      <p><strong>Business Description:</strong> ${escapeHtml(normalizedPayload.businessDescription)}</p>
      <p><strong>Physical Location:</strong> ${escapeHtml(normalizedPayload.hasPhysicalLocation)}</p>
      <p><strong>Location Type:</strong> ${escapeHtml(normalizedPayload.locationType || "Not provided")}</p>
      <p><strong>Business Running:</strong> ${escapeHtml(normalizedPayload.isBusinessRunning)}</p>
      <p><strong>Business Duration:</strong> ${escapeHtml(normalizedPayload.businessDuration)}</p>
      <p><strong>Full-time Business:</strong> ${escapeHtml(normalizedPayload.isFullTimeBusiness)}</p>
      <p><strong>If Not Full-time:</strong> ${escapeHtml(normalizedPayload.businessTypeIfNotFullTime || "Not provided")}</p>
      <p><strong>Business Registered:</strong> ${escapeHtml(normalizedPayload.isBusinessRegistered)}</p>
      <p><strong>Needs Registration Help:</strong> ${escapeHtml(normalizedPayload.needsRegistrationHelp || "Not provided")}</p>
      <p><strong>Has Staff:</strong> ${escapeHtml(normalizedPayload.hasStaff)}</p>
      <p><strong>Staff Count:</strong> ${escapeHtml(normalizedPayload.staffCount || "Not provided")}</p>
      <p><strong>Making Sales:</strong> ${escapeHtml(normalizedPayload.isMakingSales)}</p>
      <p><strong>Annual Revenue:</strong> ${escapeHtml(normalizedPayload.annualRevenue || "Not provided")}</p>
      <p><strong>Main Sales Channel:</strong> ${escapeHtml(normalizedPayload.salesChannels)}</p>
      <p><strong>On Social Media:</strong> ${escapeHtml(normalizedPayload.onSocialMedia)}</p>
      <p><strong>Social Profiles:</strong></p>
      <ul>
        ${
          normalizedPayload.socialMediaProfiles.length > 0
            ? normalizedPayload.socialMediaProfiles
                .map(
                  (profile) =>
                    `<li>${escapeHtml(profile.platform)}: <a href="${escapeHtml(profile.url)}">${escapeHtml(profile.url)}</a></li>`
                )
                .join("")
            : "<li>Not provided</li>"
        }
      </ul>
      <p><strong>Wants Support:</strong> ${escapeHtml(normalizedPayload.wantsBusinessSupport)}</p>
      <p><strong>Has Website:</strong> ${escapeHtml(normalizedPayload.hasWebsite)}</p>
      <p><strong>Website URL:</strong> ${escapeHtml(normalizedPayload.websiteUrl || "Not provided")}</p>
      <p><strong>Support Needed First:</strong> ${escapeHtml(normalizedPayload.supportAreaNeeded)}</p>
      <p><strong>Preferred Contact Day:</strong> ${escapeHtml(normalizedPayload.preferredContactDay)}</p>
      <p><strong>Preferred Contact Time:</strong> ${escapeHtml(normalizedPayload.preferredContactTime)}</p>
    `;

    try {
      await sendZeptoEmail(
        {
          bounce_address: bounceAddress,
          from: {
            address: bounceAddress,
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
          bounce_address: bounceAddress,
          from: {
            address: bounceAddress,
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
          subject: "We received your business profile",
          htmlbody: `
            <h2>Thank you for sharing your business profile</h2>
            <p>Hi ${escapeHtml(normalizedPayload.firstName)},</p>
            <p>We have received your submission and will contact you via ${escapeHtml(normalizedPayload.preferredContactMethod)}.</p>
            <p><strong>Support area selected:</strong> ${escapeHtml(normalizedPayload.supportAreaNeeded)}</p>
            <p><strong>Preferred contact day:</strong> ${escapeHtml(normalizedPayload.preferredContactDay)}</p>
            <p><strong>Preferred contact time:</strong> ${escapeHtml(normalizedPayload.preferredContactTime)}</p>
            <p>Best regards,<br />DXI Marketing</p>
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