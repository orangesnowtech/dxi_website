"use client";

import { useRef, useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

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
  annualRevenue: string;
  salesChannels: string;
  onSocialMedia: string;
  socialMediaProfiles: SocialMediaProfile[];
  wantsBusinessSupport: string;
  hasWebsite: string;
  websiteUrl: string;
  supportAreaNeeded: string;
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
  annualRevenue: "",
  salesChannels: "",
  onSocialMedia: "",
  socialMediaProfiles: [],
  wantsBusinessSupport: "",
  hasWebsite: "",
  websiteUrl: "",
  supportAreaNeeded: "",
  preferredContactDay: "",
  preferredContactTime: "",
};

const yesNoOptions = ["Yes", "No"];

const countries = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Other"];

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

const contactTimes = [
  "8:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 2:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
];

const annualRevenueRanges = [
  "No revenue yet",
  "Under ₦500,000",
  "₦500,000 - ₦2,000,000",
  "₦2,000,001 - ₦5,000,000",
  "₦5,000,001 - ₦10,000,000",
  "₦10,000,001 - ₦25,000,000",
  "₦25,000,001 - ₦50,000,000",
  "Above ₦50,000,000",
];

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Federal Capital Territory",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

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

function formatSelectedDate(dateValue: string) {
  if (!dateValue) {
    return "Choose a date";
  }

  const parsed = new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export default function BusinessProfilePage() {
  const contactDayInputRef = useRef<HTMLInputElement>(null);
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

      if (name === "hasPhysicalLocation" && value !== "Yes") {
        next.locationType = "";
      }

      if (name === "isFullTimeBusiness" && value !== "No") {
        next.businessTypeIfNotFullTime = "";
      }

      if (name === "hasStaff" && value !== "Yes") {
        next.staffCount = "";
      }

      if (name === "hasWebsite" && value !== "Yes") {
        next.websiteUrl = "";
      }

      if (name === "country" && value !== "Nigeria") {
        next.state = "";
      }

      if (name === "isBusinessRegistered" && value !== "No") {
        next.needsRegistrationHelp = "";
      }

      if (name === "onSocialMedia" && value !== "Yes") {
        next.socialMediaProfiles = [];
      }

      if (name === "onSocialMedia" && value === "Yes" && next.socialMediaProfiles.length === 0) {
        next.socialMediaProfiles = [{ platform: "", url: "" }];
      }

      if (name === "wantsBusinessSupport" && value === "No") {
        next.supportAreaNeeded = "";
        next.preferredContactDay = "";
        next.preferredContactTime = "";
      }

      return next;
    });
  };

  const handleCityBlur = () => {
    setFormData((prev) => ({
      ...prev,
      cityOrArea: toTitleCase(prev.cityOrArea),
    }));
  };

  const handleSocialProfileChange = (
    index: number,
    field: "platform" | "url",
    value: string
  ) => {
    setFormData((prev) => {
      const nextProfiles = [...prev.socialMediaProfiles];
      nextProfiles[index] = {
        ...nextProfiles[index],
        [field]: value,
      };

      return {
        ...prev,
        socialMediaProfiles: nextProfiles,
      };
    });
  };

  const addSocialMediaProfile = () => {
    setFormData((prev) => ({
      ...prev,
      socialMediaProfiles: [...prev.socialMediaProfiles, { platform: "", url: "" }],
    }));
  };

  const openContactDayCalendar = () => {
    const input = contactDayInputRef.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setIsSubmitted(false);
    setSubmitStatus({ type: null, message: "" });

    if (formData.wantsBusinessSupport === "Yes" && !formData.preferredContactDay) {
      setSubmitStatus({
        type: "error",
        message: "Please select a preferred contact day from the calendar.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/business-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit business profile");
      }

      setSubmitStatus({
        type: "success",
        message: "Thank you. Your business profile has been saved and we will contact you soon.",
      });
      setIsSubmitted(true);
      setFormData(initialFormData);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An unexpected error occurred.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen font-sans bg-black">
      <Nav isSticky={false} />

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Business Profile Form
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto">
              Fill out this profile to help us understand your business and the kind of support you need.
            </p>
            <p className="text-gray-300 text-sm md:text-base max-w-3xl mx-auto mt-3">
              Fields marked with * are compulsory.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className={`bg-white rounded-lg shadow-xl p-6 md:p-8 space-y-8 ${isSubmitted ? "hidden" : ""}`}
            >
              <fieldset
                disabled={isSubmitting}
                className={isSubmitting ? "opacity-70 pointer-events-none" : ""}
              >
              <div className="border-b border-gray-200 pb-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Section A: Contact Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      maxLength={50}
                      pattern="[A-Za-z][A-Za-z' -]*"
                      title="First name should contain only letters, spaces, apostrophes, or hyphens."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                      minLength={2}
                      maxLength={50}
                      pattern="[A-Za-z][A-Za-z' -]*"
                      title="Last name should contain only letters, spaces, apostrophes, or hyphens."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      minLength={7}
                      maxLength={20}
                      pattern="^\\+?[0-9\\s()-]{7,20}$"
                      title="Enter a valid phone number (digits, spaces, +, parentheses, or hyphens)."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="emailAddress"
                      value={formData.emailAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Preferred Method of Contact *</label>
                  <select
                    name="preferredContactMethod"
                    value={formData.preferredContactMethod}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    <option value="Phone Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Section B: Location Information</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Which country is your business based in? *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    {countries.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">What state are you located in? *</label>
                    {formData.country === "Nigeria" ? (
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="">Select a state</option>
                        {nigerianStates.map((stateOption) => (
                          <option key={stateOption} value={stateOption}>
                            {stateOption}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        minLength={2}
                        maxLength={80}
                        pattern="[A-Za-z][A-Za-z' -]*"
                        title="State/region should contain only letters, spaces, apostrophes, or hyphens."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900"
                        placeholder="Enter state/region"
                      />
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">What city or area do you operate from? *</label>
                    <input
                      type="text"
                      name="cityOrArea"
                      value={formData.cityOrArea}
                      onChange={handleInputChange}
                      onBlur={handleCityBlur}
                      required
                      minLength={2}
                      maxLength={80}
                      pattern="[A-Za-z][A-Za-z' -]*"
                      title="City/area should contain only letters, spaces, apostrophes, or hyphens."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Do you currently operate from a physical location? *</label>
                  <select
                    name="hasPhysicalLocation"
                    value={formData.hasPhysicalLocation}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.hasPhysicalLocation === "Yes" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">If yes, what type of location do you operate from?</label>
                    <select
                      name="locationType"
                      value={formData.locationType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">Select an option</option>
                      <option value="Shop">Shop</option>
                      <option value="Office">Office</option>
                      <option value="Kiosk">Kiosk</option>
                      <option value="Market Stall">Market Stall</option>
                      <option value="Shared Space">Shared Space</option>
                      <option value="Home-Based">Home-Based</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200 pb-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Section C: Business Status</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Do you offer a product, a service, or both? *</label>
                  <select
                    name="businessOffering"
                    value={formData.businessOffering}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    <option value="Product">Product</option>
                    <option value="Service">Service</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tell us about your business *</label>
                  <textarea
                    name="businessDescription"
                    value={formData.businessDescription}
                    onChange={handleInputChange}
                    required
                    minLength={20}
                    maxLength={1000}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900 resize-y"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Is your business currently running? *</label>
                  <select
                    name="isBusinessRunning"
                    value={formData.isBusinessRunning}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">How long has the business been operating? *</label>
                  <select
                    name="businessDuration"
                    value={formData.businessDuration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    <option value="Not started yet">Not started yet</option>
                    <option value="Less than 6 months">Less than 6 months</option>
                    <option value="6 months to 1 year">6 months to 1 year</option>
                    <option value="1 to 3 years">1 to 3 years</option>
                    <option value="Over 3 years">Over 3 years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Is this your full-time business? *</label>
                  <select
                    name="isFullTimeBusiness"
                    value={formData.isFullTimeBusiness}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.isFullTimeBusiness === "No" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">If not, how would you describe it?</label>
                    <select
                      name="businessTypeIfNotFullTime"
                      value={formData.businessTypeIfNotFullTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">Select an option</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Side gig">Side gig</option>
                      <option value="Weekend business">Weekend business</option>
                      <option value="Still testing the idea">Still testing the idea</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200 pb-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Section D: Business Setup</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Is your business registered? *</label>
                  <select
                    name="isBusinessRegistered"
                    value={formData.isBusinessRegistered}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="In progress">In progress</option>
                    <option value="Not sure">Not sure</option>
                  </select>
                </div>

                {formData.isBusinessRegistered === "No" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Do you need help registering your business?</label>
                    <select
                      name="needsRegistrationHelp"
                      value={formData.needsRegistrationHelp}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">Select an option</option>
                      {yesNoOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Do you currently have staff or people helping you? *</label>
                  <select
                    name="hasStaff"
                    value={formData.hasStaff}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.hasStaff === "Yes" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">If yes, how many people are involved in the business?</label>
                    <select
                      name="staffCount"
                      value={formData.staffCount}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">Select an option</option>
                      <option value="1 person">1 person</option>
                      <option value="2 to 5 people">2 to 5 people</option>
                      <option value="6 to 10 people">6 to 10 people</option>
                      <option value="More than 10 people">More than 10 people</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="border-b border-gray-200 pb-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Section E: Sales and Operations</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Are you currently making sales? *</label>
                  <select
                    name="isMakingSales"
                    value={formData.isMakingSales}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="Not really">Not really</option>
                    <option value="Not enough">Not enough</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">What is your approximate annual revenue? (₦) *</label>
                  <select
                    name="annualRevenue"
                    value={formData.annualRevenue}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select a revenue range</option>
                    {annualRevenueRanges.map((range) => (
                      <option key={range} value={range}>
                        {range}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Where do you mainly sell your products or services? *</label>
                  <select
                    name="salesChannels"
                    value={formData.salesChannels}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    <option value="Physical Store">Physical Store</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Website">Website</option>
                    <option value="Online Marketplace">Online Marketplace</option>
                    <option value="Referrals">Referrals</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Are you on social media? *</label>
                  <select
                    name="onSocialMedia"
                    value={formData.onSocialMedia}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.onSocialMedia === "Yes" && (
                  <div className="space-y-4">
                    {formData.socialMediaProfiles.map((profile, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Social media platform</label>
                          <select
                            value={profile.platform}
                            onChange={(e) => handleSocialProfileChange(index, "platform", e.target.value)}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                          >
                            <option value="">Select platform</option>
                            {socialPlatformOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-900 mb-2">Profile URL</label>
                          <input
                            type="url"
                            value={profile.url}
                            onChange={(e) => handleSocialProfileChange(index, "url", e.target.value)}
                            required
                            placeholder="https://..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900"
                          />
                        </div>
                      </div>
                    ))}

                    <div>
                      <button
                        type="button"
                        onClick={addSocialMediaProfile}
                        className="px-4 py-2 border border-[#EF1111] text-[#EF1111] rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Add more
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Do you currently have a website? *</label>
                  <select
                    name="hasWebsite"
                    value={formData.hasWebsite}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.hasWebsite === "Yes" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">If yes, what is the URL?</label>
                    <input
                      type="url"
                      name="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={handleInputChange}
                      required
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Section F: Support Needed</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Do you want support with growing or improving the business? *</label>
                  <select
                    name="wantsBusinessSupport"
                    value={formData.wantsBusinessSupport}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                  >
                    <option value="">Select an option</option>
                    {yesNoOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  {formData.wantsBusinessSupport !== "No" && (
                    <>
                    <label className="block text-sm font-medium text-gray-900 mb-2">What area do you need support with first?</label>
                    <select
                      name="supportAreaNeeded"
                      value={formData.supportAreaNeeded}
                      onChange={handleInputChange}
                      required={formData.wantsBusinessSupport === "Yes"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="">Select an option</option>
                      <option value="Branding">Branding</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Website">Website</option>
                      <option value="Business Structure">Business Structure</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Accounting">Accounting</option>
                      <option value="Legal">Legal</option>
                      <option value="Recruitment">Recruitment</option>
                      <option value="Training">Training</option>
                      <option value="Operations">Operations</option>
                      <option value="Funding">Funding</option>
                      <option value="Not Sure Yet">Not Sure Yet</option>
                    </select>
                    </>
                  )}
                </div>

                {formData.wantsBusinessSupport !== "No" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Preferred contact day</label>
                      <input
                        ref={contactDayInputRef}
                        type="date"
                        name="preferredContactDay"
                        value={formData.preferredContactDay}
                        min={minContactDate}
                        onChange={handleInputChange}
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden="true"
                      />
                      <button
                        type="button"
                        onClick={openContactDayCalendar}
                        className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent"
                      >
                        {formatSelectedDate(formData.preferredContactDay)}
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Preferred contact time</label>
                      <select
                        name="preferredContactTime"
                        value={formData.preferredContactTime}
                        onChange={handleInputChange}
                        required={formData.wantsBusinessSupport === "Yes"}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent bg-white text-gray-900"
                      >
                        <option value="">Select a time slot</option>
                        {contactTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {submitStatus.type === "error" && (
                <div
                  className={`p-4 rounded-lg border ${
                    "bg-red-50 text-red-800 border-red-200"
                  }`}
                >
                  <p className="text-sm font-medium">{submitStatus.message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full mt-6 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#EF1111] text-white hover:bg-[#d10e0e]"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Submit Business Profile"}
              </button>
              </fieldset>
            </form>

            {isSubmitted && submitStatus.type === "success" && (
              <div className="bg-green-50 border border-green-200 rounded-lg  p-6 md:p-8 text-center">
                <h3 className="text-xl font-semibold text-green-900 mb-2">Submission Received</h3>
                <p className="text-green-800">{submitStatus.message}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}