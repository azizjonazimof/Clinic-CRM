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
      organizationUsers: {
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true
                }
              }
            }
          }
        }
      },
      clinicAssignments: true,
      branchAssignments: true
    }
  });

  if (!user || user.status !== "ACTIVE") {
    throw new Error("Unauthorized");
  }

  // Determine the primary role for the session (simplified: take the first one or use legacy if none)
  const primaryOrgUser = user.organizationUsers[0];
  const roleCode = (primaryOrgUser?.role.code || user.role || "USER") as any;
  const permissions = primaryOrgUser?.role.permissions.map(rp => rp.permission.code) || [];

  // Aggregate clinic and branch IDs from all assignment types
  const clinicIds = Array.from(new Set([
    ...user.organizationUsers.map(ou => ou.organizationId),
    ...user.clinicAssignments.map(ca => ca.clinicId)
  ]));

  const branchIds = user.branchAssignments.map(ba => ba.branchId);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: roleCode,
    permissions: permissions,
    clinicIds,
    branchIds
  };
}
