import { NextRequest, NextResponse } from "next/server";

const rolePrefixes = {
  "/super-admin": "SUPER_ADMIN",
  "/clinic-admin": "CLINIC_ADMIN",
  "/doctor": "DOCTOR"
} as const;

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  for (const [prefix, role] of Object.entries(rolePrefixes)) {
    if (pathname.startsWith(prefix)) {
      const response = NextResponse.next();
      response.headers.set("x-required-role", role);
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/super-admin/:path*", "/clinic-admin/:path*", "/doctor/:path*", "/login", "/forgot-password", "/reset-password"]
};
