"use client";

import { useState } from "react";
import { siteSettings } from "@/content/site";
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
} from "./FormControls";

type SocialMediaProfile = {
  platform: string;
  url: string;
};

type BusinessProfileForm = {
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
  socialMediaProfiles: SocialMediaProfile[];
  wantsBusinessSupport: string;
  hasWebsite: string;
  websiteUrl: string;
  supportAreaNeeded: string;
  businessGoalsNextSixMonths: string;
  // Section G — financing history and needs
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

const initialFormData: BusinessProfileForm = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
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
  isBusinessRegistered: "",
  needsRegistrationHelp: "",
  hasStaff: "",
  staffCount: "",
  isMakingSales: "",
  monthlyRevenue: "",
  salesChannels: "",
  onSocialMedia: "",
  socialMediaProfiles: [],
  wantsBusinessSupport: "",
  hasWebsite: "",
  websiteUrl: "",
  supportAreaNeeded: "",
  businessGoalsNextSixMonths: "",
  hasActiveDebt: "",
  borrowedAmount: "",
  outstandingDebtAmount: "",
  debtRepaymentTerms: "",
  previousFinancingApplication: "",
  financingReceivedAmount: "",
  financingType: "",
  rejectionReason: "",
  financingSoughtNextYear: "",
  financingPurpose: "",
  hasCollateralOrGuarantors: "",
  preferredContactDay: "",
  preferredContactTime: "",
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
const contactMethods = ["Phone Call", "WhatsApp", "Email", "SMS"];
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
  "6 months to 1 year",
  "1 to 3 years",
  "Over 3 years",
];
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
const salesChannelOptions = [
  "Physical Store",
  "WhatsApp",
  "Instagram",
  "Website",
  "Online Marketplace",
  "Referrals",
  "Other",
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
const debtRanges = [
  "Under ₦100,000",
  "₦100,000 - ₦500,000",
  "₦500,001 - ₦1,000,000",
  "₦1,000,001 - ₦5,000,000",
  "Above ₦5,000,000",
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
const financingSoughtRanges = ["None right now", ...debtRanges];
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Clear follow-up answers whenever their trigger stops applying, so a
      // changed mind cannot leave stale values in the submission.
      if (name === "hasPhysicalLocation" && value !== "Yes") next.locationType = "";
      if (name === "isFullTimeBusiness" && value !== "No") next.businessTypeIfNotFullTime = "";
      if (name === "hasStaff" && value !== "Yes") next.staffCount = "";
      if (name === "hasWebsite" && value !== "Yes") next.websiteUrl = "";
      if (name === "country" && value !== "Nigeria") next.state = "";
      if (name === "isBusinessRegistered" && value !== "No") next.needsRegistrationHelp = "";

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

      if (name === "hasActiveDebt") {
        if (value !== "Yes") {
          next.borrowedAmount = "";
          next.outstandingDebtAmount = "";
          next.debtRepaymentTerms = "";
        } else {
          // An active loan already answers whether they have ever applied, so
          // that branch is switched off and its answers cleared.
          next.previousFinancingApplication = "";
          next.financingReceivedAmount = "";
          next.rejectionReason = "";
        }
        // financingType is asked by both branches — reset it on any switch.
        next.financingType = "";
      }

      if (name === "previousFinancingApplication") {
        if (value !== "Yes, and I received it") {
          next.financingReceivedAmount = "";
          next.financingType = "";
        }
        if (value !== "Yes, but I was rejected") {
          next.rejectionReason = "";
        }
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
          "Thank you. Your business profile has been saved and we will contact you soon.",
      });
      setIsSubmitted(true);
      setFormData(initialFormData);
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
  const hasActiveDebt = formData.hasActiveDebt === "Yes";

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
                We&rsquo;ll send your ₦50,000 membership payment details shortly. Once settled,
                you&rsquo;re in.
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
                      <Label htmlFor="emailAddress" required>Email Address</Label>
                      <TextInput id="emailAddress" name="emailAddress" type="email" inputMode="email" value={formData.emailAddress} onChange={handleInputChange} required />
                    </Field>
                  </Row>
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
                    <Label htmlFor="salesChannels" required>Where do you mainly sell your products or services?</Label>
                    <Select id="salesChannels" name="salesChannels" value={formData.salesChannels} onChange={handleInputChange} options={salesChannelOptions} required />
                  </Field>
                  <Row>
                    <Field half>
                      <Label htmlFor="onSocialMedia" required>Are you on social media?</Label>
                      <Select id="onSocialMedia" name="onSocialMedia" value={formData.onSocialMedia} onChange={handleInputChange} options={yesNo} required />
                    </Field>
                    <Field half>
                      <Label htmlFor="hasWebsite" required>Do you currently have a website?</Label>
                      <Select id="hasWebsite" name="hasWebsite" value={formData.hasWebsite} onChange={handleInputChange} options={yesNo} required />
                    </Field>
                  </Row>

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

                  <Conditional when={formData.hasWebsite === "Yes"}>
                    <Field>
                      <Label htmlFor="websiteUrl" required>What is your website address?</Label>
                      <TextInput id="websiteUrl" name="websiteUrl" value={formData.websiteUrl} onChange={handleInputChange} placeholder="yourbusiness.com" required />
                    </Field>
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
                    <Label htmlFor="hasActiveDebt" required>Do you currently have any active business loans or debt?</Label>
                    <Select id="hasActiveDebt" name="hasActiveDebt" value={formData.hasActiveDebt} onChange={handleInputChange} options={yesNo} required />
                  </Field>
                  <Conditional when={hasActiveDebt}>
                    <Field>
                      <Label htmlFor="borrowedAmount">How much was originally borrowed or received?</Label>
                      <Select id="borrowedAmount" name="borrowedAmount" value={formData.borrowedAmount} onChange={handleInputChange} options={debtRanges} placeholder="Select a range" />
                    </Field>
                    <Field>
                      <Label htmlFor="outstandingDebtAmount">And roughly how much is still outstanding?</Label>
                      <Select id="outstandingDebtAmount" name="outstandingDebtAmount" value={formData.outstandingDebtAmount} onChange={handleInputChange} options={debtRanges} placeholder="Select a range" />
                    </Field>
                    <Field>
                      <Label htmlFor="financingType">What kind of financing is it?</Label>
                      <Select id="financingType" name="financingType" value={formData.financingType} onChange={handleInputChange} options={financingTypes} />
                    </Field>
                    <Field>
                      <Label htmlFor="debtRepaymentTerms">What are the repayment terms, briefly?</Label>
                      <TextInput id="debtRepaymentTerms" name="debtRepaymentTerms" value={formData.debtRepaymentTerms} onChange={handleInputChange} placeholder="e.g. 18 months, 5% monthly, from a microfinance bank" />
                    </Field>
                  </Conditional>

                  <Field>
                    <Label htmlFor="previousFinancingApplication" required={!hasActiveDebt}>
                      Have you ever applied for a business loan or grant before?
                    </Label>
                    <Select
                      id="previousFinancingApplication"
                      name="previousFinancingApplication"
                      value={formData.previousFinancingApplication}
                      onChange={handleInputChange}
                      options={financingApplicationStatuses}
                      placeholder={hasActiveDebt ? "Already answered above" : "Select an option"}
                      required={!hasActiveDebt}
                      disabled={hasActiveDebt}
                    />
                    {hasActiveDebt && (
                      <Hint>
                        An active loan already tells us you&rsquo;ve applied before, so we
                        won&rsquo;t ask again.
                      </Hint>
                    )}
                  </Field>
                  <Conditional when={formData.previousFinancingApplication === "Yes, and I received it"}>
                    <Field>
                      <Label htmlFor="financingReceivedAmount">Roughly how much did you receive?</Label>
                      <Select id="financingReceivedAmount" name="financingReceivedAmount" value={formData.financingReceivedAmount} onChange={handleInputChange} options={debtRanges} placeholder="Select a range" />
                    </Field>
                    <Field>
                      <Label htmlFor="financingType">What kind of financing was it?</Label>
                      <Select id="financingType" name="financingType" value={formData.financingType} onChange={handleInputChange} options={financingTypes} />
                    </Field>
                  </Conditional>
                  <Conditional when={formData.previousFinancingApplication === "Yes, but I was rejected"}>
                    <Field>
                      <Label htmlFor="rejectionReason">If you were rejected, what reason were you given?</Label>
                      <Select id="rejectionReason" name="rejectionReason" value={formData.rejectionReason} onChange={handleInputChange} options={rejectionReasons} />
                      <Hint>
                        There&rsquo;s no wrong answer here — most of these are exactly what the
                        Academy helps you fix.
                      </Hint>
                    </Field>
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
                    Right after you submit, we&rsquo;ll send your ₦50,000 membership payment
                    details. Once settled, you&rsquo;re in.
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
