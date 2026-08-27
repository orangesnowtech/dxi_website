"use client";

import { useEffect, useState } from "react";
import { siteSettings } from "@/content/site";
import { MEMBERSHIP_FEE_LABEL } from "@/lib/academy";
import { normalizeReferralCode } from "@/lib/referral";
import { trackApplicationSubmitted } from "@/lib/analytics";
import {
  SectionLabel,
  Field,
  Row,
  Label,
  Hint,
  TextInput,
  Select,
  TextArea,
  Conditional,
  Frame,
} from "@/app/components/ui/FormControls";

type SocialMediaProfile = {
  platform: string;
  url: string;
};

type BusinessProfileForm = {
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
  socialMediaProfiles: SocialMediaProfile[];
  wantsBusinessSupport: string;
  supportAreaNeeded: string;
  businessGoalsNextSixMonths: string;
  // Section G — financing history and needs. Everything branches off whether
  // they have applied for financing before.
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
  /** Optional. Attributes the signup, and may discount the membership fee. */
  referralCode: string;
};

const initialFormData: BusinessProfileForm = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  alternatePhoneNumber: "",
  emailAddress: "",
  preferredContactMethod: "",
  country: "Nigeria",
  state: "",
  cityOrArea: "",
  businessOffering: "",
  businessDescription: "",
  hasPhysicalLocation: "",
  locationType: "",
  isBusinessRunning: "",
  businessDuration: "",
  isFullTimeBusiness: "",
  businessTypeIfNotFullTime: "",
  salesLocation: "",
  onlineSalesChannel: "",
  otherPlatformName: "",
  websiteUrl: "",
  isBusinessRegistered: "",
  needsRegistrationHelp: "",
  hasStaff: "",
  staffCount: "",
  isMakingSales: "",
  monthlyRevenue: "",
  onSocialMedia: "",
  socialMediaProfiles: [],
  wantsBusinessSupport: "",
  supportAreaNeeded: "",
  businessGoalsNextSixMonths: "",
  previousFinancingApplication: "",
  loanAmountRange: "",
  financingType: "",
  fundingInstitution: "",
  interestRate: "",
  isLoanRepaid: "",
  repaymentPeriod: "",
  outstandingDebtAmount: "",
  rejectionReason: "",
  financingSoughtNextYear: "",
  financingPurpose: "",
  hasCollateralOrGuarantors: "",
  preferredContactDay: "",
  preferredContactTime: "",
  referralCode: "",
};

const yesNo = ["Yes", "No"];
const countries = [
  "Nigeria",
  "Ghana",
  "Kenya",
  "South Africa",
  "United Kingdom",
  "United States",
  "Other",
];
const contactMethods = ["Phone", "WhatsApp", "Email"];
const locationTypes = [
  "Shop",
  "Office",
  "Kiosk",
  "Market Stall",
  "Shared Space",
  "Home-Based",
  "Other",
];
const offerings = ["Product", "Service", "Both"];
const businessDurations = [
  "Not started yet",
  "Less than 6 months",
  "6 - 12 months",
  "1 - 3 years",
  "3 - 6 years",
  "6 years and above",
];
const salesLocations = ["Online", "Physical store", "Both"];
const onlineSalesChannels = ["Website", "Social media", "Other third-party platform"];
const partTimeTypes = ["Part-time", "Side gig", "Weekend business", "Still testing the idea"];
const registrationStatuses = ["Yes", "No", "In progress", "Not sure"];
const staffCounts = ["1 person", "2 to 5 people", "6 to 10 people", "More than 10 people"];
const salesStatuses = ["Yes", "No", "Not really", "Not enough"];
const monthlyRevenueRanges = [
  "No revenue yet",
  "Under ₦50,000",
  "₦50,000 - ₦200,000",
  "₦200,001 - ₦500,000",
  "₦500,001 - ₦1,000,000",
  "₦1,000,001 - ₦2,500,000",
  "₦2,500,001 - ₦5,000,000",
  "Above ₦5,000,000",
];
const socialPlatformOptions = [
  "Instagram",
  "Facebook",
  "TikTok",
  "X (Twitter)",
  "LinkedIn",
  "YouTube",
  "WhatsApp",
  "Snapchat",
  "Threads",
  "Other",
];
const supportAreas = [
  "Branding",
  "Marketing",
  "Sales",
  "Website",
  "Business Structure",
  "Social Media",
  "Accounting",
  "Legal",
  "Recruitment",
  "Training",
  "Operations",
  "Funding",
  "Not Sure Yet",
];
const contactTimes = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];
const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara",
];

