import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOGIN_PATH = "/login";
const HOME_PATH = "/analytics";

const publicPaths = [LOGIN_PATH, "/signup", "/auth/callback"];
const protectedPrefixes = ["/analytics", "/inbox", "/orders", "/products", "/customers", "/connectors", "/settings", "/templates", "/agent-test"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("refreshToken")?.value;

  const isPublic = publicPaths.some((p) => pathname === p || pathname.startsWith(p));
  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));

  if (!isPublic && isProtected && !token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isPublic && token && (pathname === LOGIN_PATH || pathname === "/signup")) {
    return NextResponse.redirect(new URL(HOME_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
