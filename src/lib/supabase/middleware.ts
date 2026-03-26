import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Skip auth check if Supabase env vars are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes that require authentication
  const isFreeAuditProtected =
    pathname.startsWith("/free-audit/setup") ||
    pathname.startsWith("/free-audit/progress") ||
    pathname.startsWith("/free-audit/results");

  // Protect dashboard routes
  if (!user && pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect free-audit post-auth routes
  if (!user && isFreeAuditProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/free-audit";
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (
    user &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Role-based routing: prospects can't access the full dashboard
  if (user && pathname.startsWith("/dashboard")) {
    try {
      // Use service role to check user role (avoids RLS issues in middleware)
      const adminUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const adminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (adminUrl && adminKey) {
        const adminClient = createClient(adminUrl, adminKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { data: dbUser } = await adminClient
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (dbUser?.role === "prospect") {
          // Find their latest audit or redirect to setup
          const { data: clients } = await adminClient
            .from("clients")
            .select("id")
            .eq("created_by_signup", true)
            .limit(1);

          if (clients && clients.length > 0) {
            const { data: audits } = await adminClient
              .from("audits")
              .select("id, status")
              .eq("client_id", clients[0].id)
              .order("created_at", { ascending: false })
              .limit(1);

            if (audits && audits.length > 0) {
              const url = request.nextUrl.clone();
              if (audits[0].status === "completed") {
                url.pathname = `/free-audit/results/${audits[0].id}`;
              } else {
                url.pathname = `/free-audit/progress`;
                url.searchParams.set("audit_id", audits[0].id);
              }
              return NextResponse.redirect(url);
            }
          }

          // No audit yet — send to setup
          const url = request.nextUrl.clone();
          url.pathname = "/free-audit/setup";
          return NextResponse.redirect(url);
        }
      }
    } catch {
      // If role check fails, allow through (fail open for dashboard users)
    }
  }

  return supabaseResponse;
}
