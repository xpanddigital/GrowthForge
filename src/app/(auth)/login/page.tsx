"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const isPostCheckout = searchParams.get("checkout") === "success";
  const sessionId = searchParams.get("session_id");

  useEffect(() => { document.title = "Sign In — MentionLayer"; }, []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(isPostCheckout ? "" : "");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const supabase = createClient();
  const router = useRouter();

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
    } else {
      // Ensure user row exists in public.users (same as callback route)
      try {
        await fetch("/api/auth/ensure-user", { method: "POST" });
      } catch {
        // Non-blocking — proceed to dashboard even if this fails
      }

      // If coming back from Stripe checkout, verify and go to onboarding
      if (isPostCheckout && sessionId) {
        try {
          await fetch("/api/billing/verify-checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: sessionId }),
          });
        } catch {
          // Non-blocking
        }
        router.push("/dashboard/onboarding?checkout=success");
      } else {
        router.push("/dashboard");
      }
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the magic link!");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto w-full max-w-sm space-y-6 p-6">
        {isPostCheckout && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-center">
            <p className="text-sm font-medium text-emerald-500">
              🎉 Payment successful! Your 14-day trial is active.
            </p>
            <p className="mt-1 text-xs text-emerald-500/70">
              Sign in to get started with your account.
            </p>
          </div>
        )}

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-primary">Mention</span>Layer
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        <form
          onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}
          className="space-y-4"
        >
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

          {mode === "password" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium leading-none"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      setMessage("Enter your email first, then click reset.");
                      return;
                    }
                    setLoading(true);
                    setMessage("");
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/callback?type=recovery`,
                    });
                    if (error) {
                      setMessage(error.message);
                    } else {
                      setMessage("Check your email for the password reset link!");
                    }
                    setLoading(false);
                  }}
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              ? "Signing in..."
              : mode === "password"
                ? "Sign In"
                : "Send Magic Link"}
          </button>
        </form>

        {message && (
          <p
            className={`text-center text-sm ${
              message.includes("Check your email")
                ? "text-emerald-500"
                : "text-destructive"
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={() => setMode(mode === "password" ? "magic" : "password")}
          className="block w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          {mode === "password"
            ? "Use magic link instead"
            : "Use password instead"}
        </button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-sm text-muted-foreground">Loading...</div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
