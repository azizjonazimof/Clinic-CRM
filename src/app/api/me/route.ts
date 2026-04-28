import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export async function GET() {
  try {
    return ok(await getCurrentUser());
  } catch {
    return fail("UNAUTHORIZED", "Authentication is required.", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json().catch(() => ({}));
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: typeof body.firstName === "string" ? body.firstName : undefined,
        lastName: typeof body.lastName === "string" ? body.lastName : undefined,
        phone: typeof body.phone === "string" ? body.phone : undefined
      },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true }
    });
    return ok(updated);
  } catch {
    return fail("UNAUTHORIZED", "Authentication is required.", 401);
  }
}
