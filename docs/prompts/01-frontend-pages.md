# Frontend Page Prompts

## General Frontend Prompt

Create role-based frontend pages for a medical CRM platform. Every page must include the exact route path, layout rules, page goal, sections, filters, tables, cards, modals, empty states, loading states, and future API compatibility. Use a professional medical SaaS admin style with clean spacing, restrained color, clear hierarchy, responsive behavior, and accessible controls.

## Authentication Pages

### Login

- Route: `/login`
- Goal: Authenticate users and route them to the correct role dashboard.
- Include email, password, remember me, forgot password link, validation states, disabled loading button, and error alert.
- After login, redirect by role:
  - Super Admin: `/super-admin/dashboard`
  - Clinic Admin: `/clinic-admin/dashboard`
  - Doctor: `/doctor/dashboard`

### Forgot Password

- Route: `/forgot-password`
- Goal: Request password reset email.
- Include email field, submit state, success confirmation, and link back to login.

### Reset Password

- Route: `/reset-password`
- Goal: Set a new password from reset token.
- Include new password, confirm password, password rules, token error state, and success redirect to login.

## Super Admin Pages

### Dashboard

- Route: `/super-admin/dashboard`
- Goal: Show platform-wide operational overview.
- Sections: KPI cards, clinic growth chart, branch activity, user activity, recent clinics, alerts.
- Filters: date range, clinic status, region.
- Future APIs: platform metrics, growth analytics, activity feed.

### Clinics

- Route: `/super-admin/clinics`
- Goal: Create, list, edit, suspend, and inspect clinics.
- Include clinic table with name, owner, branches, users, status, created date, actions.
- Filters: status, region, subscription/status if applicable.
- Modals: create clinic, edit clinic, suspend confirmation.

### Branches

- Route: `/super-admin/branches`
- Goal: Manage and inspect all branches across clinics.
- Include branch table with clinic, branch name, address, doctors, patients, rooms, status.
- Filters: clinic, status, city/region.
- Modals: create branch, edit branch, deactivate confirmation.

### Users

- Route: `/super-admin/users`
- Goal: Manage global users and assignments.
- Include user table with name, email, role, clinic scope, branch scope, status, last login.
- Filters: role, clinic, branch, status.
- Modals: create user, assign role, reset password, deactivate user.

### Analytics

- Route: `/super-admin/analytics`
- Goal: Show cross-clinic platform analytics.
- Sections: revenue overview, appointments or consultations, patient growth, clinic performance ranking, doctor activity.
- Filters: date range, clinic, branch, region.
- Charts must be API-ready and handle no-data states.

### Settings

- Route: `/super-admin/settings`
- Goal: Manage platform-level configuration.
- Sections: profile, security, system defaults, audit settings, notification settings.
- Include save/cancel states and validation.

## Clinic Admin Pages

### Dashboard

- Route: `/clinic-admin/dashboard`
- Goal: Show clinic-scoped operations summary.
- Sections: patients, doctors, revenue, invoices, stock alerts, source performance, recent activity.
- Filters: branch, date range.

### Branch Details

- Route: `/clinic-admin/branches/:branchId`
- Goal: Manage one branch profile and operational stats.
- Sections: branch info, address/contact, doctors, rooms, services, recent activity.
- Modals: edit branch, add room, assign doctor.

### Patients

- Route: `/clinic-admin/patients`
- Goal: Search and manage clinic patients.
- Include table with full name, phone, branch, assigned doctor, last visit, status, balance.
- Filters: branch, doctor, status, source, date range.
- Actions: view detail, create patient, edit, archive.

### Patient Detail

- Route: `/clinic-admin/patients/:patientId`
- Goal: Show complete patient profile.
- Sections: demographics, medical summary, consultations, invoices, payments, goods usage, files or notes.
- Actions: edit patient, create invoice, add consultation if permitted.

### Doctors

- Route: `/clinic-admin/doctors`
- Goal: Manage doctors in the clinic.
- Include doctor table with specialty, branch, active patients, consultations, status, performance shortcut.
- Filters: branch, specialty, status.
- Modals: add doctor, assign branch, deactivate.

