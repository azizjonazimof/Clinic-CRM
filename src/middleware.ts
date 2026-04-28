import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const rolePrefixes = {
  "/super-admin": "SUPER_ADMIN",
  "/clinic-admin": "CLINIC_ADMIN",
  "/doctor": "DOCTOR"
} as const;

const roleDashboards = {
  SUPER_ADMIN: "/super-admin/dashboard",
  CLINIC_ADMIN: "/clinic-admin/dashboard",
  DOCTOR: "/doctor/dashboard"
} as const;

function key() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) return null;
  return new TextEncoder().encode(secret);
}

async function tokenRole(token: string) {
  const secret = key();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload.role as keyof typeof roleDashboards;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("access_token")?.value;

  if (pathname === "/login" && accessToken) {
    const role = await tokenRole(accessToken);
    if (role && roleDashboards[role]) {
      return NextResponse.redirect(new URL(roleDashboards[role], request.url));
    }
  }

  for (const [prefix, role] of Object.entries(rolePrefixes)) {
    if (pathname.startsWith(prefix)) {
      const currentRole = accessToken ? await tokenRole(accessToken) : null;
      if (!currentRole) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }
      if (currentRole !== role && currentRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL(roleDashboards[currentRole], request.url));
      }
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