// Financing
const loanAmountRanges = [
  "Below ₦100,000",
  "₦100,000 - ₦300,000",
  "₦300,001 - ₦500,000",
  "₦500,001 - ₦1,000,000",
  "₦1,000,001 - ₦5,000,000",
  "Above ₦5,000,000",
];
const interestRates = ["Below 5%", "5% - 10%", "11% - 20%", "Above 20%", "Don't remember"];
const repaymentPeriods = [
  "Less than 6 months",
  "6 - 12 months",
  "1 - 2 years",
  "2 - 5 years",
  "More than 5 years",
];
const financingApplicationStatuses = [
  "Yes, and I received it",
  "Yes, but I was rejected",
  "Yes, still pending",
  "No, never applied",
];
const financingTypes = [
  "Bank loan",
  "Microfinance loan",
  "Government grant",
  "Cooperative / esusu",
  "Family & friends",
  "Angel / investor",
  "Other",
];
const rejectionReasons = [
  "No or poor records",
  "Business not registered",
  "No collateral",
  "Insufficient revenue",
  "No credit history",
  "No clear reason given",
  "Other",
];
const financingSoughtRanges = [
  "None",
  "Under ₦100,000",
  "₦100,000 - ₦500,000",
  "₦500,001 - ₦1,000,000",
  "₦1,000,001 - ₦5,000,000",
  "Above ₦5,000,000",
];
const financingPurposes = [
  "Inventory / stock",
  "Equipment",
  "Hiring",
  "Marketing",
  "Expansion / new location",
  "Working capital",
  "Other",
];
const collateralOptions = ["Yes", "No", "Not sure"];

