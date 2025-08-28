import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export default async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;
  console.log("Middleware - Pathname:", pathname, "User:", user);

  // If not logged in
  if (!user) {
    // Protect ALL private pages including onboarding
    if (
      pathname.startsWith("/feed") ||
      pathname.startsWith("/groups") ||
      pathname.startsWith("/inbox") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/onboarding")
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return res;
  }

  // Logged in: fetch profile row
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  const isOnboarded =
    profile &&
    profile.first_name &&
    profile.last_name &&
    profile.genotype &&
    profile.country &&
    profile.role;

  // 🚧 If logged in but not onboarded → force /onboarding
  if (
    (pathname.startsWith("/feed") ||
      pathname.startsWith("/groups") ||
      pathname.startsWith("/inbox") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/settings")) &&
    !isOnboarded
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  // 🚧 If onboarded → block access to /onboarding
  if (pathname.startsWith("/onboarding") && isOnboarded) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // 🚧 If logged in → block access to guest-only auth routes
  if (
    [
      "/login",
      "/signup",
      "/reset-password",
      "/verify-email",
      "/forgot-password",
    ].includes(pathname)
  ) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // 🚧 Homepage redirect
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/reset-password",
    "/verify-email",
    "/forgot-password",
    "/onboarding",
    "/feed/:path*",
    "/groups/:path*",
    "/inbox/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
