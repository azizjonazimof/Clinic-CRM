import { cookies } from "next/headers";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { buildSessionUser } from "@/server/session";
import { randomToken, signAccessToken, tokenHash } from "@/server/security";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (!refreshToken) return fail("UNAUTHORIZED", "Refresh token is required.", 401);

  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: tokenHash(refreshToken) } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    return fail("UNAUTHORIZED", "Refresh token is invalid.", 401);
  }

  const sessionUser = await buildSessionUser(stored.userId);
  const accessToken = await signAccessToken(sessionUser);
  const nextRefreshToken = randomToken();

  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
    prisma.refreshToken.create({
      data: {
        userId: stored.userId,
        tokenHash: tokenHash(nextRefreshToken),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
      }
    })
  ]);

  const response = ok({ accessToken, refreshToken: nextRefreshToken });
  response.cookies.set("access_token", accessToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 15 });
  response.cookies.set("refresh_token", nextRefreshToken, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return response;
}
