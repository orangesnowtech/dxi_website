"use client";

import { useState } from "react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { countryCodes } from "./countryCodes";

const services = [
  "Web Development",
  "Mobile App Development",
  "Brand Identity Design",
  "Digital Marketing",
  "Content Creation",
  "Social Media Management",
  "SEO Services",
  "E-commerce Solutions",
  "UI/UX Design",
  "Consulting",
];

export default function ContactUs() {
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    company: "",
    service: "web development",
    countryCode: "+234", // Default to Nigeria
    phone: "",
    projectBrief: null as File | null,
    projectDetails: "",
  });

  const [fileName, setFileName] = useState("No file chosen");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, projectBrief: file }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("fullname", formData.fullname);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("company", formData.company || "");
      formDataToSend.append("service", formData.service);
      formDataToSend.append("countryCode", formData.countryCode);
      formDataToSend.append("phone", formData.phone);
      formDataToSend.append("projectDetails", formData.projectDetails || "");
      
      if (formData.projectBrief) {
        formDataToSend.append("projectBrief", formData.projectBrief);
      }

      // Submit to API route
      const response = await fetch("/api/contact", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit form");
      }

      // Success
      setSubmitStatus({
        type: "success",
        message: "Thank you! Your message has been sent successfully. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        fullname: "",
        email: "",
        company: "",
        service: "web development",
        countryCode: "+234",
        phone: "",
        projectBrief: null,
        projectDetails: "",
      });
      setFileName("No file chosen");

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus({ type: null, message: "" });
      }, 5000);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen font-sans bg-black">
      <Nav isSticky={false} />

      {/* Contact Form Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Contact Form
            </h1>
            <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
              Tell us a bit about your project or inquiry — our team will get back to you shortly.
            </p>
          </div>

          {/* Form Container */}
          <div className="max-w-4xl mx-auto">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-xl p-6 md:p-8 space-y-6"
            >
              {/* Fullname */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Fullname{" "}
                  <span className="text-[#EF1111]">(required)</span>
                </label>
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Email Address{" "}
                  <span className="text-[#EF1111]">(required)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Company / Brand Name and Service of Interest - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Company / Brand Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Company / Brand Name{" "}
                    <span className="text-gray-500 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Service of Interest */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Service of Interest{" "}
                    <span className="text-[#EF1111]">(required)</span>
                  </label>
                  <div className="relative">
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent appearance-none bg-white text-gray-900"
                    >
                      {services.map((service) => (
                        <option key={service} value={service.toLowerCase()} className="text-gray-900">
                          {service}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Phone Number{" "}
                  <span className="text-[#EF1111]">(required)</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-shrink-0">
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent appearance-none bg-white pr-8 text-gray-900 min-w-[100px]"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.dialCode} className="text-gray-900">
                          {country.dialCode}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* Upload a Project Brief */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload a Project Brief{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700">
                    Choose File
                    <input
                      type="file"
                      name="projectBrief"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt"
                    />
                  </label>
                  <span className="text-sm text-gray-500">{fileName}</span>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Details{" "}
                  <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  name="projectDetails"
                  value={formData.projectDetails}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EF1111] focus:border-transparent resize-none text-gray-900 placeholder-gray-500"
                  placeholder="Tell us about your project..."
                />
              </div>

              {/* Status Message */}
              {submitStatus.type && (
                <div
                  className={`p-4 rounded-lg ${
                    submitStatus.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  <p className="text-sm font-medium">{submitStatus.message}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#EF1111] text-white hover:bg-[#d10e0e]"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
