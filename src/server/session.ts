import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/server/security";
import type { SessionUser } from "@/types/domain";

export async function getCurrentUser(): Promise<SessionUser> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  const authorization = headerStore.get("authorization");
  const bearer = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
  const token = bearer ?? cookieStore.get("access_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  return verifyAccessToken(token);
}

export async function buildSessionUser(userId: string): Promise<SessionUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clinicAssignments: true,
      branchAssignments: true
    }
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("Unauthorized");
  }

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    clinicIds: user.clinicAssignments.map((assignment) => assignment.clinicId),
    branchIds: user.branchAssignments.map((assignment) => assignment.branchId)
  };
}

