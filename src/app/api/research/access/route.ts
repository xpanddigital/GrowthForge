import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Captures emails from the /research/explore unlock gate.
//
// V1 storage: append a JSON line to `logs/research-access.jsonl` so the file is
// trivially greppable / importable into anything later.
//
// V2 (when ready): swap the writeAppend below for a Supabase insert into a
// `research_access` table. Same payload shape.

interface AccessPayload {
  email: string;
  referrer?: string;
  surface?: string;
}

const LOG_DIR = path.join(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "research-access.jsonl");

// Crude in-memory rate limit per IP — replace with proper rate-limit lib in prod.
const recentByIP = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 5;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // Rate limit
  const now = Date.now();
  const last = recentByIP.get(ip) ?? 0;
  if (now - last < RATE_LIMIT_WINDOW_MS / RATE_LIMIT_MAX_REQUESTS) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  recentByIP.set(ip, now);
  // Cleanup stale entries periodically
  if (recentByIP.size > 1000) {
    recentByIP.forEach((v, k) => {
      if (now - v > RATE_LIMIT_WINDOW_MS) recentByIP.delete(k);
    });
  }

  let body: AccessPayload;
  try {
    body = (await req.json()) as AccessPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.email || !body.email.includes("@") || body.email.length > 320) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const record = {
    ts: new Date().toISOString(),
    email: body.email.trim().toLowerCase(),
    referrer: (body.referrer ?? "").slice(0, 500),
    surface: (body.surface ?? "explorer").slice(0, 50),
    ip,
    userAgent: (req.headers.get("user-agent") ?? "").slice(0, 500),
  };

  try {
    await fs.mkdir(LOG_DIR, { recursive: true });
    await fs.appendFile(LOG_FILE, JSON.stringify(record) + "\n", "utf-8");
  } catch (err) {
    // Don't fail the request if logging fails — the gate should still unlock.
    console.error("[research-access] log write failed:", err);
  }

  return NextResponse.json({ ok: true });
}
