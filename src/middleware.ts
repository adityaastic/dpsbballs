import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    "dsp-admin-secret-key-change-in-production-please-2024"
);
const COOKIE_NAME = "dsp_admin_session";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/api"];

function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

type CachedRedirect = {
  sourcePath: string;
  destinationUrl: string;
  type: 301 | 302;
  active: boolean;
};

let cachedRedirects: CachedRedirect[] = [];
let lastRedirectsFetch = 0;

async function getActiveRedirects(origin: string): Promise<CachedRedirect[]> {
  const now = Date.now();
  if (now - lastRedirectsFetch < 15000 && cachedRedirects.length >= 0) {
    return cachedRedirects;
  }
  try {
    const res = await fetch(`${origin}/api/redirects`, {
      next: { revalidate: 15 },
    });
    if (res.ok) {
      const data = await res.json();
      cachedRedirects = Array.isArray(data.redirects) ? data.redirects : [];
      lastRedirectsFetch = now;
    }
  } catch {
    // Ignore network errors during build/edge
  }
  return cachedRedirects;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    if (
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/_next") &&
      !pathname.includes(".")
    ) {
      const redirects = await getActiveRedirects(request.nextUrl.origin);
      const match = redirects.find(
        (r) =>
          r.active &&
          (r.sourcePath === pathname ||
            r.sourcePath.replace(/\/$/, "") === pathname.replace(/\/$/, ""))
      );
      if (match && match.destinationUrl !== pathname) {
        const dest = match.destinationUrl.startsWith("http")
          ? match.destinationUrl
          : new URL(match.destinationUrl, request.url).toString();
        return NextResponse.redirect(dest, match.type === 302 ? 302 : 301);
      }
    }
    return NextResponse.next();
  }

  if (isPublicAdminPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

