"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [usePassword, setUsePassword] = useState(true);
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    if (usePassword) {
      // Password signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            agency_name: agencyName || undefined,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setIsError(true);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Create agency + user row
        await fetch("/api/auth/ensure-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agency_name: agencyName || undefined,
          }),
        });

        // Redirect to onboarding for new users
        window.location.href = "/dashboard/onboarding";
        return;
      }

      setMessage("Check your email to verify your account.");
    } else {
      // Magic link signup
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/callback`,
          data: {
            full_name: fullName,
            agency_name: agencyName || undefined,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        setIsError(true);
      } else {
        setMessage("Check your email for the magic link!");
      }
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-sm space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Mention</span>Layer
          </h1>
          <p className="text-sm text-muted-foreground">
            Create your agency account
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="fullName"
              className="text-sm font-medium leading-none"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Joel House"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="agencyName"
              className="text-sm font-medium leading-none"
            >
              Agency Name
            </label>
            <input
              id="agencyName"
              type="text"
              placeholder="Your Agency"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              Optional — we&apos;ll create one from your name if left blank.
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium leading-none"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@agency.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {usePassword && (
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={usePassword}
                minLength={8}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading
              ? usePassword
                ? "Creating account..."
                : "Sending magic link..."
              : "Get Started — Free"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setUsePassword(!usePassword)}
          className="block w-full text-center text-sm text-muted-foreground hover:text-foreground"
        >
          {usePassword
            ? "Use magic link instead"
            : "Use password instead"}
        </button>

        {message && (
          <p
            className={`text-center text-sm ${
              isError ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {message}
          </p>
        )}

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>

        <p className="text-center text-xs text-muted-foreground">
          Start with 100 free credits. No credit card required.
        </p>
      </div>
    </div>
  );
}
