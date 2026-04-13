"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export function AuditForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const finalUrl =
      websiteUrl.startsWith("http") ? websiteUrl : `https://${websiteUrl}`;

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
        data: {
          full_name: fullName,
          company_name: companyName,
          website_url: finalUrl,
          signup_source: "free_audit",
        },
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="rounded-2xl p-8 sm:p-10 text-center" style={{ background: "var(--surface-raised)", boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 8px 32px -4px rgba(0,0,0,0.06)" }}>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "var(--accent-subtle)" }}>
          <svg className="h-8 w-8" fill="none" stroke="var(--accent)" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="mt-5 text-[22px] font-semibold" style={{ color: "var(--ink)", fontFamily: "'Outfit', system-ui, sans-serif" }}>Check your email</h3>
        <p className="mt-2 text-[15px]" style={{ color: "var(--ink-secondary)" }}>
          We sent a magic link to <strong style={{ color: "var(--ink)" }}>{email}</strong>.<br />
          Click the link to start your free audit.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="fullName" className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Jane Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="flex h-11 w-full rounded-lg px-3.5 text-[14px] outline-none transition-all"
            style={{
              background: "var(--surface)",
              border: "1.5px solid rgba(26,26,46,0.1)",
              color: "var(--ink)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(26,26,46,0.1)")}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
            Work Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex h-11 w-full rounded-lg px-3.5 text-[14px] outline-none transition-all"
            style={{
              background: "var(--surface)",
              border: "1.5px solid rgba(26,26,46,0.1)",
              color: "var(--ink)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(26,26,46,0.1)")}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="companyName" className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            placeholder="Acme Corp"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="flex h-11 w-full rounded-lg px-3.5 text-[14px] outline-none transition-all"
            style={{
              background: "var(--surface)",
              border: "1.5px solid rgba(26,26,46,0.1)",
              color: "var(--ink)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(26,26,46,0.1)")}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="websiteUrl" className="text-[13px] font-medium" style={{ color: "var(--ink)" }}>
            Website URL
          </label>
          <input
            id="websiteUrl"
            type="text"
            placeholder="company.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            required
            className="flex h-11 w-full rounded-lg px-3.5 text-[14px] outline-none transition-all"
            style={{
              background: "var(--surface)",
              border: "1.5px solid rgba(26,26,46,0.1)",
              color: "var(--ink)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
            onBlur={(e) => (e.target.style.borderColor = "rgba(26,26,46,0.1)")}
          />
        </div>
      </div>

      {error && (
        <p className="text-[13px]" style={{ color: "#dc2626" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-lg text-[15px] font-semibold text-white transition-all hover:-translate-y-px disabled:opacity-50"
        style={{ background: "var(--accent)", boxShadow: "0 2px 8px rgba(61,43,224,0.25)" }}
      >
        {loading ? "Sending magic link..." : "Start Free Audit"}
      </button>

      <div className="flex items-center justify-center gap-6 pt-1">
        {["No credit card", "Results in 5 min", "Cancel anytime"].map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--ink-tertiary)" }}>
            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="#059669" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
            {t}
          </span>
        ))}
      </div>

      <p className="text-center text-[13px]" style={{ color: "var(--ink-tertiary)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-medium" style={{ color: "var(--accent)" }}>
          Sign in
        </Link>
      </p>
    </form>
  );
}
