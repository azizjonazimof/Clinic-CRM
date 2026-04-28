# Product Modeling Guidance

## Role Hierarchy

Use a strict hierarchy:

1. Super Admin
2. Clinic Admin
3. Doctor

Super Admin owns platform-level administration. Clinic Admin owns clinic-level operations. Doctor owns clinical work and only limited operational data.

## Doctor Role Guidance

Doctors should usually be operational users, not full admins. They need fast access to their patients, consultations, goods usage, and personal performance. They should not manage clinic-wide users, global financial settings, branch setup, or platform configuration unless a separate permission is explicitly added.

## Clinic and Branch Separation

Separate Clinic from Branch because:

- One clinic organization may operate multiple locations.
- Staff assignments may differ per branch.
- Inventory, rooms, services, invoices, and analytics are often branch-specific.
- Super Admin needs platform-wide control while Clinic Admin needs scoped operational control.

## Super Admin Creation Flow

Super Admin should be able to:

- Create a clinic.
- Create one or more branches under that clinic.
- Create or invite a clinic admin.
- Assign users to clinic and branch scopes.
- Suspend or reactivate clinics, branches, and users.

## Permission Principles

- Every request must be authorized by role and scope.
- Clinic Admin access must be limited to assigned clinic and branches.
- Doctor access must be limited to assigned patients or patients they have consulted.
- Financial visibility for doctors should be configurable.
- Audit sensitive operations.

## Default Assumptions

If implementation requires a decision not specified elsewhere:

- Use branch-scoped data where operationally relevant.
- Keep analytics read-only.
- Keep destructive actions as soft-delete, archive, deactivate, suspend, or cancel.
- Prefer explicit status fields over physical deletion.
- Build DTOs around frontend page needs, not raw database tables.

