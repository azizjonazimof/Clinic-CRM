# Backend and API Architecture Prompts

## Overall Architecture

Create a modular backend for a multi-tenant medical CRM. Use clear domain modules, REST APIs, DTO validation, role-aware authorization, tenant scoping, audit logging, and consistent error contracts.

Recommended modules:

- Auth
- Users
- Clinics
- Branches
- Patients
- Doctors
- Consultations
- Services
- Rooms
- Warehouse
- Products
- Suppliers
- Payments
- Invoices
- Sources
- Analytics
- Audit Logs
- Shared/Common

## Authentication and Authorization

Implement:

- Email/password login.
- Forgot/reset password flow.
- Access token and refresh token support if backend stack supports it.
- Role-based access control.
- Scope-based authorization by clinic, branch, assigned doctor, and ownership.
- Permission constants and guards/middleware.

Access rules:

- Super Admin can access platform-wide data.
- Clinic Admin can access data only for assigned clinic and allowed branches.
- Doctor can access own assigned patients, own consultations, own goods usage, and own performance.

## API Response Contract

Use consistent responses:

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

Errors:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human readable message",
    "details": []
  }
}
```

## Super Admin APIs

- `GET /api/super-admin/dashboard`
- `GET /api/super-admin/clinics`
- `POST /api/super-admin/clinics`
- `GET /api/super-admin/clinics/:clinicId`
- `PATCH /api/super-admin/clinics/:clinicId`
- `POST /api/super-admin/clinics/:clinicId/suspend`
- `GET /api/super-admin/branches`
- `POST /api/super-admin/branches`
- `PATCH /api/super-admin/branches/:branchId`
- `GET /api/super-admin/users`
- `POST /api/super-admin/users`
- `PATCH /api/super-admin/users/:userId`
- `POST /api/super-admin/users/:userId/assignments`
- `GET /api/super-admin/analytics`
- `GET /api/super-admin/settings`
- `PATCH /api/super-admin/settings`

## Clinic Admin APIs

- `GET /api/clinic-admin/dashboard`
- `GET /api/clinic-admin/branches/:branchId`
- `PATCH /api/clinic-admin/branches/:branchId`
- `GET /api/clinic-admin/patients`
- `POST /api/clinic-admin/patients`
- `GET /api/clinic-admin/patients/:patientId`
- `PATCH /api/clinic-admin/patients/:patientId`
- `GET /api/clinic-admin/doctors`
- `POST /api/clinic-admin/doctors`
- `GET /api/clinic-admin/doctors/:doctorId`
- `PATCH /api/clinic-admin/doctors/:doctorId`
- `GET /api/clinic-admin/doctors/:doctorId/analytics`
- `GET /api/clinic-admin/services`
- `POST /api/clinic-admin/services`
- `PATCH /api/clinic-admin/services/:serviceId`
- `GET /api/clinic-admin/rooms`
- `POST /api/clinic-admin/rooms`
- `PATCH /api/clinic-admin/rooms/:roomId`
- `GET /api/clinic-admin/warehouse/summary`
- `GET /api/clinic-admin/products`
- `POST /api/clinic-admin/products`
- `PATCH /api/clinic-admin/products/:productId`
- `POST /api/clinic-admin/products/:productId/stock-adjustments`
- `GET /api/clinic-admin/suppliers`
- `POST /api/clinic-admin/suppliers`
- `GET /api/clinic-admin/suppliers/:supplierId`
- `PATCH /api/clinic-admin/suppliers/:supplierId`
- `GET /api/clinic-admin/payments`
- `POST /api/clinic-admin/payments`
- `GET /api/clinic-admin/invoices`
- `POST /api/clinic-admin/invoices`
- `GET /api/clinic-admin/invoices/:invoiceId`
- `PATCH /api/clinic-admin/invoices/:invoiceId`
- `POST /api/clinic-admin/invoices/:invoiceId/issue`
- `GET /api/clinic-admin/sources`
- `POST /api/clinic-admin/sources`
- `PATCH /api/clinic-admin/sources/:sourceId`

## Doctor APIs

- `GET /api/doctor/dashboard`
- `GET /api/doctor/patients`
- `GET /api/doctor/patients/:patientId`
- `POST /api/doctor/consultations`
- `GET /api/doctor/consultations`
- `GET /api/doctor/goods-usage`
- `POST /api/doctor/goods-usage`
- `GET /api/doctor/performance`

## Shared APIs

- `GET /api/me`
- `PATCH /api/me`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/lookups/branches`
- `GET /api/lookups/doctors`
- `GET /api/lookups/services`
- `GET /api/lookups/products`
- `GET /api/lookups/sources`

## Engineering Conventions

- Validate all request bodies, params, and query strings.
- Use pagination for all list endpoints.
- Support `search`, `page`, `limit`, `sort`, and domain filters where useful.
- Enforce tenant scoping server-side. Never rely on frontend filtering for security.
- Add audit logging to create, update, delete, suspend, assignment, invoice, payment, and stock actions.
- Add tests for auth, permission denial, tenant isolation, validation errors, and critical CRUD flows.

