import type { Role, SessionUser } from "@/types/domain";
import { hasPermission } from "@/lib/permissions";

export const demoSessions: Record<Role, SessionUser> = {
  SUPER_ADMIN: {
    id: "super-admin-1",
    email: "super@medcrm.local",
    firstName: "Super",
    lastName: "Admin",
    role: "SUPER_ADMIN",
    clinicIds: [],
    branchIds: []
  },
  CLINIC_ADMIN: {
    id: "clinic-admin-1",
    email: "admin@medcrm.local",
    firstName: "Clinic",
    lastName: "Admin",
    role: "CLINIC_ADMIN",
    clinicIds: ["clinic-1"],
    branchIds: ["branch-1", "branch-2"]
  },
  DOCTOR: {
    id: "doctor-1",
    email: "doctor@medcrm.local",
    firstName: "Doctor",
    lastName: "User",
    role: "DOCTOR",
    clinicIds: ["clinic-1"],
    branchIds: ["branch-1"]
  }
};

export function getDemoSession(role: Role = "CLINIC_ADMIN") {
  return demoSessions[role];
}

export function assertPermission(role: Role, permission: string) {
  if (!hasPermission(role, permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }
}

