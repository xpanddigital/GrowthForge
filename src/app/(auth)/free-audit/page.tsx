"use client";

import Link from "next/link";
import { FreeAuditSignupForm } from "@/components/free-audit/signup-form";

export default function FreeAuditPage() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left: Value prop */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 bg-gradient-to-br from-primary/5 via-background to-background">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            <span className="text-primary">Mention</span>Layer
          </h1>
          <h2 className="text-2xl font-semibold mb-6">
            Get Your AI Visibility Score
          </h2>
          <p className="text-muted-foreground mb-8">
            Discover how visible your brand is to ChatGPT, Perplexity, Gemini, and other AI models.
            Get a scored baseline across 5 pillars with a competitor comparison and prioritized action plan.
          </p>
          <div className="space-y-4">
            {[
              { icon: "1", text: "Sign up and tell us about your business" },
              { icon: "2", text: "Add your target keywords" },
              { icon: "3", text: "Get your AI Visibility Score in minutes" },
            ].map((step) => (
              <div key={step.icon} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {step.icon}
                </div>
                <span className="text-sm text-muted-foreground mt-0.5">{step.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Trusted by agencies managing AI visibility for 100+ brands
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center lg:hidden">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-primary">Mention</span>Layer
            </h1>
            <p className="text-sm text-muted-foreground">
              Free AI Visibility Audit
            </p>
          </div>

          <div className="hidden lg:block space-y-2">
            <h3 className="text-xl font-semibold">Start Your Free Audit</h3>
            <p className="text-sm text-muted-foreground">
              Enter your details to get started. No credit card required.
            </p>
          </div>

          <FreeAuditSignupForm />

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
