"use client";

import Link from "next/link";
import { useState } from "react";

const serviceOptions = [
  "Full-Service AI Visibility",
  "Citation Seeding Sprint",
  "AI Visibility Audit + Strategy",
  "Not sure yet — help me decide",
];

const budgetOptions = [
  "Under $1,000/month",
  "$1,000–$3,000/month",
  "$3,000–$5,000/month",
  "$5,000+/month",
  "One-time project",
];

const timelineOptions = [
  "ASAP — ready to start now",
  "Within the next 2 weeks",
  "Within the next month",
  "Just exploring options",
];

const inputClass =
  "mt-1.5 w-full rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:ring-2 transition-shadow";

export default function InquiryForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    website: "",
    service: "",
    budget: "",
    timeline: "",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    const subject = encodeURIComponent(
      `Done-for-You Inquiry: ${formData.service || "General"}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\nWebsite: ${formData.website}\n\nService: ${formData.service}\nBudget: ${formData.budget}\nTimeline: ${formData.timeline}\n\nDetails:\n${formData.details}`
    );
    window.location.href = `mailto:joel@xpanddigital.io?subject=${subject}&body=${body}`;

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "#ecfdf5" }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h1 className="mt-6 text-[32px]" style={{ color: "var(--ink)" }}>Thanks! We&apos;ll be in touch.</h1>
        <p className="mt-3 text-[16px]" style={{ color: "var(--ink-secondary)" }}>
          Your inquiry has been sent. We typically respond within 24 hours with
          a tailored proposal.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link href="/services" className="h-11 px-6 rounded-lg text-[14px] font-semibold inline-flex items-center border-[1.5px]" style={{ color: "var(--ink)", borderColor: "rgba(26,26,46,0.15)" }}>
            Back to Services
          </Link>
          <Link href="/free-audit" className="h-11 px-6 rounded-lg text-[14px] font-semibold text-white inline-flex items-center" style={{ background: "var(--accent)" }}>
            Run a Free Audit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <div className="text-center">
        <p className="text-[13px] font-semibold tracking-wide uppercase" style={{ color: "var(--warm)", letterSpacing: "0.08em" }}>
          Done-for-You
        </p>
        <h1 className="mt-4 text-[36px] sm:text-[44px] leading-[1.08] tracking-tight" style={{ color: "var(--ink)" }}>
          Tell us about your business
        </h1>
        <p className="mt-3 text-[16px]" style={{ color: "var(--ink-secondary)" }}>
          Fill out the quick form below and we&apos;ll get back to you within 24
          hours with a tailored proposal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {/* Contact info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[14px] font-medium" style={{ color: "var(--ink)" }}>Your name *</label>
            <input type="text" required value={formData.name} onChange={(e) => update("name", e.target.value)}
              className={inputClass} placeholder="Jane Smith"
              style={{ border: "1px solid rgba(26,26,46,0.12)", color: "var(--ink)", background: "white" }} />
          </div>
          <div>
            <label className="block text-[14px] font-medium" style={{ color: "var(--ink)" }}>Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => update("email", e.target.value)}
              className={inputClass} placeholder="jane@company.com"
              style={{ border: "1px solid rgba(26,26,46,0.12)", color: "var(--ink)", background: "white" }} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-[14px] font-medium" style={{ color: "var(--ink)" }}>Company name *</label>
            <input type="text" required value={formData.company} onChange={(e) => update("company", e.target.value)}
              className={inputClass} placeholder="Acme Inc"
              style={{ border: "1px solid rgba(26,26,46,0.12)", color: "var(--ink)", background: "white" }} />
          </div>
          <div>
            <label className="block text-[14px] font-medium" style={{ color: "var(--ink)" }}>Website</label>
            <input type="url" value={formData.website} onChange={(e) => update("website", e.target.value)}
              className={inputClass} placeholder="https://acme.com"
              style={{ border: "1px solid rgba(26,26,46,0.12)", color: "var(--ink)", background: "white" }} />
          </div>
        </div>

        {/* Service selection */}
        <div>
          <label className="block text-[14px] font-medium mb-2" style={{ color: "var(--ink)" }}>
            Which service are you interested in? *
          </label>
          <div className="space-y-2">
            {serviceOptions.map((option) => (
              <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3.5 text-[14px] transition-all"
                style={{
                  border: formData.service === option ? "1.5px solid var(--accent)" : "1px solid rgba(26,26,46,0.1)",
                  background: formData.service === option ? "rgba(61,43,224,0.04)" : "white",
                  color: formData.service === option ? "var(--ink)" : "var(--ink-secondary)",
                }}>
                <input type="radio" name="service" value={option} required checked={formData.service === option} onChange={(e) => update("service", e.target.value)} className="sr-only" />
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full" style={{ border: formData.service === option ? "5px solid var(--accent)" : "2px solid rgba(26,26,46,0.2)" }} />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-[14px] font-medium mb-2" style={{ color: "var(--ink)" }}>Approximate budget *</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {budgetOptions.map((option) => (
              <label key={option} className="flex cursor-pointer items-center justify-center rounded-lg px-3 py-2.5 text-center text-[13px] font-medium transition-all"
                style={{
                  border: formData.budget === option ? "1.5px solid var(--accent)" : "1px solid rgba(26,26,46,0.1)",
                  background: formData.budget === option ? "rgba(61,43,224,0.04)" : "white",
                  color: formData.budget === option ? "var(--ink)" : "var(--ink-secondary)",
                }}>
                <input type="radio" name="budget" value={option} required checked={formData.budget === option} onChange={(e) => update("budget", e.target.value)} className="sr-only" />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-[14px] font-medium mb-2" style={{ color: "var(--ink)" }}>When are you looking to start? *</label>
          <div className="grid grid-cols-2 gap-2">
            {timelineOptions.map((option) => (
              <label key={option} className="flex cursor-pointer items-center justify-center rounded-lg px-3 py-2.5 text-center text-[13px] font-medium transition-all"
                style={{
                  border: formData.timeline === option ? "1.5px solid var(--accent)" : "1px solid rgba(26,26,46,0.1)",
                  background: formData.timeline === option ? "rgba(61,43,224,0.04)" : "white",
                  color: formData.timeline === option ? "var(--ink)" : "var(--ink-secondary)",
                }}>
                <input type="radio" name="timeline" value={option} required checked={formData.timeline === option} onChange={(e) => update("timeline", e.target.value)} className="sr-only" />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <label className="block text-[14px] font-medium" style={{ color: "var(--ink)" }}>Anything else we should know?</label>
          <textarea rows={4} value={formData.details} onChange={(e) => update("details", e.target.value)}
            className={`${inputClass} resize-none`}
            placeholder="Tell us about your business, your goals, competitors you want to outrank in AI results, etc."
            style={{ border: "1px solid rgba(26,26,46,0.12)", color: "var(--ink)", background: "white" }} />
        </div>

        <button type="submit" disabled={submitting}
          className="w-full h-12 rounded-lg text-[15px] font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}>
          {submitting ? "Sending..." : "Submit Inquiry"}
        </button>

        <p className="text-center text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
          We&apos;ll respond within 24 hours. No spam, no pressure.
        </p>
      </form>
    </div>
  );
}
