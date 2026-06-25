import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL = "http://localhost:8000";
const LOGIN_PATH = "/login";
const HOME_PATH = "/analytics";

const publicPaths = [LOGIN_PATH, "/signup", "/auth/callback"];
const protectedPrefixes = [
  "/analytics", "/inbox", "/orders", "/products",
  "/customers", "/connectors", "/settings", "/templates",
];

export default function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("refreshToken")?.value;

  // Proxy API requests to the backend
  if (pathname.startsWith("/api/")) {
    const url = new URL(pathname, BACKEND_URL);
    url.search = req.nextUrl.search;
    return NextResponse.rewrite(url);
  }

  // Redirect unauthenticated users away from protected pages
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    const loginUrl = new URL(LOGIN_PATH, req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from public-only pages
  const isPublicPage = pathname === LOGIN_PATH || pathname === "/signup";
  if (isPublicPage && token) {
    return NextResponse.redirect(new URL(HOME_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
