import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// GET /api/health — Basic health check for uptime monitoring
export async function GET() {
  const checks: Record<string, "ok" | "error"> = {
    app: "ok",
    database: "error",
  };

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && key) {
      const supabase = createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await supabase
        .from("agencies")
        .select("id")
        .limit(1);
      checks.database = error ? "error" : "ok";
    }
  } catch {
    checks.database = "error";
  }

  const allHealthy = Object.values(checks).every((v) => v === "ok");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
