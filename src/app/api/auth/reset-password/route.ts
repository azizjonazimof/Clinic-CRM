import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { parseJson, resetPasswordSchema } from "@/lib/validation";
import { hashPassword, tokenHash } from "@/server/security";

export async function POST(request: Request) {
  const parsed = await parseJson(request, resetPasswordSchema);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid reset password payload", 422, parsed.error.issues);
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: tokenHash(parsed.data.token) }
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return fail("INVALID_TOKEN", "Reset token is invalid or expired.", 400);
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: await hashPassword(parsed.data.password) } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({ where: { userId: resetToken.userId, revokedAt: null }, data: { revokedAt: new Date() } })
  ]);

  return ok({ reset: true });
}
