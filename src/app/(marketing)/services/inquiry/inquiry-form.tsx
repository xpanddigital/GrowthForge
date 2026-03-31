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

    // Send via mailto as a fallback — in production this would hit an API
    const subject = encodeURIComponent(
      `Done-for-You Inquiry: ${formData.service || "General"}`
    );
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\nWebsite: ${formData.website}\n\nService: ${formData.service}\nBudget: ${formData.budget}\nTimeline: ${formData.timeline}\n\nDetails:\n${formData.details}`
    );
    window.location.href = `mailto:joel@xpanddigital.io?subject=${subject}&body=${body}`;

    // Show success state after a brief delay
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <span className="text-2xl">&#x2713;</span>
        </div>
        <h1 className="mt-6 text-3xl font-bold">Thanks! We&apos;ll be in touch.</h1>
        <p className="mt-3 text-muted-foreground">
          Your inquiry has been sent. We typically respond within 24 hours with
          a tailored proposal.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/services"
            className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Back to Services
          </Link>
          <Link
            href="/free-audit"
            className="rounded-md bg-[#6C5CE7] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A4BD1]"
          >
            Run a Free Audit
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Done-for-You
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Tell Us About Your Business
        </h1>
        <p className="mt-3 text-muted-foreground">
          Fill out the quick form below and we&apos;ll get back to you within 24
          hours with a tailored proposal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 space-y-6">
        {/* Contact info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Your name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => update("email", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="jane@company.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-foreground">
              Company name *
            </label>
            <input
              type="text"
              required
              value={formData.company}
              onChange={(e) => update("company", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Acme Inc"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => update("website", e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="https://acme.com"
            />
          </div>
        </div>

        {/* Service selection */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Which service are you interested in? *
          </label>
          <div className="mt-2 space-y-2">
            {serviceOptions.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                  formData.service === option
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={option}
                  required
                  checked={formData.service === option}
                  onChange={(e) => update("service", e.target.value)}
                  className="sr-only"
                />
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    formData.service === option
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40"
                  }`}
                >
                  {formData.service === option && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </span>
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Approximate budget *
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {budgetOptions.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-center text-xs font-medium transition-colors ${
                  formData.budget === option
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="budget"
                  value={option}
                  required
                  checked={formData.budget === option}
                  onChange={(e) => update("budget", e.target.value)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            When are you looking to start? *
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {timelineOptions.map((option) => (
              <label
                key={option}
                className={`flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2.5 text-center text-xs font-medium transition-colors ${
                  formData.timeline === option
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <input
                  type="radio"
                  name="timeline"
                  value={option}
                  required
                  checked={formData.timeline === option}
                  onChange={(e) => update("timeline", e.target.value)}
                  className="sr-only"
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* Details */}
        <div>
          <label className="block text-sm font-medium text-foreground">
            Anything else we should know?
          </label>
          <textarea
            rows={4}
            value={formData.details}
            onChange={(e) => update("details", e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Tell us about your business, your goals, competitors you want to outrank in AI results, etc."
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-[#6C5CE7] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#5A4BD1] disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Submit Inquiry"}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll respond within 24 hours. No spam, no pressure.
        </p>
      </form>
    </div>
  );
}
