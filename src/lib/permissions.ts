import type { Role } from "@/types/domain";

export const permissions = {
  platform: {
    read: "platform:read",
    manage: "platform:manage"
  },
  clinics: {
    read: "clinics:read",
    create: "clinics:create",
    update: "clinics:update",
    suspend: "clinics:suspend"
  },
  branches: {
    read: "branches:read",
    create: "branches:create",
    update: "branches:update"
  },
  users: {
    read: "users:read",
    create: "users:create",
    update: "users:update",
    assign: "users:assign"
  },
  patients: {
    read: "patients:read",
    create: "patients:create",
    update: "patients:update"
  },
  doctors: {
    read: "doctors:read",
    create: "doctors:create",
    update: "doctors:update",
    analytics: "doctors:analytics"
  },
  consultations: {
    read: "consultations:read",
    create: "consultations:create",
    update: "consultations:update"
  },
  warehouse: {
    read: "warehouse:read",
    manage: "warehouse:manage",
    adjustStock: "warehouse:adjust-stock"
  },
  payments: {
    read: "payments:read",
    create: "payments:create"
  },
  invoices: {
    read: "invoices:read",
    create: "invoices:create",
    issue: "invoices:issue"
  },
  analytics: {
    read: "analytics:read"
  }
} as const;

export type Permission = string;

export const rolePermissions: Record<Role, string[]> = {
  SUPER_ADMIN: [
    permissions.platform.read,
    permissions.platform.manage,
    permissions.clinics.read,
    permissions.clinics.create,
    permissions.clinics.update,
    permissions.clinics.suspend,
    permissions.branches.read,
    permissions.branches.create,
    permissions.branches.update,
    permissions.users.read,
    permissions.users.create,
    permissions.users.update,
    permissions.users.assign,
    permissions.analytics.read
  ],
  CLINIC_ADMIN: [
    permissions.branches.read,
    permissions.branches.update,
    permissions.users.read,
    permissions.patients.read,
    permissions.patients.create,
    permissions.patients.update,
    permissions.doctors.read,
    permissions.doctors.create,
    permissions.doctors.update,
    permissions.doctors.analytics,
    permissions.consultations.read,
    permissions.warehouse.read,
    permissions.warehouse.manage,
    permissions.warehouse.adjustStock,
    permissions.payments.read,
    permissions.payments.create,
    permissions.invoices.read,
    permissions.invoices.create,
    permissions.invoices.issue,
    permissions.analytics.read
  ],
  DOCTOR: [
    permissions.patients.read,
    permissions.consultations.read,
    permissions.consultations.create,
    permissions.warehouse.read,
    permissions.warehouse.adjustStock,
    permissions.analytics.read
  ]
};

export function hasPermission(role: Role, permission: string) {
  return rolePermissions[role].includes(permission);
}
