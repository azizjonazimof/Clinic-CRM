import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema, parseJson } from "@/lib/validation";
import { randomToken, tokenHash } from "@/server/security";

export async function POST(request: Request) {
  const parsed = await parseJson(request, forgotPasswordSchema);

  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid forgot password payload", 422, parsed.error.issues);
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  if (user) {
    const token = randomToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: tokenHash(token),
        expiresAt: new Date(Date.now() + 1000 * 60 * 30)
      }
    });

    if (process.env.NODE_ENV !== "production") {
      return ok({ sent: true, resetToken: token });
    }
  }

  return ok({ sent: true });
}
