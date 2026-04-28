import { ok } from "@/lib/api-response";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { tokenHash } from "@/server/security";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({ where: { tokenHash: tokenHash(refreshToken), revokedAt: null }, data: { revokedAt: new Date() } });
  }
  const response = ok({ loggedOut: true });
  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  return response;
}