### Doctor Detail

- Route: `/clinic-admin/doctors/:doctorId`
- Goal: Show doctor profile and operational assignments.
- Sections: profile, branches, services, patients, recent consultations, schedule placeholder.

### Doctor Analytics

- Route: `/clinic-admin/doctors/:doctorId/analytics`
- Goal: Analyze one doctor's performance.
- Sections: revenue, consultation volume, patients served, service mix, goods usage, source conversion.
- Filters: branch, date range.

### Services

- Route: `/clinic-admin/services`
- Goal: Manage billable clinic services.
- Include service table with name, category, price, duration, branch availability, active status.
- Modals: create/edit service, deactivate.

### Rooms

- Route: `/clinic-admin/services/rooms`
- Goal: Manage rooms under Services group.
- Include room table with branch, room name, type, assigned services, status.
- Modals: create/edit room, deactivate.

### Warehouse

- Route: `/clinic-admin/warehouse`
- Goal: Show warehouse overview.
- Sections: stock value, low stock, expiring products, recent movements, top-used goods.
- Filters: branch, product category, date range.

### Products

- Route: `/clinic-admin/warehouse/products`
- Goal: Manage warehouse products and inventory.
- Include product table with SKU, name, category, unit, stock, low-stock threshold, supplier, status.
- Modals: create/edit product, stock adjustment, deactivate.

### Suppliers

- Route: `/clinic-admin/warehouse/suppliers`
- Goal: Manage suppliers.
- Include supplier table with name, phone, products count, balance, status.
- Modals: create/edit supplier, deactivate.

### Supplier Detail

- Route: `/clinic-admin/warehouse/suppliers/:supplierId`
- Goal: Show supplier profile, products, purchase history, and payments.

### Payments

- Route: `/clinic-admin/payments`
- Goal: Track payments and balances.
- Include payment table with patient, invoice, amount, method, date, status, branch.
- Filters: branch, method, status, date range.

### Invoices

- Route: `/clinic-admin/payments/invoices`
- Goal: Manage invoices.
- Include invoice table with number, patient, doctor, branch, total, paid, due, status, created date.
- Filters: branch, doctor, invoice status, date range.

### Create Invoice

- Route: `/clinic-admin/payments/invoices/create`
- Goal: Create an invoice for a patient.
- Include patient selector, branch selector, doctor selector, services, products/goods, discounts, taxes if enabled, totals, save draft, issue invoice.

### Sources

- Route: `/clinic-admin/sources`
- Goal: Manage patient acquisition sources.
- Include source table with name, type, patients count, revenue, conversion placeholder, status.
- Modals: create/edit source, deactivate.

## Doctor Pages

### Dashboard

- Route: `/doctor/dashboard`
- Goal: Show doctor-specific daily work.
- Sections: assigned patients, today's consultations, revenue or performance summary if permitted, recent notes, goods usage alerts.
- Filters: date range where relevant.

### My Patients

- Route: `/doctor/patients`
- Goal: Show patients assigned to or consulted by the doctor.
- Include patient table with name, phone, last consultation, next action, status.
- Filters: status, date range.

### Patient Detail

- Route: `/doctor/patients/:patientId`
- Goal: Show doctor-authorized patient details.
- Include demographics, medical summary, consultation history, goods usage, notes.
- Hide admin-only financial controls unless explicitly permitted.

### Add Consultation

- Route: `/doctor/consultations/create`
- Goal: Record a new consultation.
- Include patient selector, complaints, diagnosis, treatment plan, services performed, goods used, notes, follow-up date.

### Goods Usage

- Route: `/doctor/goods-usage`
- Goal: Track goods used by the doctor during consultations.
- Include usage table with patient, product, quantity, consultation, date, status.

### My Performance

- Route: `/doctor/performance`
- Goal: Show doctor personal analytics.
- Sections: consultations, patients served, services performed, goods used, revenue if permitted.
- Filters: date range.