function toTitleCase(value: string) {
  return value
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Shown in place of the rest of the form when the country is not Nigeria.
 *
 * The Academy only operates in Nigeria for now, so rather than let someone
 * spend ten minutes on a profile we cannot act on, the form stops at the
 * country question and offers a way to stay in touch.
 */
function NotAvailableNotice() {
  const waHref = `https://wa.me/${siteSettings.whatsappNumber}?text=${encodeURIComponent(
    "Hello DXI, I'm outside Nigeria and I'd like to know when the Academy opens in my country."
  )}`;

  return (
    <div className="border-2 border-ink p-8" role="status">
      <div className="mb-4 inline-block bg-signal px-3 py-[5px] font-mono text-[11px] uppercase tracking-[0.14em] text-white">
        Not available yet
      </div>
      <h2 className="mb-3 font-disp text-2xl uppercase leading-tight">
        Nigeria only, for now<span className="text-signal">.</span>
      </h2>
      <p className="mb-4 text-[15px] text-smoke">
        The DXI Academy is only available to Nigerian businesses at the moment. The structuring,
        mentorship and financing introductions all run through partners operating in Nigeria, so we
        can&rsquo;t serve a business based elsewhere properly yet.
      </p>
      <p className="mb-6 text-[15px] text-smoke">
        If your business is registered in Nigeria, change the country above and the form will open
        back up.
      </p>
      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-signal px-[30px] py-4 font-mono text-sm tracking-[0.04em] text-white transition-[transform,background-color] duration-150 hover:bg-signal-hover hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        Tell me when you expand
      </a>
    </div>
  );
}

export default function BusinessProfilePage() {
  const minContactDate = getTodayDateString();
  const [formData, setFormData] = useState<BusinessProfileForm>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Result of the live referral lookup. "idle" also covers an empty field —
  // the code is optional, so saying nothing is a perfectly good answer.
  const [referralCheck, setReferralCheck] = useState<{
    status: "idle" | "checking" | "valid" | "invalid" | "unavailable";
    message: string;
  }>({ status: "idle", message: "" });

  const referralCode = formData.referralCode;

  /**
   * Checks the code a moment after typing stops, so the applicant knows it
   * worked before they spend ten minutes on the rest of the form. Nothing is
   * claimed here — the use is only taken when the profile is submitted.
   */
  useEffect(() => {
    if (!referralCode) {
      setReferralCheck({ status: "idle", message: "" });
      return;
    }

    if (referralCode.length < 3) {
      setReferralCheck({ status: "idle", message: "" });
      return;
    }

    setReferralCheck({ status: "checking", message: "Checking…" });

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/referral-codes/validate?code=${encodeURIComponent(referralCode)}`,
          { signal: controller.signal }
        );
        const data = await response.json();

        if (!response.ok) {
          // A lookup outage must not block an application: the server checks
          // the code again on submit either way.
          setReferralCheck({
            status: "unavailable",
            message: data.error || "We could not check that code. You can still submit.",
          });
          return;
        }

        setReferralCheck({
          status: data.valid ? "valid" : "invalid",
          message: data.message,
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }

        setReferralCheck({
          status: "unavailable",
          message: "We could not check that code. You can still submit.",
        });
      }
    }, 450);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [referralCode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Codes travel on flyers and over the phone, so accept whatever case and
      // spacing they arrive in and settle on the one canonical form.
      if (name === "referralCode") next.referralCode = normalizeReferralCode(value);

      // Clear follow-up answers whenever their trigger stops applying, so a
      // changed mind cannot leave stale values in the submission.
      if (name === "hasPhysicalLocation" && value !== "Yes") next.locationType = "";
      if (name === "isFullTimeBusiness" && value !== "No") next.businessTypeIfNotFullTime = "";
      if (name === "hasStaff" && value !== "Yes") next.staffCount = "";
      if (name === "country" && value !== "Nigeria") next.state = "";
      if (name === "isBusinessRegistered" && value !== "No") next.needsRegistrationHelp = "";

      // Selling physically only means none of the online follow-ups apply.
      if (name === "salesLocation" && value === "Physical store") {
        next.onlineSalesChannel = "";
        next.otherPlatformName = "";
        next.websiteUrl = "";
      }
      if (name === "onlineSalesChannel") {
        if (value !== "Other third-party platform") next.otherPlatformName = "";
        if (value !== "Website") next.websiteUrl = "";
      }

      if (name === "onSocialMedia" && value !== "Yes") next.socialMediaProfiles = [];
      if (name === "onSocialMedia" && value === "Yes" && next.socialMediaProfiles.length === 0) {
        next.socialMediaProfiles = [{ platform: "", url: "" }];
      }

      if (name === "wantsBusinessSupport" && value === "No") {
        next.supportAreaNeeded = "";
        next.businessGoalsNextSixMonths = "";
        next.preferredContactDay = "";
        next.preferredContactTime = "";
      }

      if (name === "previousFinancingApplication") {
        if (!value.startsWith("Yes")) {
          next.loanAmountRange = "";
          next.financingType = "";
          next.fundingInstitution = "";
        }
        // Interest, repayment and balance only exist once money changed hands.
        if (value !== "Yes, and I received it") {
          next.interestRate = "";
          next.isLoanRepaid = "";
          next.repaymentPeriod = "";
          next.outstandingDebtAmount = "";
        }
        if (value !== "Yes, but I was rejected") {
          next.rejectionReason = "";
        }
      }

      // A settled loan has no remaining term or balance to report.
      if (name === "isLoanRepaid" && value !== "No") {
        next.repaymentPeriod = "";
        next.outstandingDebtAmount = "";
      }

      return next;
    });
  };

  const handleCityBlur = () => {
    setFormData((prev) => ({ ...prev, cityOrArea: toTitleCase(prev.cityOrArea) }));
  };

  const handleSocialProfileChange = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    setFormData((prev) => {
      const nextProfiles = [...prev.socialMediaProfiles];
      nextProfiles[index] = { ...nextProfiles[index], [field]: value };
      return { ...prev, socialMediaProfiles: nextProfiles };
    });
  };

  const addSocialMediaProfile = () => {
    setFormData((prev) => ({
      ...prev,
      socialMediaProfiles: [...prev.socialMediaProfiles, { platform: "", url: "" }],
    }));
  };

  const removeSocialMediaProfile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaProfiles: prev.socialMediaProfiles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSubmitted(false);
    setSubmitStatus({ type: null, message: "" });

    if (formData.wantsBusinessSupport === "Yes" && !formData.preferredContactDay) {
      setSubmitStatus({
        type: "error",
        message: "Please choose a preferred contact day.",
      });
      setIsSubmitting(false);
      return;
    }

    // A code we already know is bad would only be rejected by the server a
    // moment later, after they had watched the whole form submit.
    if (formData.referralCode && referralCheck.status === "invalid") {
      setSubmitStatus({
        type: "error",
        message: `${referralCheck.message} You can also clear the field and submit without a code.`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/business-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit business profile");
      }

      setSubmitStatus({
        type: "success",
        message:
          "Thank you. Your business profile is now with our team for review, and we will be in touch either way.",
      });
      setIsSubmitted(true);
      trackApplicationSubmitted();
      setFormData(initialFormData);
      setReferralCheck({ status: "idle", message: "" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const wantsSupport = formData.wantsBusinessSupport === "Yes";
  const isNigeria = formData.country === "Nigeria";
  const sellsOnline = formData.salesLocation === "Online" || formData.salesLocation === "Both";
  const hasAppliedBefore = formData.previousFinancingApplication.startsWith("Yes");
  const loanReceived = formData.previousFinancingApplication === "Yes, and I received it";
  const loanRejected = formData.previousFinancingApplication === "Yes, but I was rejected";

  return (
    <main>
      {/* Hero */}
      <header className="relative overflow-hidden bg-ink text-white">
        <div
          className="absolute top-0 right-0 h-[min(34vw,360px)] w-[min(34vw,360px)] bg-signal"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
          aria-hidden
        />
        <div className="relative z-2 mx-auto w-full max-w-wrap px-6 pt-[70px] pb-[74px]">
          <div className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-signal">
            DXI Academy · Step one
          </div>
          <h1 className="mb-5 max-w-[14ch] font-disp text-[clamp(38px,6.4vw,74px)] uppercase leading-[0.95] tracking-[-0.01em]">
            Business
            <br />
            Profile<span className="text-signal">.</span>
          </h1>
          <p className="max-w-[600px] text-[clamp(16px,2.2vw,20px)] text-mute-hi">
            Tell us about your business so we know exactly how to help you grow it — and, when
            you&rsquo;re ready, introduce you to the right financing partners. It takes about ten
            minutes.
          </p>
        </div>
      </header>

      <div className="py-[70px]">
        <div className="mx-auto w-full max-w-[820px] px-6">
          {isSubmitted && submitStatus.type === "success" ? (
            <div className="border-2 border-ink p-8">
              <div className="mb-4 inline-block bg-signal px-3 py-[5px] font-mono text-[11px] uppercase tracking-[0.14em] text-white">
                Received
              </div>
              <h2 className="mb-3 font-disp text-2xl uppercase">Profile submitted.</h2>
              <p className="mb-6 text-[15px] text-smoke">{submitStatus.message}</p>
              <p className="font-mono text-sm text-smoke">
                Next: our team reviews your profile. If you&rsquo;re approved, we&rsquo;ll email
                you the ₦50,000 membership payment details. Please don&rsquo;t send any payment
                until you receive that email from us.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-11 border-l-[3px] border-signal py-1.5 pl-4 font-mono text-[13px] text-smoke">
                Fields marked with <b className="text-signal">*</b> are required.
              </div>

              <form onSubmit={handleSubmit} noValidate={false}>
                {/* A — Contact */}
                <fieldset className="mb-13 border-none">
                  <SectionLabel tag="A">Contact Information</SectionLabel>
                  <Row>
                    <Field half>
                      <Label htmlFor="firstName" required>First Name</Label>
                      <TextInput id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                    </Field>
                    <Field half>
                      <Label htmlFor="lastName" required>Last Name</Label>
                      <TextInput id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                    </Field>
                  </Row>
                  <Row>
                    <Field half>
                      <Label htmlFor="phoneNumber" required>Phone Number</Label>
                      <TextInput id="phoneNumber" name="phoneNumber" type="tel" inputMode="tel" value={formData.phoneNumber} onChange={handleInputChange} required />
                    </Field>
                    <Field half>
                      <Label htmlFor="alternatePhoneNumber">Alternate Phone Number</Label>
                      <TextInput id="alternatePhoneNumber" name="alternatePhoneNumber" type="tel" inputMode="tel" value={formData.alternatePhoneNumber} onChange={handleInputChange} />
                      <Hint>Optional — a second number we can try if the first one doesn&rsquo;t connect.</Hint>
                    </Field>
                  </Row>
                  <Field>
                    <Label htmlFor="emailAddress" required>Email Address</Label>
                    <TextInput id="emailAddress" name="emailAddress" type="email" inputMode="email" value={formData.emailAddress} onChange={handleInputChange} required />
                  </Field>
                  <Field>
                    <Label htmlFor="preferredContactMethod" required>Preferred Method of Contact</Label>
                    <Select id="preferredContactMethod" name="preferredContactMethod" value={formData.preferredContactMethod} onChange={handleInputChange} options={contactMethods} required />
                  </Field>
                </fieldset>

                {/* B — Location */}
                <fieldset className="mb-13 border-none">
                  <SectionLabel tag="B">Location Information</SectionLabel>
                  <Field>
                    <Label htmlFor="country" required>Which country is your business based in?</Label>
                    <Select id="country" name="country" value={formData.country} onChange={handleInputChange} options={countries} required />
                  </Field>
                  {/* Country is the gate — everything below it only applies to Nigeria. */}
                  {isNigeria && (
                    <>
                      <Field>
                        <Label htmlFor="state" required>What state are you located in?</Label>
                        <Select id="state" name="state" value={formData.state} onChange={handleInputChange} options={nigerianStates} placeholder="Select a state" required />
                      </Field>
                      <Field>
                        <Label htmlFor="cityOrArea" required>What city or area do you operate from?</Label>
                        <TextInput id="cityOrArea" name="cityOrArea" value={formData.cityOrArea} onChange={handleInputChange} onBlur={handleCityBlur} required />
                      </Field>
                      <Field>
                        <Label htmlFor="hasPhysicalLocation" required>Do you currently operate from a physical location?</Label>
                        <Select id="hasPhysicalLocation" name="hasPhysicalLocation" value={formData.hasPhysicalLocation} onChange={handleInputChange} options={yesNo} required />
                      </Field>
                      <Conditional when={formData.hasPhysicalLocation === "Yes"}>
                        <Field>
                          <Label htmlFor="locationType" required>What kind of location is it?</Label>
                          <Select id="locationType" name="locationType" value={formData.locationType} onChange={handleInputChange} options={locationTypes} required />
                        </Field>
                      </Conditional>
                    </>
                  )}
                </fieldset>

                {!isNigeria && <NotAvailableNotice />}

                {isNigeria && (
                  <>

                {/* C — Business status */}
                <fieldset className="mb-13 border-none">
                  <SectionLabel tag="C">Business Status</SectionLabel>
                  <Field>
                    <Label htmlFor="businessOffering" required>Do you offer a product, a service, or both?</Label>
                    <Select id="businessOffering" name="businessOffering" value={formData.businessOffering} onChange={handleInputChange} options={offerings} required />
                  </Field>
                  <Field>
                    <Label htmlFor="businessDescription" required>Tell us about your business</Label>
                    <TextArea id="businessDescription" name="businessDescription" value={formData.businessDescription} onChange={handleInputChange} placeholder="What you do, who you serve, what makes you different." required />
                  </Field>
                  <Field>
                    <Label htmlFor="isBusinessRunning" required>Is your business currently running?</Label>
                    <Select id="isBusinessRunning" name="isBusinessRunning" value={formData.isBusinessRunning} onChange={handleInputChange} options={yesNo} required />
                  </Field>
                  <Field>
                    <Label htmlFor="businessDuration" required>How long has the business been operating?</Label>
                    <Select id="businessDuration" name="businessDuration" value={formData.businessDuration} onChange={handleInputChange} options={businessDurations} required />
                  </Field>
                  <Field>
                    <Label htmlFor="isFullTimeBusiness" required>Is this your full-time business?</Label>
                    <Select id="isFullTimeBusiness" name="isFullTimeBusiness" value={formData.isFullTimeBusiness} onChange={handleInputChange} options={yesNo} required />
                  </Field>
                  <Conditional when={formData.isFullTimeBusiness === "No"}>
                    <Field>
                      <Label htmlFor="businessTypeIfNotFullTime" required>How would you describe it then?</Label>
                      <Select id="businessTypeIfNotFullTime" name="businessTypeIfNotFullTime" value={formData.businessTypeIfNotFullTime} onChange={handleInputChange} options={partTimeTypes} required />
                    </Field>
                  </Conditional>
                  <Field>
                    <Label htmlFor="salesLocation" required>Where do you sell your product or service?</Label>
                    <Select id="salesLocation" name="salesLocation" value={formData.salesLocation} onChange={handleInputChange} options={salesLocations} required />
                  </Field>
                  <Conditional when={sellsOnline}>
                    <Field>
                      <Label htmlFor="onlineSalesChannel" required>Where online?</Label>
                      <Select id="onlineSalesChannel" name="onlineSalesChannel" value={formData.onlineSalesChannel} onChange={handleInputChange} options={onlineSalesChannels} required />
                    </Field>
                    <Conditional when={formData.onlineSalesChannel === "Other third-party platform"}>
                      <Field>
                        <Label htmlFor="otherPlatformName" required>Which platform?</Label>
                        <TextInput id="otherPlatformName" name="otherPlatformName" value={formData.otherPlatformName} onChange={handleInputChange} placeholder="e.g. Jumia, Konga, Selar" required />
                      </Field>
                    </Conditional>
                    <Conditional when={formData.onlineSalesChannel === "Website"}>
                      <Field>
                        <Label htmlFor="websiteUrl" required>What is your website address?</Label>
                        <TextInput id="websiteUrl" name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} placeholder="yourbusiness.com" required />
                      </Field>
                    </Conditional>
                  </Conditional>
                </fieldset>

                {/* D — Setup */}
                <fieldset className="mb-13 border-none">
                  <SectionLabel tag="D">Business Setup</SectionLabel>
                  <Field>
                    <Label htmlFor="isBusinessRegistered" required>Is your business registered?</Label>
                    <Select id="isBusinessRegistered" name="isBusinessRegistered" value={formData.isBusinessRegistered} onChange={handleInputChange} options={registrationStatuses} required />
                  </Field>
                  <Conditional when={formData.isBusinessRegistered === "No"}>
                    <Field>
                      <Label htmlFor="needsRegistrationHelp" required>Would you like help registering it?</Label>
                      <Select id="needsRegistrationHelp" name="needsRegistrationHelp" value={formData.needsRegistrationHelp} onChange={handleInputChange} options={yesNo} required />
                    </Field>
                  </Conditional>
                  <Field>
                    <Label htmlFor="hasStaff" required>Do you currently have staff or people helping you?</Label>
                    <Select id="hasStaff" name="hasStaff" value={formData.hasStaff} onChange={handleInputChange} options={yesNo} required />
                  </Field>
                  <Conditional when={formData.hasStaff === "Yes"}>
                    <Field>
                      <Label htmlFor="staffCount" required>How many?</Label>
                      <Select id="staffCount" name="staffCount" value={formData.staffCount} onChange={handleInputChange} options={staffCounts} required />
                    </Field>
                  </Conditional>
                </fieldset>

                {/* E — Sales & operations */}
                <fieldset className="mb-13 border-none">
                  <SectionLabel tag="E">Sales &amp; Operations</SectionLabel>
                  <Field>
                    <Label htmlFor="isMakingSales" required>Are you currently making sales?</Label>
                    <Select id="isMakingSales" name="isMakingSales" value={formData.isMakingSales} onChange={handleInputChange} options={salesStatuses} required />
                  </Field>
                  <Field>
                    <Label htmlFor="monthlyRevenue" required>What is your approximate monthly revenue? (₦)</Label>
                    <Select id="monthlyRevenue" name="monthlyRevenue" value={formData.monthlyRevenue} onChange={handleInputChange} options={monthlyRevenueRanges} placeholder="Select a revenue range" required />
                  </Field>
                  <Field>
                    <Label htmlFor="onSocialMedia" required>Are you on social media?</Label>
                    <Select id="onSocialMedia" name="onSocialMedia" value={formData.onSocialMedia} onChange={handleInputChange} options={yesNo} required />
                  </Field>

                  <Conditional when={formData.onSocialMedia === "Yes"}>
                    {formData.socialMediaProfiles.map((profile, index) => (
                      <Row key={index}>
                        <Field half>
                          <Label htmlFor={`socialPlatform-${index}`} required>Platform</Label>
                          <Select
                            id={`socialPlatform-${index}`}
                            name={`socialPlatform-${index}`}
                            value={profile.platform}
                            onChange={(e) => handleSocialProfileChange(index, "platform", e.target.value)}
                            options={socialPlatformOptions}
                            required
                          />
                        </Field>
                        <Field half>
                          <Label htmlFor={`socialUrl-${index}`} required>Profile link or handle</Label>
                          <TextInput
                            id={`socialUrl-${index}`}
                            name={`socialUrl-${index}`}
                            value={profile.url}
                            onChange={(e) => handleSocialProfileChange(index, "url", e.target.value)}
                            placeholder="@yourbrand or a full link"
                            required
                          />
                          {formData.socialMediaProfiles.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSocialMediaProfile(index)}
                              className="mt-1.5 font-mono text-[12.5px] text-signal hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </Field>
                      </Row>
                    ))}
                    <button
                      type="button"
                      onClick={addSocialMediaProfile}
                      className="mb-6 font-mono text-[13px] tracking-[0.04em] text-ink shadow-[inset_0_0_0_2px_var(--color-ink)] px-4 py-2 transition-colors hover:bg-ink hover:text-white"
                    >
                      + Add another platform
                    </button>
                  </Conditional>
                </fieldset>

                {/* F — Support */}
                <fieldset className="mb-13 border-none">
                  <SectionLabel tag="F">Support Needed</SectionLabel>
                  <Field>
                    <Label htmlFor="wantsBusinessSupport" required>Do you want support with growing or improving the business?</Label>
                    <Select id="wantsBusinessSupport" name="wantsBusinessSupport" value={formData.wantsBusinessSupport} onChange={handleInputChange} options={yesNo} required />
                  </Field>
                  <Conditional when={wantsSupport}>
                    <Field>
                      <Label htmlFor="supportAreaNeeded" required>What area do you need support with first?</Label>
                      <Select id="supportAreaNeeded" name="supportAreaNeeded" value={formData.supportAreaNeeded} onChange={handleInputChange} options={supportAreas} required />
                    </Field>
                    <Field>
                      <Label htmlFor="businessGoalsNextSixMonths" required>What are your business goals in the next 6 months?</Label>
                      <TextArea id="businessGoalsNextSixMonths" name="businessGoalsNextSixMonths" value={formData.businessGoalsNextSixMonths} onChange={handleInputChange} placeholder="Where you want the business to be." required />
                    </Field>
                  </Conditional>
                </fieldset>

                {/* G — Financing */}
                <fieldset className="mb-13 border-none">
                  <SectionLabel tag="G">Financing History &amp; Needs</SectionLabel>
                  <Frame>
                    This section helps us understand your financing journey so we can prepare you
                    and, when you&rsquo;re ready, introduce you to the right partners.{" "}
                    <b className="text-ink">
                      The Academy does not lend money, and the decision always sits with the lender
                    </b>{" "}
                    — our job is to make your business one they&rsquo;re glad to say yes to.
                  </Frame>

                  <Field>
                    <Label htmlFor="previousFinancingApplication" required>
                      Have you ever applied for a business loan or grant before?
                    </Label>
                    <Select
                      id="previousFinancingApplication"
                      name="previousFinancingApplication"
                      value={formData.previousFinancingApplication}
                      onChange={handleInputChange}
                      options={financingApplicationStatuses}
                      required
                    />
                  </Field>

                  <Conditional when={hasAppliedBefore}>
                    <Field>
                      <Label htmlFor="loanAmountRange">
                        {loanReceived ? "Roughly how much did you receive?" : "How much did you apply for?"}
                      </Label>
                      <Select id="loanAmountRange" name="loanAmountRange" value={formData.loanAmountRange} onChange={handleInputChange} options={loanAmountRanges} placeholder="Select a range" />
                    </Field>
                    <Field>
                      <Label htmlFor="financingType">What kind of financing was it?</Label>
                      <Select id="financingType" name="financingType" value={formData.financingType} onChange={handleInputChange} options={financingTypes} />
                    </Field>
                    <Field>
                      <Label htmlFor="fundingInstitution">Which institution or organisation?</Label>
                      <TextInput id="fundingInstitution" name="fundingInstitution" value={formData.fundingInstitution} onChange={handleInputChange} placeholder="e.g. LAPO Microfinance Bank, BOI, Tony Elumelu Foundation" />
                    </Field>

                    {loanReceived && (
                      <>
                        <Field>
                          <Label htmlFor="interestRate">What is the interest rate?</Label>
                          <Select id="interestRate" name="interestRate" value={formData.interestRate} onChange={handleInputChange} options={interestRates} />
                        </Field>
                        <Field>
                          <Label htmlFor="isLoanRepaid">Has the loan been paid off?</Label>
                          <Select id="isLoanRepaid" name="isLoanRepaid" value={formData.isLoanRepaid} onChange={handleInputChange} options={yesNo} />
                        </Field>
                        {/* Term and balance only matter while the loan is live. */}
                        <Conditional when={formData.isLoanRepaid === "No"}>
                          <Field>
                            <Label htmlFor="repaymentPeriod">How long is the repayment period?</Label>
                            <Select id="repaymentPeriod" name="repaymentPeriod" value={formData.repaymentPeriod} onChange={handleInputChange} options={repaymentPeriods} />
                          </Field>
                          <Field>
                            <Label htmlFor="outstandingDebtAmount">Roughly how much is still remaining?</Label>
                            <Select id="outstandingDebtAmount" name="outstandingDebtAmount" value={formData.outstandingDebtAmount} onChange={handleInputChange} options={loanAmountRanges} placeholder="Select a range" />
                          </Field>
                        </Conditional>
                      </>
                    )}

                    {loanRejected && (
                      <Field>
                        <Label htmlFor="rejectionReason">What reason were you given?</Label>
                        <Select id="rejectionReason" name="rejectionReason" value={formData.rejectionReason} onChange={handleInputChange} options={rejectionReasons} />
                        <Hint>
                          There&rsquo;s no wrong answer here — most of these are exactly what the
                          Academy helps you fix.
                        </Hint>
                      </Field>
                    )}
                  </Conditional>

                  <Field>
                    <Label htmlFor="financingSoughtNextYear">What financing are you hoping for in the next 12 months?</Label>
                    <Select id="financingSoughtNextYear" name="financingSoughtNextYear" value={formData.financingSoughtNextYear} onChange={handleInputChange} options={financingSoughtRanges} placeholder="Select a range" />
                  </Field>
                  <Field>
                    <Label htmlFor="financingPurpose">What would you use the financing for?</Label>
                    <Select id="financingPurpose" name="financingPurpose" value={formData.financingPurpose} onChange={handleInputChange} options={financingPurposes} />
                  </Field>
                  <Field>
                    <Label htmlFor="hasCollateralOrGuarantors">Do you have collateral or guarantors available?</Label>
                    <Select id="hasCollateralOrGuarantors" name="hasCollateralOrGuarantors" value={formData.hasCollateralOrGuarantors} onChange={handleInputChange} options={collateralOptions} />
                  </Field>
                </fieldset>

                {/* H — Scheduling */}
                {wantsSupport && (
                  <fieldset className="mb-13 border-none">
                    <SectionLabel tag="H">When Can We Reach You?</SectionLabel>
                    <Row>
                      <Field half>
                        <Label htmlFor="preferredContactDay" required>Preferred contact day</Label>
                        <TextInput id="preferredContactDay" name="preferredContactDay" type="date" min={minContactDate} value={formData.preferredContactDay} onChange={handleInputChange} required />
                      </Field>
                      <Field half>
                        <Label htmlFor="preferredContactTime" required>Preferred contact time</Label>
                        <Select id="preferredContactTime" name="preferredContactTime" value={formData.preferredContactTime} onChange={handleInputChange} options={contactTimes} placeholder="Select a time slot" required />
                      </Field>
                    </Row>
                  </fieldset>
                )}

                {/* Referral — lettered off H so the sequence stays contiguous
                    whether or not the scheduling section is showing. */}
                <fieldset className="mb-13 border-none">
                  <SectionLabel tag={wantsSupport ? "I" : "H"}>Referral Code</SectionLabel>
                  <Field>
                    <Label htmlFor="referralCode">
                      Were you given a referral code?
                    </Label>
                    <TextInput
                      id="referralCode"
                      name="referralCode"
                      value={formData.referralCode}
                      onChange={handleInputChange}
                      placeholder="e.g. GIFT-K7P2QM"
                      autoComplete="off"
                      spellCheck={false}
                      maxLength={24}
                      aria-describedby="referralCode-status"
                    />
                    <Hint>
                      Optional. If someone from our team referred you, or your training is
                      being covered as a gift, enter their code here — it tells us who sent
                      you and applies any discount on the {MEMBERSHIP_FEE_LABEL} membership.
                    </Hint>
                    <div
                      id="referralCode-status"
                      role="status"
                      aria-live="polite"
                      className="mt-2 min-h-[20px] font-mono text-[12.5px]"
                    >
                      {referralCheck.status === "checking" && (
                        <span className="text-smoke">{referralCheck.message}</span>
                      )}
                      {referralCheck.status === "valid" && (
                        <span className="text-ink">
                          <b className="text-signal">✓</b> {referralCheck.message}
                        </span>
                      )}
                      {referralCheck.status === "invalid" && (
                        <span className="text-signal">{referralCheck.message}</span>
                      )}
                      {referralCheck.status === "unavailable" && (
                        <span className="text-smoke">{referralCheck.message}</span>
                      )}
                    </div>
                  </Field>
                </fieldset>

                {submitStatus.type === "error" && (
                  <div className="mb-6 border-l-[3px] border-signal bg-ash px-5 py-4 font-mono text-[13px] text-ink">
                    {submitStatus.message}
                  </div>
                )}

                <div className="mt-2.5 border-t-[3px] border-ink pt-[34px]">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-block cursor-pointer border-none bg-signal px-[30px] py-4 font-mono text-sm tracking-[0.04em] text-white transition-[transform,background-color] duration-150 hover:bg-signal-hover hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                  >
                    {isSubmitting ? "Submitting…" : "Submit Business Profile"}
                  </button>
                  <p className="mt-4 font-mono text-sm text-smoke">
                    Your profile goes to our team for review. Approved applicants receive
                    their ₦50,000 membership payment details by email.
                  </p>
                </div>
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
