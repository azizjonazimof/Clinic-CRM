import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { loginSchema, parseJson } from "@/lib/validation";
import { buildSessionUser } from "@/server/session";
import { randomToken, signAccessToken, tokenHash, verifyPassword } from "@/server/security";

export async function POST(request: Request) {
  const parsed = await parseJson(request, loginSchema);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid login payload", 422, parsed.error.issues);
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (!user || user.status !== "ACTIVE" || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return fail("INVALID_CREDENTIALS", "Email or password is incorrect.", 401);
  }

  const sessionUser = await buildSessionUser(user.id);
  const accessToken = await signAccessToken(sessionUser);
  const refreshToken = randomToken();

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: tokenHash(refreshToken),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    }
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const response = ok({
    user: sessionUser,
    accessToken,
    refreshToken,
    redirectTo:
      sessionUser.role === "SUPER_ADMIN"
        ? "/super-admin/dashboard"
        : sessionUser.role === "DOCTOR"
          ? "/doctor/dashboard"
          : "/clinic-admin/dashboard"
  });

  response.cookies.set("access_token", accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 15 });
  response.cookies.set("refresh_token", refreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
