import type { SessionUser } from "@/types/domain";

export function canAccessClinic(user: SessionUser, clinicId?: string) {
  return user.role === "SUPER_ADMIN" || !clinicId || user.clinicIds.includes(clinicId);
}

export function canAccessBranch(user: SessionUser, branchId?: string) {
  return user.role === "SUPER_ADMIN" || !branchId || user.branchIds.includes(branchId);
}

export function assertScope(user: SessionUser, scope: { clinicId?: string; branchId?: string }) {
  if (!canAccessClinic(user, scope.clinicId) || !canAccessBranch(user, scope.branchId)) {
    throw new Error("Scope denied");
  }
}

