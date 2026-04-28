# Medical CRM Platform Build Instructions

## Purpose

Use this file as the master instruction document for building the medical CRM platform from scratch. When asked to build the project, follow these instructions and the prompt files in `docs/prompts` without asking product-structure questions unless a missing detail would block implementation.

## Core Product Model

Build a multi-tenant medical CRM with three primary roles:

- `SUPER_ADMIN`: platform owner role. Can manage clinics, branches, users, global analytics, and platform settings.
- `CLINIC_ADMIN`: clinic or organization operator. Can manage assigned clinic data, branches, doctors, patients, services, rooms, warehouse, suppliers, payments, invoices, and sources.
- `DOCTOR`: operational medical role. Can manage own dashboard, assigned patients, consultations, goods usage, and personal performance.

Model the product around `Clinic` or organization plus `Branch` separation:

- A clinic can have multiple branches.
- Branch-level data includes doctors, rooms, patients, services, stock, invoices, and payments.
- Users may be scoped to one clinic, one or more branches, or global platform access depending on role.

Doctors should usually be operational users, not full admins. Admin capabilities should stay with clinic admins unless explicitly granted through permissions.

Super Admin must be able to create new clinics, create branches, invite or create users, and assign users to clinic and branch scopes.

## Global UI Rules

- Build authenticated app layouts per role.
- Use a clean SaaS admin style: dense but readable, professional, responsive, and optimized for repeated daily use.
- Prefer white or near-white surfaces, muted borders, dark text, medical blue or teal as primary accent, and restrained status colors.
- Use role-specific sidebars. Do not show pages the user cannot access.
- Tables must support search, filters, pagination, empty states, loading states, and row actions where relevant.
- Cards must summarize actionable metrics, not decorative content.
- Modals must be used for create, edit, confirmation, and quick detail workflows where they avoid unnecessary navigation.
- Keep routes stable for future backend connection. Do not hardcode temporary route names that conflict with the route map below.

## Route Map

### Authentication

- `/login`
- `/forgot-password`
- `/reset-password`

### Super Admin

- `/super-admin/dashboard`
- `/super-admin/clinics`
- `/super-admin/branches`
- `/super-admin/users`
- `/super-admin/analytics`
- `/super-admin/settings`

### Clinic Admin

- `/clinic-admin/dashboard`
- `/clinic-admin/branches/:branchId`
- `/clinic-admin/patients`
- `/clinic-admin/patients/:patientId`
- `/clinic-admin/doctors`
- `/clinic-admin/doctors/:doctorId`
- `/clinic-admin/doctors/:doctorId/analytics`
- `/clinic-admin/services`
- `/clinic-admin/services/rooms`
- `/clinic-admin/warehouse`
- `/clinic-admin/warehouse/products`
- `/clinic-admin/warehouse/suppliers`
- `/clinic-admin/warehouse/suppliers/:supplierId`
- `/clinic-admin/payments`
- `/clinic-admin/payments/invoices`
- `/clinic-admin/payments/invoices/create`
- `/clinic-admin/sources`

### Doctor

- `/doctor/dashboard`
- `/doctor/patients`
- `/doctor/patients/:patientId`
- `/doctor/consultations/create`
- `/doctor/goods-usage`
- `/doctor/performance`

## Clinic Admin Sidebar Grouping

Use this corrected grouped structure:

- Dashboard
- Branch Details
- Patients
- Doctors
  - Doctor List
  - Doctor Detail
  - Doctor Analytics
- Services
  - Services
  - Rooms
- Warehouse
  - Overview
  - Products
  - Suppliers
  - Supplier Detail
- Payments
  - Payments
  - Invoices
  - Create Invoice
- Sources

## Prompt Files

Use these files as the detailed prompt groups:

- [Frontend page prompts](docs/prompts/01-frontend-pages.md)
- [Backend and API architecture prompts](docs/prompts/02-backend-api-architecture.md)
- [Database-to-API mapping prompts](docs/prompts/03-database-api-mapping.md)
- [Route and structure refinements](docs/prompts/04-route-structure-refinements.md)
- [Product modeling guidance](docs/prompts/05-product-modeling-guidance.md)

## Build Expectations

When implementing:

- Create a production-ready project structure.
- Add typed entities, DTOs, route constants, permission constants, and shared API response contracts.
- Implement authentication and role-aware authorization from the beginning.
- Keep frontend pages ready for real API integration even if mock data is used first.
- Keep backend endpoints scoped by role, clinic, branch, and ownership rules.
- Add validation, error handling, audit logging hooks, and tests for critical flows.
- Prefer incremental implementation that preserves the route map and data model.

## Do Not Ask Again

Assume the product is a multi-tenant medical CRM with Super Admin, Clinic Admin, and Doctor portals. If a detail is missing, choose the most conventional medical CRM behavior, document the assumption in code or docs, and continue.

## Do the following

organizations
- id uuid pk
- type varchar(30) -- 'clinic'
- legal_name varchar(255)
- display_name varchar(255)
- tax_id varchar(100) null
- phone varchar(50) null
- email varchar(255) null
- country_code varchar(10) null
- timezone varchar(100) not null
- currency_code varchar(10) not null
- address_text text null
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz null

users
- id uuid pk
- email varchar(255) unique null
- phone varchar(50) unique null
- password_hash text
- full_name varchar(255)
- avatar_url text null
- language_code varchar(10) null
- is_active boolean default true
- last_login_at timestamptz null
- created_at timestamptz
- updated_at timestamptz

roles
- id uuid pk
- code varchar(50) unique -- SUPER_ADMIN, CLINIC_ADMIN, DOCTOR, RECEPTIONIST, CASHIER, WAREHOUSE_MANAGER, ACCOUNTANT, NURSE
- name varchar(100)

roles
- id uuid pk
- code varchar(50) unique -- SUPER_ADMIN, CLINIC_ADMIN, DOCTOR, RECEPTIONIST, CASHIER, WAREHOUSE_MANAGER, ACCOUNTANT, NURSE
- name varchar(100)

permissions
- id uuid pk
- code varchar(100) unique
- name varchar(255)
- module varchar(100)

role_permissions
- role_id uuid fk -> roles.id
- permission_id uuid fk -> permissions.id
primary key (role_id, permission_id)

organization_users
- id uuid pk
- organization_id uuid fk -> organizations.id
- user_id uuid fk -> users.id
- role_id uuid fk -> roles.id
- status varchar(30) -- active, invited, suspended
- joined_at timestamptz
- left_at timestamptz null
- created_at timestamptz
- updated_at timestamptz
unique (organization_id, user_id, role_id)

staff_profiles
- id uuid pk
- organization_user_id uuid fk -> organization_users.id
- employee_code varchar(100) null
- first_name varchar(100)
- last_name varchar(100)
- middle_name varchar(100) null
- gender varchar(30) null
- birth_date date null
- hire_date date null
- phone varchar(50) null
- email varchar(255) null
- notes text null
- created_at timestamptz
- updated_at timestamptz

doctor_profiles
- id uuid pk
- staff_profile_id uuid fk -> staff_profiles.id unique
- profession_title varchar(255) -- dermatologist, dentist, therapist...
- specialization_code varchar(100) null
- license_number varchar(100) null
- career_start_date date null -- to calculate experience years
- bio text null
- consultation_fee numeric(14,2) null
- rating_cached numeric(3,2) null
- created_at timestamptz
- updated_at timestamptz

doctor_services
- doctor_profile_id uuid fk -> doctor_profiles.id
- service_id uuid fk -> services.id
- is_active boolean default true
primary key (doctor_profile_id, service_id)

doctor_rooms
- doctor_profile_id uuid fk -> doctor_profiles.id
- room_id uuid fk -> rooms.id
- assigned_from timestamptz
- assigned_to timestamptz null
primary key (doctor_profile_id, room_id, assigned_from)

patients
- id uuid pk
- organization_id uuid fk -> organizations.id
- external_patient_code varchar(100) null
- first_name varchar(100)
- last_name varchar(100)
- middle_name varchar(100) null
- full_name_search varchar(255) generated/searchable
- gender varchar(30) null
- birth_date date null
- age_cached int null
- phone varchar(50) null
- email varchar(255) null
- address_text text null
- height_cm numeric(6,2) null
- weight_kg numeric(6,2) null
- blood_group varchar(10) null
- allergies text null
- emergency_contact_name varchar(255) null
- emergency_contact_phone varchar(50) null
- source_id uuid fk -> lead_sources.id null
- created_by_user_id uuid fk -> users.id null
- primary_doctor_id uuid fk -> doctor_profiles.id null
- status varchar(30) default 'active'
- first_visit_at timestamptz null
- last_visit_at timestamptz null
- notes text null
- created_at timestamptz
- updated_at timestamptz
- deleted_at timestamptz null


patient_doctor_assignments
- id uuid pk
- organization_id uuid fk -> organizations.id
- patient_id uuid fk -> patients.id
- doctor_profile_id uuid fk -> doctor_profiles.id
- assignment_type varchar(30) -- primary, temporary, referral
- is_active boolean default true
- assigned_at timestamptz
- unassigned_at timestamptz null
- assigned_by_user_id uuid fk -> users.id
- notes text null


unique (patient_id) where is_active = true


patient_documents
- id uuid pk
- patient_id uuid fk -> patients.id
- document_type varchar(50) -- passport, lab_result, xray, consent, medical_file
- file_url text
- file_name varchar(255)
- mime_type varchar(100) null
- uploaded_by_user_id uuid fk -> users.id
- is_sensitive boolean default true
- created_at timestamptz

patient_tags
- id uuid pk
- organization_id uuid fk -> organizations.id
- name varchar(100)
unique (organization_id, name)

patient_tag_links
- patient_id uuid fk -> patients.id
- patient_tag_id uuid fk -> patient_tags.id
primary key (patient_id, patient_tag_id)

lead_sources
- id uuid pk
- organization_id uuid fk -> organizations.id
- source_type varchar(50) -- manual, mobile_app, telegram, instagram, website, referral, call_center, walk_in
- name varchar(255) -- e.g. Instagram Ads April, Telegram Bot, App Redirect
- external_ref varchar(255) null
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz

patient_source_events
- id uuid pk
- organization_id uuid fk -> organizations.id
- patient_id uuid fk -> patients.id
- source_id uuid fk -> lead_sources.id
- event_type varchar(50) -- created, redirected, booked, confirmed, visited
- occurred_at timestamptz
- metadata jsonb null
- created_at timestamptz

rooms
- id uuid pk
- organization_id uuid fk -> organizations.id
- name varchar(100)
- code varchar(50) null
- floor varchar(30) null
- room_type varchar(50) null
- capacity int default 1
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz

room_services
- room_id uuid fk -> rooms.id
- service_id uuid fk -> services.id
- is_active boolean default true
primary key (room_id, service_id)

service_categories
- id uuid pk
- organization_id uuid fk -> organizations.id
- name varchar(255)
- parent_id uuid fk -> service_categories.id null
- sort_order int default 0
- is_active boolean default true

services
- id uuid pk
- organization_id uuid fk -> organizations.id
- category_id uuid fk -> service_categories.id null
- code varchar(100) null
- name varchar(255)
- description text null
- duration_minutes int null
- base_price numeric(14,2) not null
- cost_price numeric(14,2) null
- requires_room boolean default false
- requires_doctor boolean default true
- is_product_consumption_enabled boolean default false
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz
unique (organization_id, name)

service_required_products
- id uuid pk
- service_id uuid fk -> services.id
- product_id uuid fk -> products.id
- quantity numeric(14,3) not null
- unit_id uuid fk -> units.id
- is_optional boolean default false


appointments
- id uuid pk
- organization_id uuid fk -> organizations.id
- patient_id uuid fk -> patients.id
- doctor_profile_id uuid fk -> doctor_profiles.id
- room_id uuid fk -> rooms.id null
- source_id uuid fk -> lead_sources.id null
- appointment_type varchar(50) -- consultation, procedure, follow_up
- status varchar(30) -- scheduled, confirmed, in_progress, completed, no_show, cancelled
- scheduled_start timestamptz
- scheduled_end timestamptz
- notes text null
- created_by_user_id uuid fk -> users.id
- created_at timestamptz
- updated_at timestamptz

encounters
- id uuid pk
- organization_id uuid fk -> organizations.id
- appointment_id uuid fk -> appointments.id null
- patient_id uuid fk -> patients.id
- doctor_profile_id uuid fk -> doctor_profiles.id
- room_id uuid fk -> rooms.id null
- encounter_type varchar(50) -- outpatient, emergency, follow_up
- status varchar(30) -- open, closed, cancelled
- started_at timestamptz
- ended_at timestamptz null
- diagnosis_summary text null
- clinical_notes text null
- created_by_user_id uuid fk -> users.id
- created_at timestamptz
- updated_at timestamptz

encounter_services
- id uuid pk
- encounter_id uuid fk -> encounters.id
- service_id uuid fk -> services.id
- doctor_profile_id uuid fk -> doctor_profiles.id null
- room_id uuid fk -> rooms.id null
- quantity numeric(14,2) default 1
- unit_price numeric(14,2) not null
- discount_amount numeric(14,2) default 0
- tax_amount numeric(14,2) default 0
- total_amount numeric(14,2) not null
- service_started_at timestamptz null
- service_ended_at timestamptz null
- status varchar(30) -- planned, completed, cancelled
- notes text null
- created_at timestamptz

encounter_product_consumptions
- id uuid pk
- encounter_service_id uuid fk -> encounter_services.id
- product_id uuid fk -> products.id
- batch_id uuid fk -> inventory_batches.id null
- quantity numeric(14,3) not null
- unit_cost numeric(14,2) null
- total_cost numeric(14,2) null
- created_at timestamptz

invoices
- id uuid pk
- organization_id uuid fk -> organizations.id
- patient_id uuid fk -> patients.id
- encounter_id uuid fk -> encounters.id null
- invoice_number varchar(100)
- status varchar(30) -- draft, unpaid, paid, cancelled, partially_paid
- issue_date date
- due_date date null
- subtotal numeric(14,2) not null
- discount_amount numeric(14,2) default 0
- tax_amount numeric(14,2) default 0
- total_amount numeric(14,2) not null
- paid_amount numeric(14,2) default 0
- currency_code varchar(10) not null
- notes text null
- created_by_user_id uuid fk -> users.id
- created_at timestamptz
- updated_at timestamptz
- cancelled_at timestamptz null
unique (organization_id, invoice_number)

invoice_items
- id uuid pk
- invoice_id uuid fk -> invoices.id
- item_type varchar(30) -- service, product, adjustment
- service_id uuid fk -> services.id null
- product_id uuid fk -> products.id null
- encounter_service_id uuid fk -> encounter_services.id null
- description varchar(255)
- quantity numeric(14,3) not null
- unit_price numeric(14,2) not null
- discount_amount numeric(14,2) default 0
- tax_amount numeric(14,2) default 0
- line_total numeric(14,2) not null
- sort_order int default 0

payments
- id uuid pk
- organization_id uuid fk -> organizations.id
- patient_id uuid fk -> patients.id null
- invoice_id uuid fk -> invoices.id null
- payment_method varchar(50) -- cash, card, transfer, click, payme, insurance, mixed
- amount numeric(14,2) not null
- paid_at timestamptz not null
- external_transaction_id varchar(255) null
- payment_provider varchar(100) null
- status varchar(30) -- pending, succeeded, failed, refunded, cancelled
- received_by_user_id uuid fk -> users.id null
- notes text null
- created_at timestamptz

payment_allocations
- id uuid pk
- payment_id uuid fk -> payments.id
- invoice_id uuid fk -> invoices.id
- allocated_amount numeric(14,2) not null
unique (payment_id, invoice_id)

refunds
- id uuid pk
- organization_id uuid fk -> organizations.id
- payment_id uuid fk -> payments.id
- invoice_id uuid fk -> invoices.id null
- amount numeric(14,2)
- reason text null
- refunded_at timestamptz
- processed_by_user_id uuid fk -> users.id

payment_provider_webhooks
- id uuid pk
- organization_id uuid fk -> organizations.id null
- provider_name varchar(100)
- event_name varchar(100)
- external_event_id varchar(255) null
- payload jsonb
- processed_status varchar(30) -- pending, processed, failed
- received_at timestamptz
- processed_at timestamptz null
unique (provider_name, external_event_id)

units
- id uuid pk
- code varchar(30) unique -- pcs, ml, g, box
- name varchar(100)

product_categories
- id uuid pk
- organization_id uuid fk -> organizations.id
- name varchar(255)
- parent_id uuid fk -> product_categories.id null

products
- id uuid pk
- organization_id uuid fk -> organizations.id
- category_id uuid fk -> product_categories.id null
- sku varchar(100) null
- barcode varchar(100) null
- name varchar(255)
- description text null
- unit_id uuid fk -> units.id
- product_type varchar(30) -- sellable, consumable, both
- purchase_price numeric(14,2) default 0
- selling_price numeric(14,2) default 0
- min_stock_level numeric(14,3) default 0
- is_batch_tracked boolean default true
- is_expiry_tracked boolean default true
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz
unique (organization_id, name)

suppliers
- id uuid pk
- organization_id uuid fk -> organizations.id
- name varchar(255)
- phone varchar(50) null
- email varchar(255) null
- address_text text null
- contact_person varchar(255) null
- notes text null
- is_active boolean default true
- created_at timestamptz
- updated_at timestamptz

supplier_products
- id uuid pk
- supplier_id uuid fk -> suppliers.id
- product_id uuid fk -> products.id
- supplier_sku varchar(100) null
- last_purchase_price numeric(14,2) null
- lead_time_days int null
- is_preferred boolean default false
unique (supplier_id, product_id)

purchase_orders
- id uuid pk
- organization_id uuid fk -> organizations.id
- supplier_id uuid fk -> suppliers.id
- po_number varchar(100)
- status varchar(30) -- draft, sent, partially_received, received, cancelled
- order_date date
- expected_date date null
- subtotal numeric(14,2)
- total_amount numeric(14,2)
- notes text null
- created_by_user_id uuid fk -> users.id
- created_at timestamptz
- updated_at timestamptz
unique (organization_id, po_number)

purchase_order_items
- id uuid pk
- purchase_order_id uuid fk -> purchase_orders.id
- product_id uuid fk -> products.id
- quantity numeric(14,3)
- unit_price numeric(14,2)
- line_total numeric(14,2)

warehouses
- id uuid pk
- organization_id uuid fk -> organizations.id
- name varchar(255)
- code varchar(100) null
- is_default boolean default false
- created_at timestamptz

inventory_batches
- id uuid pk
- organization_id uuid fk -> organizations.id
- warehouse_id uuid fk -> warehouses.id
- product_id uuid fk -> products.id
- supplier_id uuid fk -> suppliers.id null
- batch_number varchar(100) null
- expiry_date date null
- received_at timestamptz null
- unit_cost numeric(14,2) not null
- quantity_received numeric(14,3) not null
- quantity_remaining numeric(14,3) not null
- status varchar(30) -- active, exhausted, expired, quarantined
- created_at timestamptz

stock_movements
- id uuid pk
- organization_id uuid fk -> organizations.id
- warehouse_id uuid fk -> warehouses.id
- product_id uuid fk -> products.id
- batch_id uuid fk -> inventory_batches.id null
- movement_type varchar(30) -- in, out, transfer_in, transfer_out, adjustment, return_in, return_out, consume
- reference_type varchar(50) null -- purchase_order, encounter_service, invoice, manual_adjustment
- reference_id uuid null
- quantity numeric(14,3) not null
- unit_cost numeric(14,2) null
- moved_at timestamptz
- created_by_user_id uuid fk -> users.id
- notes text null
- created_at timestamptz

inventory_adjustments
- id uuid pk
- organization_id uuid fk -> organizations.id
- warehouse_id uuid fk -> warehouses.id
- reason varchar(255)
- notes text null
- adjusted_by_user_id uuid fk -> users.id
- adjusted_at timestamptz

inventory_adjustment_items
- id uuid pk
- inventory_adjustment_id uuid fk -> inventory_adjustments.id
- product_id uuid fk -> products.id
- batch_id uuid fk -> inventory_batches.id null
- delta_quantity numeric(14,3)
- unit_cost numeric(14,2) null

doctor_reviews
- id uuid pk
- organization_id uuid fk -> organizations.id
- doctor_profile_id uuid fk -> doctor_profiles.id
- patient_id uuid fk -> patients.id
- encounter_id uuid fk -> encounters.id null
- rating int check (rating between 1 and 5)
- comment text null
- created_at timestamptz
unique (doctor_profile_id, patient_id, encounter_id)

daily_clinic_metrics
- id uuid pk
- organization_id uuid fk -> organizations.id
- metric_date date
- total_income numeric(14,2)
- total_patients int
- new_patients int
- returning_patients int
- paid_invoices_count int
- unpaid_invoices_count int
- draft_invoices_count int
- cancelled_invoices_count int
- created_at timestamptz
unique (organization_id, metric_date)

daily_doctor_metrics
- id uuid pk
- organization_id uuid fk -> organizations.id
- doctor_profile_id uuid fk -> doctor_profiles.id
- metric_date date
- total_income numeric(14,2)
- total_patients int
- new_patients int
- returning_patients int
- average_consultation_duration_minutes numeric(10,2) null
- rating_avg numeric(3,2) null
- created_at timestamptz
unique (organization_id, doctor_profile_id, metric_date)

daily_source_metrics
- id uuid pk
- organization_id uuid fk -> organizations.id
- source_id uuid fk -> lead_sources.id
- metric_date date
- patients_count int
- income_amount numeric(14,2) default 0
unique (organization_id, source_id, metric_date)

patient_consents
- id uuid pk
- organization_id uuid fk -> organizations.id
- patient_id uuid fk -> patients.id
- consent_type varchar(50) -- treatment, privacy, marketing, telemedicine, document_upload
- status varchar(30) -- granted, revoked
- granted_at timestamptz null
- revoked_at timestamptz null
- document_id uuid fk -> patient_documents.id null
- collected_by_user_id uuid fk -> users.id null

audit_logs
- id uuid pk
- organization_id uuid fk -> organizations.id null
- user_id uuid fk -> users.id null
- action varchar(50) -- create, update, delete, view, export, login
- entity_type varchar(100)
- entity_id uuid null
- patient_id uuid fk -> patients.id null
- ip_address inet null
- user_agent text null
- before_data jsonb null
- after_data jsonb null
- occurred_at timestamptz

data_access_logs

For PHI viewing.

data_access_logs
- id uuid pk
- organization_id uuid fk -> organizations.id
- user_id uuid fk -> users.id
- patient_id uuid fk -> patients.id
- access_type varchar(50) -- viewed_profile, viewed_document, exported_data
- reason_code varchar(100) null
- occurred_at timestamptz
P. Files and attachments
files
files
- id uuid pk
- organization_id uuid fk -> organizations.id null
- storage_provider varchar(50)
- storage_key text
- file_name varchar(255)
- mime_type varchar(100)
- file_size_bytes bigint
- checksum varchar(255) null
- uploaded_by_user_id uuid fk -> users.id null
- created_at timestamptz

Then link from patient docs, doctor docs, invoice pdfs, consent files, etc.

Q. Notes / comments / activity feed
entity_notes
entity_notes
- id uuid pk
- organization_id uuid fk -> organizations.id
- entity_type varchar(100)
- entity_id uuid
- note_type varchar(50) -- internal, medical, billing
- body text
- created_by_user_id uuid fk -> users.id
- created_at timestamptz
9) Critical business rules to enforce
Patient ownership

You said:

clinic and doctors of clinic have same patients
but doctors can't have same client

This needs a precise rule:

Best interpretation
Patient belongs to clinic
One patient can be visible inside clinic
One patient has one active responsible doctor at a time

Enforce via patient_doctor_assignments unique active assignment.

Invoice generation
Invoice may be created from selected services/products
Services can come from appointment/encounter
Product sales can also be invoiced directly
Invoice items must be immutable after payment except via cancellation/refund workflow
Inventory
Product consumption should happen from encounter/service completion
Product sales should trigger stock out
Purchase receiving should trigger stock in
Never directly edit stock quantity without adjustment ledger
Soft delete

For medical/legal data:

do not hard-delete encounters, invoices, payments, stock movements
use soft delete or cancellation states
10) Indexing strategy

At minimum, index these:

patients (organization_id, full_name_search)
patients (organization_id, phone)
patients (organization_id, primary_doctor_id)
appointments (organization_id, scheduled_start)
appointments (organization_id, doctor_profile_id, scheduled_start)
encounters (organization_id, patient_id, started_at)
encounters (organization_id, doctor_profile_id, started_at)
invoices (organization_id, status, issue_date)
payments (organization_id, paid_at)
stock_movements (organization_id, product_id, moved_at)
stock_movements (organization_id, warehouse_id, moved_at)
patient_source_events (organization_id, source_id, occurred_at)
audit_logs (organization_id, occurred_at)
data_access_logs (organization_id, patient_id, occurred_at)

Use partial indexes for active rows where useful.

11) Suggested RLS / access model
Super admin
can access all organizations
Clinic admin
full access inside own organization_id
Doctor
can view own schedule, own encounters
can view clinic patients only if allowed
can edit only patients assigned to them or encounters created by them
can only view minimum necessary patient data for their role
Cashier
invoices, payments
limited/no access to full clinical notes
Warehouse manager
products, suppliers, stock
no access to sensitive medical notes

That aligns with healthcare minimum-necessary principles.

12) Recommended naming / engineering standards so any developer can support it

Use these conventions:

English table/column names only
singular or plural consistently, not mixed
UUID PK everywhere
*_id foreign keys
enum-like values stored as constrained text or lookup tables
all timestamps in UTC
monetary values as numeric(14,2)
quantities as numeric(14,3)
immutable ledger/event tables for stock and payments
avoid storing derived metrics unless explicitly cached
use migrations
document every status transition
add API-level idempotency for payment/provider callbacks
13) ERD-level relation summary

High-level:

organizations 1—M organization_users
users 1—M organization_users
organization_users 1—1 staff_profiles
staff_profiles 1—1 doctor_profiles
organizations 1—M patients
patients 1—M appointments
patients 1—M encounters
doctor_profiles 1—M appointments
doctor_profiles 1—M encounters
encounters 1—M encounter_services
encounter_services 1—M encounter_product_consumptions
organizations 1—M services
organizations 1—M products
organizations 1—M rooms
rooms M—M services
doctor_profiles M—M services
patients 1—M invoices
invoices 1—M invoice_items
invoices 1—M payments through payment_allocations
organizations 1—M suppliers
organizations 1—M warehouses
products 1—M inventory_batches
products 1—M stock_movements
lead_sources 1—M patient_source_events
14) Final recommendation: split into bounded modules

For maintainability, implement as modules:

Identity & Access
Clinic Management
Patient & Medical Records
Scheduling
Services & Encounters
Billing & Payments
Inventory & Suppliers
Analytics
Audit & Compliance
Integrations

This makes it easier for developers worldwide to understand and extend.

15) Biggest mistakes to avoid

Do not:

mix doctor and user in one messy table
store stock as only one number without movement ledger
make invoices editable after payment without audit/refund logic
let every clinic query every patient without RLS
hard-delete medical records
store everything in one clients table with no encounter/billing separation
skip audit logs for PHI access

Access model
1. Platform Super Admin

Can see and manage everything across the whole platform.

Can:

create new clinics
activate/deactivate clinics
add clinic admins
add global users
assign users into clinics
manage subscription, plans, platform settings
see all reports across clinics
manage platform-wide source integrations if needed
2. Clinic Admin

Can see and manage everything inside only their clinic.

Can:

add doctors and staff to their clinic
manage patients in their clinic
manage rooms
manage services
manage products/goods
manage suppliers
manage invoices/payments
monitor clinic dashboards
assign patients to doctors
set which doctor can perform which service
manage clinic-specific sources like Telegram, Instagram, app redirects

Cannot:

see other clinics
create platform-level settings
control another clinic unless explicitly allowed
3. Doctor

Can work inside their clinic only, but with limited rights.

Can:

view their assigned patients
add visit info / encounter info
add medical notes
add performed services
consume goods/products used during service
create or request invoice items depending on business flow
view their own dashboard and own numbers
maybe see shared clinic patients if clinic policy allows

Cannot by default:

manage all doctors
manage all suppliers
change clinic-wide settings
see full financial data of all clinic unless permission given
edit other doctors’ patients unless permission given
Your flow in simple form

Yes, the structure should evolve like this:

Platform Super Admin
↓
Clinic
↓
Clinic Admin
↓
Doctors / Staff

More correctly in database/business terms:

One platform
Many clinics
Each clinic has one or more clinic admins
Each clinic has one or more doctors/staff
Doctors operate inside clinic scope

Best version for long-term growth

If you want this system to grow properly, use 4 levels, not 3:

Level 1 — Platform Super Admin

Global system owner

Level 2 — Clinic Organization

The clinic company/brand

Level 3 — Branch

Physical location / medical center / филиал

Level 4 — Users inside branch

Clinic Admin, Doctor, Receptionist, Cashier, Warehouse Manager, Nurse

This is stronger than directly doing:

Super Admin
Clinic Super Admin
Doctor Admin

Because later you may need:

one company with 5 branches
doctors only in one branch
warehouse per branch
dashboard per branch
combined dashboard across all branches
Recommended permission interpretation
Platform Super Admin

Full access to all organizations and branches.

Organization Owner / Main Clinic Admin

Can see all branches under their clinic company.

Branch Admin

Can manage one branch only.

Doctor

Can operate on patients, services, notes, goods usage.

Example real flow

Super Admin creates:

Clinic Group: MedLife
Branch 1: MedLife Chilanzar
Branch 2: MedLife Sergeli

Then adds:

Main Clinic Admin for MedLife
Branch Admin for Chilanzar
Branch Admin for Sergeli
Doctors under each branch

This is much cleaner.

Recommendation for your current project

So the answer is:

Yes, Super Admin should be able to add anyone and also create new clinic / new branch.

But I strongly recommend these roles:

Platform Super Admin
Organization Admin or Clinic Owner
Branch Admin
Doctor
Receptionist
Cashier
Warehouse Manager
Nurse

Instead of calling doctor “Doctor Admin”, call them simply Doctor unless they really manage users/settings too.

Final clear answer

Yes:

Super Admin can add anyone to the platform
Super Admin can create new clinic
Super Admin can create new branch
Clinic Admin can manage everything inside own clinic/branch
Doctor can add medical/service-related data and consume goods required for services

Best long-term structure:

Platform Super Admin → Clinic Organization → Branch → Doctor/Staff


Build a modern, scalable, responsive **medical CRM / clinic management SaaS frontend** for web.

## Product goal

Create a professional healthcare platform UI where the hierarchy is:

* **Platform Super Admin**
* **Clinic Organization / Clinic Group**
* **Branch**
* **Clinic Admin**
* **Doctor**
* optional future staff roles: Receptionist, Cashier, Nurse, Warehouse Manager

This is a **multi-tenant medical platform**.

## Main access logic

### Platform Super Admin

Can see and manage all clinics, all branches, all users, all reports, all platform settings.

### Clinic Admin

Can see and manage everything only inside their own clinic / branch:

* patients
* doctors
* services
* rooms
* products / goods
* suppliers
* invoices
* payments
* dashboards
* source tracking

### Doctor

Can only work inside the clinic / branch they belong to:

* see assigned patients
* add consultation / encounter / service information
* add medical notes
* add goods usage for performed services
* see their own numbers and doctor dashboard
* cannot manage global or clinic-wide system settings unless explicit permission is granted

## Design style

Create a **clean medical SaaS UI** with:

* minimalist layout
* high readability
* premium modern B2B healthcare look
* strong spacing and hierarchy
* soft rounded corners
* clean tables
* well-designed filters
* dashboard cards
* chart-based analytics
* light shadows
* no visual clutter
* responsive desktop-first interface with tablet support

## Color palette

Use these colors consistently:

* **Primary Blue:** `#2563EB`
* **White / Main Background:** `#FFFFFF`
* **Third color (accent):** `#14B8A6` (teal)

Supporting neutrals:

* Background light: `#F8FAFC`
* Card background: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Usage rules

* Blue for navigation, active states, links, selected filters, primary actions
* Teal for analytics accents, highlights, positive health/business indicators
* White and light neutrals for cleanliness and trust
* Do not overuse teal
* Keep the interface medical, premium, and calm

## Typography

Use a modern sans-serif style with:

* large section titles
* clear table headers
* readable form labels
* small muted helper text
* strong contrast for key numbers in dashboards

## App structure

Create a full frontend concept including:

* sidebar navigation
* top header
* breadcrumbs
* global search
* notifications area
* profile menu
* responsive tables
* drawer / modal forms
* tabs where suitable
* reusable cards
* charts
* status badges
* medical-friendly clean form layouts

## Main modules and pages

# 1. Authentication

Create:

* Login page
* Forgot password page
* Reset password page

Style:

* clean split-screen or centered card layout
* medical SaaS branding feel
* strong trust-oriented design

# 2. Platform Super Admin panel

Create pages:

## 2.1 Dashboard

Show:

* total clinics
* total branches
* total doctors
* total patients
* total revenue across platform
* active users
* recent activity
* new clinics added
* top performing clinics
* quick stats cards
* revenue trend chart
* clinic growth chart

## 2.2 Clinics management

Table with:

* clinic/group name
* number of branches
* number of doctors
* number of patients
* total revenue
* status
* created date
* actions

Include:

* create clinic button
* create branch button
* assign clinic admin
* search
* filters
* view details page

## 2.3 Branches management

Table with:

* branch name
* clinic/group
* location
* admins
* doctors count
* patient count
* status
* actions

## 2.4 Users management

Table with:

* full name
* role
* clinic
* branch
* phone/email
* status
* last login
* actions

Support:

* invite user
* assign role
* activate/deactivate user

## 2.5 Platform analytics

Show:

* platform revenue
* patient acquisition by source
* clinic comparison
* doctor comparison
* invoice type breakdown
* product consumption trends
* branch performance comparison

## 2.6 Platform settings

Sections:

* global permissions overview
* integrations
* payment methods
* source templates
* branding basics
* audit logs view

# 3. Clinic Admin panel

Create a clinic-scoped interface.

## 3.1 Clinic dashboard

Show filtered period with:

* monthly income by default
* number of clients / patients
* income day-by-day for last 7 days by default
* clients day-by-day for last 7 days by default
* clients by source day-by-day for last 7 days by default
* most active doctors
* income by most active doctors
* patient count by most active doctors
* invoice status statistics: paid, unpaid, draft, cancelled
* warehouse summary
* top services
* top doctors
* top patient source channels

Use cards + line charts + bar charts + donut charts.

## 3.2 Branch / clinic details page

Show:

* clinic name
* branch name
* address
* timezone
* admins
* active doctors
* active rooms
* active services
* status
* quick actions

## 3.3 Patients page

Create a clean patients table with:

* full name
* age
* gender
* phone
* source
* primary doctor
* last visit
* total visits
* total income from patient
* monthly income from patient
* status
* actions

Include:

* search
* filters
* date range filter
* source filter
* doctor filter
* create patient button
* export button

## 3.4 Patient profile page

Design a rich patient profile with tabs:

### Overview tab

Show:

* full name
* age
* height
* weight
* source
* primary doctor
* contact details
* first visit
* last visit
* total times serviced
* total income from this patient
* monthly income from this patient
* patient tags
* alerts/allergies if available

### Medical Documents tab

Show uploaded files list with preview cards.

### Visit / Encounter History tab

Timeline or table of:

* visit date
* doctor
* service
* diagnosis summary
* invoice status
* payment status

### Billing tab

Show:

* invoices
* payments
* outstanding amount
* paid amount
* recent transactions

### Notes tab

Doctor/clinic notes layout.

## 3.5 Doctors page

Table with:

* full name
* profession
* years of experience
* services count
* patients served
* total income by doctor
* monthly income by doctor
* rating
* status
* actions

## 3.6 Doctor profile page

Tabs:

### Overview

* full name
* medical profession
* career start date
* calculated experience years
* clinic/branch
* contact
* rating
* services list

### Patients Served

Table of all patients this doctor served.

### Monthly Patients

Filtered table or stats card view.

### Performance

Show:

* total income by this doctor
* monthly income by this doctor
* total income by this doctor’s patients
* monthly income by this doctor’s patients
* service distribution
* patient trend
* appointment load
* top services

## 3.7 Doctor analytics dashboard for clinic admin

Important page.

Allow filters:

* one doctor
* multiple doctors
* all doctors
* date period
* one service
* multiple services
* all services

Show according to filters:

* Total Patients (Today)
* Average Consultation
* New Patients
* Returning Patients
* Total Income
* Daily Patient Trend (last 7 days by default)
* Doctors Rating
* Age Distribution / Demographics
* Service Distribution
* Highest Times / patient flow heatmap (24 hours x 7 days)

Create this page as a very strong analytics dashboard.

## 3.8 Services page

Table and management UI for:

* service name
* category
* price
* duration
* room requirement
* doctor requirement
* linked goods/products used
* status

Support create/edit/delete UI.

## 3.9 Rooms page

Table/cards with:

* room name
* room type
* floor
* available services
* assigned doctors
* status

## 3.10 Products / Goods page

Warehouse/inventory page with:

* product name
* category
* SKU
* unit
* current stock
* min stock
* purchase price
* selling price
* product type
* expiry if relevant
* status

Include:

* low stock warnings
* stock badges
* filters
* product detail page

## 3.11 Warehouse statistics page

Show:

* general indicators in the clinic
* date filters
* Kirim vs Chiqim
* total left goods
* total spent
* total output
* top spent goods
* few remainings / low stock items
* stock movement chart
* category consumption chart

## 3.12 Suppliers page

Table:

* supplier name
* contact
* products count
* total orders
* recent supply date
* status
* actions

## 3.13 Supplier detail page

Show:

* supplier profile
* linked products
* purchase history
* total supplied value
* recent orders
* notes

## 3.14 Invoices page

Table with:

* invoice number
* patient
* doctor
* date
* total
* paid
* due
* status

Statuses:

* paid
* unpaid
* draft
* cancelled

Include filters and invoice detail drawer/page.

## 3.15 Invoice creation flow

Design invoice creation UI where:

* selected services and products are linked
* service lines can be added from encounter/treatment
* product lines can be added if sold
* totals auto-calculate
* status badges are visible
* payment action available

## 3.16 Payments page

Show:

* payment records
* provider
* method
* invoice
* patient
* amount
* date
* success/failure/refund status

## 3.17 Sources page

Manage patient acquisition sources such as:

* app
* telegram
* instagram
* website
* referral
* manual / walk-in

Show:

* source name
* type
* linked patients
* conversions
* revenue generated
* activity over time

# 4. Doctor panel

Design a simpler role-based workspace for doctor users.

## 4.1 Doctor dashboard

Show only doctor-related numbers:

* today’s patients
* total patients
* new patients
* returning patients
* own income
* monthly income
* recent consultations
* upcoming appointments
* top services
* personal trend charts

## 4.2 My Patients

Table/list of assigned or accessible patients.

## 4.3 Patient detail

Doctor-oriented view:

* patient profile summary
* clinical notes
* visit history
* documents
* service records

## 4.4 Add consultation / encounter

Create a clean medical form where doctor can:

* choose patient
* add diagnosis summary
* add clinical notes
* select performed services
* add service quantities
* add goods/products consumed during service
* complete encounter

## 4.5 Goods usage during service

Important UI:
doctor can record what goods were used for a service.
Show:

* service
* linked required goods
* quantity used
* stock availability
* warnings for low stock

## 4.6 My performance

Show:

* patients served
* monthly patients
* income by doctor
* income by doctor’s patients
* service performance
* schedule load
* ratings if available

# 5. Reusable UI patterns

Build reusable design system components:

* stat cards
* KPI cards
* line chart cards
* bar chart cards
* donut chart cards
* tables with advanced filtering
* patient mini-card
* doctor mini-card
* status badges
* invoice status badges
* payment status badges
* stock warning badges
* source badges
* empty states
* search bars
* modal forms
* drawers
* multi-select filters
* date range picker
* tabs
* activity timeline

# 6. Navigation

Build only the **Super Admin Dashboard page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its local reusable components needed for this page**.
Do **not** generate Clinics page, Branches page, Users page, Analytics page, or Settings page yet.
Do **not** create unrelated subpages.
Keep the layout ready so future pages can be added without changing root structure.

---

## Root path structure

This project must follow this route hierarchy exactly:

* `/auth/login`
* `/super-admin`

  * `/super-admin/dashboard`
  * `/super-admin/clinics`
  * `/super-admin/branches`
  * `/super-admin/users`
  * `/super-admin/analytics`
  * `/super-admin/settings`

For this task, generate only:

* **Page route:** `/super-admin/dashboard`

This page belongs inside the **Super Admin layout**.

---

## Parent layout rules

Create a reusable **Super Admin App Layout** that will be reused by all future Super Admin pages.

### Layout requirements

* left sidebar navigation
* top header
* breadcrumb area
* main content container
* responsive desktop-first layout
* tablet-friendly behavior
* clean medical SaaS style

### Sidebar items

Show these sidebar items exactly in this order:

1. Dashboard
2. Clinics
3. Branches
4. Users
5. Analytics
6. Settings

Only **Dashboard** should be active for now.

### Header area

Include:

* page title
* global search input
* notification icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Super Admin / Dashboard`

---

## Product context

This is a **medical CRM / clinic management SaaS**.

Hierarchy:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor

The Super Admin can see all clinics, all branches, all doctors, all patients, all global analytics, and all platform-level operations.

---

## Design style

Create a **clean premium healthcare admin dashboard** with:

* white and blue dominant UI
* calm medical B2B look
* strong spacing
* soft corners
* professional card design
* subtle shadows
* clean charts
* no clutter
* high readability
* dashboard-first information hierarchy

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary navigation, active states, buttons, key links
* Teal for positive analytics accents and supporting highlights
* White/light background for cleanliness
* Keep interface medical and premium

---

## Dashboard page goal

Design the **main Super Admin overview page**.

This page should instantly answer:

* how the whole platform is performing
* how many clinics and branches exist
* whether growth is increasing
* what recent activity happened
* which clinics are performing best

---

## Dashboard route definition

* **Route:** `/super-admin/dashboard`
* **Page name:** Super Admin Dashboard
* **Layout parent:** Super Admin App Layout
* **Sidebar active item:** Dashboard

---

## Dashboard content sections

### 1. Top summary KPI cards

Create a top row of KPI/stat cards for:

* Total Clinics
* Total Branches
* Total Doctors
* Total Patients
* Total Revenue
* Active Users

Each card should include:

* label
* large number
* small trend indicator
* small contextual helper text
* simple icon
* clean compact premium card design

---

### 2. Revenue trend section

Create a large analytics card with:

* title: `Platform Revenue Trend`
* line chart for platform revenue over time
* date range filter on card header
* optional compare indicator vs previous period

---

### 3. Clinic growth section

Create a card with:

* title: `Clinic Growth`
* chart showing new clinics/branches added over time
* visually separate clinic growth from revenue growth

---

### 4. Top performing clinics

Create a ranked/table-card section:

* clinic/group name
* branches count
* doctors count
* patients count
* revenue
* growth indicator
* status badge

This should feel like a preview section that later can connect to `/super-admin/clinics`.

---

### 5. Recent activity feed

Create an activity timeline/card showing example items such as:

* new clinic created
* new branch added
* clinic admin invited
* doctor added
* payment integration connected
* source connected

Each activity item should have:

* icon
* title
* short description
* timestamp
* subtle layout

---

### 6. Quick actions area

Create a compact quick actions section with buttons:

* Create Clinic
* Create Branch
* Invite User
* View Analytics

Buttons can visually suggest future navigation, but do not build those pages now.

---

### 7. Platform health / system overview

Create a small section/cards for:

* active clinics
* inactive clinics
* pending invites
* connected sources
* successful payment integrations
* warning or alert area if needed

Keep it visually calm and useful.

---

## Components to create for this page only

Create only the minimum reusable components needed for this page, such as:

* Super Admin Layout
* Sidebar
* Top Header
* Breadcrumb
* KPI Stat Card
* Analytics Card
* Activity Feed Card
* Top Clinics Table/Card
* Quick Action Button Group

Do not create full shared app-wide design system yet beyond what this page needs.

---

## Data behavior

Use realistic mock data relevant to a medical CRM SaaS:

* clinics
* branches
* doctors
* patients
* revenue
* activity logs

Make the mock data look believable for a healthcare operations platform.

---

## Responsive behavior

Desktop-first.
On smaller screens:

* sidebar can collapse
* KPI cards wrap cleanly
* charts remain readable
* tables/cards stack properly

---

## UX notes

* make the dashboard feel executive-level
* this is not a clinic dashboard, it is a platform-wide admin dashboard
* emphasize overview, monitoring, and platform control
* keep information hierarchy very clear
* avoid too many tiny widgets
* use whitespace well

---

## Important future compatibility rule

This page must be built so future pages can be added under the same root without changing structure:

Future pages that will come later:

* `/super-admin/clinics`
* `/super-admin/branches`
* `/super-admin/users`
* `/super-admin/analytics`
* `/super-admin/settings`

Do not redesign the route root later.
Do not rename the layout later.
Do not merge this dashboard into another route.

---

## Final output expectation

Generate a polished frontend page for:

* `Super Admin App Layout`
* `Super Admin Dashboard` at `/super-admin/dashboard`

Only this page and its directly required layout/components.


Build only the **Super Admin Clinics Management page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and any small local components needed for this page**.
Assume the **Super Admin App Layout** already exists from the previous page.
Do **not** redesign the root layout.
Do **not** generate Dashboard, Branches, Users, Analytics, or Settings pages now.
Do **not** change existing route structure.

---

## Root path structure

This project must follow this route hierarchy exactly:

* `/auth/login`
* `/super-admin`

  * `/super-admin/dashboard`
  * `/super-admin/clinics`
  * `/super-admin/branches`
  * `/super-admin/users`
  * `/super-admin/analytics`
  * `/super-admin/settings`

For this task, generate only:

* **Page route:** `/super-admin/clinics`

This page belongs inside the existing **Super Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Super Admin App Layout
* left sidebar
* top header
* breadcrumb area

Do not rebuild them from scratch unless needed for consistency.
Use the same visual language and navigation structure as `/super-admin/dashboard`.

---

## Sidebar state

Sidebar items must remain exactly:

1. Dashboard
2. Clinics
3. Branches
4. Users
5. Analytics
6. Settings

For this page:

* **Clinics** must be active
* others inactive

---

## Header and breadcrumb

### Header

Keep:

* page title
* global search
* notifications
* profile dropdown

### Breadcrumb

Show:

* `Super Admin / Clinics`

---

## Product context

This is a **platform-level clinic management page** for a medical CRM SaaS.

The Platform Super Admin manages:

* clinic organizations / clinic groups
* clinic-level admins
* high-level clinic status
* clinic growth and health
* onboarding of new clinics into the platform

This page is for **managing clinic organizations**, not individual branches.

A clinic organization may contain one or more branches.

---

## Design style

Create a **premium healthcare B2B management page** with:

* clean white and blue interface
* enterprise-grade table design
* professional spacing
* soft card containers
* modern filters
* subtle status colors
* readable data-heavy layout
* polished SaaS admin feel

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* blue for actions, active states, links, selected filters
* teal for supportive highlights and positive insights
* success/warning/danger only for status meaning
* keep the page visually calm and premium

---

## Route definition

* **Route:** `/super-admin/clinics`
* **Page name:** Clinics Management
* **Layout parent:** Super Admin App Layout
* **Sidebar active item:** Clinics

---

## Main page goal

This page should help the Super Admin:

* see all clinic organizations
* search clinics quickly
* filter clinics by status or performance
* create a new clinic
* assign clinic admins
* open a clinic detail view
* understand clinic size and business performance at a glance

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Clinics`
* short supporting subtitle describing this page as platform-wide clinic organization management
* primary action button: `Create Clinic`
* secondary action button: `Create Branch`
* optional tertiary action: `Export`

This top area should feel executive and operational.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* status filter
* revenue range filter
* clinic size filter
* created date filter
* sort dropdown
* reset filters button

### Suggested status options

* Active
* Inactive
* Pending Setup
* Suspended

### Suggested clinic size filter

* Small
* Medium
* Large
* Enterprise

---

### 3. Clinics data table

Create a premium responsive management table.

Columns:

* Clinic / Group Name
* Number of Branches
* Number of Doctors
* Number of Patients
* Total Revenue
* Status
* Created Date
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View Details
* Assign Clinic Admin
* Create Branch
* Edit Clinic
* Activate / Deactivate

Do not create the actual destination pages yet, but structure actions cleanly.

---

### 4. Clinic summary cards above or around table

Add a compact overview strip or mini KPI section for this page:

* Total Clinics
* Active Clinics
* Pending Setup
* Suspended Clinics

Keep it smaller than the dashboard KPI cards.

---

### 5. Empty state

Design a polished empty state for cases when no clinics exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Create Clinic button

---

### 6. Create Clinic modal or drawer

Design a clean UI for creating a clinic organization.

Fields:

* Clinic / Group Name
* Legal Name
* Main Contact Name
* Main Contact Phone
* Main Contact Email
* Country
* Timezone
* Currency
* Address
* Initial Status

Actions:

* Cancel
* Save Clinic

Keep this as a clean admin form, not a public-facing onboarding flow.

---

### 7. Assign Clinic Admin modal

Design a modal/drawer for assigning a clinic admin.

Fields:

* Clinic Name (read-only or selected)
* Full Name
* Email
* Phone
* Role
* Send Invite toggle

Actions:

* Cancel
* Assign Admin

---

### 8. Create Branch quick action entry point

Since this is the Clinics page, provide a clear entry point to create a branch related to a clinic.

You may include:

* button in row action menu
* top page button
* quick modal trigger

But do not generate the full Branches page yet.

---

## Clinic card / table data realism

Use believable medical SaaS mock data such as:

* clinic organizations with professional names
* realistic branch counts
* realistic doctor counts
* patient counts
* revenue values
* status states

Examples can feel like:

* multi-branch clinic group
* specialty clinic group
* premium medical center group

---

## UX expectations

The user should quickly understand:

* which clinics are active
* which clinics are large or high-performing
* which clinics may need setup or admin assignment
* what action to take next

This is a platform control page, so it should feel powerful but not crowded.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Clinics Table
* Status Badge
* Action Dropdown
* Create Clinic Modal
* Assign Admin Modal
* Empty State

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert wide table gracefully
* filters can wrap into rows
* action buttons stay usable
* modals remain readable
* important information remains visible

---

## Future compatibility rule

This page must remain compatible with the following existing/future routes:

* `/super-admin/dashboard`
* `/super-admin/clinics`
* `/super-admin/branches`
* `/super-admin/users`
* `/super-admin/analytics`
* `/super-admin/settings`

Do not rename route paths.
Do not move Clinics under another section.
Do not merge clinics with branches.

Clinics page = clinic organizations only.
Branches page = branch entities separately.

---

## Final output expectation

Generate a polished frontend page for:

* `Super Admin Clinics Management`
* route: `/super-admin/clinics`

Reuse the existing Super Admin layout and keep route structure clean for future pages.

Build only the **Super Admin Branches Management page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and any small local components needed for this page**.
Assume the **Super Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Dashboard, Clinics, Users, Analytics, or Settings pages now.
Do **not** change existing route structure.

---

## Root path structure

This project must follow this route hierarchy exactly:

* `/auth/login`
* `/super-admin`

  * `/super-admin/dashboard`
  * `/super-admin/clinics`
  * `/super-admin/branches`
  * `/super-admin/users`
  * `/super-admin/analytics`
  * `/super-admin/settings`

For this task, generate only:

* **Page route:** `/super-admin/branches`

This page belongs inside the existing **Super Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Super Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared page styling from dashboard and clinics pages

Do not rebuild them from scratch unless needed for consistency.
Use the same visual language and navigation structure as the previous Super Admin pages.

---

## Sidebar state

Sidebar items must remain exactly:

1. Dashboard
2. Clinics
3. Branches
4. Users
5. Analytics
6. Settings

For this page:

* **Branches** must be active
* others inactive

---

## Header and breadcrumb

### Header

Keep:

* page title
* global search
* notifications
* profile dropdown

### Breadcrumb

Show:

* `Super Admin / Branches`

---

## Product context

This is a **platform-level branch management page** for a medical CRM SaaS.

A **Clinic / Group** can contain one or more **Branches**.

This page is specifically for managing **branch entities**, not clinic organizations.

Each branch should be understood as a physical or operational unit such as:

* one clinic location
* one medical center location
* one филиал / branch office

The Platform Super Admin uses this page to:

* monitor all branches across all clinics
* compare branch scale and activity
* create new branches
* assign branch-level admins if needed
* see which clinic each branch belongs to
* monitor branch operational status

---

## Design style

Create a **premium healthcare B2B management page** with:

* clean white and blue interface
* enterprise-grade table design
* subtle medical SaaS visual language
* professional spacing
* soft card containers
* modern filters
* readable data-heavy layout
* polished branch operations management feel

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* blue for active states, links, actions, selected filters
* teal for supportive highlights
* success/warning/danger only for meaningful status states
* keep the interface calm, premium, and operational

---

## Route definition

* **Route:** `/super-admin/branches`
* **Page name:** Branches Management
* **Layout parent:** Super Admin App Layout
* **Sidebar active item:** Branches

---

## Main page goal

This page should help the Super Admin:

* see all branches across all clinic organizations
* understand which clinic each branch belongs to
* search and filter branches
* create a new branch
* monitor size and operational health of branches
* assign or review branch admins
* open a branch detail view later without changing route structure

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Branches`
* short supporting subtitle describing this page as platform-wide branch management
* primary action button: `Create Branch`
* secondary action button: `Export`

This top area should feel operational and structured.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* clinic/group filter
* location filter
* status filter
* branch size filter
* created date filter
* sort dropdown
* reset filters button

### Suggested status options

* Active
* Inactive
* Pending Setup
* Suspended

### Suggested branch size filter

* Small
* Medium
* Large

---

### 3. Branches data table

Create a premium responsive management table.

Columns:

* Branch Name
* Clinic / Group
* Location
* Admins
* Doctors Count
* Patients Count
* Status
* Created Date
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View Details
* Assign Branch Admin
* Edit Branch
* Activate / Deactivate

Do not create the destination pages yet, but structure actions clearly.

---

### 4. Branch summary cards above or around table

Add a compact overview strip or mini KPI section for this page:

* Total Branches
* Active Branches
* Pending Setup
* Suspended Branches

Keep this lighter than the main dashboard KPI section.

---

### 5. Branch quick insights area

Add a small insights section or side panel with useful branch-level operational signals such as:

* branch with highest doctor count
* branch with highest patient count
* newest branch added
* clinic group with most branches

Keep it concise and executive-friendly.

---

### 6. Empty state

Design a polished empty state for cases when no branches exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Create Branch button

---

### 7. Create Branch modal or drawer

Design a clean UI for creating a branch.

Fields:

* Branch Name
* Clinic / Group
* Branch Code
* Country
* City / Region
* Full Address
* Timezone
* Main Contact Name
* Main Contact Phone
* Main Contact Email
* Initial Status

Actions:

* Cancel
* Save Branch

Keep this as an admin setup form.

---

### 8. Assign Branch Admin modal

Design a modal/drawer for assigning a branch admin.

Fields:

* Branch Name (read-only or selected)
* Full Name
* Email
* Phone
* Role
* Send Invite toggle

Actions:

* Cancel
* Assign Admin

---

## Data realism

Use believable medical SaaS mock data for branches such as:

* clinic group names
* branch locations
* doctor counts
* patient counts
* branch statuses
* admins count

Examples should look like real healthcare organizations, not generic fake data.

---

## UX expectations

The user should quickly understand:

* where each branch belongs
* which branches are active
* which branches are large or growing
* which branches still need setup/admin assignment
* what action to take next

This is a platform control page, so it should feel organized, powerful, and clean.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Branches Table
* Status Badge
* Action Dropdown
* Create Branch Modal
* Assign Branch Admin Modal
* Empty State
* Branch Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert wide table gracefully
* filters wrap properly
* action buttons remain accessible
* modals remain readable
* critical fields stay visible

---

## Future compatibility rule

This page must remain compatible with the following existing/future routes:

* `/super-admin/dashboard`
* `/super-admin/clinics`
* `/super-admin/branches`
* `/super-admin/users`
* `/super-admin/analytics`
* `/super-admin/settings`

Do not rename route paths.
Do not move branches under another section.
Do not merge branches with clinics.

Clinics page = clinic organizations only.
Branches page = branch entities only.

---

## Final output expectation

Generate a polished frontend page for:

* `Super Admin Branches Management`
* route: `/super-admin/branches`

Reuse the existing Super Admin layout and keep route structure clean for future pages.


Build only the **Super Admin Users Management page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and any small local components needed for this page**.
Assume the **Super Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Dashboard, Clinics, Branches, Analytics, or Settings pages now.
Do **not** change existing route structure.

---

## Root path structure

This project must follow this route hierarchy exactly:

* `/auth/login`
* `/super-admin`

  * `/super-admin/dashboard`
  * `/super-admin/clinics`
  * `/super-admin/branches`
  * `/super-admin/users`
  * `/super-admin/analytics`
  * `/super-admin/settings`

For this task, generate only:

* **Page route:** `/super-admin/users`

This page belongs inside the existing **Super Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Super Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared page styling from previous Super Admin pages

Do not rebuild them from scratch unless needed for consistency.
Use the same visual language and navigation structure as the previous Super Admin pages.

---

## Sidebar state

Sidebar items must remain exactly:

1. Dashboard
2. Clinics
3. Branches
4. Users
5. Analytics
6. Settings

For this page:

* **Users** must be active
* others inactive

---

## Header and breadcrumb

### Header

Keep:

* page title
* global search
* notifications
* profile dropdown

### Breadcrumb

Show:

* `Super Admin / Users`

---

## Product context

This is a **platform-level users management page** for a medical CRM SaaS.

The Platform Super Admin manages all users across the platform, including:

* clinic admins
* branch admins
* doctors
* optional future staff users such as receptionist, cashier, nurse, warehouse manager

This page is for:

* viewing all platform users
* assigning roles
* connecting users to clinics and branches
* inviting new users
* activating/deactivating users
* monitoring account status and last login

This is not a patient page and not a doctor performance page.
It is a platform identity and role management page.

---

## Design style

Create a **premium healthcare B2B users management page** with:

* clean white and blue interface
* enterprise-grade table design
* professional spacing
* soft card containers
* modern filters
* polished role/status badges
* readable data-heavy layout
* calm medical SaaS visual language

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* blue for active states, actions, links, selected filters
* teal for supporting highlights
* success/warning/danger only for user/account status meaning
* keep interface premium, structured, and operational

---

## Route definition

* **Route:** `/super-admin/users`
* **Page name:** Users Management
* **Layout parent:** Super Admin App Layout
* **Sidebar active item:** Users

---

## Main page goal

This page should help the Super Admin:

* see all users across the platform
* understand each user’s role
* know which clinic and branch they belong to
* invite new users
* assign roles
* activate or deactivate users
* quickly search and filter accounts
* monitor account readiness and usage

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Users`
* short supporting subtitle describing this as platform-wide user and role management
* primary action button: `Invite User`
* secondary action button: `Export`

This top area should feel operational and administrative.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* role filter
* clinic/group filter
* branch filter
* status filter
* last login filter
* sort dropdown
* reset filters button

### Suggested role options

* Clinic Admin
* Branch Admin
* Doctor
* Receptionist
* Cashier
* Nurse
* Warehouse Manager

### Suggested status options

* Active
* Invited
* Suspended
* Inactive

---

### 3. Users data table

Create a premium responsive management table.

Columns:

* Full Name
* Role
* Clinic / Group
* Branch
* Phone / Email
* Status
* Last Login
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* role badges
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View User
* Edit Role
* Reassign Clinic / Branch
* Resend Invite
* Activate / Deactivate
* Suspend User

Do not create separate destination pages yet, but structure actions cleanly.

---

### 4. Users summary cards above or around table

Add a compact overview strip or mini KPI section for this page:

* Total Users
* Active Users
* Pending Invites
* Suspended Users

Keep it smaller than dashboard KPI cards.

---

### 5. Invite User modal or drawer

Design a clean UI for inviting a new platform user.

Fields:

* Full Name
* Email
* Phone
* Role
* Clinic / Group
* Branch
* Send Invite toggle
* Optional Notes

Actions:

* Cancel
* Send Invite

Behavior rules:

* branch options should depend on selected clinic/group
* some roles may require branch assignment
* clinic admin may be clinic-level, not branch-level

---

### 6. Edit Role / Assignment modal

Design a modal/drawer for updating a user’s access.

Fields:

* Full Name (read-only)
* Role
* Clinic / Group
* Branch
* Status
* Optional Notes

Actions:

* Cancel
* Save Changes

This should clearly communicate hierarchy:

* clinic-level role
* branch-level role
* doctor belongs inside a clinic/branch structure

---

### 7. User quick insights area

Add a small side or top insights section showing useful signals such as:

* most common role
* clinic with most users
* branch with highest staff count
* recently invited users count

Keep it concise and executive-friendly.

---

### 8. Empty state

Design a polished empty state for cases when no users exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Invite User button

---

## Data realism

Use believable medical SaaS mock data such as:

* realistic healthcare staff names
* clear roles
* clinic groups and branches
* invite states
* last login timestamps
* admin/doctor/staff distribution

Make the data feel like a real healthcare operations platform.

---

## UX expectations

The user should quickly understand:

* who is on the platform
* what access each user has
* which clinic/branch they belong to
* which users are active vs pending
* what action to take next

This page should feel like a serious access-management page, not a generic contacts list.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Users Table
* Role Badge
* Status Badge
* Action Dropdown
* Invite User Modal
* Edit Role Modal
* Empty State
* User Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert wide table gracefully
* filters wrap properly
* action buttons remain accessible
* modals remain readable
* key identity and access fields stay visible

---

## Future compatibility rule

This page must remain compatible with the following existing/future routes:

* `/super-admin/dashboard`
* `/super-admin/clinics`
* `/super-admin/branches`
* `/super-admin/users`
* `/super-admin/analytics`
* `/super-admin/settings`

Do not rename route paths.
Do not move users under another section.
Do not merge this page with clinic or branch pages.

Users page = platform user identity and access management only.

---

## Final output expectation

Generate a polished frontend page for:

* `Super Admin Users Management`
* route: `/super-admin/users`

Reuse the existing Super Admin layout and keep route structure clean for future pages.


Build only the **Super Admin Analytics page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and any small local components needed for this page**.
Assume the **Super Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Dashboard, Clinics, Branches, Users, or Settings pages now.
Do **not** change existing route structure.

---

## Root path structure

This project must follow this route hierarchy exactly:

* `/auth/login`
* `/super-admin`

  * `/super-admin/dashboard`
  * `/super-admin/clinics`
  * `/super-admin/branches`
  * `/super-admin/users`
  * `/super-admin/analytics`
  * `/super-admin/settings`

For this task, generate only:

* **Page route:** `/super-admin/analytics`

This page belongs inside the existing **Super Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Super Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared page styling from previous Super Admin pages

Do not rebuild them from scratch unless needed for consistency.
Use the same visual language and navigation structure as the previous Super Admin pages.

---

## Sidebar state

Sidebar items must remain exactly:

1. Dashboard
2. Clinics
3. Branches
4. Users
5. Analytics
6. Settings

For this page:

* **Analytics** must be active
* others inactive

---

## Header and breadcrumb

### Header

Keep:

* page title
* global search
* notifications
* profile dropdown

### Breadcrumb

Show:

* `Super Admin / Analytics`

---

## Product context

This is a **platform-level analytics page** for a medical CRM SaaS.

The Platform Super Admin needs a high-level analytics page to monitor:

* platform revenue
* clinic performance comparison
* branch performance comparison
* doctor comparison at platform level
* patient acquisition by source
* invoice status distribution
* product / goods consumption trends
* growth over time

This is a global analytics page across the whole platform, not a single clinic dashboard.

---

## Design style

Create a **premium healthcare B2B analytics page** with:

* clean white and blue interface
* executive-level analytics design
* strong chart hierarchy
* professional spacing
* soft card containers
* modern filter controls
* data-rich but not cluttered layout
* calm medical SaaS visual language

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* blue for primary charts, active states, links, filters, actions
* teal for secondary analytics emphasis and positive highlights
* success/warning/danger for meaningful business status indicators only
* keep the page premium, clean, and analytical

---

## Route definition

* **Route:** `/super-admin/analytics`
* **Page name:** Platform Analytics
* **Layout parent:** Super Admin App Layout
* **Sidebar active item:** Analytics

---

## Main page goal

This page should help the Super Admin:

* understand total platform performance
* compare clinics and branches
* understand acquisition channels
* monitor revenue and growth trends
* see invoice health
* observe doctor and service activity at a strategic level
* identify strong and weak operational areas quickly

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Analytics`
* short supporting subtitle describing this as platform-wide business and operational analytics
* primary action button: `Export Report`
* secondary action button: `Save View`

This area should feel executive and analytical.

---

### 2. Global filter toolbar

Create a modern analytics filter toolbar containing:

* date range picker
* clinic/group multi-select filter
* branch multi-select filter
* source multi-select filter
* service multi-select filter
* sort/view dropdown if useful
* reset filters button

This filter bar should look strong, premium, and dashboard-friendly.

---

### 3. Top KPI cards

Add a KPI row for:

* Total Revenue
* Total Patients
* Total Clinics
* Total Branches
* Active Doctors
* Average Revenue per Clinic

Each KPI card should include:

* title
* large value
* trend indicator
* small helper text
* clean icon treatment

Keep these more analytics-focused than the dashboard summary cards.

---

### 4. Revenue analytics section

Create a large primary analytics area with:

#### 4.1 Platform Revenue Trend

* line or area chart
* date-based trend
* compare against previous period if suitable

#### 4.2 Revenue by Clinic

* bar chart or ranked comparison card
* compare top clinics by revenue

#### 4.3 Revenue by Branch

* separate chart/card for branch-level revenue comparison

This section should communicate platform financial performance quickly.

---

### 5. Patient acquisition by source

Create a dedicated section showing:

* patient acquisition by source
* revenue contribution by source
* source trend over time

Sources may include:

* app
* telegram
* instagram
* website
* referral
* walk-in / manual

Suggested visualization:

* donut chart for distribution
* bar chart for comparison
* line chart for trend if useful

---

### 6. Clinic comparison section

Create an executive comparison area for clinics.

Possible fields:

* clinic/group name
* revenue
* branches
* doctors
* patients
* growth %
* average revenue per patient

This can be a chart + ranked table/card combination.

---

### 7. Doctor comparison section

Create a platform-level doctor comparison card or chart section.

Show example platform metrics such as:

* total income generated
* patients served
* average rating
* top services
* clinic/branch association

This should not look like a profile page.
It should look like comparative analytics.

---

### 8. Invoice status breakdown

Create a section showing invoice health across the platform.

Statuses:

* paid
* unpaid
* draft
* cancelled

Suggested display:

* donut or segmented chart
* summary values
* percentages
* optional trend vs previous period

---

### 9. Product / goods consumption trends

Create a section for platform warehouse or goods analytics.

Show:

* top consumed goods
* goods usage trend over time
* branches with highest goods usage
* low-stock or high-consumption alert indicator if helpful

Keep it platform-level, not too warehouse-technical.

---

### 10. Branch performance comparison

Create a dedicated section to compare branch performance across clinics.

Metrics can include:

* patients count
* doctors count
* revenue
* growth
* utilization indicator

Use a chart and/or ranked list.

---

### 11. Insight cards / highlights panel

Add a concise strategic insights panel with example signals such as:

* top growing clinic
* top performing branch
* strongest acquisition source
* highest revenue doctor group
* unusual invoice risk or unpaid ratio

Keep it concise, executive, and useful.

---

### 12. Empty state / no data state

Design a polished empty state for cases when filters return no data.

Show:

* icon or illustration area
* short message
* helpful text
* reset filters action

---

## Data realism

Use believable medical SaaS mock analytics data such as:

* realistic clinic and branch names
* realistic patient volume ranges
* realistic doctor counts
* plausible revenue values
* realistic acquisition channels
* believable invoice distributions
* credible product consumption data

Make the analytics feel like a real healthcare operations platform.

---

## UX expectations

The user should quickly understand:

* how the overall platform is performing
* which clinics and branches are strongest
* where patients are coming from
* whether revenue is growing
* whether invoice health is good or risky
* which areas require attention

This page must feel executive, strategic, and clean.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Analytics Filter Toolbar
* KPI Stat Card
* Chart Card
* Comparison Table/Card
* Insight Card
* Empty State

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* KPI cards wrap cleanly
* chart cards stack properly
* filters wrap into multiple lines
* comparison tables degrade gracefully
* analytics remain readable

---

## Future compatibility rule

This page must remain compatible with the following existing/future routes:

* `/super-admin/dashboard`
* `/super-admin/clinics`
* `/super-admin/branches`
* `/super-admin/users`
* `/super-admin/analytics`
* `/super-admin/settings`

Do not rename route paths.
Do not merge analytics into dashboard.
Do not move analytics under another section.

Analytics page = strategic platform-wide analytics only.

---

## Final output expectation

Generate a polished frontend page for:

* `Super Admin Analytics`
* route: `/super-admin/analytics`

Reuse the existing Super Admin layout and keep route structure clean for future pages.


Build only the **Super Admin Settings page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and any small local components needed for this page**.
Assume the **Super Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Dashboard, Clinics, Branches, Users, or Analytics pages now.
Do **not** change existing route structure.

---

## Root path structure

This project must follow this route hierarchy exactly:

* `/auth/login`
* `/super-admin`

  * `/super-admin/dashboard`
  * `/super-admin/clinics`
  * `/super-admin/branches`
  * `/super-admin/users`
  * `/super-admin/analytics`
  * `/super-admin/settings`

For this task, generate only:

* **Page route:** `/super-admin/settings`

This page belongs inside the existing **Super Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Super Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared page styling from previous Super Admin pages

Do not rebuild them from scratch unless needed for consistency.
Use the same visual language and navigation structure as the previous Super Admin pages.

---

## Sidebar state

Sidebar items must remain exactly:

1. Dashboard
2. Clinics
3. Branches
4. Users
5. Analytics
6. Settings

For this page:

* **Settings** must be active
* others inactive

---

## Header and breadcrumb

### Header

Keep:

* page title
* global search
* notifications
* profile dropdown

### Breadcrumb

Show:

* `Super Admin / Settings`

---

## Product context

This is a **platform-level settings page** for a medical CRM SaaS.

The Platform Super Admin uses this page to manage global system configuration across the platform.

This page must support configuration areas such as:

* global permissions overview
* integrations
* payment methods
* source templates
* branding basics
* audit logs view

This is not a clinic settings page.
It is a platform governance and configuration page.

---

## Design style

Create a **premium healthcare B2B settings page** with:

* clean white and blue interface
* structured enterprise settings layout
* premium card sections
* tabbed or sectioned settings architecture
* professional spacing
* calm medical SaaS visual language
* readable configuration forms
* polished admin controls

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* blue for active tabs, primary actions, selected states
* teal for supportive highlights
* danger only for risky/destructive settings
* keep the interface structured, calm, and premium

---

## Route definition

* **Route:** `/super-admin/settings`
* **Page name:** Platform Settings
* **Layout parent:** Super Admin App Layout
* **Sidebar active item:** Settings

---

## Main page goal

This page should help the Super Admin:

* configure global system behavior
* manage integrations and payment providers
* define source templates
* review permission structure
* adjust basic platform branding
* access audit logs in an organized way

The page should feel like a serious control center.

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Settings`
* short supporting subtitle describing this as platform-wide configuration and governance
* primary action button: `Save Changes`
* secondary action button: `Discard Changes`

This area should feel administrative and structured.

---

### 2. Settings navigation structure

Create the settings page with either:

* left inner settings navigation, or
* horizontal tabs, or
* sectioned card layout with tab switching

Use one clean approach and keep it scalable.

The settings sections must be:

1. Global Permissions
2. Integrations
3. Payment Methods
4. Source Templates
5. Branding
6. Audit Logs

Do not create unrelated settings sections.

---

## Section 1: Global Permissions

Create a settings section for **global permissions overview**.

Show:

* role categories
* permissions summary by role
* permission group cards or matrix
* role labels such as:

  * Platform Super Admin
  * Clinic Admin
  * Branch Admin
  * Doctor
  * Receptionist
  * Cashier
  * Nurse
  * Warehouse Manager

Important:

* This section is an **overview / management UI**
* it can look like a permission matrix or grouped access cards
* do not overcomplicate with deeply technical ACL visuals
* make it admin-readable

Include actions like:

* Edit Role Permissions
* View Role Scope

You may represent permissions in grouped modules such as:

* Clinics
* Branches
* Users
* Patients
* Doctors
* Invoices
* Payments
* Warehouse
* Sources
* Reports
* Settings

---

## Section 2: Integrations

Create a clean integrations management section.

Show integration cards or rows for examples like:

* Telegram
* Instagram
* Website / API
* Mobile App redirect source
* Payment Gateway
* Email Service
* SMS Provider

Each integration item can show:

* integration name
* category
* status
* last sync or connection state
* configure button
* enable/disable toggle

Include a polished integration settings modal/drawer if useful.

---

## Section 3: Payment Methods

Create a settings section for global payment methods.

Show supported payment methods such as:

* Cash
* Card
* Bank Transfer
* Click
* Payme
* Insurance

Each payment method item can include:

* method name
* provider type
* status
* processing status
* enable/disable toggle
* edit action

Include a clean form/modal for:

* adding or configuring a payment method
* provider credentials fields
* status toggle
* environment selection if useful

Do not make it too technical, but make it enterprise-ready.

---

## Section 4: Source Templates

Create a section for global patient source templates.

Sources may include:

* App
* Telegram
* Instagram
* Website
* Referral
* Walk-in / Manual
* Partner / Campaign

Show:

* source name
* source type
* status
* linked clinics count or availability scope
* edit action

Add a form/modal to:

* create source template
* edit source template
* set active/inactive
* define description or default label

This is platform-level template management, not clinic-level source performance analytics.

---

## Section 5: Branding

Create a simple platform branding section.

Show editable fields such as:

* Platform Name
* Logo upload area
* Favicon upload area
* Primary Color
* Accent Color
* Email sender name
* Support email

Keep it basic and professional.
This is branding basics, not a full design system editor.

---

## Section 6: Audit Logs

Create a platform-level audit logs viewer.

Show a clean searchable log table with columns like:

* Timestamp
* User
* Action
* Module
* Entity
* Clinic / Branch
* Result / Status

Include:

* search input
* date filter
* module filter
* user filter
* status filter
* export action if useful

This should feel like a professional admin traceability panel.

---

## Additional UI patterns

### Save/discard behavior

Settings page should visually support:

* unsaved changes state
* save changes
* discard changes

### Status treatment

Use clean badges/toggles for:

* active/inactive
* connected/disconnected
* enabled/disabled
* success/error/warning state where meaningful

### Settings cards

Use premium settings cards or sections with:

* title
* small description
* content area
* inline actions where relevant

---

## Data realism

Use believable platform-level mock settings data such as:

* realistic integration names
* realistic payment methods
* healthcare-relevant source types
* realistic role names
* plausible audit log entries

Make the page feel like a real enterprise medical SaaS control panel.

---

## UX expectations

The user should quickly understand:

* what can be configured globally
* which integrations are active
* which payment methods are enabled
* how sources are templated
* what the platform branding is
* what recent system actions occurred in audit logs

This page should feel trustworthy, controlled, and enterprise-ready.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Settings Navigation Tabs or Side Menu
* Settings Card
* Permission Matrix / Access Cards
* Integration Card
* Payment Method Card
* Source Template Table
* Branding Form
* Audit Logs Table
* Status Badge
* Toggle Switch
* Config Modal

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* tabs/sections remain easy to switch
* settings cards stack cleanly
* tables remain readable or transform appropriately
* forms stay usable
* audit logs filters wrap properly

---

## Future compatibility rule

This page must remain compatible with the following existing/future routes:

* `/super-admin/dashboard`
* `/super-admin/clinics`
* `/super-admin/branches`
* `/super-admin/users`
* `/super-admin/analytics`
* `/super-admin/settings`

Do not rename route paths.
Do not move settings under another section.
Do not merge settings into analytics or dashboard.

Settings page = platform governance and configuration only.

---

## Final output expectation

Generate a polished frontend page for:

* `Super Admin Settings`
* route: `/super-admin/settings`

Reuse the existing Super Admin layout and keep route structure clean for future pages.

Build only the **Clinic Admin Dashboard page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Do **not** generate Patients, Doctors, Services, Rooms, Products, Warehouse, Suppliers, Invoices, Payments, Sources, or detail pages yet.
Keep the layout and route structure stable so future Clinic Admin pages can be added without changing the root.

---

## Root path structure

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctor-analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/rooms`
  * `/clinic-admin/products`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/suppliers`
  * `/clinic-admin/suppliers/:id`
  * `/clinic-admin/invoices`
  * `/clinic-admin/invoices/create`
  * `/clinic-admin/payments`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/dashboard`

This page belongs inside the **Clinic Admin App Layout**.

---

## Parent layout rules

Create a reusable **Clinic Admin App Layout** that will be reused by all future Clinic Admin pages.

### Layout requirements

* left sidebar navigation
* top header
* breadcrumb area
* main content container
* responsive desktop-first layout
* tablet-friendly behavior
* clean medical SaaS style

### Sidebar items

Show these sidebar items exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Doctor Analytics
6. Services
7. Rooms
8. Products
9. Warehouse
10. Suppliers
11. Invoices
12. Payments
13. Sources

Only **Dashboard** should be active for now.

### Header area

Include:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Dashboard`

---

## Product context

This is a **Clinic-scoped admin dashboard** inside a medical CRM / clinic management SaaS.

Hierarchy:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor

The Clinic Admin can manage and monitor everything only inside their own clinic / branch scope:

* patients
* doctors
* services
* rooms
* products and goods
* warehouse usage
* suppliers
* invoices
* payments
* sources
* clinic-level analytics

This dashboard is not platform-wide.
It is a **branch/clinic operations dashboard**.

---

## Design style

Create a **clean premium healthcare admin dashboard** with:

* white and blue dominant UI
* calm medical B2B look
* strong spacing
* soft corners
* professional cards
* subtle shadows
* chart-based analytics
* no clutter
* high readability
* dashboard-first information hierarchy

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for navigation, active states, buttons, filters, key actions
* Teal for analytics highlights and positive indicators
* White/light background for trust and cleanliness
* Keep the interface medical and premium

---

## Dashboard page goal

Design the **main Clinic Admin overview page**.

This page should instantly answer:

* how this clinic/branch is performing
* what income and patient volume look like
* where patients are coming from
* which doctors are most active
* what invoice health looks like
* whether warehouse/product activity needs attention

---

## Dashboard route definition

* **Route:** `/clinic-admin/dashboard`
* **Page name:** Clinic Dashboard
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Dashboard

---

## Main filters for this dashboard

Create a strong top filter area with:

* date range filter
* quick period selector
* branch label/context indicator if useful
* export button if suitable

### Default filter behavior

* **Monthly income** should be shown by default
* day-by-day views should default to **last 7 days**
* all metrics are scoped to the current clinic/branch only

---

## Dashboard content sections

### 1. Top KPI cards

Create a top row of KPI/stat cards for:

* Monthly Income
* Total Patients
* New Patients
* Returning Patients
* Paid Invoices
* Outstanding Amount

Each card should include:

* label
* large number
* trend indicator
* helper text
* small clean icon
* premium compact card design

---

### 2. Income day-by-day section

Create a large analytics card with:

* title: `Income Trend`
* line or area chart
* day-by-day income view
* default last 7 days
* date filter in header if useful

This should reflect the requirement:

* income day by day view of last filtered 7 days by default

---

### 3. Patients day-by-day section

Create a chart card with:

* title: `Patients Trend`
* day-by-day patient count
* default last 7 days
* clean chart styling

This should reflect:

* clients day by day view of last filtered 7 days by default

---

### 4. Patients by source section

Create a section showing:

* patient count by source day-by-day
* last 7 days by default
* source categories such as:

  * app
  * telegram
  * instagram
  * website
  * referral
  * walk-in / manual

Use a chart that makes source comparison easy.
This should clearly support:

* clients by source day by day view of last filtered days

---

### 5. Most active doctors section

Create a ranked card or table-like section showing:

* doctor name
* profession
* patients served
* income generated
* trend or activity indicator

This section should support:

* most active doctors
* income by most active doctors
* patient count by most active doctors

---

### 6. Invoice status statistics section

Create a clean breakdown section for invoice statuses:

* paid
* unpaid
* draft
* cancelled

Suggested visualization:

* donut chart or segmented card group
* summary values
* percentage or count labels

This should clearly communicate invoice health.

---

### 7. Warehouse summary section

Create a compact operational warehouse summary showing:

* current stock health
* low stock items count
* top consumed goods
* recent goods output
* warning badge if needed

This is only a summary preview for the dashboard, not the full warehouse page.

---

### 8. Top services section

Create a ranked list or chart for:

* top services by usage
* top services by revenue if useful

Keep it concise and readable.

---

### 9. Top doctors section

Create a second doctor-focused summary if helpful, distinct from “most active doctors”.
This may emphasize:

* revenue leaders
* highest patient volume
* best rated doctors if mock data supports it

Make sure it does not feel repetitive.

---

### 10. Top patient source channels section

Create a compact source performance area showing:

* source name
* patients count
* revenue contribution if useful
* trend indicator

This should complement the source chart section.

---

### 11. Recent activity / alerts section

Create a small clinic operations activity feed or alerts panel with examples like:

* patient added
* invoice generated
* doctor added
* source connected
* low stock warning
* supplier delivery recorded

Keep it useful but not too large.

---

## Data realism

Use believable clinic-level medical SaaS mock data:

* realistic patient counts
* realistic doctor names and specialties
* believable service names
* plausible revenue values
* realistic source distribution
* operational invoice and warehouse signals

Make the page feel like a real clinic branch dashboard.

---

## UX expectations

The user should quickly understand:

* clinic monthly performance
* daily income movement
* patient growth and return behavior
* top doctors and services
* invoice risk
* warehouse attention points
* source effectiveness

This page must feel operational, strategic, and clean.

---

## Components to create for this page only

Create only the minimum reusable components needed for this page, such as:

* Clinic Admin Layout
* Sidebar
* Top Header
* Breadcrumb
* KPI Stat Card
* Chart Card
* Doctor Ranking Card
* Invoice Status Card
* Warehouse Summary Card
* Source Performance Card
* Activity Feed Card

Do not create full app-wide components beyond what this page needs.

---

## Responsive behavior

Desktop-first.
On smaller screens:

* sidebar can collapse
* KPI cards wrap cleanly
* charts stack properly
* ranked sections remain readable
* filters stay usable

---

## Important future compatibility rule

This page must be built so future pages can be added under the same root without changing structure:

Future pages that will come later:

* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctor-analytics`
* `/clinic-admin/services`
* `/clinic-admin/rooms`
* `/clinic-admin/products`
* `/clinic-admin/warehouse`
* `/clinic-admin/suppliers`
* `/clinic-admin/suppliers/:id`
* `/clinic-admin/invoices`
* `/clinic-admin/invoices/create`
* `/clinic-admin/payments`
* `/clinic-admin/sources`

Do not redesign the route root later.
Do not rename the layout later.
Do not merge this dashboard into another route.

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin App Layout`
* `Clinic Dashboard` at `/clinic-admin/dashboard`

Only this page and its directly required layout/components.

Build only the **Clinic Admin Dashboard page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Do **not** generate Patients, Doctors, Services, Rooms, Warehouse, Products, Suppliers, Payments, Invoices, Sources, or detail pages yet.
Keep the layout and route structure stable so future Clinic Admin pages can be added without changing the root.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/dashboard`

This page belongs inside the **Clinic Admin App Layout**.

---

## Parent layout rules

Create a reusable **Clinic Admin App Layout** that will be reused by all future Clinic Admin pages.

### Layout requirements

* left sidebar navigation
* top header
* breadcrumb area
* main content container
* responsive desktop-first layout
* tablet-friendly behavior
* clean medical SaaS style

### Sidebar structure

Show these sidebar items exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

Only **Dashboard** should be active for now.

### Sidebar grouping rules

The sidebar must be designed so these future nested sections can exist under parent modules without changing the root layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

For this task, those nested pages should **not** be generated yet, but the sidebar architecture must support them.

### Header area

Include:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Dashboard`

---

## Product context

This is a **Clinic-scoped admin dashboard** inside a medical CRM / clinic management SaaS.

Hierarchy:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor

The Clinic Admin can manage and monitor everything only inside their own clinic / branch scope:

* patients
* doctors
* services
* rooms
* warehouse operations
* products and goods
* suppliers
* invoices
* payments
* sources
* clinic-level analytics

This dashboard is not platform-wide.
It is a **branch/clinic operations dashboard**.

---

## Design style

Create a **clean premium healthcare admin dashboard** with:

* white and blue dominant UI
* calm medical B2B look
* strong spacing
* soft corners
* professional cards
* subtle shadows
* chart-based analytics
* no clutter
* high readability
* dashboard-first information hierarchy

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for navigation, active states, buttons, filters, key actions
* Teal for analytics highlights and positive indicators
* White/light background for trust and cleanliness
* Keep the interface medical and premium

---

## Dashboard page goal

Design the **main Clinic Admin overview page**.

This page should instantly answer:

* how this clinic/branch is performing
* what income and patient volume look like
* where patients are coming from
* which doctors are most active
* what invoice health looks like
* whether warehouse/product activity needs attention

---

## Dashboard route definition

* **Route:** `/clinic-admin/dashboard`
* **Page name:** Clinic Dashboard
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Dashboard

---

## Main filters for this dashboard

Create a strong top filter area with:

* date range filter
* quick period selector
* branch label/context indicator if useful
* export button if suitable

### Default filter behavior

* **Monthly income** should be shown by default
* day-by-day views should default to **last 7 days**
* all metrics are scoped to the current clinic/branch only

---

## Dashboard content sections

### 1. Top KPI cards

Create a top row of KPI/stat cards for:

* Monthly Income
* Total Patients
* New Patients
* Returning Patients
* Paid Invoices
* Outstanding Amount

Each card should include:

* label
* large number
* trend indicator
* helper text
* small clean icon
* premium compact card design

---

### 2. Income day-by-day section

Create a large analytics card with:

* title: `Income Trend`
* line or area chart
* day-by-day income view
* default last 7 days
* date filter in header if useful

This should reflect:

* income day by day view of last filtered 7 days by default

---

### 3. Patients day-by-day section

Create a chart card with:

* title: `Patients Trend`
* day-by-day patient count
* default last 7 days
* clean chart styling

This should reflect:

* clients day by day view of last filtered 7 days by default

---

### 4. Patients by source section

Create a section showing:

* patient count by source day-by-day
* last 7 days by default
* source categories such as:

  * app
  * telegram
  * instagram
  * website
  * referral
  * walk-in / manual

Use a chart that makes source comparison easy.

This should clearly support:

* clients by source day by day view of last filtered days

---

### 5. Most active doctors section

Create a ranked card or table-like section showing:

* doctor name
* profession
* patients served
* income generated
* trend or activity indicator

This section should support:

* most active doctors
* income by most active doctors
* patient count by most active doctors

This section is a dashboard preview and should visually connect to the future Doctors module.

---

### 6. Invoice status statistics section

Create a clean breakdown section for invoice statuses:

* paid
* unpaid
* draft
* cancelled

Suggested visualization:

* donut chart or segmented card group
* summary values
* percentage or count labels

This should clearly communicate invoice health and visually connect to the future Payments module.

---

### 7. Warehouse summary section

Create a compact operational warehouse summary showing:

* current stock health
* low stock items count
* top consumed goods
* recent goods output
* warning badge if needed

This is only a summary preview for the dashboard, not the full warehouse page.

This section should visually connect to the future Warehouse module.

---

### 8. Top services section

Create a ranked list or chart for:

* top services by usage
* top services by revenue if useful

Keep it concise and readable.
This section should visually connect to the future Services module.

---

### 9. Top patient source channels section

Create a compact source performance area showing:

* source name
* patients count
* revenue contribution if useful
* trend indicator

This should complement the source chart section and connect to the future Sources module.

---

### 10. Recent activity / alerts section

Create a small clinic operations activity feed or alerts panel with examples like:

* patient added
* invoice generated
* doctor added
* source connected
* low stock warning
* supplier delivery recorded

Keep it useful but not too large.

---

## Data realism

Use believable clinic-level medical SaaS mock data:

* realistic patient counts
* realistic doctor names and specialties
* believable service names
* plausible revenue values
* realistic source distribution
* operational invoice and warehouse signals

Make the page feel like a real clinic branch dashboard.

---

## UX expectations

The user should quickly understand:

* clinic monthly performance
* daily income movement
* patient growth and return behavior
* top doctors and services
* invoice risk
* warehouse attention points
* source effectiveness

This page must feel operational, strategic, and clean.

---

## Components to create for this page only

Create only the minimum reusable components needed for this page, such as:

* Clinic Admin Layout
* Sidebar
* Top Header
* Breadcrumb
* KPI Stat Card
* Chart Card
* Doctor Ranking Card
* Invoice Status Card
* Warehouse Summary Card
* Source Performance Card
* Activity Feed Card

Do not create full app-wide components beyond what this page needs.

---

## Responsive behavior

Desktop-first.
On smaller screens:

* sidebar can collapse
* KPI cards wrap cleanly
* charts stack properly
* ranked sections remain readable
* filters stay usable

---

## Important future compatibility rule

This page must be built so future pages can be added under the same root without changing structure:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not redesign the route root later.
Do not rename the layout later.
Do not merge this dashboard into another route.

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin App Layout`
* `Clinic Dashboard` at `/clinic-admin/dashboard`

Only this page and its directly required layout/components.

Build only the **Clinic Admin Branch Details page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the dashboard page.
Do **not** redesign the root layout.
Do **not** generate Patients, Doctors, Services, Rooms, Warehouse, Products, Suppliers, Payments, Invoices, Sources, or detail pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/branch-details`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared visual language from the Clinic Admin dashboard

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design system already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Branch Details** must be active
* others inactive

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Branch Details`

---

## Product context

This is a **clinic / branch identity and operational details page** inside a medical CRM SaaS.

This page is for the Clinic Admin to view and manage the main branch-level information for the clinic they control.

This is not a platform clinic organization page.
This is a **clinic-admin-level branch page**.

The page should help the Clinic Admin understand and manage:

* branch name and identity
* address and contact information
* timezone and operational details
* clinic admins
* active doctors
* active rooms
* active services
* status
* quick operational actions

---

## Design style

Create a **clean premium healthcare admin details page** with:

* white and blue dominant UI
* elegant information cards
* calm medical B2B design
* strong spacing
* soft corners
* subtle shadows
* clean detail layout
* readable structured sections
* not overloaded with data

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for active states, links, buttons, tabs if any
* Teal for supporting highlights and positive indicators
* White/light surfaces for trust and cleanliness
* Keep the interface medical, structured, and premium

---

## Route definition

* **Route:** `/clinic-admin/branch-details`
* **Page name:** Branch Details
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Branch Details

---

## Main page goal

This page should help the Clinic Admin quickly understand:

* which branch they are managing
* branch operational status
* who the branch admins are
* how many doctors, rooms, and services are active
* the branch location and contact details
* quick operational entry points

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Branch Details`
* short supporting subtitle describing this as the operational profile of the current clinic branch
* primary action button: `Edit Branch`
* secondary action button: `Manage Admins`

This top area should feel clean, trustworthy, and administrative.

---

### 2. Branch identity summary card

Create a premium overview card containing:

* Branch Name
* Clinic / Group Name
* Branch Code
* Status badge
* Timezone
* Created date if useful

This should be the main identifying section at the top.

---

### 3. Contact and location section

Create a structured card or two-column details section showing:

* Country
* City / Region
* Full Address
* Main Contact Name
* Main Contact Phone
* Main Contact Email
* optional embedded location/map placeholder area if useful

This should feel like an official branch profile.

---

### 4. Operational summary cards

Create a compact KPI-style strip showing:

* Active Doctors
* Active Rooms
* Active Services
* Current Patients count or current active patients if useful

These should be smaller than dashboard KPI cards and focused on branch setup/operations.

---

### 5. Branch admins section

Create a card showing current admins for this branch.

For each admin show:

* full name
* role
* email
* phone
* status

Include actions such as:

* Add Admin
* Edit Admin
* Remove Admin

This section should feel like branch-level access control, but not a full users management page.

---

### 6. Doctors preview section

Create a preview section showing active doctors in this branch.

For each doctor show:

* full name
* profession
* years of experience
* current status

This should be a preview card/table section, not the full doctors page.
It should visually connect to the future Doctors module.

Include a subtle action like:

* View All Doctors

---

### 7. Rooms preview section

Create a preview section showing branch rooms.

For each room show:

* room name
* room type
* floor if useful
* status
* number of services linked if useful

This should be a preview only and connect to the future Rooms page under Services.

Include a subtle action like:

* View Rooms

---

### 8. Services preview section

Create a preview section showing active services available in this branch.

For each service show:

* service name
* category
* price
* duration
* status

This should be a preview only and connect to the future Services module.

Include a subtle action like:

* View Services

---

### 9. Branch operational status section

Create a small operational health/status card showing items such as:

* branch status
* payment methods active count
* connected sources count
* warehouse readiness or stock readiness indicator
* setup completion indicator if useful

This should feel like a concise management summary.

---

### 10. Quick actions section

Create a compact quick actions card with buttons like:

* Edit Branch Info
* Add Doctor
* Add Service
* Add Room
* Manage Warehouse
* Manage Payments

These buttons can imply future module entry points, but do not generate those pages yet.

---

### 11. Recent branch activity section

Create a small recent activity or timeline section showing examples such as:

* doctor added
* room added
* service created
* invoice generated
* source connected
* supplier updated

Keep it useful but not too large.

---

## Forms / modals for this page

### Edit Branch modal or drawer

Create a clean edit form with fields:

* Branch Name
* Branch Code
* Country
* City / Region
* Full Address
* Timezone
* Main Contact Name
* Main Contact Phone
* Main Contact Email
* Status

Actions:

* Cancel
* Save Changes

---

### Add / Manage Branch Admin modal

Create a clean form for adding or assigning a branch admin.

Fields:

* Full Name
* Email
* Phone
* Role
* Status
* Send Invite toggle

Actions:

* Cancel
* Save Admin

---

## Data realism

Use believable clinic-level medical SaaS mock data:

* realistic clinic/branch names
* realistic admins and doctors
* believable contact data
* credible counts for rooms and services
* plausible operational status information

Make the page feel like a real clinic branch profile page.

---

## UX expectations

The user should quickly understand:

* branch identity
* contact information
* key operational setup
* who manages the branch
* how many doctors/rooms/services are active
* what to do next operationally

This page must feel structured, trustworthy, and easy to scan.

---

## Components to create for this page only

Create only the minimum reusable components needed for this page, such as:

* Branch Identity Card
* Contact Details Card
* Operational Summary Card
* Admin List Card
* Doctors Preview Card
* Rooms Preview Card
* Services Preview Card
* Operational Status Card
* Quick Actions Card
* Activity Feed Card
* Edit Branch Modal
* Manage Admin Modal

Do not create full unrelated module components yet.

---

## Responsive behavior

Desktop-first.
On smaller screens:

* sections stack cleanly
* preview tables/cards remain readable
* quick actions wrap properly
* forms remain usable
* branch detail cards keep strong hierarchy

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not redesign the route root later.
Do not rename the layout later.
Do not merge this page into dashboard or settings.

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Branch Details`
* route: `/clinic-admin/branch-details`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Patients page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Patient Detail, Doctors, Services, Warehouse, Payments, Sources, or other pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/patients`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from dashboard and branch details pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Patients** must be active
* others inactive

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Patients`

---

## Product context

This is the **clinic-scoped patients management page** inside a medical CRM SaaS.

The Clinic Admin uses this page to:

* see all patients in the current clinic / branch scope
* search patients quickly
* filter patients by source, doctor, date, and status
* create a new patient
* monitor patient value and activity
* open the patient detail page later

This is not the patient detail page.
This is the main patients list and management page.

---

## Design style

Create a **premium healthcare B2B patients management page** with:

* clean white and blue interface
* professional medical SaaS table design
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* calm healthcare visual style
* data-heavy but clean layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive highlights and positive analytics hints
* White/light background for trust and cleanliness
* Keep interface medical, premium, and calm

---

## Route definition

* **Route:** `/clinic-admin/patients`
* **Page name:** Patients
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Patients

---

## Main page goal

This page should help the Clinic Admin:

* view all patients in the clinic
* understand patient activity and value at a glance
* find specific patients quickly
* filter patients by important business and medical context
* create and manage patients efficiently
* navigate later to patient detail pages without route confusion

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Patients`
* short supporting subtitle describing this as clinic-wide patient management
* primary action button: `Add Patient`
* secondary action button: `Export`

This area should feel operational and clean.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* date range filter
* source filter
* doctor filter
* status filter
* sort dropdown
* reset filters button

### Suggested patient status options

* Active
* New
* Returning
* Inactive

### Suggested source options

* App
* Telegram
* Instagram
* Website
* Referral
* Walk-in / Manual

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Patients summary cards

Add a compact overview strip or mini KPI section for this page:

* Total Patients
* New Patients
* Returning Patients
* Active This Month

Keep these lighter than dashboard KPI cards.

---

### 4. Patients data table

Create a premium responsive management table.

Columns:

* Full Name
* Age
* Gender
* Phone
* Source
* Primary Doctor
* Last Visit
* Total Visits
* Total Income
* Monthly Income
* Status
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* source badges
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View Profile
* Edit Patient
* Assign Doctor
* View Billing
* Add Note

Do not generate the destination pages yet, but structure actions clearly.

---

### 5. Add Patient modal or drawer

Design a clean patient creation form.

Fields:

* Full Name
* Gender
* Birth Date or Age
* Phone
* Email
* Address
* Height
* Weight
* Source
* Primary Doctor
* Allergies / Notes
* Optional medical document upload area

Actions:

* Cancel
* Save Patient

Keep it simple, medical-friendly, and admin-usable.

---

### 6. Assign Doctor modal

Design a clean modal/drawer for assigning or changing a patient’s primary doctor.

Fields:

* Patient Name
* Primary Doctor
* Assignment Note
* Effective Date if useful

Actions:

* Cancel
* Save Assignment

This should reflect the clinic operational flow clearly.

---

### 7. Patient quick insights area

Add a concise insights area showing useful operational signals such as:

* patients by source
* highest value patient segment
* recently added patients
* patients without recent visit
* patients without doctor assignment if useful

Keep it concise and actionable.

---

### 8. Empty state

Design a polished empty state for cases when no patients exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Add Patient button

---

## Data realism

Use believable clinic-level medical SaaS mock data such as:

* realistic patient names
* plausible ages and genders
* realistic sources
* realistic doctors
* believable visit counts
* plausible income values
* credible statuses

Make the table feel like a real clinic operations product.

---

## UX expectations

The user should quickly understand:

* who the patients are
* which patients are new or returning
* which doctor is responsible
* which source brought the patient
* patient activity and value
* what action to take next

This page should feel like a strong operational patient management page, not just a basic contacts list.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Patients Table
* Source Badge
* Status Badge
* Action Dropdown
* Add Patient Modal
* Assign Doctor Modal
* Empty State
* Patient Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the wide table gracefully
* filters wrap properly
* action buttons remain accessible
* forms remain readable
* key patient fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not merge patients with another module.
Do not redesign the Clinic Admin route root.

Patients page = clinic-wide patients list and management only.
Patient detail page will come later at `/clinic-admin/patients/:id`.

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Patients`
* route: `/clinic-admin/patients`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Patient Detail page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Doctors, Services, Warehouse, Payments, Sources, or other unrelated pages now.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/patients/:id`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Patients** must be active
* others inactive

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Patients / Patient Profile`

---

## Product context

This is the **patient detail / patient profile page** inside a clinic-scoped medical CRM SaaS.

The Clinic Admin uses this page to:

* view one patient’s full operational and medical summary
* see patient profile and contact info
* see billing summary
* review visit / encounter history
* review medical documents
* read notes
* understand patient value and activity over time

This is not the main patients list.
This is the detailed patient management page for one selected patient.

---

## Design style

Create a **premium healthcare patient profile page** with:

* clean white and blue interface
* trust-oriented medical design
* structured detail layout
* clear sections and tabs
* readable cards
* soft shadows
* premium clinical SaaS feel
* strong hierarchy without clutter

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active tabs, links, selected states
* Teal for supportive highlights and helpful data emphasis
* White/light background for clinical cleanliness and trust
* Keep interface premium and medically appropriate

---

## Route definition

* **Route:** `/clinic-admin/patients/:id`
* **Page name:** Patient Profile
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Patients

---

## Main page goal

This page should help the Clinic Admin quickly understand:

* who the patient is
* their medical/basic profile
* their assigned doctor
* their visit history
* their billing and payment status
* their total value to the clinic
* their uploaded documents and notes

The page should be detail-rich but easy to scan.

---

## Main page structure

### 1. Top patient header section

Create a strong page header/profile summary area with:

* patient full name
* age
* gender
* phone
* source
* primary doctor
* status badge
* quick actions such as:

  * Edit Patient
  * Assign Doctor
  * Add Note
  * Create Invoice

This section should feel like the patient identity anchor for the page.

---

### 2. Patient overview cards

Create a compact summary strip showing:

* Total Visits
* Total Income from Patient
* Monthly Income from Patient
* Last Visit Date

These cards should feel clean and operational.

---

## Main content tabs

Design this page with clear tabs.

Tabs must be:

1. Overview
2. Medical Documents
3. Visit History
4. Billing
5. Notes

Do not create extra tabs.

---

## Tab 1: Overview

This tab should show the main patient profile in structured cards/sections.

### Overview content

Show:

* Full Name
* Age
* Height
* Weight
* Source
* Primary Doctor
* Contact Details
* First Visit Date
* Last Visit Date
* Total Times Serviced
* Total Income from this Patient
* Monthly Income from this Patient
* Patient Tags
* Alerts / Allergies if available

Design this as a premium two-column or card-based detail layout.

Include:

* edit button
* subtle medical-friendly detail styling

---

## Tab 2: Medical Documents

Create a clean medical documents section.

Show uploaded files as cards or table rows with:

* document name
* document type
* uploaded date
* uploaded by
* preview/open action
* download action if useful

Support examples such as:

* lab result
* x-ray
* passport/ID
* medical file
* consent form

Include:

* Upload Document button
* empty state if no documents exist

---

## Tab 3: Visit History

Create a timeline or structured table for patient visits / encounters.

Fields can include:

* visit date
* doctor
* service
* diagnosis summary
* invoice status
* payment status
* action to view more

This section should feel like a usable visit history log.

You may use:

* table
* timeline
* hybrid card layout

Choose the cleaner healthcare SaaS option.

---

## Tab 4: Billing

Create a billing summary tab for this patient.

Show:

* outstanding amount
* paid amount
* recent invoices
* recent payments
* invoice/payment status summary

### Recent invoices table

Include:

* invoice number
* date
* total
* paid
* due
* status

### Recent payments table

Include:

* payment method
* invoice
* amount
* date
* payment status

Include actions like:

* View Invoice
* Create Invoice

Do not generate the full payments module page now, only this patient-level billing view.

---

## Tab 5: Notes

Create a patient notes section.

Show notes in a professional clinical/admin note layout with:

* note author
* date/time
* note content
* note category if useful

Support note types such as:

* admin note
* medical note
* billing note

Include:

* Add Note button
* note input modal or inline form
* searchable or filterable notes if useful

---

## Forms / modals for this page

### Edit Patient modal or drawer

Create a clean patient edit form with fields:

* Full Name
* Gender
* Birth Date or Age
* Phone
* Email
* Address
* Height
* Weight
* Source
* Primary Doctor
* Allergies / Notes

Actions:

* Cancel
* Save Changes

---

### Upload Document modal

Create a clean modal/drawer for:

* document type
* file upload
* note/description if useful

Actions:

* Cancel
* Upload Document

---

### Add Note modal

Create a clean note creation UI with:

* note type
* note content

Actions:

* Cancel
* Save Note

---

### Assign Doctor modal

Create a clean doctor assignment modal with:

* patient name
* current doctor
* new primary doctor
* assignment note
* effective date if useful

Actions:

* Cancel
* Save Assignment

---

## Data realism

Use believable clinic-level medical SaaS mock data such as:

* realistic patient names
* realistic ages/heights/weights
* realistic doctors
* plausible visit dates
* believable service names
* credible invoice/payment history
* realistic document types
* realistic clinical/admin notes

Make the page feel like a real patient profile inside a clinic operations platform.

---

## UX expectations

The user should quickly understand:

* patient identity and profile
* patient’s value and activity
* latest visits
* billing state
* document availability
* notes and operational context
* next actions to take

This page should feel trustworthy, clinically appropriate, and operationally useful.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Patient Header Card
* Overview Stat Cards
* Tab Navigation
* Detail Info Cards
* Documents List/Card
* Visit History Table/Timeline
* Billing Summary Card
* Notes Feed
* Edit Patient Modal
* Upload Document Modal
* Add Note Modal
* Assign Doctor Modal
* Empty State

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* patient header stacks cleanly
* tabs remain usable
* detail cards stack properly
* visit and billing tables degrade gracefully
* modals stay readable

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not merge this page into payments or doctors.
Do not redesign the Clinic Admin route root.

Patients page = list page at `/clinic-admin/patients`
Patient detail page = detailed profile page at `/clinic-admin/patients/:id`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Patient Profile`
* route: `/clinic-admin/patients/:id`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Doctors page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Doctor Profile, Doctor Analytics, Services, Warehouse, Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/doctors`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Doctors** must be active
* others inactive

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Doctors`

---

## Product context

This is the **clinic-scoped doctors management page** inside a medical CRM SaaS.

The Clinic Admin uses this page to:

* see all doctors in the current clinic / branch
* search and filter doctors
* add a new doctor
* monitor doctor activity and value
* understand profession, experience, patients served, income, and rating
* later open doctor detail and analytics pages

This is not the doctor profile page.
This is the main doctors list and management page.

---

## Design style

Create a **premium healthcare B2B doctors management page** with:

* clean white and blue interface
* professional medical SaaS table design
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* premium healthcare operations feel
* data-rich but clean layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive highlights and positive performance hints
* White/light background for trust and cleanliness
* Keep interface premium, medical, and calm

---

## Route definition

* **Route:** `/clinic-admin/doctors`
* **Page name:** Doctors
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Doctors

---

## Main page goal

This page should help the Clinic Admin:

* view all doctors in the clinic
* understand doctor role and specialty
* see experience and service capability
* understand patient load and income contribution
* identify active/high-performing doctors
* manage doctor records efficiently
* navigate later to doctor detail and analytics pages without route confusion

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Doctors`
* short supporting subtitle describing this as clinic-wide doctors management
* primary action button: `Add Doctor`
* secondary action button: `Export`

This area should feel operational and structured.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* profession / specialty filter
* status filter
* service filter
* experience range filter
* sort dropdown
* reset filters button

### Suggested doctor status options

* Active
* On Leave
* Inactive

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Doctors summary cards

Add a compact overview strip or mini KPI section for this page:

* Total Doctors
* Active Doctors
* Top Rated Doctors count
* Doctors With Patients This Month

Keep these lighter than dashboard KPI cards.

---

### 4. Doctors data table

Create a premium responsive management table.

Columns:

* Full Name
* Profession
* Years of Experience
* Services Count
* Patients Served
* Total Income
* Monthly Income
* Rating
* Status
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* rating visualization
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View Profile
* Edit Doctor
* Manage Services
* View Patients
* View Analytics
* Deactivate

Do not generate the destination pages yet, but structure actions clearly.

---

### 5. Add Doctor modal or drawer

Design a clean doctor creation form.

Fields:

* Full Name
* Gender if useful
* Phone
* Email
* Profession / Specialty
* Career Start Date
* License Number if useful
* Assigned Services
* Status
* Notes / Bio if useful

Actions:

* Cancel
* Save Doctor

Keep it simple, medical-friendly, and admin-usable.

---

### 6. Edit Doctor modal

Design a clean doctor edit form with fields similar to creation:

* Full Name
* Phone
* Email
* Profession / Specialty
* Career Start Date
* Assigned Services
* Status
* Notes / Bio

Actions:

* Cancel
* Save Changes

---

### 7. Manage Services modal

Design a clean modal/drawer for assigning services to a doctor.

Fields:

* Doctor Name
* Multi-select Services
* Notes if useful

Actions:

* Cancel
* Save Services

This should clearly support the clinic flow where each doctor can serve one or many services.

---

### 8. Doctors quick insights area

Add a concise insights area showing useful operational signals such as:

* most active profession
* highest income doctor
* most booked doctor
* doctors with low current patient load
* recently added doctors

Keep it concise and actionable.

---

### 9. Empty state

Design a polished empty state for cases when no doctors exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Add Doctor button

---

## Data realism

Use believable clinic-level medical SaaS mock data such as:

* realistic doctor names
* real-looking specialties/professions
* plausible years of experience
* believable service counts
* realistic patient counts
* plausible income values
* believable ratings and statuses

Make the table feel like a real clinic operations product.

---

## UX expectations

The user should quickly understand:

* who the doctors are
* what each doctor does
* how experienced they are
* how active and valuable they are
* which doctors are high-performing or underutilized
* what action to take next

This page should feel like a strong operational doctors management page, not just a staff directory.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Doctors Table
* Rating Display
* Status Badge
* Action Dropdown
* Add Doctor Modal
* Edit Doctor Modal
* Manage Services Modal
* Empty State
* Doctor Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the wide table gracefully
* filters wrap properly
* action buttons remain accessible
* forms remain readable
* key doctor fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not merge doctors with another module.
Do not redesign the Clinic Admin route root.

Doctors page = clinic-wide doctors list and management only.
Doctor detail page will come later at `/clinic-admin/doctors/:id`.
Doctor analytics page will come later at `/clinic-admin/doctors/analytics`.

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Doctors`
* route: `/clinic-admin/doctors`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Doctor Profile page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Doctor Analytics, Services, Warehouse, Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/doctors/:id`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Doctors** must be active
* others inactive

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Doctors / Doctor Profile`

---

## Product context

This is the **doctor detail / doctor profile page** inside a clinic-scoped medical CRM SaaS.

The Clinic Admin uses this page to:

* view one doctor’s full profile
* understand profession and experience
* see assigned services
* review patients served
* review monthly patients
* evaluate doctor performance
* understand revenue contribution and patient-related revenue

This is not the doctors list page.
This is the detailed doctor management page for one selected doctor.

---

## Design style

Create a **premium healthcare doctor profile page** with:

* clean white and blue interface
* trust-oriented medical design
* structured detail layout
* clear sections and tabs
* readable cards
* soft shadows
* premium clinical SaaS feel
* strong hierarchy without clutter

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active tabs, links, selected states
* Teal for supportive highlights and helpful data emphasis
* White/light background for clinical cleanliness and trust
* Keep interface premium and medically appropriate

---

## Route definition

* **Route:** `/clinic-admin/doctors/:id`
* **Page name:** Doctor Profile
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Doctors

---

## Main page goal

This page should help the Clinic Admin quickly understand:

* who the doctor is
* their profession and experience
* which services they perform
* which patients they served
* how many patients they see monthly
* how much income they generate
* how much income comes from their patients overall

The page should be detail-rich but easy to scan.

---

## Main page structure

### 1. Top doctor header section

Create a strong page header/profile summary area with:

* doctor full name
* profession / specialty
* clinic / branch
* years of experience
* rating
* status badge
* quick actions such as:

  * Edit Doctor
  * Manage Services
  * View Analytics
  * Deactivate Doctor

This section should feel like the doctor identity anchor for the page.

---

### 2. Doctor overview cards

Create a compact summary strip showing:

* Patients Served
* Monthly Patients
* Total Income by Doctor
* Monthly Income by Doctor

These cards should feel clean and operational.

---

## Main content tabs

Design this page with clear tabs.

Tabs must be:

1. Overview
2. Patients Served
3. Monthly Patients
4. Performance

Do not create extra tabs.

---

## Tab 1: Overview

This tab should show the main doctor profile in structured cards/sections.

### Overview content

Show:

* Full Name
* Medical Profession
* Career Start Date
* Calculated Experience Years
* Clinic / Branch
* Contact Details
* Rating
* Status
* Services List
* License Number if useful
* Notes / Bio if useful

Design this as a premium two-column or card-based detail layout.

Include:

* edit button
* manage services button
* subtle medical-friendly detail styling

---

## Tab 2: Patients Served

Create a clean patients-served section.

Show a structured table with:

* patient full name
* age
* gender
* primary source
* last visit date
* total visits
* total income from patient
* status
* action to view patient

This section should show all patients this doctor has served historically.

Include:

* search input
* filters if useful
* empty state if no patients exist

---

## Tab 3: Monthly Patients

Create a monthly patients section focused on recent/current period patients.

Show:

* current period selector if useful
* patient list or card grid
* patient count summary
* new vs returning breakdown if useful

Fields can include:

* patient full name
* last visit
* visit count this month
* services used
* monthly income from patient

This should feel different from “Patients Served” by emphasizing recent/current-period activity.

---

## Tab 4: Performance

Create a performance analytics tab for this doctor.

Show:

* Total Income by this Doctor
* Monthly Income by this Doctor
* Total Income by this Doctor’s Patients
* Monthly Income by this Doctor’s Patients
* Service Distribution
* Patient Trend
* Appointment / workload trend if useful
* Top Services

### Suggested visualizations

Use a clean combination of:

* KPI cards
* bar charts
* line charts
* donut/pie chart for service distribution

This tab should feel like a detailed preview of doctor analytics, while still leaving room for the future full analytics page at `/clinic-admin/doctors/analytics`.

---

## Forms / modals for this page

### Edit Doctor modal or drawer

Create a clean doctor edit form with fields:

* Full Name
* Phone
* Email
* Profession / Specialty
* Career Start Date
* Status
* Notes / Bio
* License Number if useful

Actions:

* Cancel
* Save Changes

---

### Manage Services modal

Create a clean modal/drawer for assigning services to this doctor.

Fields:

* Doctor Name
* Multi-select Services
* Notes if useful

Actions:

* Cancel
* Save Services

---

## Data realism

Use believable clinic-level medical SaaS mock data such as:

* realistic doctor names
* realistic specialties
* plausible years of experience
* believable ratings
* realistic patient counts
* plausible income values
* believable service assignments
* credible patient lists and recent activity

Make the page feel like a real doctor profile inside a clinic operations platform.

---

## UX expectations

The user should quickly understand:

* doctor identity and specialty
* experience level
* patient load
* assigned services
* revenue contribution
* patient-related revenue
* recent and historical activity
* next actions to take

This page should feel trustworthy, clinically appropriate, and operationally useful.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Doctor Header Card
* Overview Stat Cards
* Tab Navigation
* Detail Info Cards
* Patients Table
* Monthly Patients Card/List
* Performance KPI Cards
* Chart Cards
* Edit Doctor Modal
* Manage Services Modal
* Empty State

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* doctor header stacks cleanly
* tabs remain usable
* detail cards stack properly
* patient tables degrade gracefully
* charts stack properly
* modals stay readable

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not merge this page into analytics or services.
Do not redesign the Clinic Admin route root.

Doctors page = list page at `/clinic-admin/doctors`
Doctor detail page = detailed profile page at `/clinic-admin/doctors/:id`
Doctor analytics page = separate page later at `/clinic-admin/doctors/analytics`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Doctor Profile`
* route: `/clinic-admin/doctors/:id`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Doctor Analytics page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Doctors List, Doctor Profile, Services, Warehouse, Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/doctors/analytics`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Doctors** must be active
* others inactive

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Doctors / Analytics`

---

## Product context

This is the **clinic-scoped doctor analytics page** inside a medical CRM SaaS.

The Clinic Admin uses this page to monitor one, many, or all doctors in the current clinic / branch.

This page must support filter-based analytics for:

* one doctor
* multiple doctors
* all doctors
* date period
* one service
* multiple services
* all services

This page is not a single doctor profile page.
This is the **analytics and comparison dashboard for doctors inside one clinic**.

---

## Design style

Create a **premium healthcare B2B analytics page** with:

* clean white and blue interface
* executive-level but clinic-scoped analytics design
* strong chart hierarchy
* professional spacing
* soft card containers
* modern filter controls
* data-rich but not cluttered layout
* calm medical SaaS visual language

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary charts, active states, tabs, selected filters, actions
* Teal for secondary analytics emphasis and positive highlights
* success/warning/danger only for meaningful status indicators
* keep the page premium, clean, and analytical

---

## Route definition

* **Route:** `/clinic-admin/doctors/analytics`
* **Page name:** Doctor Analytics
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Doctors

---

## Main page goal

This page should help the Clinic Admin:

* analyze performance of one doctor, many doctors, or all doctors
* understand patient and revenue trends
* compare doctors fairly
* understand consultation behavior
* identify new vs returning patient balance
* see service mix
* understand age demographics of clinic patients
* identify highest patient flow times
* monitor clinic doctor performance at a strategic and operational level

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Doctor Analytics`
* short supporting subtitle describing this as clinic-wide doctor performance analytics
* primary action button: `Export Report`
* secondary action button: `Save View`

This area should feel analytical and executive.

---

### 2. Main analytics filter toolbar

Create a premium filter area that supports all major filtering logic.

Required filters:

* doctor filter:

  * one doctor
  * multiple doctors
  * all doctors
* date range filter
* service filter:

  * one service
  * multiple services
  * all services

Optional extra filters if useful:

* specialty filter
* status filter

The filter section should feel like a serious analytics control bar and must be easy to scan and use.

---

## Required analytics outputs

According to the selected filters, the page must present these metrics clearly:

* Total Patients (Today)
* Average Consultation
* New Patients
* Returning Patients
* Total Income
* Daily Patient Trend
* Doctors Rating
* Age Distribution
* Service Distribution
* Highest Times / patient flow heatmap

These are mandatory outputs.

---

## Main dashboard sections

### 3. Top KPI cards

Create a KPI row for:

* Total Patients Today
* Average Consultation
* New Patients
* Returning Patients
* Total Income
* Average Rating

Each KPI card should include:

* title
* large value
* trend or comparison indicator
* helper text
* compact professional card design

---

### 4. Daily Patient Trend section

Create a large chart card with:

* title: `Daily Patient Trend`
* line or area chart
* default last 7 days
* filter-responsive behavior

This should reflect:

* daily patient trend
* last 7 days by default

---

### 5. Doctors rating section

Create a doctor rating comparison area.

Possible formats:

* ranked horizontal bar chart
* compact comparison table
* card-based rating comparison

Show:

* doctor name
* rating
* patient volume context if useful

This should help the Clinic Admin compare doctor rating across the selected set.

---

### 6. Age Distribution section

Create a demographics section showing age distribution of clinic patients related to selected doctors and filters.

Use a clean chart such as:

* bar chart
* grouped distribution chart

Example age bands:

* 0–17
* 18–25
* 26–35
* 36–45
* 46–60
* 60+

This should support:

* Age Distribution / Demographics of clinic patients

---

### 7. Service Distribution section

Create a service mix section showing how visits are distributed by service type for the selected doctors and date range.

Use:

* donut chart
* bar chart
* or a clean combined layout

Show:

* service name
* share / percentage
* total count or revenue if useful

This should clearly support:

* Service Distribution - Distribution by type

---

### 8. Highest Times section

Create a heatmap-style patient flow section.

This section must show:

* **24 hours x 7 days**
* patient flow intensity by time slot
* strongest time windows
* quieter times

This is important and should visually feel like a clinic operations heatmap.

This should support:

* Highest Times - 24 hours x 7 days patient flow

---

### 9. Doctor comparison section

Create a comparative section for selected doctors.

Show example metrics by doctor:

* doctor name
* patients served
* total income
* average consultation
* rating
* top service

Use either:

* ranked table
* comparison card grid
* or chart + mini table combination

This section should feel strategic and actionable.

---

### 10. New vs returning patients section

Create a dedicated section or comparison card for:

* New Patients
* Returning Patients

Show:

* totals
* ratio
* trend if useful

This should feel clean and not repetitive with the KPI row.

---

### 11. Average consultation section

Create a card or chart specifically for average consultation analytics.

Possible interpretation:

* average consultation duration
* or average consultations per selected doctor/day

Design this in a clean way and label it clearly so there is no ambiguity.

Keep it operational and believable.

---

### 12. Analytics insights panel

Add a concise strategic insights section with examples like:

* best performing doctor this period
* most booked service
* strongest patient-returning pattern
* highest-rated active doctor
* peak patient hours
* underutilized doctor signal

Keep it concise, executive-friendly, and useful.

---

### 13. Empty state / no data state

Design a polished empty state for cases when filters return no data.

Show:

* icon or illustration area
* short message
* helpful text
* reset filters action

---

## Data realism

Use believable clinic-level medical SaaS mock analytics data such as:

* realistic doctor names and specialties
* realistic patient volumes
* plausible consultation numbers
* believable income values
* realistic rating ranges
* realistic service categories
* believable age distribution
* realistic hourly/week heatmap patterns

Make the analytics feel like a real clinic operations platform.

---

## UX expectations

The user should quickly understand:

* who is performing best
* what patient patterns look like
* how doctor ratings compare
* how services are distributed
* when the clinic is busiest
* how new and returning patients are balanced
* what actions or decisions should follow

This page must feel strategic, operational, and clean.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Analytics Filter Toolbar
* KPI Stat Card
* Chart Card
* Doctor Comparison Table/Card
* Rating Comparison Card
* Heatmap Card
* Demographics Chart Card
* Service Distribution Card
* Insights Card
* Empty State

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* KPI cards wrap cleanly
* chart cards stack properly
* filters wrap into multiple rows
* heatmap remains readable
* comparison tables/cards degrade gracefully
* analytics remain readable

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not merge this page into doctor profile or dashboard.
Do not redesign the Clinic Admin route root.

Doctors analytics page = clinic-wide doctor analytics at `/clinic-admin/doctors/analytics`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Doctor Analytics`
* route: `/clinic-admin/doctors/analytics`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Services page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Rooms, Warehouse, Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/services`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Services** must be active
* others inactive

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Services`

---

## Product context

This is the **clinic-scoped services management page** inside a medical CRM SaaS.

The Clinic Admin uses this page to:

* see all services offered in the current clinic / branch
* search and filter services
* create a new service
* edit price, duration, and operational setup
* understand room requirements
* understand doctor requirements
* understand linked goods/products used during service
* later navigate to Rooms under the Services module

This is not the rooms page.
This is the main services list and management page.

---

## Design style

Create a **premium healthcare B2B services management page** with:

* clean white and blue interface
* professional medical SaaS table design
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* premium clinical operations feel
* data-rich but clean layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive highlights and positive operational hints
* White/light background for trust and cleanliness
* Keep interface premium, medical, and calm

---

## Route definition

* **Route:** `/clinic-admin/services`
* **Page name:** Services
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Services

---

## Main page goal

This page should help the Clinic Admin:

* view all services in the clinic
* understand service type and operational setup
* manage service price and duration
* see whether a service requires room and doctor assignment
* see whether goods/products are linked to service consumption
* create and manage services efficiently
* later navigate to related Rooms without route confusion

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Services`
* short supporting subtitle describing this as clinic-wide services management
* primary action button: `Add Service`
* secondary action button: `View Rooms`
* optional tertiary action: `Export`

This area should feel operational and structured.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* category filter
* room requirement filter
* doctor requirement filter
* status filter
* sort dropdown
* reset filters button

### Suggested service status options

* Active
* Inactive
* Draft

### Suggested room requirement options

* Requires Room
* No Room Required

### Suggested doctor requirement options

* Requires Doctor
* No Doctor Required

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Services summary cards

Add a compact overview strip or mini KPI section for this page:

* Total Services
* Active Services
* Services Requiring Rooms
* Services Linked to Goods

Keep these lighter than dashboard KPI cards.

---

### 4. Services data table

Create a premium responsive management table.

Columns:

* Service Name
* Category
* Price
* Duration
* Room Requirement
* Doctor Requirement
* Linked Goods / Products
* Status
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* requirement badges
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* Edit Service
* Manage Linked Goods
* Assign Doctors
* View Room Compatibility
* Deactivate

Do not generate the destination pages yet, but structure actions clearly.

---

### 5. Add Service modal or drawer

Design a clean service creation form.

Fields:

* Service Name
* Category
* Description
* Price
* Duration
* Requires Room toggle
* Requires Doctor toggle
* Status
* Optional Notes

Actions:

* Cancel
* Save Service

Keep it simple, medical-friendly, and admin-usable.

---

### 6. Edit Service modal

Design a clean service edit form with fields similar to creation:

* Service Name
* Category
* Description
* Price
* Duration
* Requires Room toggle
* Requires Doctor toggle
* Status
* Optional Notes

Actions:

* Cancel
* Save Changes

---

### 7. Manage Linked Goods modal

Design a clean modal/drawer for linking goods/products used during a service.

Fields:

* Service Name
* Multi-select Products / Goods
* Quantity per service
* Unit if useful
* Notes if useful

Actions:

* Cancel
* Save Linked Goods

This should clearly support the clinic flow where services can consume products from warehouse stock.

---

### 8. Assign Doctors modal

Design a clean modal/drawer for assigning which doctors can perform a service.

Fields:

* Service Name
* Multi-select Doctors
* Optional Notes

Actions:

* Cancel
* Save Assignment

This should clearly support the clinic flow where services and doctors are connected.

---

### 9. Services quick insights area

Add a concise insights area showing useful operational signals such as:

* most used service category
* highest revenue service
* longest duration service
* services without linked goods
* services without assigned doctors if useful

Keep it concise and actionable.

---

### 10. Empty state

Design a polished empty state for cases when no services exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Add Service button

---

## Data realism

Use believable clinic-level medical SaaS mock data such as:

* realistic service names
* plausible categories
* believable prices
* realistic durations
* meaningful room/doctor requirements
* believable linked goods counts
* credible statuses

Make the table feel like a real clinic operations product.

---

## UX expectations

The user should quickly understand:

* what services exist
* how each service operates
* which services need rooms or doctors
* which services consume products/goods
* which services might need configuration
* what action to take next

This page should feel like a strong operational services management page, not just a simple catalog.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Services Table
* Requirement Badge
* Status Badge
* Action Dropdown
* Add Service Modal
* Edit Service Modal
* Manage Linked Goods Modal
* Assign Doctors Modal
* Empty State
* Service Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the wide table gracefully
* filters wrap properly
* action buttons remain accessible
* forms remain readable
* key service fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not merge services with another module.
Do not redesign the Clinic Admin route root.

Services page = clinic-wide services list and management only.
Rooms page will come later at `/clinic-admin/services/rooms`.

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Services`
* route: `/clinic-admin/services`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Rooms page** under the **Services module** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Warehouse, Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/services/rooms`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages
* Services module structure already established by `/clinic-admin/services`

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Services** must be active
* others inactive

### Services module grouping rule

Inside the Services module, this page must clearly belong to:

* Services List → `/clinic-admin/services`
* Rooms → `/clinic-admin/services/rooms`

This page is a child page of the Services module and must visually feel connected to Services, not like a separate top-level module.

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Services / Rooms`

---

## Product context

This is the **clinic-scoped rooms management page** inside the **Services module** of a medical CRM SaaS.

The Clinic Admin uses this page to:

* see all rooms in the current clinic / branch
* manage room details
* understand room type and floor/location
* see which services are available in each room
* see which doctors are assigned to each room
* create new rooms
* manage service-room compatibility

This is not the services list page.
This is the rooms page inside the Services module.

---

## Design style

Create a **premium healthcare B2B rooms management page** with:

* clean white and blue interface
* professional medical SaaS table and card design
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* premium operational feel
* data-rich but clean layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive highlights and positive operational hints
* White/light background for trust and cleanliness
* Keep interface premium, medical, and calm

---

## Route definition

* **Route:** `/clinic-admin/services/rooms`
* **Page name:** Rooms
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Services

---

## Main page goal

This page should help the Clinic Admin:

* view all rooms in the clinic
* understand each room’s purpose and setup
* know which services can be performed in which room
* know which doctors are assigned to which room
* create and manage rooms efficiently
* monitor room operational readiness

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Rooms`
* short supporting subtitle describing this as rooms management inside the Services module
* primary action button: `Add Room`
* secondary action button: `Back to Services`
* optional tertiary action: `Export`

This area should feel operational and structured.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* room type filter
* floor filter
* status filter
* assigned doctor filter
* service compatibility filter
* sort dropdown
* reset filters button

### Suggested room status options

* Active
* Inactive
* Maintenance

### Suggested room type examples

* Consultation
* Procedure
* Diagnostic
* Therapy
* Operating
* General

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Rooms summary cards

Add a compact overview strip or mini KPI section for this page:

* Total Rooms
* Active Rooms
* Rooms With Assigned Doctors
* Rooms Linked to Services

Keep these lighter than dashboard KPI cards.

---

### 4. Rooms data table

Create a premium responsive management table.

Columns:

* Room Name
* Room Type
* Floor
* Available Services
* Assigned Doctors
* Status
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* Edit Room
* Assign Services
* Assign Doctors
* View Details
* Mark Maintenance
* Deactivate

Do not generate destination pages yet, but structure actions clearly.

---

### 5. Add Room modal or drawer

Design a clean room creation form.

Fields:

* Room Name
* Room Code if useful
* Room Type
* Floor
* Description
* Status

Actions:

* Cancel
* Save Room

Keep it simple, operational, and clinic-admin-friendly.

---

### 6. Edit Room modal

Design a clean room edit form with fields similar to creation:

* Room Name
* Room Code
* Room Type
* Floor
* Description
* Status

Actions:

* Cancel
* Save Changes

---

### 7. Assign Services modal

Design a clean modal/drawer for assigning services that can be performed in a room.

Fields:

* Room Name
* Multi-select Services
* Optional Notes

Actions:

* Cancel
* Save Assignment

This should clearly support the operational flow where rooms and services are connected.

---

### 8. Assign Doctors modal

Design a clean modal/drawer for assigning doctors to a room.

Fields:

* Room Name
* Multi-select Doctors
* Optional Notes

Actions:

* Cancel
* Save Assignment

This should clearly support the operational flow where rooms and doctors can be connected.

---

### 9. Rooms quick insights area

Add a concise insights area showing useful operational signals such as:

* most utilized room type
* rooms without assigned doctors
* rooms without linked services
* rooms currently under maintenance
* most service-compatible room

Keep it concise and actionable.

---

### 10. Optional card/grid view toggle

Because rooms can work well as both table and card views, include a polished toggle for:

* Table View
* Card View

In card view, each room card can show:

* room name
* room type
* floor
* assigned doctors count
* available services count
* status badge

This is optional but recommended if it stays clean.

---

### 11. Empty state

Design a polished empty state for cases when no rooms exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Add Room button

---

## Data realism

Use believable clinic-level medical SaaS mock data such as:

* realistic room names
* plausible room types
* believable floor/location labels
* realistic service counts
* realistic doctor assignment counts
* credible statuses

Make the page feel like a real clinic operations product.

---

## UX expectations

The user should quickly understand:

* what rooms exist
* what each room is used for
* which doctors and services are connected to each room
* which rooms need configuration or attention
* what action to take next

This page should feel like a strong operational rooms management page, not just a facilities list.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Rooms Table
* Room Card
* Status Badge
* Action Dropdown
* View Toggle
* Add Room Modal
* Edit Room Modal
* Assign Services Modal
* Assign Doctors Modal
* Empty State
* Room Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the table gracefully
* filters wrap properly
* card view becomes especially usable
* action buttons remain accessible
* forms remain readable
* key room fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not split rooms into a new top-level sidebar module.
Do not redesign the Clinic Admin route root.

Services page = `/clinic-admin/services`
Rooms page inside Services module = `/clinic-admin/services/rooms`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Rooms`
* route: `/clinic-admin/services/rooms`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Warehouse Overview page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Products, Suppliers, Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/warehouse`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages
* Warehouse module structure should be ready for child pages:

  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Warehouse** must be active
* others inactive

### Warehouse module grouping rule

Inside the Warehouse module, this page must clearly belong to:

* Warehouse Overview → `/clinic-admin/warehouse`
* Products → `/clinic-admin/warehouse/products`
* Suppliers → `/clinic-admin/warehouse/suppliers`
* Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

This page is the parent overview page of the Warehouse module and must visually connect to Products and Suppliers later.

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Warehouse`

---

## Product context

This is the **clinic-scoped warehouse overview page** inside a medical CRM SaaS.

The Clinic Admin uses this page to monitor general warehouse and goods statistics for the current clinic / branch.

This page should help track:

* general stock health
* Kirim vs Chiqim
* total remaining goods
* total spent goods
* total output
* top spent goods
* few remaining items / low stock
* stock movement trends
* category consumption trends

This is not the detailed Products page and not the Suppliers page.
This is the **main warehouse analytics and operations overview page**.

---

## Design style

Create a **premium healthcare B2B warehouse overview page** with:

* clean white and blue interface
* operational analytics design
* strong chart hierarchy
* professional spacing
* soft card containers
* premium stock/operations dashboard feel
* data-rich but not cluttered layout
* calm medical SaaS visual language

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary charts, active states, filters, actions
* Teal for secondary analytics emphasis and positive indicators
* Warning and danger for low-stock or risky inventory signals
* keep the page premium, operational, and clean

---

## Route definition

* **Route:** `/clinic-admin/warehouse`
* **Page name:** Warehouse
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Warehouse

---

## Main page goal

This page should help the Clinic Admin:

* understand overall stock and warehouse condition
* monitor incoming vs outgoing goods
* identify low stock issues
* see top consumed goods
* understand usage trends
* navigate later to Products and Suppliers cleanly

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Warehouse`
* short supporting subtitle describing this as clinic warehouse overview and stock operations monitoring
* primary action button: `View Products`
* secondary action button: `View Suppliers`
* optional tertiary action: `Export`

This area should feel operational and analytical.

---

### 2. Main filter toolbar

Create a premium filter area with:

* date range filter
* category filter
* stock status filter
* movement type filter
* sort/view dropdown if useful
* reset filters button

### Suggested stock status options

* Healthy
* Low Stock
* Critical
* Out of Stock

### Suggested movement type options

* All
* Kirim
* Chiqim
* Consumption
* Adjustment

This filter bar should be clean and easy to scan.

---

### 3. Top KPI cards

Create a KPI row for:

* Total Left Goods
* Total Spent
* Total Output
* Low Stock Items
* Out of Stock Items
* Categories Tracked

Each KPI card should include:

* title
* large value
* trend or comparison indicator
* helper text
* compact professional card design

---

### 4. Kirim vs Chiqim section

Create a major analytics card for:

* **Kirim vs Chiqim**
* compare incoming vs outgoing goods over time
* use a clean bar or line chart
* responsive to filters

This must clearly represent warehouse inflow vs outflow.

---

### 5. Stock movement trend section

Create a chart card showing:

* stock movement over time
* incoming, outgoing, and consumption pattern
* default recent period behavior

This should feel like an operational trend chart.

---

### 6. Top spent goods section

Create a ranked section showing:

* product/good name
* category
* amount spent/consumed
* trend if useful

This should support:

* Top spent goods

Use a ranked list, horizontal bar chart, or hybrid card/table layout.

---

### 7. Few remainings / low stock section

Create a critical stock attention section showing:

* low stock items
* critical stock items
* remaining quantity
* min threshold if useful
* severity badge

This should support:

* The few remainings
* low stock monitoring

This section should visually stand out but still stay premium.

---

### 8. Category consumption section

Create a chart section for:

* category consumption trend
* distribution of usage by product category

Use:

* donut chart
* bar chart
* or a clean combined layout

This should help the admin understand which categories are used most.

---

### 9. Warehouse insights panel

Add a concise insights section with example signals such as:

* most consumed category
* fastest depleting item
* branch stock risk warning
* unusually high output pattern
* category with lowest remaining stock

Keep it concise, actionable, and executive-friendly.

---

### 10. Quick navigation cards

Create a compact section that visually connects to future Warehouse child pages:

* Products
* Suppliers

These can be cards or action buttons with short descriptions, such as:

* Manage all products and stock items
* Manage suppliers and purchase relationships

Do not generate those pages yet, only create navigation entry points.

---

### 11. Empty state / no data state

Design a polished empty state for cases when filters return no data.

Show:

* icon or illustration area
* short message
* helpful text
* reset filters action

---

## Data realism

Use believable clinic-level warehouse mock data such as:

* realistic medical goods/product names
* believable categories
* plausible stock counts
* credible consumption values
* realistic low-stock patterns
* meaningful category distribution
* believable inflow/outflow trends

Make the warehouse analytics feel like a real clinic operations platform.

---

## UX expectations

The user should quickly understand:

* current stock health
* incoming vs outgoing goods
* which items are being consumed most
* what items are running low
* which categories drive warehouse activity
* what operational attention is needed next

This page must feel operational, strategic, and clean.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Analytics Filter Toolbar
* KPI Stat Card
* Chart Card
* Ranked Goods Card
* Low Stock Alert Table/Card
* Category Consumption Card
* Insights Card
* Quick Navigation Cards
* Empty State

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* KPI cards wrap cleanly
* chart cards stack properly
* filters wrap into multiple rows
* ranked and alert sections remain readable
* analytics remain readable

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not split Warehouse into a separate root.
Do not redesign the Clinic Admin route root.

Warehouse overview page = `/clinic-admin/warehouse`
Products page later = `/clinic-admin/warehouse/products`
Suppliers page later = `/clinic-admin/warehouse/suppliers`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Warehouse Overview`
* route: `/clinic-admin/warehouse`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.



Build only the **Clinic Admin Products page** inside the **Warehouse module** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Suppliers, Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/warehouse/products`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages
* Warehouse module structure already established by `/clinic-admin/warehouse`

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Warehouse** must be active
* others inactive

### Warehouse module grouping rule

Inside the Warehouse module, this page must clearly belong to:

* Warehouse Overview → `/clinic-admin/warehouse`
* Products → `/clinic-admin/warehouse/products`
* Suppliers → `/clinic-admin/warehouse/suppliers`
* Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

This page is a child page of the Warehouse module and must visually feel connected to Warehouse Overview and Suppliers.

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Warehouse / Products`

---

## Product context

This is the **clinic-scoped products / goods management page** inside the **Warehouse module** of a medical CRM SaaS.

The Clinic Admin uses this page to:

* see all products and goods in the current clinic / branch
* manage stock items used for selling or servicing
* monitor stock quantity and stock health
* manage SKU, unit, purchase price, selling price, and product type
* monitor expiry-related items if relevant
* manage low stock and inventory warnings
* later navigate to Suppliers inside the Warehouse module

This is not the Warehouse Overview page.
This is the detailed products and goods management page inside Warehouse.

---

## Design style

Create a **premium healthcare B2B products management page** with:

* clean white and blue interface
* professional warehouse/inventory SaaS table design
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* premium operational feel
* data-rich but clean layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive highlights and positive stock indicators
* Warning and danger for low-stock and critical stock states
* White/light background for operational cleanliness
* Keep interface premium and calm

---

## Route definition

* **Route:** `/clinic-admin/warehouse/products`
* **Page name:** Products
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Warehouse

---

## Main page goal

This page should help the Clinic Admin:

* view all products and goods
* understand stock condition quickly
* manage product records
* identify low-stock and critical items
* understand pricing and usage role
* efficiently maintain clinic inventory items

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Products`
* short supporting subtitle describing this as product and goods management inside the Warehouse module
* primary action button: `Add Product`
* secondary action button: `View Suppliers`
* optional tertiary action: `Export`

This area should feel operational and structured.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* category filter
* product type filter
* stock status filter
* expiry status filter
* sort dropdown
* reset filters button

### Suggested product type options

* Sellable
* Consumable
* Both

### Suggested stock status options

* Healthy
* Low Stock
* Critical
* Out of Stock

### Suggested expiry status options

* All
* Near Expiry
* Expired
* No Expiry Tracking

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Products summary cards

Add a compact overview strip or mini KPI section for this page:

* Total Products
* Low Stock Items
* Out of Stock Items
* Near Expiry Items

Keep these lighter than dashboard KPI cards.

---

### 4. Products data table

Create a premium responsive management table.

Columns:

* Product Name
* Category
* SKU
* Unit
* Current Stock
* Min Stock
* Purchase Price
* Selling Price
* Product Type
* Expiry
* Status
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* stock status badges
* expiry badges where relevant
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* Edit Product
* Adjust Stock
* View Movements
* Mark Expired
* Deactivate

Do not generate destination pages yet, but structure actions clearly.

---

### 5. Add Product modal or drawer

Design a clean product creation form.

Fields:

* Product Name
* Category
* SKU
* Barcode if useful
* Unit
* Product Type
* Purchase Price
* Selling Price
* Current Stock
* Min Stock Level
* Expiry Date or expiry tracking toggle
* Status
* Notes / Description if useful

Actions:

* Cancel
* Save Product

Keep it simple, inventory-friendly, and clinic-admin-usable.

---

### 6. Edit Product modal

Design a clean product edit form with fields similar to creation:

* Product Name
* Category
* SKU
* Barcode
* Unit
* Product Type
* Purchase Price
* Selling Price
* Min Stock Level
* Expiry Date or expiry tracking
* Status
* Notes / Description

Actions:

* Cancel
* Save Changes

---

### 7. Adjust Stock modal

Design a clean modal/drawer for manual stock update.

Fields:

* Product Name
* Current Stock
* Adjustment Type:

  * Increase
  * Decrease
  * Correction
* Quantity
* Reason
* Notes if useful

Actions:

* Cancel
* Save Adjustment

This should support operational stock management.

---

### 8. Products quick insights area

Add a concise insights area showing useful operational signals such as:

* fastest depleting item
* highest stocked item
* products near expiry
* products below minimum stock
* most used consumable category

Keep it concise and actionable.

---

### 9. Optional product cards view

Because products can work in both table and card layouts, include a polished toggle for:

* Table View
* Card View

In card view, each product card can show:

* product name
* category
* stock count
* product type
* expiry badge
* stock status badge

This is optional but recommended if it stays clean.

---

### 10. Empty state

Design a polished empty state for cases when no products exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Add Product button

---

## Data realism

Use believable clinic-level inventory mock data such as:

* realistic medical product/goods names
* plausible categories
* believable SKU/unit formats
* realistic stock values
* credible pricing
* meaningful product types
* realistic expiry behavior
* believable stock statuses

Make the table feel like a real clinic inventory management product.

---

## UX expectations

The user should quickly understand:

* what products exist
* how much stock is available
* what items are low or critical
* which items are sellable vs consumable
* what items need attention soon
* what action to take next

This page should feel like a strong operational products management page, not just a stock spreadsheet.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Products Table
* Product Card
* Stock Status Badge
* Expiry Badge
* Action Dropdown
* View Toggle
* Add Product Modal
* Edit Product Modal
* Adjust Stock Modal
* Empty State
* Product Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the table gracefully
* filters wrap properly
* card view becomes especially usable
* action buttons remain accessible
* forms remain readable
* key stock and price fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not split Products into a new top-level sidebar module.
Do not redesign the Clinic Admin route root.

Warehouse overview page = `/clinic-admin/warehouse`
Products page inside Warehouse module = `/clinic-admin/warehouse/products`
Suppliers page later = `/clinic-admin/warehouse/suppliers`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Products`
* route: `/clinic-admin/warehouse/products`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Suppliers page** inside the **Warehouse module** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Supplier Detail, Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/warehouse/suppliers`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages
* Warehouse module structure already established by:

  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Warehouse** must be active
* others inactive

### Warehouse module grouping rule

Inside the Warehouse module, this page must clearly belong to:

* Warehouse Overview → `/clinic-admin/warehouse`
* Products → `/clinic-admin/warehouse/products`
* Suppliers → `/clinic-admin/warehouse/suppliers`
* Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

This page is a child page of the Warehouse module and must visually feel connected to Warehouse Overview and Products.

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Warehouse / Suppliers`

---

## Product context

This is the **clinic-scoped suppliers management page** inside the **Warehouse module** of a medical CRM SaaS.

The Clinic Admin uses this page to:

* see all suppliers for the current clinic / branch
* manage supplier records
* monitor supplier activity and supply relationships
* understand how many products each supplier provides
* understand recent supply activity
* later open supplier detail pages

This is not the Warehouse Overview page and not the Products page.
This is the suppliers list and management page inside Warehouse.

---

## Design style

Create a **premium healthcare B2B suppliers management page** with:

* clean white and blue interface
* professional warehouse/vendor SaaS table design
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* premium operational feel
* data-rich but clean layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive highlights and positive supply signals
* White/light background for operational cleanliness
* Keep interface premium and calm

---

## Route definition

* **Route:** `/clinic-admin/warehouse/suppliers`
* **Page name:** Suppliers
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Warehouse

---

## Main page goal

This page should help the Clinic Admin:

* view all suppliers
* understand supplier activity quickly
* identify key suppliers
* manage supplier contacts and status
* later navigate to supplier detail pages without route confusion

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Suppliers`
* short supporting subtitle describing this as supplier management inside the Warehouse module
* primary action button: `Add Supplier`
* secondary action button: `View Products`
* optional tertiary action: `Export`

This area should feel operational and structured.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* status filter
* product category filter
* recent supply date filter
* products count filter
* sort dropdown
* reset filters button

### Suggested supplier status options

* Active
* Inactive
* Preferred
* On Hold

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Suppliers summary cards

Add a compact overview strip or mini KPI section for this page:

* Total Suppliers
* Active Suppliers
* Preferred Suppliers
* Recently Active Suppliers

Keep these lighter than dashboard KPI cards.

---

### 4. Suppliers data table

Create a premium responsive management table.

Columns:

* Supplier Name
* Contact
* Products Count
* Total Orders
* Recent Supply Date
* Status
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View Supplier
* Edit Supplier
* View Linked Products
* Mark Preferred
* Activate / Deactivate

Do not generate destination pages yet, but structure actions clearly.

---

### 5. Add Supplier modal or drawer

Design a clean supplier creation form.

Fields:

* Supplier Name
* Contact Person
* Phone
* Email
* Address
* Notes
* Status

Actions:

* Cancel
* Save Supplier

Keep it simple, operational, and clinic-admin-friendly.

---

### 6. Edit Supplier modal

Design a clean supplier edit form with fields similar to creation:

* Supplier Name
* Contact Person
* Phone
* Email
* Address
* Notes
* Status

Actions:

* Cancel
* Save Changes

---

### 7. Link Products modal

Design a clean modal/drawer for linking products to a supplier.

Fields:

* Supplier Name
* Multi-select Products
* Supplier SKU if useful
* Preferred Supplier toggle if useful
* Notes if useful

Actions:

* Cancel
* Save Links

This should clearly support the operational flow where suppliers are connected to products.

---

### 8. Suppliers quick insights area

Add a concise insights area showing useful operational signals such as:

* supplier with most products
* most recently active supplier
* suppliers without recent orders
* preferred supplier count
* supplier category concentration if useful

Keep it concise and actionable.

---

### 9. Optional supplier cards view

Because supplier data can work in both table and card layouts, include a polished toggle for:

* Table View
* Card View

In card view, each supplier card can show:

* supplier name
* contact person
* products count
* recent supply date
* status badge

This is optional but recommended if it stays clean.

---

### 10. Empty state

Design a polished empty state for cases when no suppliers exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Add Supplier button

---

## Data realism

Use believable clinic-level supplier mock data such as:

* realistic supplier names
* plausible contact names
* believable products counts
* realistic recent supply dates
* credible order counts
* meaningful statuses

Make the page feel like a real clinic procurement management product.

---

## UX expectations

The user should quickly understand:

* which suppliers exist
* which suppliers are active or preferred
* how many products each supplier provides
* who to contact
* which suppliers need attention
* what action to take next

This page should feel like a strong operational suppliers management page, not just a contacts table.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Suppliers Table
* Supplier Card
* Status Badge
* Action Dropdown
* View Toggle
* Add Supplier Modal
* Edit Supplier Modal
* Link Products Modal
* Empty State
* Supplier Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the table gracefully
* filters wrap properly
* card view becomes especially usable
* action buttons remain accessible
* forms remain readable
* key supplier fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not split Suppliers into a new top-level sidebar module.
Do not redesign the Clinic Admin route root.

Warehouse overview page = `/clinic-admin/warehouse`
Products page = `/clinic-admin/warehouse/products`
Suppliers page inside Warehouse module = `/clinic-admin/warehouse/suppliers`
Supplier detail page later = `/clinic-admin/warehouse/suppliers/:id`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Suppliers`
* route: `/clinic-admin/warehouse/suppliers`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Supplier Detail page** inside the **Warehouse module** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Payments, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/warehouse/suppliers/:id`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages
* Warehouse module structure already established by:

  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Warehouse** must be active
* others inactive

### Warehouse module grouping rule

Inside the Warehouse module, this page must clearly belong to:

* Warehouse Overview → `/clinic-admin/warehouse`
* Products → `/clinic-admin/warehouse/products`
* Suppliers → `/clinic-admin/warehouse/suppliers`
* Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

This page is a child page of the Suppliers section and must visually feel connected to the Suppliers list, not like a separate module.

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Warehouse / Suppliers / Supplier Profile`

---

## Product context

This is the **supplier detail / supplier profile page** inside the **Warehouse module** of a medical CRM SaaS.

The Clinic Admin uses this page to:

* view one supplier’s full profile
* understand supplier contact and business details
* review linked products
* review purchase/supply history
* understand total supplied value
* review recent orders and activity
* manage supplier relationship details

This is not the suppliers list page.
This is the detailed supplier management page for one selected supplier.

---

## Design style

Create a **premium healthcare B2B supplier profile page** with:

* clean white and blue interface
* structured operational detail layout
* clear sections and tabs
* readable cards
* soft shadows
* premium warehouse/procurement SaaS feel
* strong hierarchy without clutter

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active tabs, links, selected states
* Teal for supportive highlights and useful procurement emphasis
* White/light background for operational cleanliness
* Keep interface premium and calm

---

## Route definition

* **Route:** `/clinic-admin/warehouse/suppliers/:id`
* **Page name:** Supplier Profile
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Warehouse

---

## Main page goal

This page should help the Clinic Admin quickly understand:

* who the supplier is
* how to contact them
* what products they supply
* how much value they have supplied
* what recent purchase/supply activity looks like
* whether this supplier is active, preferred, or at risk

The page should be detail-rich but easy to scan.

---

## Main page structure

### 1. Top supplier header section

Create a strong page header/profile summary area with:

* supplier name
* contact person
* phone
* email
* status badge
* preferred supplier indicator if useful
* quick actions such as:

  * Edit Supplier
  * Link Products
  * Add Purchase Record
  * Mark Preferred

This section should feel like the supplier identity anchor for the page.

---

### 2. Supplier overview cards

Create a compact summary strip showing:

* Products Linked
* Total Orders
* Total Supplied Value
* Recent Supply Date

These cards should feel clean and operational.

---

## Main content tabs

Design this page with clear tabs.

Tabs must be:

1. Overview
2. Linked Products
3. Purchase History
4. Recent Orders
5. Notes

Do not create extra tabs.

---

## Tab 1: Overview

This tab should show the main supplier profile in structured cards/sections.

### Overview content

Show:

* Supplier Name
* Contact Person
* Phone
* Email
* Address
* Status
* Preferred Supplier flag
* First Added Date if useful
* Recent Supply Date
* Total Orders
* Total Supplied Value
* Notes / Description if useful

Design this as a premium two-column or card-based detail layout.

Include:

* edit button
* subtle operational detail styling

---

## Tab 2: Linked Products

Create a clean linked-products section.

Show a structured table or card list with:

* product name
* category
* supplier SKU if useful
* last purchase price
* stock status if useful
* preferred supplier flag
* action to view product

This section should show products connected to this supplier.

Include:

* search input
* product category filter if useful
* Link Product button
* empty state if no linked products exist

---

## Tab 3: Purchase History

Create a purchase/supply history section.

Show a structured table with:

* purchase/order number
* date
* products count
* total amount
* status
* action to view more

Possible statuses:

* Draft
* Ordered
* Partially Received
* Received
* Cancelled

This tab should feel like a usable procurement history log.

---

## Tab 4: Recent Orders

Create a recent orders section focused on more recent activity.

Show:

* recent purchase records
* supply dates
* amount
* order status
* linked products count

This tab should feel different from full purchase history by emphasizing recent/current activity.

You may use:

* compact table
* recent activity cards
* timeline if clean

Choose the cleaner operational SaaS option.

---

## Tab 5: Notes

Create a supplier notes section.

Show notes in a professional admin/procurement note layout with:

* note author
* date/time
* note content
* note category if useful

Support note types such as:

* supplier note
* procurement note
* delivery note
* finance note

Include:

* Add Note button
* note input modal or inline form
* searchable or filterable notes if useful

---

## Forms / modals for this page

### Edit Supplier modal or drawer

Create a clean supplier edit form with fields:

* Supplier Name
* Contact Person
* Phone
* Email
* Address
* Status
* Preferred Supplier toggle
* Notes / Description

Actions:

* Cancel
* Save Changes

---

### Link Products modal

Create a clean modal/drawer for linking products to this supplier.

Fields:

* Supplier Name
* Multi-select Products
* Supplier SKU if useful
* Preferred Supplier toggle if useful
* Notes if useful

Actions:

* Cancel
* Save Links

---

### Add Purchase Record modal

Create a clean modal/drawer for adding a purchase/supply record.

Fields:

* Supplier Name
* Order Number
* Date
* Products / items selector
* Quantity
* Total Amount
* Status
* Notes if useful

Actions:

* Cancel
* Save Record

---

### Add Note modal

Create a clean note creation UI with:

* note type
* note content

Actions:

* Cancel
* Save Note

---

## Data realism

Use believable clinic-level supplier/procurement mock data such as:

* realistic supplier names
* plausible contact details
* believable product links
* realistic order numbers
* credible supply values
* meaningful statuses
* believable notes and recent activity

Make the page feel like a real supplier profile inside a clinic procurement platform.

---

## UX expectations

The user should quickly understand:

* supplier identity and contact
* supply relationship strength
* linked products
* purchase history
* recent orders
* supplier notes and operational context
* next actions to take

This page should feel trustworthy, operationally useful, and procurement-friendly.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Supplier Header Card
* Overview Stat Cards
* Tab Navigation
* Detail Info Cards
* Linked Products Table/Card
* Purchase History Table
* Recent Orders Card/List
* Notes Feed
* Edit Supplier Modal
* Link Products Modal
* Add Purchase Record Modal
* Add Note Modal
* Empty State

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* supplier header stacks cleanly
* tabs remain usable
* detail cards stack properly
* linked products and history tables degrade gracefully
* modals stay readable

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not merge this page into products or warehouse overview.
Do not redesign the Clinic Admin route root.

Suppliers list page = `/clinic-admin/warehouse/suppliers`
Supplier detail page = `/clinic-admin/warehouse/suppliers/:id`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Supplier Profile`
* route: `/clinic-admin/warehouse/suppliers/:id`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.




Build only the **Clinic Admin Payments Overview page** inside the **Payments module** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Invoices, Create Invoice, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/payments`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages
* Payments module structure should be ready for child pages:

  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Payments** must be active
* others inactive

### Payments module grouping rule

Inside the Payments module, this page must clearly belong to:

* Payments Overview → `/clinic-admin/payments`
* Invoices → `/clinic-admin/payments/invoices`
* Create Invoice → `/clinic-admin/payments/invoices/create`

This page is the parent overview page of the Payments module and must visually connect to Invoices and Create Invoice later.

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Payments`

---

## Product context

This is the **clinic-scoped payments overview page** inside a medical CRM SaaS.

The Clinic Admin uses this page to monitor financial collection activity for the current clinic / branch.

This page should help track:

* payment records
* payment methods and providers
* paid vs failed vs refunded outcomes
* payment volume over time
* top payment methods
* outstanding financial signals
* recent transactions
* quick navigation to invoices and invoice creation

This is not the detailed Invoices page.
This is the **main payments analytics and transaction overview page**.

---

## Design style

Create a **premium healthcare B2B payments overview page** with:

* clean white and blue interface
* operational finance dashboard design
* strong chart hierarchy
* professional spacing
* soft card containers
* premium billing/collections SaaS feel
* data-rich but not cluttered layout
* calm medical SaaS visual language

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary charts, active states, filters, actions
* Teal for secondary analytics emphasis and positive payment indicators
* Success/warning/danger for payment statuses and risk signals
* keep the page premium, financial, and clean

---

## Route definition

* **Route:** `/clinic-admin/payments`
* **Page name:** Payments
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Payments

---

## Main page goal

This page should help the Clinic Admin:

* understand overall payment performance
* monitor transaction health
* identify failed/refunded patterns
* understand which payment methods are used most
* see recent payment activity
* navigate later to invoices and invoice creation cleanly

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Payments`
* short supporting subtitle describing this as clinic payment overview and transaction monitoring
* primary action button: `View Invoices`
* secondary action button: `Create Invoice`
* optional tertiary action: `Export`

This area should feel operational and finance-oriented.

---

### 2. Main filter toolbar

Create a premium filter area with:

* date range filter
* payment method filter
* provider filter
* payment status filter
* patient filter if useful
* sort/view dropdown if useful
* reset filters button

### Suggested payment status options

* Succeeded
* Pending
* Failed
* Refunded
* Cancelled

### Suggested payment method options

* Cash
* Card
* Bank Transfer
* Click
* Payme
* Insurance
* Mixed

This filter bar should be clean and easy to scan.

---

### 3. Top KPI cards

Create a KPI row for:

* Total Collected
* Successful Payments
* Failed Payments
* Refunded Amount
* Pending Transactions
* Average Payment Size

Each KPI card should include:

* title
* large value
* trend or comparison indicator
* helper text
* compact professional card design

---

### 4. Payment volume trend section

Create a major analytics card for:

* payment volume over time
* successful vs failed trend if useful
* line or bar chart
* responsive to filters

This should feel like the main finance trend section.

---

### 5. Payment methods distribution section

Create a section showing:

* payment method usage distribution
* payment amount by method
* top collection channels

Use:

* donut chart
* bar chart
* or a clean combined layout

This should help the Clinic Admin understand how patients pay.

---

### 6. Payment status breakdown section

Create a section for:

* succeeded
* pending
* failed
* refunded
* cancelled

Use:

* donut chart
* segmented breakdown cards
* percentage + count labels

This should clearly communicate transaction health.

---

### 7. Recent transactions section

Create a structured recent-transactions table or card list.

Fields should include:

* payment ID or transaction reference
* patient
* invoice reference
* payment method
* provider
* amount
* date
* status

Include actions such as:

* View Payment
* View Invoice
* Retry / Review if status is failed or pending

This is a preview/overview section, not a full invoices table.

---

### 8. Top payment providers / methods section

Create a compact section highlighting:

* most used payment method
* highest grossing payment method
* provider success rate
* provider/refund pattern if useful

Keep it concise and operational.

---

### 9. Outstanding / risk signals section

Create a small finance risk panel showing:

* unpaid-related payment risk hints
* failed transaction concentration
* refund spikes
* pending payment backlog

This should feel like an actionable clinic finance monitoring block.

---

### 10. Quick navigation cards

Create a compact section that visually connects to future Payments child pages:

* Invoices
* Create Invoice

These can be cards or action buttons with short descriptions, such as:

* Manage invoice records and statuses
* Create a new invoice from services and products

Do not generate those pages yet, only create navigation entry points.

---

### 11. Empty state / no data state

Design a polished empty state for cases when filters return no data.

Show:

* icon or illustration area
* short message
* helpful text
* reset filters action

---

## Data realism

Use believable clinic-level payment mock data such as:

* realistic payment methods used in clinics
* credible provider names
* plausible payment amounts
* meaningful payment statuses
* realistic recent transaction patterns
* believable refund/failure distribution

Make the payments analytics feel like a real clinic operations platform.

---

## UX expectations

The user should quickly understand:

* how much money has been collected
* whether payments are succeeding
* which methods are used most
* what transactions need attention
* what risk signals are present
* what financial action is needed next

This page must feel operational, finance-aware, and clean.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Analytics Filter Toolbar
* KPI Stat Card
* Chart Card
* Payment Status Breakdown Card
* Transactions Table/Card
* Risk Signals Card
* Payment Methods Card
* Quick Navigation Cards
* Empty State

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* KPI cards wrap cleanly
* chart cards stack properly
* filters wrap into multiple rows
* recent transactions remain readable
* analytics remain readable

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not split Payments into a separate root.
Do not redesign the Clinic Admin route root.

Payments overview page = `/clinic-admin/payments`
Invoices page later = `/clinic-admin/payments/invoices`
Create Invoice page later = `/clinic-admin/payments/invoices/create`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Payments Overview`
* route: `/clinic-admin/payments`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Invoices page** inside the **Payments module** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Create Invoice, Sources, or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/payments/invoices`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages
* Payments module structure already established by:

  * `/clinic-admin/payments`

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Payments** must be active
* others inactive

### Payments module grouping rule

Inside the Payments module, this page must clearly belong to:

* Payments Overview → `/clinic-admin/payments`
* Invoices → `/clinic-admin/payments/invoices`
* Create Invoice → `/clinic-admin/payments/invoices/create`

This page is a child page of the Payments module and must visually feel connected to Payments Overview and Create Invoice.

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Payments / Invoices`

---

## Product context

This is the **clinic-scoped invoices management page** inside the **Payments module** of a medical CRM SaaS.

The Clinic Admin uses this page to:

* see all invoices in the current clinic / branch
* search and filter invoices
* monitor invoice statuses
* understand billed, paid, and due amounts
* review invoice records connected to patients and doctors
* navigate to create a new invoice

This is not the payments overview page.
This is the detailed invoices list and management page inside Payments.

---

## Design style

Create a **premium healthcare B2B invoices management page** with:

* clean white and blue interface
* professional billing SaaS table design
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* premium finance/operations feel
* data-rich but clean layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive highlights and positive finance indicators
* Success/warning/danger for invoice statuses and risk signals
* White/light background for financial cleanliness
* Keep interface premium and calm

---

## Route definition

* **Route:** `/clinic-admin/payments/invoices`
* **Page name:** Invoices
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Payments

---

## Main page goal

This page should help the Clinic Admin:

* view all invoices
* understand invoice status quickly
* identify unpaid and overdue invoices
* review invoice amounts and payment progress
* connect invoices to patients and doctors
* manage invoice records efficiently
* navigate later to invoice creation without route confusion

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Invoices`
* short supporting subtitle describing this as invoice management inside the Payments module
* primary action button: `Create Invoice`
* secondary action button: `Export`

This area should feel operational and finance-oriented.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* invoice status filter
* doctor filter
* patient filter
* date range filter
* due status filter
* sort dropdown
* reset filters button

### Required invoice status options

* Paid
* Unpaid
* Draft
* Cancelled

### Suggested due status options

* All
* Due Today
* Overdue
* Upcoming
* No Due Date

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Invoices summary cards

Add a compact overview strip or mini KPI section for this page:

* Total Invoices
* Paid Invoices
* Unpaid Invoices
* Cancelled Invoices
* Total Billed Amount
* Outstanding Amount

Keep these lighter than dashboard KPI cards.

---

### 4. Invoices data table

Create a premium responsive management table.

Columns:

* Invoice Number
* Patient
* Doctor
* Date
* Total
* Paid
* Due
* Status
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* status badges
* amount emphasis
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View Invoice
* Edit Invoice
* Mark as Paid
* Cancel Invoice
* Duplicate Invoice
* Print / Download

Do not generate separate invoice detail pages unless represented as drawer/modal behavior inside this page.

---

### 5. Invoice detail drawer or modal

Design a clean invoice detail drawer or modal that opens from the table.

Show:

* invoice number
* patient
* doctor
* issue date
* due date
* status
* line items
* subtotal
* discounts
* total
* paid amount
* remaining due
* payment history preview if useful

This keeps invoice review possible without requiring a separate route.

---

### 6. Mark as Paid modal

Design a clean finance-friendly modal for marking an invoice as paid.

Fields:

* Invoice Number
* Total Amount
* Remaining Due
* Payment Method
* Provider if useful
* Paid Amount
* Payment Date
* Notes

Actions:

* Cancel
* Confirm Payment

This should feel operationally clear and safe.

---

### 7. Cancel Invoice modal

Design a clean confirmation modal for cancelling an invoice.

Show:

* invoice number
* patient name
* total amount
* cancellation reason input

Actions:

* Back
* Confirm Cancellation

Use a careful finance-oriented destructive action design.

---

### 8. Invoice quick insights area

Add a concise insights area showing useful financial signals such as:

* unpaid concentration
* highest invoice value
* most common invoice status
* overdue invoice count
* doctor with highest billed invoices if useful

Keep it concise and actionable.

---

### 9. Optional invoice cards view

Because invoices can work in both table and card layouts, include a polished toggle for:

* Table View
* Card View

In card view, each invoice card can show:

* invoice number
* patient
* doctor
* total
* paid
* due
* status badge
* date

This is optional but recommended if it stays clean.

---

### 10. Empty state

Design a polished empty state for cases when no invoices exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Create Invoice button

---

## Data realism

Use believable clinic-level invoice mock data such as:

* realistic invoice numbers
* plausible patient and doctor names
* meaningful amounts
* believable paid/due splits
* realistic dates
* credible invoice statuses

Make the page feel like a real clinic billing management product.

---

## UX expectations

The user should quickly understand:

* which invoices exist
* which are paid or unpaid
* how much is outstanding
* which invoices need action
* what billing patterns need attention
* what action to take next

This page should feel like a strong operational invoice management page, not just a finance table.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Invoices Table
* Invoice Card
* Status Badge
* Action Dropdown
* View Toggle
* Invoice Detail Drawer
* Mark as Paid Modal
* Cancel Invoice Modal
* Empty State
* Invoice Insight Card

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the table gracefully
* filters wrap properly
* card view becomes especially usable
* action buttons remain accessible
* drawers and modals remain readable
* key invoice fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not split Invoices into a new top-level sidebar module.
Do not redesign the Clinic Admin route root.

Payments overview page = `/clinic-admin/payments`
Invoices page inside Payments module = `/clinic-admin/payments/invoices`
Create Invoice page later = `/clinic-admin/payments/invoices/create`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Invoices`
* route: `/clinic-admin/payments/invoices`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.

Build only the **Clinic Admin Create Invoice page** inside the **Payments module** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Sources or other unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/payments/invoices/create`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages
* Payments module structure already established by:

  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Payments** must be active
* others inactive

### Payments module grouping rule

Inside the Payments module, this page must clearly belong to:

* Payments Overview → `/clinic-admin/payments`
* Invoices → `/clinic-admin/payments/invoices`
* Create Invoice → `/clinic-admin/payments/invoices/create`

This page is a child page of the Payments module and must visually feel connected to Payments Overview and Invoices.

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Payments / Create Invoice`

---

## Product context

This is the **clinic-scoped invoice creation page** inside the **Payments module** of a medical CRM SaaS.

The Clinic Admin uses this page to create a new invoice for a patient using:

* services
* products / goods
* encounter/treatment-related service lines
* manual adjustments if needed

The page must support the clinic workflow where:

* selected services and products are linked
* service lines can be added from encounter/treatment
* product lines can be added if sold
* totals auto-calculate
* status badges are visible
* payment action can happen after invoice creation

This is not the invoices list page.
This is the dedicated invoice creation workflow page.

---

## Design style

Create a **premium healthcare B2B invoice creation page** with:

* clean white and blue interface
* structured finance form layout
* premium billing workflow feel
* strong spacing
* soft cards
* subtle shadows
* clear form hierarchy
* operational and trustworthy visual design

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary actions, active steps, selected states, links
* Teal for supportive highlights and positive finance signals
* Success/warning/danger for invoice/payment statuses and validations
* White/light background for clean financial workflow presentation
* Keep interface premium and calm

---

## Route definition

* **Route:** `/clinic-admin/payments/invoices/create`
* **Page name:** Create Invoice
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Payments

---

## Main page goal

This page should help the Clinic Admin:

* create a new invoice quickly and safely
* select the patient and doctor context
* add services and products into invoice lines
* see auto-calculated totals live
* understand invoice status before saving
* optionally trigger payment collection after invoice creation

This page should feel like a strong invoice-builder workflow, not a generic form.

---

## Main page structure

### 1. Page top section

Create a strong page header section with:

* page title: `Create Invoice`
* short supporting subtitle describing this as invoice creation inside the Payments module
* primary action button: `Save Invoice`
* secondary action button: `Save as Draft`
* optional tertiary action: `Cancel`

This area should feel finance-oriented and action-ready.

---

### 2. Invoice status strip

Create a compact status/summary strip near the top showing:

* Invoice Status
* Draft / Unpaid visual state
* Selected Patient
* Selected Doctor
* Current Total

This should update visually as data is entered.

---

### 3. Invoice form layout

Design the page as a structured multi-section creation workflow.
A two-column layout is recommended:

* **Left/main column:** invoice details and line items
* **Right/summary column:** totals, status, payment summary, quick actions

Keep it clean and professional.

---

## Main form sections

### 4. Basic invoice information

Create a main details card with fields:

* Invoice Number
* Patient selector
* Doctor selector
* Issue Date
* Due Date
* Notes
* Status

### Status options

* Draft
* Unpaid

Do not allow Paid as initial default unless explicitly triggered after creation.

Patient and doctor selectors should feel searchable and premium.

---

### 5. Add service lines section

Create a section for adding invoice service lines.

This section must support:

* add service manually
* add service from encounter / treatment context
* quantity
* unit price
* discount
* line total

Fields per service row:

* Service
* Source / Encounter reference if useful
* Quantity
* Unit Price
* Discount
* Total
* Remove row action

Include:

* `Add Service` button
* optional `Import from Encounter` button

This section should clearly support the workflow:

* service lines can be added from encounter/treatment

---

### 6. Add product lines section

Create a section for adding product/goods lines.

This section must support:

* adding products sold directly
* quantity
* unit price
* discount
* line total

Fields per product row:

* Product
* Quantity
* Unit Price
* Discount
* Total
* Remove row action

Include:

* `Add Product` button

This section should clearly support the workflow:

* product lines can be added if sold

---

### 7. Optional adjustments section

Create an optional adjustments block for:

* manual adjustment
* additional charge
* discount
* tax if useful

Keep it clean and not overly accounting-heavy.

Possible fields:

* Adjustment label
* Type
* Amount

This is optional but should be supported cleanly.

---

### 8. Linked context indicators

Where suitable, show subtle indicators that connect invoice lines to:

* patient
* doctor
* encounter/treatment
* service
* product

This helps the invoice feel traceable and operationally grounded.

---

## Right-side summary panel

### 9. Invoice summary card

Create a sticky or clearly visible summary panel showing:

* services subtotal
* products subtotal
* discounts total
* adjustments total
* grand total

Update totals live as the form changes.

---

### 10. Payment readiness / quick payment card

Create a compact card showing:

* status after save will be Draft or Unpaid
* amount due
* quick action button: `Save & Collect Payment`
* quick action button: `Save Invoice`

This should make next-step payment workflow obvious without needing a separate immediate page flow.

---

### 11. Validation / alerts card

Create a clean small validation area that shows helpful warnings such as:

* no patient selected
* no invoice lines added
* due date before issue date
* stock warning for selected product if useful
* service line missing price

Keep these messages premium and non-intrusive.

---

## Suggested interaction model

The page should support these clear actions:

* Save as Draft
* Save as Unpaid
* Save & Collect Payment
* Cancel

Make sure the form and UI clearly separate these outcomes.

---

## Optional stepper/header flow

If helpful, you may represent the creation process as a soft workflow such as:

1. Invoice Info
2. Add Items
3. Review Totals
4. Save / Collect Payment

Only use this if it stays clean and does not overcomplicate the page.

---

## Data realism

Use believable clinic-level invoice mock data such as:

* realistic patients
* realistic doctors
* realistic service names and prices
* realistic product names and prices
* plausible discounts and totals
* believable invoice numbering

Make the page feel like a real clinic billing workflow.

---

## UX expectations

The user should quickly understand:

* who the invoice is for
* what services/products are included
* how totals are formed
* what the current status is
* what happens when they save
* how to continue to payment

This page should feel like a strong transactional workflow page, not just a long form.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Invoice Status Strip
* Searchable Select Inputs
* Service Line Item Table/Rows
* Product Line Item Table/Rows
* Adjustments Block
* Invoice Summary Card
* Payment Readiness Card
* Validation Alerts Card
* Sticky Summary Sidebar

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* main form and summary stack properly
* line-item sections remain usable
* buttons stay visible and clear
* totals remain readable
* selectors and date fields remain easy to use

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not split Create Invoice into a new top-level sidebar module.
Do not redesign the Clinic Admin route root.

Payments overview page = `/clinic-admin/payments`
Invoices page = `/clinic-admin/payments/invoices`
Create Invoice page inside Payments module = `/clinic-admin/payments/invoices/create`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Create Invoice`
* route: `/clinic-admin/payments/invoices/create`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Clinic Admin Sources page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Clinic Admin App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate any unrelated pages now.
Do **not** change existing route structure.

---

## Correct Clinic Admin route hierarchy

This project must follow this Clinic Admin route hierarchy exactly:

* `/clinic-admin`

  * `/clinic-admin/dashboard`
  * `/clinic-admin/branch-details`
  * `/clinic-admin/patients`
  * `/clinic-admin/patients/:id`
  * `/clinic-admin/doctors`
  * `/clinic-admin/doctors/:id`
  * `/clinic-admin/doctors/analytics`
  * `/clinic-admin/services`
  * `/clinic-admin/services/rooms`
  * `/clinic-admin/warehouse`
  * `/clinic-admin/warehouse/products`
  * `/clinic-admin/warehouse/suppliers`
  * `/clinic-admin/warehouse/suppliers/:id`
  * `/clinic-admin/payments`
  * `/clinic-admin/payments/invoices`
  * `/clinic-admin/payments/invoices/create`
  * `/clinic-admin/sources`

For this task, generate only:

* **Page route:** `/clinic-admin/sources`

This page belongs inside the existing **Clinic Admin App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Clinic Admin App Layout
* left sidebar
* top header
* breadcrumb area
* shared Clinic Admin visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Clinic Admin section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. Branch Details
3. Patients
4. Doctors
5. Services
6. Warehouse
7. Payments
8. Sources

For this page:

* **Sources** must be active
* others inactive

### Future nested grouping rules

The sidebar must still support these future nested sections without changing layout:

* **Doctors**

  * Doctors List → `/clinic-admin/doctors`
  * Doctor Profile → `/clinic-admin/doctors/:id`
  * Doctor Analytics → `/clinic-admin/doctors/analytics`

* **Services**

  * Services List → `/clinic-admin/services`
  * Rooms → `/clinic-admin/services/rooms`

* **Warehouse**

  * Warehouse Overview → `/clinic-admin/warehouse`
  * Products → `/clinic-admin/warehouse/products`
  * Suppliers → `/clinic-admin/warehouse/suppliers`
  * Supplier Detail → `/clinic-admin/warehouse/suppliers/:id`

* **Payments**

  * Payments Overview → `/clinic-admin/payments`
  * Invoices → `/clinic-admin/payments/invoices`
  * Create Invoice → `/clinic-admin/payments/invoices/create`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Clinic Admin / Sources`

---

## Product context

This is the **clinic-scoped patient acquisition sources management page** inside a medical CRM SaaS.

The Clinic Admin uses this page to:

* manage patient acquisition sources for the current clinic / branch
* track where patients come from
* monitor conversions and revenue generated by source
* manage sources such as:

  * app
  * telegram
  * instagram
  * website
  * referral
  * walk-in / manual
* review source performance over time
* add and configure clinic-level sources

This page is both:

* a **sources management page**
* and a **light analytics/performance page** for source effectiveness

---

## Design style

Create a **premium healthcare B2B sources management page** with:

* clean white and blue interface
* premium SaaS marketing-source management feel
* clear table + analytics layout
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* data-rich but clean layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive analytics highlights and positive acquisition indicators
* Success/warning/danger only for meaningful source performance or status signals
* White/light background for clarity and cleanliness
* Keep interface premium and calm

---

## Route definition

* **Route:** `/clinic-admin/sources`
* **Page name:** Sources
* **Layout parent:** Clinic Admin App Layout
* **Sidebar active item:** Sources

---

## Main page goal

This page should help the Clinic Admin:

* view all patient acquisition sources
* understand how well each source performs
* identify which sources bring the most patients
* identify which sources generate the most revenue
* manage source records and statuses
* make better operational/marketing decisions based on source data

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `Sources`
* short supporting subtitle describing this as patient acquisition source management and performance monitoring
* primary action button: `Add Source`
* secondary action button: `Export`

This area should feel operational and analytics-aware.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* source type filter
* status filter
* date range filter
* performance filter if useful
* sort dropdown
* reset filters button

### Suggested source type options

* App
* Telegram
* Instagram
* Website
* Referral
* Walk-in / Manual
* Partner / Campaign

### Suggested status options

* Active
* Inactive
* Paused

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Sources summary cards

Add a compact overview strip or mini KPI section for this page:

* Total Sources
* Active Sources
* Total Patients from Sources
* Total Revenue from Sources

Keep these lighter than dashboard KPI cards.

---

### 4. Sources data table

Create a premium responsive management table.

Columns:

* Source Name
* Type
* Linked Patients
* Conversions
* Revenue Generated
* Activity Trend
* Status
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* source type badges
* status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View Performance
* Edit Source
* Pause / Activate
* Duplicate Source
* Delete Source

Do not create separate detail routes unless represented as drawer/modal behavior inside this page.

---

### 5. Source performance analytics section

Create a dedicated analytics section showing source performance.

Include:

* patients by source
* revenue by source
* source activity trend over time

Suggested visualizations:

* bar chart for source comparison
* line chart for trend over time
* donut chart for source share distribution if useful

This section should help the Clinic Admin compare source effectiveness quickly.

---

### 6. Top sources / source ranking section

Create a ranked section showing:

* top sources by patient count
* top sources by revenue
* best conversion source if useful

This can be:

* ranked cards
* horizontal bar chart
* compact leaderboard table

Keep it concise and actionable.

---

### 7. Add Source modal or drawer

Design a clean source creation form.

Fields:

* Source Name
* Source Type
* Description
* Tracking Code or External Reference if useful
* Status
* Notes if useful

Actions:

* Cancel
* Save Source

This should support practical clinic source management.

---

### 8. Edit Source modal

Design a clean source edit form with fields similar to creation:

* Source Name
* Source Type
* Description
* Tracking Code or External Reference
* Status
* Notes

Actions:

* Cancel
* Save Changes

---

### 9. Source performance drawer or modal

Design a clean drawer/modal for viewing one source’s performance details without a separate route.

Show:

* source name
* type
* patient count
* conversions
* revenue generated
* recent activity
* small trend chart
* related notes if useful

This lets source review happen within the same page.

---

### 10. Sources quick insights area

Add a concise insights area showing useful signals such as:

* best performing source by patients
* best performing source by revenue
* source with declining activity
* newly added source with good traction
* underperforming active source

Keep it concise and actionable.

---

### 11. Optional cards view

Because sources can work in both table and card layouts, include a polished toggle for:

* Table View
* Card View

In card view, each source card can show:

* source name
* source type
* patients count
* revenue
* status badge
* mini trend indicator

This is optional but recommended if it stays clean.

---

### 12. Empty state

Design a polished empty state for cases when no sources exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Add Source button

---

## Data realism

Use believable clinic-level source/performance mock data such as:

* realistic source names
* meaningful acquisition channel types
* plausible patient counts
* believable conversion counts
* realistic revenue contribution
* credible activity trends
* meaningful statuses

Make the page feel like a real clinic acquisition and source tracking product.

---

## UX expectations

The user should quickly understand:

* what sources exist
* which sources are active
* where patients come from
* which sources generate the most value
* which sources need attention
* what action to take next

This page should feel like a strong operational and analytical sources page, not just a simple list.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Sources Table
* Source Card
* Status Badge
* Type Badge
* Action Dropdown
* View Toggle
* Add Source Modal
* Edit Source Modal
* Source Performance Drawer
* Empty State
* Source Insight Card
* Analytics Chart Cards

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the table gracefully
* filters wrap properly
* card view becomes especially usable
* action buttons remain accessible
* modals and drawers remain readable
* key source fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Clinic Admin routes:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

Do not rename route paths.
Do not split Sources into a new top-level sidebar module.
Do not redesign the Clinic Admin route root.

Sources page = `/clinic-admin/sources`

---

## Final output expectation

Generate a polished frontend page for:

* `Clinic Admin Sources`
* route: `/clinic-admin/sources`

Reuse the existing Clinic Admin layout and keep route structure clean for future pages.


Build only the **Doctor Dashboard page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Do **not** generate My Patients, Patient Detail, Add Consultation, Goods Usage, My Performance, or other pages yet.
Keep the layout and route structure stable so future Doctor pages can be added without changing the root.

---

## Correct Doctor route hierarchy

This project must follow this Doctor route hierarchy exactly:

* `/doctor`

  * `/doctor/dashboard`
  * `/doctor/patients`
  * `/doctor/patients/:id`
  * `/doctor/encounters/create`
  * `/doctor/goods-usage`
  * `/doctor/performance`

For this task, generate only:

* **Page route:** `/doctor/dashboard`

This page belongs inside the **Doctor App Layout**.

---

## Parent layout rules

Create a reusable **Doctor App Layout** that will be reused by all future Doctor pages.

### Layout requirements

* left sidebar navigation
* top header
* breadcrumb area
* main content container
* responsive desktop-first layout
* tablet-friendly behavior
* clean medical SaaS style

### Sidebar structure

Show these sidebar items exactly in this order:

1. Dashboard
2. My Patients
3. Add Consultation
4. Goods Usage
5. My Performance

Only **Dashboard** should be active for now.

### Sidebar grouping rules

The sidebar must be designed so these future routes can exist without changing the root layout:

* **Dashboard**

  * Doctor Dashboard → `/doctor/dashboard`

* **My Patients**

  * Patients List → `/doctor/patients`
  * Patient Detail → `/doctor/patients/:id`

* **Add Consultation**

  * Create Encounter / Consultation → `/doctor/encounters/create`

* **Goods Usage**

  * Goods usage during service → `/doctor/goods-usage`

* **My Performance**

  * Personal performance analytics → `/doctor/performance`

For this task, those other pages should **not** be generated yet, but the sidebar architecture must support them.

### Header area

Include:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Doctor / Dashboard`

---

## Product context

This is a **doctor-scoped workspace dashboard** inside a medical CRM / clinic management SaaS.

Hierarchy:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor

The Doctor can work only inside their clinic / branch scope and should be able to:

* see their assigned or accessible patients
* add consultation / encounter information
* add clinical notes
* record performed services
* record goods/products used during service
* view their own activity and performance

This dashboard is not clinic-wide and not platform-wide.
It is a **personal operational dashboard for one doctor**.

---

## Design style

Create a **clean premium healthcare doctor dashboard** with:

* white and blue dominant UI
* calm medical B2B look
* strong spacing
* soft corners
* professional cards
* subtle shadows
* chart-based analytics
* no clutter
* high readability
* dashboard-first personal workflow hierarchy

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for navigation, active states, buttons, filters, key actions
* Teal for analytics highlights and positive indicators
* White/light background for trust and cleanliness
* Keep the interface medical and premium

---

## Dashboard page goal

Design the **main Doctor overview page**.

This page should instantly answer:

* how the doctor is performing today and this month
* how many patients they are handling
* how much income they generated
* what their recent consultations look like
* what appointments are coming up
* which services they perform most
* what requires attention next

---

## Dashboard route definition

* **Route:** `/doctor/dashboard`
* **Page name:** Doctor Dashboard
* **Layout parent:** Doctor App Layout
* **Sidebar active item:** Dashboard

---

## Main filters for this dashboard

Create a strong top filter area with:

* date range filter
* quick period selector
* clinic/branch context label if useful
* export button if suitable

### Default filter behavior

* doctor personal monthly overview should be shown by default
* recent trend views should default to **last 7 days**
* all metrics are scoped to the current logged-in doctor only

---

## Dashboard content sections

### 1. Top KPI cards

Create a top row of KPI/stat cards for:

* Today’s Patients
* Total Patients
* New Patients
* Returning Patients
* Monthly Income
* Completed Consultations

Each card should include:

* label
* large number
* trend indicator
* helper text
* small clean icon
* premium compact card design

---

### 2. Recent consultations section

Create a primary section showing recent consultations or encounters.

For each recent item show:

* patient name
* consultation date/time
* service or consultation type
* short status
* action to continue/view patient

This should feel like a doctor’s operational recent activity area.

---

### 3. Upcoming appointments section

Create a clean schedule preview section showing upcoming appointments.

For each appointment show:

* patient name
* scheduled time
* service/visit type
* room if useful
* status

This section should help the doctor know what is next today or soon.

---

### 4. Personal patient trend section

Create a chart card with:

* title: `Patient Trend`
* recent patient volume over time
* default last 7 days
* clean line or area chart styling

This should reflect the doctor’s personal patient flow.

---

### 5. Income trend section

Create a chart card with:

* title: `Income Trend`
* recent income generated by the doctor
* default recent period
* clean chart styling

This should reflect the doctor’s own contribution, not clinic-wide totals.

---

### 6. Top services section

Create a ranked list or chart for:

* top services performed by the doctor
* service count and/or service income if useful

Keep it concise and readable.
This section should visually connect to the future encounter workflow.

---

### 7. Quick actions section

Create a compact quick actions card with buttons like:

* Add Consultation
* Open My Patients
* Record Goods Usage
* View My Performance

These buttons can imply future navigation, but do not generate those pages now.

---

### 8. Alerts / tasks section

Create a small professional alerts or task panel showing examples like:

* incomplete consultation note
* pending follow-up
* missing goods usage record
* upcoming appointment reminder
* patient with recent repeat visit

Keep it useful but not too large.

---

### 9. Mini patient summary section

Create a compact section with operational patient insights such as:

* active patients this month
* recently seen patients
* patients needing follow-up
* new patient ratio vs returning

Keep it concise and clearly personal to the doctor.

---

## Data realism

Use believable doctor-level medical SaaS mock data:

* realistic patient counts
* realistic doctor schedule items
* believable consultation/service names
* plausible income values
* realistic new vs returning patient balance
* credible recent activity and alerts

Make the page feel like a real doctor workspace dashboard.

---

## UX expectations

The user should quickly understand:

* their current workload
* their recent and upcoming activity
* how many patients they are handling
* their income contribution
* what services dominate their work
* what action to take next

This page must feel practical, personal, and clean.

---

## Components to create for this page only

Create only the minimum reusable components needed for this page, such as:

* Doctor App Layout
* Sidebar
* Top Header
* Breadcrumb
* KPI Stat Card
* Recent Consultations Card
* Upcoming Appointments Card
* Chart Card
* Top Services Card
* Quick Actions Card
* Alerts/Tasks Card
* Mini Patient Summary Card

Do not create full app-wide components beyond what this page needs.

---

## Responsive behavior

Desktop-first.
On smaller screens:

* sidebar can collapse
* KPI cards wrap cleanly
* charts stack properly
* schedule and activity sections remain readable
* quick actions stay usable

---

## Important future compatibility rule

This page must be built so future pages can be added under the same root without changing structure:

* `/doctor/dashboard`
* `/doctor/patients`
* `/doctor/patients/:id`
* `/doctor/encounters/create`
* `/doctor/goods-usage`
* `/doctor/performance`

Do not redesign the route root later.
Do not rename the layout later.
Do not merge this dashboard into another route.

---

## Final output expectation

Generate a polished frontend page for:

* `Doctor App Layout`
* `Doctor Dashboard` at `/doctor/dashboard`

Only this page and its directly required layout/components.


Build only the **Doctor My Patients page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Doctor App Layout** already exists from the dashboard page.
Do **not** redesign the root layout.
Do **not** generate Patient Detail, Add Consultation, Goods Usage, My Performance, or other pages yet.
Do **not** change existing route structure.

---

## Correct Doctor route hierarchy

This project must follow this Doctor route hierarchy exactly:

* `/doctor`

  * `/doctor/dashboard`
  * `/doctor/patients`
  * `/doctor/patients/:id`
  * `/doctor/encounters/create`
  * `/doctor/goods-usage`
  * `/doctor/performance`

For this task, generate only:

* **Page route:** `/doctor/patients`

This page belongs inside the existing **Doctor App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Doctor App Layout
* left sidebar
* top header
* breadcrumb area
* shared Doctor visual language from the dashboard page

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Doctor section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. My Patients
3. Add Consultation
4. Goods Usage
5. My Performance

For this page:

* **My Patients** must be active
* others inactive

### Future grouping rules

The sidebar must still support these future routes without changing layout:

* **Dashboard**

  * Doctor Dashboard → `/doctor/dashboard`

* **My Patients**

  * Patients List → `/doctor/patients`
  * Patient Detail → `/doctor/patients/:id`

* **Add Consultation**

  * Create Encounter / Consultation → `/doctor/encounters/create`

* **Goods Usage**

  * Goods usage during service → `/doctor/goods-usage`

* **My Performance**

  * Personal performance analytics → `/doctor/performance`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Doctor / My Patients`

---

## Product context

This is the **doctor-scoped patients page** inside a medical CRM SaaS.

The Doctor uses this page to:

* see assigned or accessible patients
* search patients quickly
* view recent patient activity
* understand basic clinical and operational information
* open a patient detail page later
* prepare for consultation and follow-up

This is not the patient detail page.
This is the doctor’s main patients list and working page.

---

## Design style

Create a **premium healthcare doctor patients page** with:

* clean white and blue interface
* trust-oriented medical design
* strong readability
* modern filters
* soft cards
* subtle shadows
* clear hierarchy
* premium clinical workflow feel
* data-rich but calm layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, selected filters, links
* Teal for supportive highlights and positive patient signals
* White/light background for clinical cleanliness and trust
* Keep interface premium and medically appropriate

---

## Route definition

* **Route:** `/doctor/patients`
* **Page name:** My Patients
* **Layout parent:** Doctor App Layout
* **Sidebar active item:** My Patients

---

## Main page goal

This page should help the doctor:

* view all assigned or accessible patients
* quickly find a patient before consultation
* understand recent visit activity
* see relevant operational details
* identify follow-up or repeat-visit patients
* navigate later to patient detail without route confusion

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `My Patients`
* short supporting subtitle describing this as the doctor’s patient workspace
* primary action button: `Add Consultation`
* secondary action button: `Export`

This area should feel practical and clinical.

---

### 2. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* date range filter
* status filter
* source filter
* follow-up filter
* sort dropdown
* reset filters button

### Suggested patient status options

* Active
* New
* Returning
* Follow-up Needed
* Inactive

### Suggested source options

* App
* Telegram
* Instagram
* Website
* Referral
* Walk-in / Manual

The toolbar should feel strong, premium, and easy to scan.

---

### 3. Patients summary cards

Add a compact overview strip or mini KPI section for this page:

* Total My Patients
* New Patients
* Returning Patients
* Follow-up Needed

Keep these lighter than dashboard KPI cards.

---

### 4. Patients data table

Create a premium responsive management table.

Columns:

* Full Name
* Age
* Gender
* Phone
* Source
* Last Visit
* Total Visits
* Follow-up Status
* Notes Indicator
* Actions

### Table behavior

Include:

* row hover state
* sort indicators
* source badges
* follow-up/status badges
* action menu per row
* pagination
* optional checkbox selection
* clean sticky header if suitable

### Actions menu per row

Include:

* View Patient
* Add Consultation
* Add Note
* View History

Do not generate the destination pages yet, but structure actions clearly.

---

### 5. Patient quick preview drawer or modal

Design a clean preview drawer/modal that opens from the table.

Show:

* patient full name
* age
* gender
* phone
* source
* last visit
* total visits
* allergies/alerts if available
* recent notes preview
* quick actions:

  * Open Patient
  * Add Consultation

This allows quick doctor workflow without needing a separate page every time.

---

### 6. Follow-up queue section

Create a concise operational section showing patients who may need attention soon.

Examples:

* recent repeat visits
* incomplete follow-up
* patient not seen recently
* patient with recent alert note

This section should feel useful for a doctor’s workflow.

---

### 7. Patient quick insights area

Add a concise insights area showing useful personal signals such as:

* most frequent source among this doctor’s patients
* patients seen this week
* patients with most visits
* new vs returning ratio
* patients with recent notes

Keep it concise and actionable.

---

### 8. Empty state

Design a polished empty state for cases when no patients exist or filters return no result.

Show:

* icon or illustration area
* short message
* helpful text
* Add Consultation button

---

## Data realism

Use believable doctor-level medical SaaS mock data such as:

* realistic patient names
* plausible ages and genders
* believable source channels
* realistic visit dates
* follow-up signals
* realistic clinical notes indicators

Make the page feel like a real doctor patient workspace.

---

## UX expectations

The user should quickly understand:

* who their patients are
* which patients need attention
* recent visit activity
* follow-up and repeat patterns
* what action to take next

This page should feel like a strong operational patient list for a doctor, not a generic CRM contacts page.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Filter Toolbar
* Patients Table
* Source Badge
* Follow-up Badge
* Action Dropdown
* Patient Quick Preview Drawer
* Follow-up Queue Card
* Empty State
* Patient Insight Card

Do not generate components for unrelated pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* convert the table gracefully
* filters wrap properly
* action buttons remain accessible
* preview drawer remains readable
* key patient fields stay visible

---

## Important future compatibility rule

This page must remain compatible with the following Doctor routes:

* `/doctor/dashboard`
* `/doctor/patients`
* `/doctor/patients/:id`
* `/doctor/encounters/create`
* `/doctor/goods-usage`
* `/doctor/performance`

Do not rename route paths.
Do not redesign the Doctor route root.

My Patients page = doctor patients list and working page only.
Patient detail page will come later at `/doctor/patients/:id`.

---

## Final output expectation

Generate a polished frontend page for:

* `Doctor My Patients`
* route: `/doctor/patients`

Reuse the existing Doctor layout and keep route structure clean for future pages.


Build only the **Doctor Patient Detail page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Doctor App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Add Consultation, Goods Usage, My Performance, or unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Doctor route hierarchy

This project must follow this Doctor route hierarchy exactly:

* `/doctor`

  * `/doctor/dashboard`
  * `/doctor/patients`
  * `/doctor/patients/:id`
  * `/doctor/encounters/create`
  * `/doctor/goods-usage`
  * `/doctor/performance`

For this task, generate only:

* **Page route:** `/doctor/patients/:id`

This page belongs inside the existing **Doctor App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Doctor App Layout
* left sidebar
* top header
* breadcrumb area
* shared Doctor visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Doctor section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. My Patients
3. Add Consultation
4. Goods Usage
5. My Performance

For this page:

* **My Patients** must be active
* others inactive

### Future grouping rules

The sidebar must still support these future routes without changing layout:

* **Dashboard**

  * Doctor Dashboard → `/doctor/dashboard`

* **My Patients**

  * Patients List → `/doctor/patients`
  * Patient Detail → `/doctor/patients/:id`

* **Add Consultation**

  * Create Encounter / Consultation → `/doctor/encounters/create`

* **Goods Usage**

  * Goods usage during service → `/doctor/goods-usage`

* **My Performance**

  * Personal performance analytics → `/doctor/performance`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Doctor / My Patients / Patient Profile`

---

## Product context

This is the **doctor-scoped patient detail / patient profile page** inside a medical CRM SaaS.

The Doctor uses this page to:

* view one patient’s profile and history
* review clinical notes
* review visit history
* check medical documents
* understand recent services and encounters
* prepare for or continue consultation
* add notes and continue care safely

This is not the clinic admin patient page.
This is a **doctor-oriented patient workspace** focused on care and consultation flow.

---

## Design style

Create a **premium healthcare doctor patient profile page** with:

* clean white and blue interface
* strong trust-oriented medical design
* structured clinical detail layout
* clear sections and tabs
* readable cards
* soft shadows
* premium doctor workspace feel
* strong hierarchy without clutter

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active tabs, links, selected states
* Teal for supportive highlights and useful data emphasis
* White/light background for clinical cleanliness and trust
* Keep interface premium and medically appropriate

---

## Route definition

* **Route:** `/doctor/patients/:id`
* **Page name:** Patient Profile
* **Layout parent:** Doctor App Layout
* **Sidebar active item:** My Patients

---

## Main page goal

This page should help the doctor quickly understand:

* who the patient is
* recent clinical context
* visit history
* current notes and alerts
* available medical documents
* what action to take next in care flow

This page should be detail-rich but optimized for doctor workflow.

---

## Main page structure

### 1. Top patient header section

Create a strong page header/profile summary area with:

* patient full name
* age
* gender
* phone
* source
* status badge
* primary alerts / allergies if available
* quick actions such as:

  * Add Consultation
  * Add Note
  * View Documents
  * View Visit History

This section should feel like the patient identity anchor for the page.

---

### 2. Patient overview cards

Create a compact summary strip showing:

* Total Visits
* Last Visit Date
* Recent Service
* Follow-up Status

These cards should feel clean and clinically useful.

---

## Main content tabs

Design this page with clear tabs.

Tabs must be:

1. Overview
2. Clinical Notes
3. Visit History
4. Medical Documents
5. Services Record

Do not create extra tabs.

---

## Tab 1: Overview

This tab should show the main patient profile in structured cards/sections.

### Overview content

Show:

* Full Name
* Age
* Height
* Weight
* Source
* Contact Details
* First Visit Date
* Last Visit Date
* Total Times Seen
* Follow-up Flag
* Allergies / Alerts
* Short patient summary if useful

Design this as a premium two-column or card-based detail layout.

Include:

* subtle medical-friendly detail styling
* quick action to start consultation

---

## Tab 2: Clinical Notes

Create a dedicated doctor-facing notes section.

Show notes in a professional clinical note layout with:

* note author
* date/time
* note content
* note type if useful

Suggested note types:

* consultation note
* follow-up note
* alert note
* clinical observation

Include:

* Add Note button
* note input modal or inline form
* search/filter notes if useful

This tab should feel strongly useful for ongoing care.

---

## Tab 3: Visit History

Create a timeline or structured table for past visits / encounters.

Fields can include:

* visit date
* visit type
* service
* short diagnosis/summary
* status
* action to review more

This should feel like a practical historical care log for the doctor.

You may use:

* table
* timeline
* hybrid card layout

Choose the cleaner doctor-workflow option.

---

## Tab 4: Medical Documents

Create a clean medical documents section.

Show uploaded files as cards or table rows with:

* document name
* document type
* uploaded date
* preview/open action
* download action if useful

Support examples such as:

* lab result
* x-ray
* scan
* consent form
* prescription-related file

Include:

* Upload Document button
* empty state if no documents exist

---

## Tab 5: Services Record

Create a section focused on services the patient has received.

Show:

* service name
* date
* doctor
* quantity if useful
* status
* linked encounter if useful

This tab should help the doctor quickly understand treatment/service history.

---

## Forms / modals for this page

### Add Note modal

Create a clean note creation UI with:

* note type
* note content

Actions:

* Cancel
* Save Note

---

### Upload Document modal

Create a clean modal/drawer for:

* document type
* file upload
* note/description if useful

Actions:

* Cancel
* Upload Document

---

### Quick patient summary drawer or side card

Create a compact reusable quick summary area showing:

* patient alerts
* recent visits
* recent notes
* next best action

This helps keep the page highly usable.

---

## Data realism

Use believable doctor-level medical SaaS mock data such as:

* realistic patient names
* realistic ages/heights/weights
* believable visit dates
* realistic service names
* credible notes and alerts
* realistic document types

Make the page feel like a real doctor-facing patient profile.

---

## UX expectations

The user should quickly understand:

* patient identity and risk context
* recent care history
* notes and alerts
* service history
* available documents
* next action in consultation flow

This page should feel trustworthy, clinically appropriate, and highly practical.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Patient Header Card
* Overview Stat Cards
* Tab Navigation
* Detail Info Cards
* Notes Feed
* Visit History Table/Timeline
* Documents List/Card
* Services Record Table
* Add Note Modal
* Upload Document Modal
* Quick Summary Drawer/Card
* Empty State

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* patient header stacks cleanly
* tabs remain usable
* detail cards stack properly
* tables degrade gracefully
* notes and documents remain readable
* modals stay usable

---

## Important future compatibility rule

This page must remain compatible with the following Doctor routes:

* `/doctor/dashboard`
* `/doctor/patients`
* `/doctor/patients/:id`
* `/doctor/encounters/create`
* `/doctor/goods-usage`
* `/doctor/performance`

Do not rename route paths.
Do not redesign the Doctor route root.

My Patients page = `/doctor/patients`
Patient detail page = `/doctor/patients/:id`

---

## Final output expectation

Generate a polished frontend page for:

* `Doctor Patient Profile`
* route: `/doctor/patients/:id`

Reuse the existing Doctor layout and keep route structure clean for future pages.

Build only the **Doctor Add Consultation / Create Encounter page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Doctor App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate Goods Usage, My Performance, or unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Doctor route hierarchy

This project must follow this Doctor route hierarchy exactly:

* `/doctor`

  * `/doctor/dashboard`
  * `/doctor/patients`
  * `/doctor/patients/:id`
  * `/doctor/encounters/create`
  * `/doctor/goods-usage`
  * `/doctor/performance`

For this task, generate only:

* **Page route:** `/doctor/encounters/create`

This page belongs inside the existing **Doctor App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Doctor App Layout
* left sidebar
* top header
* breadcrumb area
* shared Doctor visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Doctor section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. My Patients
3. Add Consultation
4. Goods Usage
5. My Performance

For this page:

* **Add Consultation** must be active
* others inactive

### Future grouping rules

The sidebar must still support these future routes without changing layout:

* **Dashboard**

  * Doctor Dashboard → `/doctor/dashboard`

* **My Patients**

  * Patients List → `/doctor/patients`
  * Patient Detail → `/doctor/patients/:id`

* **Add Consultation**

  * Create Encounter / Consultation → `/doctor/encounters/create`

* **Goods Usage**

  * Goods usage during service → `/doctor/goods-usage`

* **My Performance**

  * Personal performance analytics → `/doctor/performance`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Doctor / Add Consultation`

---

## Product context

This is the **doctor-scoped consultation / encounter creation page** inside a medical CRM SaaS.

The Doctor uses this page to:

* choose a patient
* create a new consultation / encounter
* add diagnosis summary
* add clinical notes
* select performed services
* add service quantities
* add goods/products consumed during service
* complete the encounter safely

This page should represent the core doctor workflow.

It must support the practical clinic process where:

* a doctor records what happened in the visit
* the doctor records performed services
* the doctor can note goods used during service
* the result can later connect to billing and inventory

---

## Design style

Create a **premium healthcare doctor encounter workflow page** with:

* clean white and blue interface
* strong trust-oriented medical design
* structured form layout
* premium clinical workflow feel
* strong spacing
* soft cards
* subtle shadows
* clear form hierarchy
* operational and safe visual design

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary actions, active steps, selected states, links
* Teal for supportive highlights and positive workflow indicators
* Success/warning/danger for validation, alerts, and critical workflow messages
* White/light background for clinical cleanliness and trust
* Keep interface premium and medically appropriate

---

## Route definition

* **Route:** `/doctor/encounters/create`
* **Page name:** Add Consultation
* **Layout parent:** Doctor App Layout
* **Sidebar active item:** Add Consultation

---

## Main page goal

This page should help the doctor:

* create a consultation quickly and safely
* select the right patient
* document the visit clearly
* add services performed
* record goods used
* complete the encounter with confidence
* move naturally into later billing/inventory flows

This page should feel like a strong clinical workflow page, not just a generic form.

---

## Main page structure

### 1. Page top section

Create a strong page header section with:

* page title: `Add Consultation`
* short supporting subtitle describing this as encounter and service recording for a patient visit
* primary action button: `Complete Encounter`
* secondary action button: `Save Draft`
* optional tertiary action: `Cancel`

This area should feel clinical and action-ready.

---

### 2. Encounter status strip

Create a compact status/summary strip near the top showing:

* Encounter Status
* Selected Patient
* Selected Services count
* Goods Used count
* Current Date/Time

This should update visually as data is entered.

### Suggested encounter statuses

* Draft
* In Progress
* Completed

Default should start as:

* Draft or In Progress

---

### 3. Main layout

Design the page as a structured two-column workflow if it helps:

* **Left/main column:** consultation form, services, notes, goods usage
* **Right/summary column:** patient summary, encounter summary, quick validations

Keep it clean and clinically practical.

---

## Main form sections

### 4. Patient and encounter information

Create a main details card with fields:

* Patient selector
* Consultation / Encounter Type
* Date and Time
* Visit Type
* Room if useful
* Follow-up required toggle
* Short visit reason / complaint

### Suggested encounter type examples

* Consultation
* Follow-up
* Procedure
* Check-up

The patient selector should be searchable and premium.

---

### 5. Clinical notes section

Create a strong section for doctor notes.

Fields:

* Diagnosis Summary
* Clinical Notes
* Observations
* Recommendations / Plan if useful

This should feel like the core clinical documentation area.

---

### 6. Services performed section

Create a section for adding performed services.

This section must support:

* selecting one or more services
* quantity
* optional notes per service
* service status

Fields per service row:

* Service
* Quantity
* Note
* Status
* Remove row action

Include:

* `Add Service` button

This section should clearly support the workflow:

* select performed services
* add service quantities

---

### 7. Goods/products consumed during service section

Create a section for recording goods/products used during service.

This section must support:

* choosing product/good
* related service if useful
* quantity used
* stock availability indicator
* low stock warning

Fields per row:

* Product / Good
* Linked Service if useful
* Quantity Used
* Stock Status
* Note
* Remove row action

Include:

* `Add Goods Usage` button

This section should clearly support:

* add goods/products consumed during service

---

### 8. Follow-up and next steps section

Create a compact section for:

* follow-up required toggle
* follow-up note
* recommended next visit date if useful
* reminder/note for future consultation if useful

This keeps the workflow clinically meaningful.

---

## Right-side summary panel

### 9. Patient quick summary card

Create a compact patient summary card showing:

* patient name
* age
* gender
* last visit
* allergies / alerts if available
* recent services if useful

This helps the doctor maintain context while documenting.

---

### 10. Encounter summary card

Create a clearly visible summary panel showing:

* selected patient
* encounter type
* selected services count
* goods used count
* follow-up required status
* current encounter status

This should update live as the form changes.

---

### 11. Validation / alerts card

Create a clean small validation area that shows helpful warnings such as:

* no patient selected
* no clinical note entered
* no service added
* low stock warning on selected good
* incomplete encounter fields

Keep these messages premium and non-intrusive.

---

## Suggested interaction model

The page should support these clear actions:

* Save Draft
* Complete Encounter
* Cancel

Optional:

* Complete & Go to Goods Usage
* Complete & Open Patient

Only use extra actions if they stay clean and practical.

---

## Optional workflow stepper

If helpful, you may represent the flow as a soft stepper such as:

1. Select Patient
2. Add Clinical Notes
3. Add Services
4. Record Goods Usage
5. Complete Encounter

Only use this if it improves clarity without clutter.

---

## Data realism

Use believable doctor-level medical SaaS mock data such as:

* realistic patients
* realistic consultation types
* believable services
* realistic goods/products used in care
* plausible clinical notes examples
* meaningful stock warnings

Make the page feel like a real doctor encounter workflow.

---

## UX expectations

The user should quickly understand:

* which patient is being treated
* why the visit is happening
* what notes must be documented
* what services were performed
* what goods were used
* what is still missing before completion
* what happens next

This page should feel like a strong clinical recording workflow, not just a long data form.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Encounter Status Strip
* Searchable Patient Selector
* Clinical Notes Card
* Services Line Item Section
* Goods Usage Line Item Section
* Patient Summary Card
* Encounter Summary Card
* Validation Alerts Card
* Optional Stepper

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* main form and summary stack properly
* line-item sections remain usable
* buttons stay visible and clear
* selectors and notes areas remain easy to use
* summaries remain readable

---

## Important future compatibility rule

This page must remain compatible with the following Doctor routes:

* `/doctor/dashboard`
* `/doctor/patients`
* `/doctor/patients/:id`
* `/doctor/encounters/create`
* `/doctor/goods-usage`
* `/doctor/performance`

Do not rename route paths.
Do not redesign the Doctor route root.

Add Consultation page = `/doctor/encounters/create`

---

## Final output expectation

Generate a polished frontend page for:

* `Doctor Add Consultation`
* route: `/doctor/encounters/create`

Reuse the existing Doctor layout and keep route structure clean for future pages.

Build only the **Doctor Goods Usage page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Doctor App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate My Performance or unrelated pages yet.
Do **not** change existing route structure.

---

## Correct Doctor route hierarchy

This project must follow this Doctor route hierarchy exactly:

* `/doctor`

  * `/doctor/dashboard`
  * `/doctor/patients`
  * `/doctor/patients/:id`
  * `/doctor/encounters/create`
  * `/doctor/goods-usage`
  * `/doctor/performance`

For this task, generate only:

* **Page route:** `/doctor/goods-usage`

This page belongs inside the existing **Doctor App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Doctor App Layout
* left sidebar
* top header
* breadcrumb area
* shared Doctor visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Doctor section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. My Patients
3. Add Consultation
4. Goods Usage
5. My Performance

For this page:

* **Goods Usage** must be active
* others inactive

### Future grouping rules

The sidebar must still support these future routes without changing layout:

* **Dashboard**

  * Doctor Dashboard → `/doctor/dashboard`

* **My Patients**

  * Patients List → `/doctor/patients`
  * Patient Detail → `/doctor/patients/:id`

* **Add Consultation**

  * Create Encounter / Consultation → `/doctor/encounters/create`

* **Goods Usage**

  * Goods usage during service → `/doctor/goods-usage`

* **My Performance**

  * Personal performance analytics → `/doctor/performance`

Do not generate those pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Doctor / Goods Usage`

---

## Product context

This is the **doctor-scoped goods usage recording page** inside a medical CRM SaaS.

The Doctor uses this page to:

* record what goods/products were used during a service
* connect goods usage to a patient and/or encounter
* connect goods usage to a performed service
* see stock availability before usage is recorded
* receive warnings for low stock
* make sure service-related product consumption is properly logged

This page is especially important for services that consume clinic inventory such as:

* medical disposables
* consumables
* products used during procedure/treatment

This is not the full Warehouse page.
This is a **doctor operational goods-consumption page**.

---

## Design style

Create a **premium healthcare doctor operational page** with:

* clean white and blue interface
* trust-oriented medical design
* structured operational form and table layout
* soft cards
* subtle shadows
* premium doctor workflow feel
* strong hierarchy without clutter

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for actions, active states, links, selected controls
* Teal for supportive highlights and positive stock/info signals
* Warning and danger for low stock and critical stock alerts
* White/light background for cleanliness and trust
* Keep interface premium and medically appropriate

---

## Route definition

* **Route:** `/doctor/goods-usage`
* **Page name:** Goods Usage
* **Layout parent:** Doctor App Layout
* **Sidebar active item:** Goods Usage

---

## Main page goal

This page should help the doctor:

* record goods used during patient care
* avoid forgetting product consumption
* see whether there is enough stock
* connect usage to service and encounter context
* review recent goods usage records
* work safely and quickly

This page should feel like a focused operational tool, not a general inventory module.

---

## Main page structure

### 1. Page top section

Create a strong page header section with:

* page title: `Goods Usage`
* short supporting subtitle describing this as service-related product usage recording
* primary action button: `Record Usage`
* secondary action button: `Open Consultation`
* optional tertiary action: `Export`

This area should feel operational and action-ready.

---

### 2. Goods usage summary cards

Add a compact overview strip showing:

* Total Usage Records Today
* Goods Used This Week
* Low Stock Alerts
* Linked Encounters Count

Keep these lighter than dashboard KPI cards but clearly useful.

---

### 3. Filter and search toolbar

Create a modern filter toolbar containing:

* search input
* patient filter
* service filter
* encounter filter if useful
* stock status filter
* date range filter
* sort dropdown
* reset filters button

### Suggested stock status options

* Healthy
* Low Stock
* Critical
* Out of Stock

The toolbar should feel strong, premium, and easy to scan.

---

## Main workflow sections

### 4. Record goods usage form

Create a main operational form for recording used goods.

Fields:

* Patient selector
* Encounter selector
* Service selector
* Date and Time
* Notes if useful

This should clearly connect the usage record to clinical workflow.

---

### 5. Goods usage line items section

Create a section for adding one or more goods/products used during service.

Fields per row:

* Product / Good
* Linked Service if useful
* Quantity Used
* Current Stock
* Stock Status
* Note
* Remove row action

Include:

* `Add Product` button

This section must clearly support:

* recording multiple goods in one usage record
* showing stock availability before confirmation
* warning the doctor when stock is low or critical

---

### 6. Stock warning / availability panel

Create a small but important panel that dynamically shows:

* low stock warnings
* critical stock warnings
* out of stock warnings
* suggested caution text

This should visually stand out but remain premium and clean.

---

### 7. Record usage action area

Create a clean action block with:

* Save Draft
* Confirm Usage
* Cancel

Optionally:

* Confirm & Return to Consultation
* Confirm & Add Another

Only use additional actions if they stay clean and practical.

---

## Recent usage and review sections

### 8. Recent goods usage table

Create a structured recent-records table or card list showing:

* date/time
* patient
* service
* product/good
* quantity used
* stock status after usage if useful
* action to review/edit

This gives the doctor a quick operational review of recent usage logs.

---

### 9. Frequently used goods section

Create a compact section showing:

* most commonly used goods by this doctor
* usage frequency
* linked service if useful

This can help speed up workflow and make the page feel personalized.

---

### 10. Quick insights section

Add a concise insights area showing useful signals such as:

* product most used this week
* goods often used with a certain service
* recurring low-stock items
* encounters with most goods consumption

Keep it concise and actionable.

---

## Optional smart workflow helpers

### 11. Suggested goods by service

If cleanly possible, create a helper area that suggests products based on selected service.

For example:

* selected service: `Procedure A`
* suggested goods:

  * gloves
  * disposable set
  * solution
  * bandage

This should be helpful but not noisy.

---

## Validation and safety

### 12. Validation / alerts card

Create a clean validation area that shows helpful warnings such as:

* no patient selected
* no service selected
* no goods added
* quantity exceeds available stock
* selected product is out of stock
* incomplete usage record

Keep these messages premium and non-intrusive.

---

## Data realism

Use believable doctor-level and clinic inventory mock data such as:

* realistic patient names
* realistic service names
* believable medical goods/products
* plausible quantities used
* meaningful stock counts
* realistic low-stock warnings

Make the page feel like a real doctor consumption-recording workflow.

---

## UX expectations

The user should quickly understand:

* what goods are being recorded
* which patient/service they belong to
* whether there is enough stock
* what warnings require attention
* what they just recorded recently
* what action to take next

This page should feel practical, safe, and fast for a doctor in real work.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Summary Stat Cards
* Filter Toolbar
* Searchable Select Inputs
* Goods Usage Line Items Table/Rows
* Stock Warning Card
* Recent Usage Table
* Frequently Used Goods Card
* Validation Alerts Card
* Suggested Goods Card

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* form and recent records stack properly
* line-item rows remain usable
* warnings remain visible
* action buttons stay clear
* selectors and quantity inputs remain easy to use

---

## Important future compatibility rule

This page must remain compatible with the following Doctor routes:

* `/doctor/dashboard`
* `/doctor/patients`
* `/doctor/patients/:id`
* `/doctor/encounters/create`
* `/doctor/goods-usage`
* `/doctor/performance`

Do not rename route paths.
Do not redesign the Doctor route root.

Goods Usage page = `/doctor/goods-usage`

---

## Final output expectation

Generate a polished frontend page for:

* `Doctor Goods Usage`
* route: `/doctor/goods-usage`

Reuse the existing Doctor layout and keep route structure clean for future pages.

Build only the **Doctor My Performance page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Doctor App Layout** already exists from the previous pages.
Do **not** redesign the root layout.
Do **not** generate unrelated pages.
Do **not** change existing route structure.

---

## Correct Doctor route hierarchy

This project must follow this Doctor route hierarchy exactly:

* `/doctor`

  * `/doctor/dashboard`
  * `/doctor/patients`
  * `/doctor/patients/:id`
  * `/doctor/encounters/create`
  * `/doctor/goods-usage`
  * `/doctor/performance`

For this task, generate only:

* **Page route:** `/doctor/performance`

This page belongs inside the existing **Doctor App Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Doctor App Layout
* left sidebar
* top header
* breadcrumb area
* shared Doctor visual language from previous pages

Do not rebuild them from scratch unless needed for consistency.
Use the same navigation structure and design quality already established in the Doctor section.

---

## Sidebar structure

Sidebar items must remain exactly in this order:

1. Dashboard
2. My Patients
3. Add Consultation
4. Goods Usage
5. My Performance

For this page:

* **My Performance** must be active
* others inactive

### Future grouping rules

The sidebar must still support these routes without changing layout:

* **Dashboard**

  * Doctor Dashboard → `/doctor/dashboard`

* **My Patients**

  * Patients List → `/doctor/patients`
  * Patient Detail → `/doctor/patients/:id`

* **Add Consultation**

  * Create Encounter / Consultation → `/doctor/encounters/create`

* **Goods Usage**

  * Goods usage during service → `/doctor/goods-usage`

* **My Performance**

  * Personal performance analytics → `/doctor/performance`

Do not generate other pages now.

---

## Header and breadcrumb

### Header

Keep:

* page title
* search input
* notifications icon
* profile/avatar dropdown

### Breadcrumb

Show:

* `Doctor / My Performance`

---

## Product context

This is the **doctor-scoped personal performance page** inside a medical CRM SaaS.

The Doctor uses this page to monitor their own:

* patients served
* monthly patients
* income by doctor
* income by doctor’s patients
* service performance
* schedule/workload
* ratings if available

This page is personal and reflective.
It is not a clinic-wide comparison page and not a management dashboard for many doctors.

---

## Design style

Create a **premium healthcare doctor analytics page** with:

* clean white and blue interface
* trust-oriented medical design
* executive but personal performance style
* strong chart hierarchy
* professional spacing
* soft cards
* subtle shadows
* data-rich but calm layout

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary charts, active states, filters, actions
* Teal for secondary analytics emphasis and positive progress indicators
* success/warning/danger only for meaningful status or trend signals
* keep the page premium, clean, and personally informative

---

## Route definition

* **Route:** `/doctor/performance`
* **Page name:** My Performance
* **Layout parent:** Doctor App Layout
* **Sidebar active item:** My Performance

---

## Main page goal

This page should help the doctor:

* understand their own performance over time
* see personal patient and revenue trends
* understand service mix
* monitor workload
* view ratings if available
* identify personal strengths and areas needing attention

This page should feel motivating, practical, and easy to read.

---

## Main content structure

### 1. Page top section

Create a strong page header section with:

* page title: `My Performance`
* short supporting subtitle describing this as personal doctor performance analytics
* primary action button: `Export Report`
* secondary action button: `Save View`

This area should feel professional and insight-oriented.

---

### 2. Main analytics filter toolbar

Create a premium filter area with:

* date range filter
* quick period selector
* service filter
* patient type filter if useful
* sort/view dropdown if useful
* reset filters button

### Suggested patient type options

* All
* New Patients
* Returning Patients

This filter bar should be clean and easy to scan.

---

## Main dashboard sections

### 3. Top KPI cards

Create a KPI row for:

* Patients Served
* Monthly Patients
* Total Income by Doctor
* Monthly Income by Doctor
* Total Income by Doctor’s Patients
* Average Rating

Each KPI card should include:

* title
* large value
* trend or comparison indicator
* helper text
* compact professional card design

---

### 4. Personal patient trend section

Create a large chart card with:

* title: `Patient Trend`
* line or area chart
* recent patient volume over time
* default recent period behavior

This should reflect the doctor’s own patient activity.

---

### 5. Income trend section

Create a large chart card with:

* title: `Income Trend`
* income generated by the doctor over time
* monthly and recent trend feel
* filter-responsive behavior

This should reflect the doctor’s own revenue contribution.

---

### 6. Service performance section

Create a section for service analytics.

Show:

* top services performed
* service count
* revenue by service if useful
* service distribution

Use:

* bar chart
* donut chart
* or clean ranked cards

This should support:

* service performance
* top services

---

### 7. Monthly patients section

Create a section focused on monthly patient behavior.

Show:

* monthly patient volume
* new vs returning patient balance
* repeat patient pattern if useful

This section should feel personal and operational.

---

### 8. Workload / schedule load section

Create a section showing:

* consultation load over time
* busiest days
* patient flow by weekday if useful
* workload trend

This should help the doctor understand pace and scheduling pressure.

---

### 9. Rating section

If ratings are available, create a clean rating area showing:

* average rating
* recent rating trend
* rating distribution if useful
* helpful summary text

If ratings are not emphasized, keep this section light but visually polished.

---

### 10. Personal insights panel

Add a concise personal insights section with examples like:

* strongest service this period
* highest patient-return rate
* busiest day pattern
* rising or falling patient trend
* strongest monthly income period

Keep it concise, helpful, and motivating.

---

### 11. Quick action cards

Create a compact quick actions section with buttons like:

* Add Consultation
* Open My Patients
* Record Goods Usage

These can imply navigation to existing doctor routes, but do not generate new pages now.

---

### 12. Empty state / no data state

Design a polished empty state for cases when filters return no data.

Show:

* icon or illustration area
* short message
* helpful text
* reset filters action

---

## Data realism

Use believable doctor-level medical SaaS performance data such as:

* realistic patient volumes
* plausible income values
* believable service counts
* realistic monthly trends
* meaningful ratings
* credible workload patterns

Make the analytics feel like a real doctor performance workspace.

---

## UX expectations

The user should quickly understand:

* how they are performing
* what services drive their activity
* how patient flow is changing
* whether income is improving
* where their workload is concentrated
* what actions or improvements make sense next

This page should feel personal, strategic, and practical.

---

## Reusable components allowed for this page

You may create or reuse only the components needed for this page, for example:

* Page Section Header
* Analytics Filter Toolbar
* KPI Stat Card
* Chart Card
* Service Performance Card
* Workload Card
* Rating Card
* Insights Card
* Quick Action Cards
* Empty State

Do not generate components for unrelated modules yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* KPI cards wrap cleanly
* chart cards stack properly
* filters wrap into multiple rows
* analytics remain readable
* quick action cards stay usable

---

## Important future compatibility rule

This page must remain compatible with the following Doctor routes:

* `/doctor/dashboard`
* `/doctor/patients`
* `/doctor/patients/:id`
* `/doctor/encounters/create`
* `/doctor/goods-usage`
* `/doctor/performance`

Do not rename route paths.
Do not redesign the Doctor route root.

My Performance page = `/doctor/performance`

---

## Final output expectation

Generate a polished frontend page for:

* `Doctor My Performance`
* route: `/doctor/performance`

Reuse the existing Doctor layout and keep route structure clean for future pages.

Build only the **Login page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Do **not** generate Forgot Password or Reset Password pages yet.
Keep the auth route structure stable so future auth pages can be added without changing the root.

---

## Correct authentication route hierarchy

This project must follow this authentication route hierarchy exactly:

* `/auth/login`
* `/auth/forgot-password`
* `/auth/reset-password`

For this task, generate only:

* **Page route:** `/auth/login`

This page belongs inside the **Auth Layout**.

---

## Parent layout rules

Create a reusable **Auth Layout** that will be reused by all future authentication pages.

### Layout requirements

* centered or split-screen auth layout
* premium medical SaaS visual style
* clean whitespace
* responsive design
* simple header/branding area
* form card container
* no app sidebar
* no admin navigation

### Future auth compatibility

The layout must support these future pages without redesign:

* Login → `/auth/login`
* Forgot Password → `/auth/forgot-password`
* Reset Password → `/auth/reset-password`

For this task, only generate the Login page.

---

## Product context

This is the sign-in entry point for a **medical CRM / clinic management SaaS**.

Different roles may log in here:

* Platform Super Admin
* Clinic Admin
* Doctor
* future staff roles such as Receptionist, Cashier, Nurse, Warehouse Manager

The page should feel:

* secure
* trustworthy
* medical/professional
* premium SaaS
* simple and frictionless

---

## Design style

Create a **clean premium healthcare authentication page** with:

* white and blue dominant UI
* strong trust-oriented design
* minimal clutter
* soft rounded corners
* subtle shadows
* clear input hierarchy
* polished form states
* desktop-first but mobile-friendly layout

### Suggested layout direction

Use one of these approaches:

* centered login card on light background
* split-screen layout with branding/info on one side and form on the other

Choose whichever looks cleaner and more premium for a medical SaaS.

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary button, focused inputs, links
* Teal only for subtle highlight/accent if needed
* White/light background for trust and cleanliness
* keep the interface premium and medically appropriate

---

## Route definition

* **Route:** `/auth/login`
* **Page name:** Login
* **Layout parent:** Auth Layout

---

## Main page goal

This page should help the user:

* understand they are logging into a trusted medical platform
* enter credentials quickly
* recover password easily
* sign in with minimal friction
* feel confident and secure

---

## Main page structure

### 1. Branding/header area

Create a clean branding section with:

* platform logo placeholder
* platform name
* short supporting line describing the platform as a medical CRM / clinic management system

Keep it elegant and not too wordy.

---

### 2. Login form card

Create a premium auth card with:

#### Form title

* `Welcome back`

#### Supporting text

Short line like:

* sign in to continue to your workspace

### Form fields

* Email or Phone
* Password

### Field behavior

* clear labels
* placeholders
* focus states
* error states
* password show/hide toggle

---

### 3. Supporting auth controls

Include:

* Remember me checkbox
* `Forgot password?` link
* Sign in button

### Primary CTA

* `Sign In`

The Sign In button should be visually strong and premium.

---

### 4. Validation and error states

Design polished states for:

* invalid email/phone
* missing password
* incorrect credentials
* disabled account if useful

Keep errors clear but calm.

---

### 5. Optional trust/security hints

Add a subtle section or helper text for trust, such as:

* secure access
* protected medical workspace
* role-based access

Keep it very light and professional.

---

### 6. Optional footer area

Include a minimal footer area with:

* privacy/policy placeholder
* support link placeholder if useful

Keep it simple.

---

## Interaction rules

The page should support:

* typing email or phone
* typing password
* toggling password visibility
* clicking forgot password
* submitting login form
* displaying validation errors cleanly

Do not generate the Forgot Password page yet, only link to its future route:

* `/auth/forgot-password`

---

## Data realism

Use believable placeholder content for:

* medical platform branding
* helper text
* realistic validation messages

Do not use childish or generic startup tone.

---

## UX expectations

The user should quickly understand:

* where to log in
* what fields are required
* how to recover password
* whether an error occurred
* that the system is professional and secure

This page should feel like a real healthcare SaaS login experience.

---

## Reusable components allowed for this page

Create only the minimum reusable components needed for this page, such as:

* Auth Layout
* Auth Card
* Branded Header Block
* Form Input
* Password Input with Toggle
* Checkbox Row
* Primary Auth Button
* Inline Error Message
* Minimal Footer

Do not generate broader shared auth pages yet.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* auth card remains centered and readable
* split layout can stack cleanly
* branding stays visible but compact
* inputs and button remain large enough for comfortable use

---

## Important future compatibility rule

This page must be built so future auth pages can be added under the same auth structure without changing layout:

* `/auth/login`
* `/auth/forgot-password`
* `/auth/reset-password`

Do not redesign the auth root later.
Do not rename the layout later.

---

## Final output expectation

Generate a polished frontend page for:

* `Auth Layout`
* `Login` at `/auth/login`

Only this page and its directly required layout/components.


Build only the **Forgot Password page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Auth Layout** already exists from the Login page.
Do **not** redesign the root auth layout.
Do **not** generate Reset Password yet.
Keep the auth route structure stable.

---

## Correct authentication route hierarchy

This project must follow this authentication route hierarchy exactly:

* `/auth/login`
* `/auth/forgot-password`
* `/auth/reset-password`

For this task, generate only:

* **Page route:** `/auth/forgot-password`

This page belongs inside the existing **Auth Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Auth Layout
* branding/header area
* auth card style
* auth form visual language from the Login page

Do not rebuild them from scratch unless needed for consistency.
Use the same design quality and trust-oriented auth style already established.

---

## Product context

This is the password recovery request page for a **medical CRM / clinic management SaaS**.

Users of different roles may use it:

* Platform Super Admin
* Clinic Admin
* Doctor
* future staff roles

The page should feel:

* secure
* trustworthy
* calm
* premium SaaS
* easy to use under stress

---

## Design style

Create a **clean premium healthcare authentication page** with:

* white and blue dominant UI
* strong trust-oriented design
* minimal clutter
* soft rounded corners
* subtle shadows
* clear input hierarchy
* polished form states
* desktop-first but mobile-friendly layout

Keep it visually aligned with the Login page.

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary button, focused inputs, links
* Teal only for subtle highlight/accent if needed
* White/light background for trust and cleanliness
* keep the interface premium and medically appropriate

---

## Route definition

* **Route:** `/auth/forgot-password`
* **Page name:** Forgot Password
* **Layout parent:** Auth Layout

---

## Main page goal

This page should help the user:

* request a password reset easily
* understand what to enter
* feel reassured that recovery is secure
* proceed back to login if needed

---

## Main page structure

### 1. Branding/header area

Reuse the clean auth branding section with:

* platform logo placeholder
* platform name
* short supporting line describing the platform as a medical CRM / clinic management system

Keep it visually consistent with Login.

---

### 2. Forgot password form card

Create a premium auth card with:

#### Form title

* `Forgot password?`

#### Supporting text

Short line like:

* enter your email or phone to receive reset instructions

### Form field

* Email or Phone

### Field behavior

* clear label
* placeholder
* focus states
* error states

---

### 3. Primary action

Include a strong primary button:

* `Send Reset Link`

If you want a more neutral version because phone may also be supported, label can be:

* `Send Instructions`

Choose the cleaner option and keep it consistent.

---

### 4. Secondary navigation

Include a clear secondary link/button:

* `Back to Sign In`

This should link to:

* `/auth/login`

---

### 5. Success state

Design a polished inline success state after submit.

It should communicate:

* instructions were sent
* check email or phone
* follow the next step to reset password

Keep it calm and professional.

---

### 6. Validation and error states

Design polished states for:

* missing email/phone
* invalid email/phone format
* account not found or generic recovery message
* rate limit or resend cooldown if useful

Keep errors and notices secure and professional.
Do not expose sensitive account-existence patterns too aggressively.

---

### 7. Optional help text

Add subtle helper text such as:

* if you do not receive instructions, check spam or try again later
* contact support if you continue having trouble

Keep it minimal and professional.

---

### 8. Optional footer area

Include a minimal footer area with:

* privacy/policy placeholder
* support link placeholder if useful

Keep it simple and consistent with Login.

---

## Interaction rules

The page should support:

* entering email or phone
* submitting reset request
* showing success state
* showing validation errors cleanly
* returning to login

Do not generate the Reset Password page yet, only keep compatibility with future route:

* `/auth/reset-password`

---

## Data realism

Use believable placeholder content for:

* medical platform branding
* helper text
* realistic validation and success messages

Do not use childish or overly casual tone.

---

## UX expectations

The user should quickly understand:

* what to enter
* what happens after submission
* how to return to login
* whether the request was accepted
* that the system is secure and professional

This page should feel like a real healthcare SaaS recovery experience.

---

## Reusable components allowed for this page

Create only the minimum reusable components needed for this page, such as:

* Auth Card
* Form Input
* Primary Auth Button
* Secondary Text Link
* Inline Success Message
* Inline Error Message
* Minimal Footer

Do not regenerate the full auth system.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* auth card remains centered and readable
* branding stays compact
* input and button remain easy to use
* success and error states remain clearly visible

---

## Important future compatibility rule

This page must remain compatible with:

* `/auth/login`
* `/auth/forgot-password`
* `/auth/reset-password`

Do not redesign the auth root later.
Do not rename the layout later.

---

## Final output expectation

Generate a polished frontend page for:

* `Forgot Password` at `/auth/forgot-password`

Reuse the existing `Auth Layout` and keep route structure clean for future pages.


Build only the **Reset Password page** for a multi-tenant medical CRM SaaS.

## Important scope rule

Generate **only this page and its directly needed local components**.
Assume the **Auth Layout** already exists from the Login and Forgot Password pages.
Do **not** redesign the root auth layout.
Keep the auth route structure stable.

---

## Correct authentication route hierarchy

This project must follow this authentication route hierarchy exactly:

* `/auth/login`
* `/auth/forgot-password`
* `/auth/reset-password`

For this task, generate only:

* **Page route:** `/auth/reset-password`

This page belongs inside the existing **Auth Layout**.

---

## Dependency rule

Assume these already exist and must be reused:

* Auth Layout
* branding/header area
* auth card style
* auth form visual language from the previous auth pages

Do not rebuild them from scratch unless needed for consistency.
Use the same design quality and trust-oriented auth style already established.

---

## Product context

This is the final password reset step for a **medical CRM / clinic management SaaS**.

Users of different roles may use it:

* Platform Super Admin
* Clinic Admin
* Doctor
* future staff roles

The page should feel:

* secure
* trustworthy
* calm
* premium SaaS
* very clear and low-friction

---

## Design style

Create a **clean premium healthcare authentication page** with:

* white and blue dominant UI
* strong trust-oriented design
* minimal clutter
* soft rounded corners
* subtle shadows
* clear form hierarchy
* polished validation states
* desktop-first but mobile-friendly layout

Keep it visually aligned with Login and Forgot Password.

---

## Color palette

Use these colors:

* Primary Blue: `#2563EB`
* White: `#FFFFFF`
* Accent Teal: `#14B8A6`

Supporting neutrals:

* Background: `#F8FAFC`
* Card: `#FFFFFF`
* Border: `#E5E7EB`
* Primary text: `#0F172A`
* Secondary text: `#475569`
* Muted text: `#94A3B8`
* Success: `#16A34A`
* Warning: `#F59E0B`
* Danger: `#DC2626`

### Color usage

* Blue for primary button, focused inputs, links
* Teal only for subtle highlight/accent if needed
* White/light background for trust and cleanliness
* keep the interface premium and medically appropriate

---

## Route definition

* **Route:** `/auth/reset-password`
* **Page name:** Reset Password
* **Layout parent:** Auth Layout

---

## Main page goal

This page should help the user:

* create a new password safely
* understand password requirements clearly
* confirm the new password without confusion
* successfully complete account recovery
* continue back to sign in afterward

---

## Main page structure

### 1. Branding/header area

Reuse the clean auth branding section with:

* platform logo placeholder
* platform name
* short supporting line describing the platform as a medical CRM / clinic management system

Keep it visually consistent with the other auth pages.

---

### 2. Reset password form card

Create a premium auth card with:

#### Form title

* `Reset password`

#### Supporting text

Short line like:

* create a new password for your account

### Form fields

* New Password
* Confirm New Password

### Field behavior

* clear labels
* placeholders
* focus states
* error states
* password show/hide toggles
* inline helper text for password rules

---

### 3. Password requirement guidance

Include a clean small section that explains password expectations, such as:

* minimum length
* mix of characters if desired
* avoid weak/common passwords

This should be visually subtle but useful.

### Optional UX enhancement

Show live validation indicators for password rules if it stays clean.

---

### 4. Primary action

Include a strong primary button:

* `Reset Password`

This should be visually strong and premium.

---

### 5. Secondary navigation

Include a clear secondary link/button:

* `Back to Sign In`

This should link to:

* `/auth/login`

---

### 6. Success state

Design a polished success state after reset.

It should communicate:

* password has been updated successfully
* user can now sign in with the new password

Include a strong follow-up action:

* `Go to Sign In`

---

### 7. Validation and error states

Design polished states for:

* missing password
* weak password
* password confirmation mismatch
* expired or invalid reset token
* generic reset failure if useful

Keep these messages secure, professional, and calm.

---

### 8. Optional security helper text

Add subtle helper text such as:

* choose a strong password you do not reuse elsewhere
* this helps protect your medical workspace access

Keep it minimal and professional.

---

### 9. Optional footer area

Include a minimal footer area with:

* privacy/policy placeholder
* support link placeholder if useful

Keep it simple and consistent with the other auth pages.

---

## Interaction rules

The page should support:

* entering a new password
* confirming a new password
* toggling password visibility
* showing inline validation clearly
* showing success state after completion
* returning to login

---

## Data realism

Use believable placeholder content for:

* medical platform branding
* helper text
* realistic validation and success messages

Do not use childish or overly casual tone.

---

## UX expectations

The user should quickly understand:

* what to enter
* whether the password is valid
* whether both passwords match
* whether reset succeeded
* how to continue to sign in

This page should feel like a real healthcare SaaS password reset experience.

---

## Reusable components allowed for this page

Create only the minimum reusable components needed for this page, such as:

* Auth Card
* Password Input with Toggle
* Password Rules Helper
* Primary Auth Button
* Secondary Text Link
* Inline Success Message
* Inline Error Message
* Minimal Footer

Do not regenerate the full auth system.

---

## Responsive behavior

Desktop-first.

On smaller screens:

* auth card remains centered and readable
* branding stays compact
* password inputs and button remain easy to use
* validation and success states remain clearly visible

---

## Important future compatibility rule

This page must remain compatible with:

* `/auth/login`
* `/auth/forgot-password`
* `/auth/reset-password`

Do not redesign the auth root later.
Do not rename the layout later.

---

## Final output expectation

Generate a polished frontend page for:

* `Reset Password` at `/auth/reset-password`

Reuse the existing `Auth Layout` and keep route structure clean for future pages.


Design the **overall backend architecture** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a backend architecture that is:

* production-ready
* scalable
* maintainable by developers globally
* modular
* secure
* clear in ownership boundaries
* suitable for medical/business data
* prepared for future integrations

This backend must support these platform layers:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor
* future staff roles such as Receptionist, Cashier, Nurse, Warehouse Manager

---

## Core product scope

The backend must support these functional modules:

### Platform / Super Admin side

* platform dashboard
* clinics management
* branches management
* users management
* platform analytics
* platform settings

### Clinic Admin side

* clinic dashboard
* branch details
* patients
* doctors
* doctor analytics
* services
* rooms
* warehouse
* products
* suppliers
* payments
* invoices
* sources

### Doctor side

* doctor dashboard
* my patients
* patient detail
* create encounter / consultation
* goods usage
* my performance

### Authentication

* login
* forgot password
* reset password
* role-based access control

---

## Architecture style

Use a **modular monolith** as the default architecture.

Important requirements:

* modular by business domain
* clear module boundaries
* easy future extraction into microservices if ever needed
* avoid overengineering early
* prioritize maintainability and delivery speed
* suitable for one main backend application with strong internal module separation

The architecture should be strong enough for:

* multiple clinics
* multiple branches
* many users
* payments and invoices
* inventory and warehouse operations
* medical patient records
* audit logs
* source/integration tracking

---

## Preferred backend style

Design the backend using these principles:

* Clean Architecture or layered modular architecture
* domain-driven module boundaries
* service layer
* repository/data access layer
* API/controller layer
* DTO-based contracts
* validation layer
* policy/permission layer
* audit logging layer
* transaction-safe business operations

---

## Expected backend output

Generate a detailed architecture plan that includes:

1. **High-level backend architecture**
2. **Project/module structure**
3. **Suggested folders/package organization**
4. **Layering rules**
5. **Module boundaries**
6. **Multi-tenant isolation approach**
7. **Role and permission strategy**
8. **Cross-cutting concerns**
9. **Naming conventions**
10. **API versioning approach**
11. **Error handling structure**
12. **Validation approach**
13. **Audit and logging strategy**
14. **File/document handling strategy**
15. **Background job/event handling approach**
16. **Scalability considerations**
17. **Testing strategy**
18. **Recommended engineering best practices**

---

## Multi-tenant rules

This is a **multi-tenant medical platform**.

Design the backend so that:

* Platform Super Admin can access all organizations
* Clinic Admin can access only their clinic/branch scope
* Doctor can access only allowed clinic/branch/patient scope
* tenant data isolation is enforced carefully
* branch-level and clinic-level scoping are both supported
* patient access is controlled properly
* future branch expansion is supported cleanly

Explain the best backend strategy for:

* tenant scoping
* branch scoping
* query filtering
* secure access checks
* row-level isolation logic at application level and/or database level

---

## Recommended module boundaries

Design clear business modules such as:

* auth
* users
* roles / permissions
* organizations / clinics
* branches
* patients
* doctors
* services
* rooms
* encounters
* billing / invoices
* payments
* warehouse
* products
* suppliers
* sources
* analytics
* files / documents
* audit logs
* notifications

Explain:

* what each module owns
* what it should not own
* how modules communicate
* how to avoid tangled dependencies

---

## Layering rules

Define the internal backend layers clearly.

For example, the architecture should explain something like:

* API / Controllers
* Application / Use Cases / Services
* Domain / Business Logic
* Infrastructure / Persistence / External Integrations

Explain:

* what belongs in each layer
* what must not leak between layers
* how DTOs and entities should be separated
* how validation should work
* where transactions should live

---

## Project structure

Generate a recommended backend project/folder structure.

It should be understandable to any strong developer worldwide.

Example expectation:

* root
* src
* modules
* shared
* infrastructure
* config
* tests
* migrations
* docs

But do not stop at shallow folder naming.
Design a real structure that scales.

Include:

* module folders
* controller folders
* service/use-case folders
* dto folders
* repository folders
* policy/permission folders
* mapper folders
* event/background job folders if useful

---

## API conventions

Define API conventions for the whole backend:

* REST-style API design
* consistent route naming
* versioning approach such as `/api/v1/...`
* pagination format
* sorting format
* filtering approach
* success response format
* error response format
* validation error format

Make this part clear and standardized.

---

## Role and permission strategy

The architecture must define a strong authorization model.

Support these roles at minimum:

* Platform Super Admin
* Clinic Admin
* Branch Admin if needed
* Doctor
* Receptionist
* Cashier
* Nurse
* Warehouse Manager

Explain how to implement:

* role-based access control
* permission-based access
* module-level access
* record-level access
* tenant-aware permission checks
* doctor-only scope checks

Make it scalable and clean.

---

## Security and medical-grade concerns

Because this is a medical platform, include architecture recommendations for:

* patient data protection
* access logging
* audit trails
* sensitive field handling
* file/document protection
* safe password reset
* secure token/session strategy
* rate limiting on auth-sensitive routes
* minimum necessary access design

Do not write legal compliance essays, but architecture should clearly reflect secure medical-platform thinking.

---

## Database and persistence expectations

This prompt is about backend architecture, not raw DB schema generation, but the design must assume:

* PostgreSQL or equivalent relational DB
* proper transactions
* audit tables
* soft delete where appropriate
* immutable financial and stock movement records where needed
* query efficiency
* indexes
* support for warehouse and billing logic
* support for analytics read models if needed

Explain how the backend should interact with DB cleanly.

---

## Files and documents

The backend architecture must support:

* patient medical documents
* uploaded files
* optional doctor/supplier/invoice-related documents
* storage abstraction
* secure file access

Explain the best architectural place for:

* upload service
* metadata storage
* access control
* signed/private file access if needed

---

## Background processing

Explain where and how to handle:

* notifications
* audit events
* payment provider callbacks
* periodic analytics aggregation
* low stock alerts
* integration sync tasks

Keep it practical:

* background jobs / queue support
* event-driven internal processing where useful
* avoid premature microservice complexity

---

## Logging, observability, and audit

Define architecture for:

* application logs
* audit logs
* request tracing
* error monitoring
* important domain event logs

Make clear which actions must be auditable, especially for:

* patient data access
* invoice changes
* payment actions
* stock adjustments
* role/permission changes

---

## Testing strategy

Generate a recommended testing strategy for this backend, including:

* unit tests
* service/use-case tests
* repository/integration tests
* API tests
* permission tests
* critical workflow tests

Focus on business-critical workflows such as:

* login and password reset
* patient creation and assignment
* encounter creation
* invoice creation
* payment recording
* stock usage and warehouse movements
* permission enforcement

---

## Engineering best practices

Include practical recommendations for:

* migrations
* seeding
* feature flags if useful
* idempotency for payments/webhooks
* transactional boundaries
* avoiding god services
* avoiding circular dependencies
* module contracts
* API documentation strategy
* code consistency rules

---

## Output style requirement

Generate the backend architecture as a **clear structured technical blueprint** that developers can directly use to start implementation.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **authentication and authorization architecture** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready auth and access-control design that is:

* secure
* scalable
* maintainable by developers globally
* clear in role ownership and permission logic
* suitable for medical/business data
* tenant-aware
* safe for platform admin, clinic admin, doctor, and future staff roles

This prompt must cover both:

* **authentication**
* **authorization**

---

## Product access context

This platform has these main access layers:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Branch Admin if needed
* Doctor
* future staff roles:

  * Receptionist
  * Cashier
  * Nurse
  * Warehouse Manager

The architecture must support users logging into the same platform but receiving different access scopes based on:

* role
* clinic
* branch
* record ownership
* patient access rules

---

## Authentication scope

Design the full auth flow for:

* login
* logout
* forgot password
* reset password
* session/token refresh
* account status checks
* role-aware login response
* optional future MFA readiness

Explain the best backend approach for:

* access tokens
* refresh tokens
* password reset tokens
* session invalidation
* token rotation
* device/session security if useful

---

## Authorization scope

Design a strong authorization model for:

* role-based access control
* permission-based access control
* tenant-aware access control
* clinic-level scope
* branch-level scope
* doctor-only scope
* record-level access checks

The architecture must support:

* Platform Super Admin can access all
* Clinic Admin can access only their clinic / allowed branches
* Doctor can access only allowed clinic/branch/patient/workflow scope
* future staff roles can access only the modules they are allowed to use

---

## Expected output

Generate a detailed technical blueprint that includes:

1. **Auth architecture overview**
2. **Login flow**
3. **Forgot password flow**
4. **Reset password flow**
5. **Access token + refresh token strategy**
6. **Session invalidation / logout strategy**
7. **Role and permission model**
8. **Tenant and branch scope enforcement**
9. **Record-level access rules**
10. **API endpoint recommendations**
11. **Request/response DTO suggestions**
12. **Error handling and auth error formats**
13. **Security hardening recommendations**
14. **Audit logging requirements**
15. **Testing strategy for auth/access control**
16. **Engineering best practices for implementation**

---

## Authentication design requirements

### 1. Login

Support login by:

* email
* phone
* password

The architecture must define:

* login request DTO
* login validation rules
* account lookup strategy
* password verification flow
* role/scope loading flow
* response payload structure

Explain what the login response should return, such as:

* access token
* refresh token
* user profile
* current role(s)
* current clinic/branch scope if relevant
* permissions summary if appropriate

---

### 2. Forgot password

Support forgot password by:

* email or phone

The architecture must define:

* forgot password request DTO
* secure token generation
* token expiry
* delivery strategy abstraction (email/SMS)
* anti-enumeration behavior
* resend/rate limit protection

Important:

* do not expose whether an account exists too aggressively
* use safe generic responses where appropriate

---

### 3. Reset password

Support reset password using:

* secure token
* new password
* password confirmation

The architecture must define:

* reset password request DTO
* token verification flow
* password policy validation
* token invalidation after use
* session invalidation after password change
* post-reset login strategy recommendation

---

### 4. Logout and session management

Explain how to handle:

* logout current session
* logout all sessions
* refresh token revocation
* password change invalidating old sessions if needed
* session/device tracking if useful

---

## Token/session strategy

Recommend the best practical strategy for this platform.

Cover:

* JWT vs opaque tokens
* access token lifetime
* refresh token lifetime
* secure refresh flow
* refresh token rotation
* blacklisting/revocation strategy
* secure cookie vs bearer token discussion
* SPA/admin panel compatibility

The design should be practical for a modern web SaaS.

---

## Password policy

Define a practical password policy for this product.

Explain:

* minimum length
* complexity expectations
* weak/common password prevention
* confirmation rules
* password hashing strategy
* password reset invalidation behavior

For hashing, recommend modern secure choices and explain where/how this belongs in architecture.

---

## Role model

Support at minimum these roles:

* Platform Super Admin
* Clinic Admin
* Branch Admin
* Doctor
* Receptionist
* Cashier
* Nurse
* Warehouse Manager

Explain clearly:

* what a role is
* what a permission is
* why both role-based and permission-based checks should exist
* how roles map to permission bundles
* how custom per-tenant permission overrides could be handled later if needed

---

## Permission model

Design a scalable permission naming strategy.

Examples of modules:

* auth
* users
* clinics
* branches
* patients
* doctors
* services
* rooms
* warehouse
* products
* suppliers
* encounters
* invoices
* payments
* sources
* analytics
* settings
* files
* audit logs

Define a clean permission pattern such as:

* `patients.read`
* `patients.create`
* `patients.update`
* `patients.assign_doctor`
* etc.

Explain how permission checks should work in:

* controllers
* use cases/services
* policies
* query scoping

---

## Tenant-aware authorization

This is critical.

Explain how to enforce:

* platform scope
* clinic scope
* branch scope
* doctor scope
* patient scope
* record ownership / assignment rules

The architecture must make clear how to prevent:

* clinic A seeing clinic B data
* doctor seeing unauthorized patients
* staff seeing modules outside their role
* branch leakage across branches

Design the best approach for:

* token claims
* request context
* permission context
* data filtering
* policy checks
* database query scope enforcement

---

## Doctor-specific access rules

This system has special doctor-related constraints.

Design the authorization logic for cases such as:

* doctor can see their assigned/access-allowed patients
* doctor can create encounter records for allowed patients
* doctor can record goods usage related to service
* doctor cannot manage clinic-wide users/settings
* doctor may view only relevant billing/clinical scope depending on permission

Explain how to implement this cleanly.

---

## Branch and clinic scope rules

Explain how the auth/access system should handle:

* one clinic with multiple branches
* clinic admins that may manage one or many branches
* branch admins with branch-only access
* doctors attached to one or more branches if future support is needed

The design must be future-safe and not locked to only one branch per user.

---

## API endpoint recommendations

Design the recommended auth/authz-related API endpoints.

Examples to cover:

* login
* refresh token
* logout
* logout all sessions
* forgot password
* reset password
* get current session / me
* get current permissions / access context

Use consistent REST-style versioned paths such as `/api/v1/...`

Explain purpose, request shape, response shape, and security behavior.

---

## DTO and response contract expectations

Define good request/response conventions for auth APIs.

The design should include examples for:

* login request
* login response
* forgot password request
* reset password request
* current user/session response
* permission/access context response

Make response contracts practical for frontend consumption.

---

## Error handling for auth

Define a clean error format for:

* invalid credentials
* account disabled
* account locked if used
* invalid reset token
* expired reset token
* insufficient permissions
* forbidden tenant/branch access
* refresh token expired/revoked

Keep the error format consistent and implementation-ready.

---

## Security hardening

Because this is a medical platform, include architecture recommendations for:

* strong password hashing
* token signing and storage safety
* brute-force protection
* rate limiting
* login throttling
* password reset abuse prevention
* secure audit trails
* minimum necessary access principles
* safe defaults for inactive/suspended accounts
* sensitive route protection
* CSRF/XSS/session handling considerations where relevant

Do not write generic theory only — make it implementation-oriented.

---

## Audit logging requirements

Define what auth-related actions must be audited, such as:

* login success/failure
* logout
* password reset request
* password reset success/failure
* permission changes
* role changes
* account activation/deactivation
* access to sensitive patient data if relevant to auth context

Explain:

* what fields should be logged
* what should be careful not to expose
* how audit logging should fit the architecture

---

## Suggested implementation structure

Recommend where auth/authz logic should live in backend structure, for example:

* auth module
* session/token service
* password service
* permission service
* policy/authorization layer
* request context/middleware
* guards/interceptors
* audit logging hooks

Explain which logic belongs where.

---

## Testing strategy

Generate a recommended testing strategy for auth/access control, including:

* login success/failure tests
* password reset flow tests
* refresh/logout tests
* permission enforcement tests
* tenant leakage prevention tests
* doctor scope access tests
* branch/clinic scope tests
* inactive/suspended account tests

Focus on business-critical and security-critical scenarios.

---

## Engineering best practices

Include practical recommendations for:

* token secret management
* password reset token storage strategy
* config separation by environment
* avoiding hardcoded permissions
* preventing privilege escalation
* seed strategy for roles/permissions
* idempotent password reset flows where useful
* API documentation for auth routes
* consistent middleware/guard design

---

## Output style requirement

Generate the auth and authorization design as a **clear structured technical blueprint** that developers can directly use to implement the system.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **Super Admin Backend/API layer** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **backend/API blueprint** for all **Platform Super Admin** features.

This API design must be:

* scalable
* modular
* maintainable by developers globally
* secure
* tenant-aware
* clear in ownership boundaries
* practical for frontend integration
* suitable for medical/business operations

The Super Admin layer must support platform-wide visibility and control across:

* clinics
* branches
* users
* analytics
* platform settings

---

## Scope of this prompt

Design backend/API contracts and architecture only for these Super Admin modules:

1. Super Admin Dashboard
2. Clinics Management
3. Branches Management
4. Users Management
5. Platform Analytics
6. Platform Settings

Do **not** design Clinic Admin APIs or Doctor APIs in this prompt.

---

## Platform hierarchy context

This system supports:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor
* future staff roles:

  * Receptionist
  * Cashier
  * Nurse
  * Warehouse Manager

The **Platform Super Admin** has access to all clinics, all branches, all users, all global analytics, and all platform settings.

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Module-by-module API design**
2. **REST endpoints**
3. **Request DTOs**
4. **Response DTOs**
5. **Pagination / filtering / sorting conventions**
6. **Permissions and access rules**
7. **Service/use-case boundaries**
8. **Validation rules**
9. **Error handling approach**
10. **Audit requirements**
11. **Cross-module dependencies**
12. **Implementation notes for maintainability**

Make the output practical and implementation-oriented.

---

# Global API conventions

## API style

Use:

* REST-style endpoints
* versioned routes such as `/api/v1/...`
* consistent JSON request/response contracts
* paginated list responses where relevant
* structured filtering and sorting

## Response conventions

Design consistent response shapes for:

* list endpoints
* detail endpoints
* create/update actions
* analytics responses
* settings/config responses

## Error conventions

Define clear error behavior for:

* validation errors
* forbidden access
* missing entities
* conflict/duplicate creation
* invalid state transitions
* platform setting validation failures

---

# 1. Super Admin Dashboard API

## Route scope

This module must support the frontend page:

* `/super-admin/dashboard`

## Dashboard requirements

The API must provide platform-wide dashboard data such as:

* total clinics
* total branches
* total doctors
* total patients
* total revenue across platform
* active users
* recent activity
* new clinics added
* top performing clinics
* revenue trend
* clinic growth chart
* platform health indicators

## Design requirements

Explain the best API approach for:

* one aggregated dashboard endpoint vs multiple smaller endpoints
* performance considerations
* caching/read model options if useful
* date range filters

## Required endpoints to design

At minimum design:

* dashboard overview summary
* revenue trend
* clinic growth trend
* top clinics
* recent activity feed
* platform health summary

Include:

* request parameters
* response shapes
* filtering options
* date range behavior

---

# 2. Clinics Management API

## Route scope

This module must support the frontend page:

* `/super-admin/clinics`

## Clinics page requirements

The API must support:

* clinics list
* create clinic
* edit clinic
* activate/deactivate clinic
* assign clinic admin
* clinic detail data preview for management
* filters/search/sorting
* pagination

A clinic here means **clinic organization / clinic group**, not a branch.

## Clinics data needs

The frontend needs fields such as:

* clinic/group name
* number of branches
* number of doctors
* number of patients
* total revenue
* status
* created date
* actions

## Required endpoints to design

At minimum design:

* list clinics
* get clinic by id
* create clinic
* update clinic
* change clinic status
* assign clinic admin
* clinic summary stats if separate

Include:

* DTOs
* validation rules
* duplicate prevention logic
* status transition rules
* audit requirements

Also explain:

* whether branch count / doctor count / patient count / revenue should be returned inline or through summary projection
* how to avoid N+1 performance problems

---

# 3. Branches Management API

## Route scope

This module must support the frontend page:

* `/super-admin/branches`

## Branches page requirements

The API must support:

* branch list
* create branch
* edit branch
* activate/deactivate branch
* assign branch admin if needed
* filter/search/sort/pagination
* branch detail preview for management

A branch here means:

* physical clinic location
* clinic филиал / branch unit
* belongs to a clinic organization

## Branches data needs

The frontend needs fields such as:

* branch name
* clinic/group
* location
* admins
* doctors count
* patients count
* status
* created date

## Required endpoints to design

At minimum design:

* list branches
* get branch by id
* create branch
* update branch
* change branch status
* assign branch admin

Include:

* DTOs
* validation rules
* relationship to clinic/group
* audit requirements

Explain:

* how clinic/group relation should be loaded
* how admin count/name preview should be returned
* how branch operational summary should be projected efficiently

---

# 4. Users Management API

## Route scope

This module must support the frontend page:

* `/super-admin/users`

## Users page requirements

The API must support:

* list all platform users
* invite/create user
* update user role
* reassign clinic/branch
* activate/deactivate/suspend user
* resend invite
* search/filter/sort/pagination
* platform-wide user visibility

## Users data needs

The frontend needs fields such as:

* full name
* role
* clinic/group
* branch
* phone/email
* status
* last login
* actions

## Required endpoints to design

At minimum design:

* list users
* get user by id
* invite/create user
* update user role/scope
* update user status
* resend invite
* get role options
* get assignment options (clinic/branch scopes)

Include:

* request/response DTOs
* validation rules
* role assignment rules
* clinic/branch assignment rules
* invite flow assumptions
* suspended/inactive logic
* audit requirements

Explain:

* how user identity is separated from tenant assignment
* whether one user can belong to multiple clinics/branches/roles
* how to structure DTOs so frontend can render role and scope clearly

---

# 5. Platform Analytics API

## Route scope

This module must support the frontend page:

* `/super-admin/analytics`

## Analytics page requirements

The API must support platform-wide analytics for:

* total revenue
* total patients
* total clinics
* total branches
* active doctors
* average revenue per clinic
* platform revenue trend
* revenue by clinic
* revenue by branch
* patient acquisition by source
* clinic comparison
* doctor comparison
* invoice status breakdown
* product/goods consumption trends
* branch performance comparison
* insight cards/highlights

## Filter requirements

The analytics API must support filters such as:

* date range
* clinic/group multi-select
* branch multi-select
* source multi-select
* service multi-select

## Design requirements

Explain the best backend approach for:

* analytics aggregation
* query performance
* read-model/materialized view approach if useful
* balancing real-time vs pre-aggregated data

## Required endpoints to design

At minimum design:

* top KPI summary
* revenue trend
* revenue by clinic
* revenue by branch
* patient acquisition by source
* clinic comparison
* doctor comparison
* invoice status breakdown
* goods consumption trends
* branch performance
* insights/highlights

For each:

* define input filters
* define response shape
* define whether aggregation is computed live or from read models

---

# 6. Platform Settings API

## Route scope

This module must support the frontend page:

* `/super-admin/settings`

## Settings page requirements

The API must support these settings sections:

1. Global Permissions
2. Integrations
3. Payment Methods
4. Source Templates
5. Branding
6. Audit Logs

This is a platform governance/configuration module, not a clinic settings module.

---

## 6.1 Global Permissions API

The API must support:

* role list
* permission matrix/summary
* update role permissions
* view role scopes

Support roles such as:

* Platform Super Admin
* Clinic Admin
* Branch Admin
* Doctor
* Receptionist
* Cashier
* Nurse
* Warehouse Manager

Required endpoints:

* list roles
* get role permission summary
* update role permissions
* list permission catalog

Explain:

* how permission bundles should be returned
* how changes should be audited
* how protected roles should be handled safely

---

## 6.2 Integrations API

The API must support managing integrations such as:

* Telegram
* Instagram
* Website / API
* Mobile App redirect source
* Payment Gateway
* Email Service
* SMS Provider

Required endpoints:

* list integrations
* get integration detail
* enable/disable integration
* update integration config
* test connection if useful

Explain:

* secure storage of credentials/secrets
* masking sensitive values in responses
* audit and connection test behavior

---

## 6.3 Payment Methods API

The API must support:

* list payment methods
* create/configure payment method
* enable/disable payment method
* update provider settings

Supported examples:

* Cash
* Card
* Bank Transfer
* Click
* Payme
* Insurance

Required endpoints:

* list payment methods
* create payment method config
* update payment method config
* change status
* get supported types/providers

Explain:

* how config fields differ by provider
* how to validate provider-specific config
* how to mask secrets in responses

---

## 6.4 Source Templates API

The API must support platform-level source template management.

Examples:

* App
* Telegram
* Instagram
* Website
* Referral
* Walk-in / Manual
* Partner / Campaign

Required endpoints:

* list source templates
* get source template by id
* create source template
* update source template
* activate/deactivate source template

Explain:

* difference between platform source template vs clinic-level source instance
* how templates become available to clinics

---

## 6.5 Branding API

The API must support basic platform branding such as:

* platform name
* logo
* favicon
* primary color
* accent color
* email sender name
* support email

Required endpoints:

* get branding settings
* update branding settings
* upload branding assets if needed

Explain:

* file handling strategy
* validation rules
* public vs private asset handling

---

## 6.6 Audit Logs API

The API must support a platform-level audit log viewer.

The frontend needs fields such as:

* timestamp
* user
* action
* module
* entity
* clinic / branch
* result / status

Required endpoints:

* list audit logs
* filter audit logs
* export audit logs if useful

Support filters such as:

* search
* date range
* module
* user
* status

Explain:

* which Super Admin actions must be logged
* how audit logs are queried efficiently
* what sensitive data should not be exposed in raw audit output

---

# Permissions and access rules

Define Super Admin access requirements clearly.

Explain:

* which endpoints are Super Admin only
* whether certain settings endpoints are restricted further
* how permission checks should be enforced
* how protected operations should be guarded

Even though Super Admin is high privilege, the design should still support:

* permission checks
* audit logging
* safe destructive action handling

---

# Cross-module relationships

Explain cleanly how these Super Admin APIs depend on lower modules such as:

* organizations/clinics
* branches
* users
* payments
* invoices
* analytics
* warehouse
* sources

Make the design modular and avoid tangled dependencies.

---

# Filtering, sorting, and pagination

Define a consistent approach for all Super Admin list endpoints:

* search query
* filters
* page/pageSize or cursor strategy
* sorting fields
* sort direction
* response metadata

Make it concrete and frontend-friendly.

---

# Validation rules

Define practical validation expectations for:

* clinic creation/update
* branch creation/update
* user invite/update
* settings changes
* permission updates
* integration config
* payment method config
* source template creation

Include:

* required fields
* uniqueness checks
* state transition validation
* protected-operation rules

---

# Error handling

Define Super Admin API error behavior for:

* invalid payload
* duplicate clinic/branch
* invalid assignment
* invalid role
* forbidden action
* missing entity
* invalid setting config
* integration test failure
* protected role or protected entity modification

Use a consistent backend error structure.

---

# Audit requirements

Specify which operations must create audit logs, including:

* clinic created/updated/status changed
* branch created/updated/status changed
* user invited/updated/deactivated
* permission changes
* integration changes
* payment method changes
* branding changes
* source template changes
* settings changes

Explain:

* what to log
* actor identity
* affected entity
* before/after values where appropriate

---

# Testing strategy

Generate a recommended testing strategy for Super Admin APIs, including:

* dashboard aggregation tests
* clinics list/create/update tests
* branches list/create/update tests
* user invite/role/status tests
* analytics filter tests
* settings update tests
* permission update tests
* integration config tests
* audit log visibility tests
* authorization tests

Focus on business-critical platform operations.

---

# Engineering best practices

Include practical recommendations for:

* DTO separation
* query optimization
* analytics read models
* idempotent invite or settings operations where useful
* protected role handling
* safe destructive actions
* API documentation
* consistent naming
* avoiding god-services across admin modules

---

## Output style requirement

Generate the Super Admin API design as a **clear structured technical blueprint** that developers can directly use to implement the backend.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **Clinic Admin Backend/API layer** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **backend/API blueprint** for all **Clinic Admin** features.

This API design must be:

* scalable
* modular
* maintainable by developers globally
* secure
* tenant-aware
* branch-aware
* practical for frontend integration
* suitable for medical, billing, and warehouse operations

The Clinic Admin layer must support management and visibility only inside the current clinic / allowed branch scope.

---

## Scope of this prompt

Design backend/API contracts and architecture only for these Clinic Admin modules:

1. Clinic Dashboard
2. Branch Details
3. Patients
4. Patient Detail
5. Doctors
6. Doctor Detail
7. Doctor Analytics
8. Services
9. Rooms
10. Warehouse Overview
11. Products
12. Suppliers
13. Supplier Detail
14. Payments Overview
15. Invoices
16. Create Invoice
17. Sources

Do **not** design Super Admin APIs or Doctor APIs in this prompt.

---

## Clinic Admin route context

These APIs must support frontend routes such as:

* `/clinic-admin/dashboard`
* `/clinic-admin/branch-details`
* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`
* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`
* `/clinic-admin/services`
* `/clinic-admin/services/rooms`
* `/clinic-admin/warehouse`
* `/clinic-admin/warehouse/products`
* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`
* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`
* `/clinic-admin/sources`

---

## Access and scope rules

The Clinic Admin must:

* access only their clinic organization or allowed branches
* not see data from other clinics
* not perform platform-level settings actions
* manage clinic operations, patients, doctors, services, warehouse, payments, and sources within their scope

The API design must make clear how to enforce:

* clinic scope
* branch scope
* record ownership rules where relevant
* data filtering by scope
* permission checks per module

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Module-by-module API design**
2. **REST endpoints**
3. **Request DTOs**
4. **Response DTOs**
5. **Pagination / filtering / sorting conventions**
6. **Permissions and access rules**
7. **Service/use-case boundaries**
8. **Validation rules**
9. **Error handling approach**
10. **Audit requirements**
11. **Cross-module dependencies**
12. **Implementation notes for maintainability**

Make the output practical and implementation-oriented.

---

# Global API conventions

## API style

Use:

* REST-style endpoints
* versioned routes such as `/api/v1/...`
* consistent JSON request/response contracts
* paginated list responses where relevant
* structured filtering and sorting

## Scope conventions

Every Clinic Admin API must be designed with:

* current user clinic context
* current branch or allowed branches context
* explicit scope filtering
* safe rejection if entity belongs outside permitted scope

Explain whether scope comes from:

* auth context
* branch selector/context
* explicit request parameters validated against allowed scope

---

# 1. Clinic Dashboard API

## Route scope

This module must support:

* `/clinic-admin/dashboard`

## Dashboard requirements

The API must provide clinic/branch-scoped dashboard data such as:

* monthly income
* total patients
* new patients
* returning patients
* paid invoices
* outstanding amount
* income trend
* patients trend
* patients by source
* most active doctors
* invoice status statistics
* warehouse summary
* top services
* top patient source channels
* recent activity/alerts

## Required endpoints to design

At minimum design:

* dashboard summary overview
* income trend
* patient trend
* patients by source
* most active doctors
* invoice status breakdown
* warehouse summary preview
* top services
* recent activity feed

Include:

* filter parameters
* date range behavior
* response shape
* performance approach

---

# 2. Branch Details API

## Route scope

This module must support:

* `/clinic-admin/branch-details`

## Branch details requirements

The API must support viewing and updating:

* branch identity
* clinic/group name
* branch code
* status
* timezone
* contact and address information
* active doctors count
* active rooms count
* active services count
* branch admins
* operational summary
* quick preview of doctors, rooms, and services

## Required endpoints to design

At minimum design:

* get current branch detail
* update branch detail
* list branch admins
* assign/add branch admin
* list branch doctor preview
* list branch room preview
* list branch service preview
* get branch operational summary

Include:

* DTOs
* validation rules
* status change rules
* audit requirements

---

# 3. Patients API

## Route scope

These modules must support:

* `/clinic-admin/patients`
* `/clinic-admin/patients/:id`

## Patients list requirements

The API must support:

* list patients
* search/filter/sort/paginate patients
* create patient
* update patient
* assign/change primary doctor
* patient summary metrics for list page
* lightweight patient preview

The frontend needs fields such as:

* full name
* age
* gender
* phone
* source
* primary doctor
* last visit
* total visits
* total income
* monthly income
* status

## Patient detail requirements

The API must support a rich patient profile including:

* overview data
* medical documents
* visit history
* billing summary
* notes
* patient-level quick actions

## Required endpoints to design

At minimum design:

* list patients
* get patient by id
* create patient
* update patient
* assign primary doctor
* list patient documents
* upload patient document metadata
* list patient visit history
* get patient billing summary
* list patient notes
* create patient note
* patient summary metrics endpoint if separate

Include:

* DTOs
* validation rules
* document access rules
* patient-doctor assignment rules
* note categories
* audit requirements

Explain:

* how patient total income and monthly income are projected
* how visit history is aggregated efficiently
* how document access is controlled

---

# 4. Doctors API

## Route scope

These modules must support:

* `/clinic-admin/doctors`
* `/clinic-admin/doctors/:id`
* `/clinic-admin/doctors/analytics`

## Doctors list requirements

The API must support:

* list doctors
* search/filter/sort/paginate doctors
* create doctor
* update doctor
* manage doctor status
* assign services to doctor
* doctor summary metrics for list page

The frontend needs fields such as:

* full name
* profession
* years of experience
* services count
* patients served
* total income
* monthly income
* rating
* status

## Doctor detail requirements

The API must support:

* overview
* patients served
* monthly patients
* performance summary
* service list
* edit doctor data

## Doctor analytics requirements

The API must support filterable analytics by:

* one doctor
* many doctors
* all doctors
* date range
* one/many/all services

And return:

* total patients today
* average consultation
* new patients
* returning patients
* total income
* daily patient trend
* doctors rating
* age distribution
* service distribution
* 24x7 highest-times heatmap
* doctor comparison metrics

## Required endpoints to design

At minimum design:

* list doctors
* get doctor by id
* create doctor
* update doctor
* change doctor status
* assign services to doctor
* list doctor patients served
* list doctor monthly patients
* get doctor performance summary
* doctor analytics summary
* doctor analytics daily trend
* doctor analytics ratings
* doctor analytics demographics
* doctor analytics service distribution
* doctor analytics heatmap
* doctor analytics comparison

Include:

* DTOs
* validation rules
* career start date / experience calculation strategy
* doctor-service assignment rules
* audit requirements

Explain:

* how analytics are aggregated
* how to handle large filter combinations efficiently
* whether analytics should use read models/materialized tables

---

# 5. Services and Rooms APIs

## Route scope

These modules must support:

* `/clinic-admin/services`
* `/clinic-admin/services/rooms`

## Services requirements

The API must support:

* list services
* create service
* update service
* change service status
* link goods/products to service
* assign doctors to service
* filters/search/sort/pagination
* summary metrics

Service fields include:

* service name
* category
* price
* duration
* room requirement
* doctor requirement
* linked goods/products
* status

## Rooms requirements

The API must support:

* list rooms
* create room
* update room
* change room status
* assign services to room
* assign doctors to room
* room filters/search/sort/pagination
* room summary metrics

Room fields include:

* room name
* room type
* floor
* available services
* assigned doctors
* status

## Required endpoints to design

At minimum design:

* list services
* get service by id if needed
* create service
* update service
* change service status
* link products to service
* assign doctors to service
* list rooms
* create room
* update room
* change room status
* assign services to room
* assign doctors to room
* services summary metrics
* rooms summary metrics

Include:

* DTOs
* validation rules
* room-service compatibility logic
* service-product consumption link logic
* audit requirements

---

# 6. Warehouse Overview API

## Route scope

This module must support:

* `/clinic-admin/warehouse`

## Warehouse requirements

The API must provide warehouse overview data such as:

* total left goods
* total spent
* total output
* low stock items
* out of stock items
* categories tracked
* kirim vs chiqim
* stock movement trend
* top spent goods
* few remainings / low stock items
* category consumption
* warehouse insights

## Required endpoints to design

At minimum design:

* warehouse KPI summary
* kirim vs chiqim trend
* stock movement trend
* top spent goods
* low stock items
* category consumption
* warehouse insights

Include:

* filters
* date range behavior
* stock status filtering
* movement type filtering
* response shape
* performance/read-model strategy

---

# 7. Products API

## Route scope

This module must support:

* `/clinic-admin/warehouse/products`

## Products requirements

The API must support:

* list products
* create product
* update product
* adjust stock
* mark expired
* change product status
* filters/search/sort/pagination
* products summary metrics

Fields include:

* product name
* category
* SKU
* unit
* current stock
* min stock
* purchase price
* selling price
* product type
* expiry
* status

## Required endpoints to design

At minimum design:

* list products
* get product by id
* create product
* update product
* adjust stock
* change product status
* mark expired
* get product movement history preview if useful
* products summary metrics

Include:

* DTOs
* validation rules
* stock adjustment rules
* expiry rules
* stock status derivation
* audit requirements

Explain:

* how immutable stock movement logs relate to product current stock projection
* how adjustment reasons should be captured
* how low-stock and expiry indicators should be computed

---

# 8. Suppliers API

## Route scope

These modules must support:

* `/clinic-admin/warehouse/suppliers`
* `/clinic-admin/warehouse/suppliers/:id`

## Suppliers list requirements

The API must support:

* list suppliers
* create supplier
* update supplier
* change supplier status
* link products to supplier
* filters/search/sort/pagination
* supplier summary metrics

Fields include:

* supplier name
* contact
* products count
* total orders
* recent supply date
* status

## Supplier detail requirements

The API must support:

* supplier overview
* linked products
* purchase history
* recent orders
* notes
* total supplied value

## Required endpoints to design

At minimum design:

* list suppliers
* get supplier by id
* create supplier
* update supplier
* change supplier status
* link products to supplier
* list supplier linked products
* list supplier purchase history
* list supplier recent orders
* list supplier notes
* create supplier note
* supplier summary metrics

Include:

* DTOs
* validation rules
* supplier-product link logic
* preferred supplier handling if supported
* audit requirements

---

# 9. Payments and Invoices APIs

## Route scope

These modules must support:

* `/clinic-admin/payments`
* `/clinic-admin/payments/invoices`
* `/clinic-admin/payments/invoices/create`

## Payments overview requirements

The API must provide:

* total collected
* successful payments
* failed payments
* refunded amount
* pending transactions
* average payment size
* payment volume trend
* payment methods distribution
* payment status breakdown
* recent transactions
* top payment methods/providers
* outstanding/risk signals

## Invoices list requirements

The API must support:

* list invoices
* invoice filters/search/sort/pagination
* invoice detail preview/drawer
* mark as paid
* cancel invoice
* duplicate invoice if supported
* invoice summary metrics

Invoice fields include:

* invoice number
* patient
* doctor
* date
* total
* paid
* due
* status

Statuses must include:

* paid
* unpaid
* draft
* cancelled

## Create invoice requirements

The API must support:

* create invoice draft/unpaid
* add service lines
* add product lines
* import service lines from encounter/treatment if supported
* adjustments/discounts
* auto-calculated totals
* save draft
* save unpaid
* save and collect payment flow if supported

## Required endpoints to design

At minimum design:

* payments overview summary
* payment trend
* payment method distribution
* payment status breakdown
* recent transactions
* payment insights/risk signals
* list invoices
* get invoice by id/detail
* create invoice
* update draft invoice if supported
* mark invoice as paid
* cancel invoice
* duplicate invoice if supported
* invoice summary metrics
* helper endpoint for invoice form (patients/doctors/services/products options if needed)

Include:

* DTOs
* validation rules
* invoice line structure
* payment method/provider handling
* status transition rules
* audit requirements

Explain:

* how invoice totals are calculated safely
* how payment allocation is handled
* how invoice cancellation should affect finance state
* how inventory/product sale effects are triggered if product lines are invoiced

---

# 10. Sources API

## Route scope

This module must support:

* `/clinic-admin/sources`

## Sources requirements

The API must support:

* list clinic-level source instances
* create source
* update source
* pause/activate source
* lightweight source performance review
* filters/search/sort/pagination
* summary metrics
* performance drawer data

Fields include:

* source name
* type
* linked patients
* conversions
* revenue generated
* activity trend
* status

Types include:

* app
* telegram
* instagram
* website
* referral
* walk-in / manual
* partner / campaign

## Required endpoints to design

At minimum design:

* list sources
* get source by id/performance
* create source
* update source
* change source status
* source summary metrics
* source performance trend
* top source rankings if useful

Include:

* DTOs
* validation rules
* difference between clinic source vs platform source template
* audit requirements

---

# Cross-module relationships

Explain cleanly how Clinic Admin APIs depend on lower modules such as:

* auth/access context
* clinics/branches
* patients
* doctors
* services
* rooms
* warehouse
* products
* suppliers
* encounters
* invoices/payments
* sources
* analytics projections

Make the design modular and avoid tangled dependencies.

---

# Filtering, sorting, and pagination

Define a consistent approach for all Clinic Admin list endpoints:

* search query
* filters
* page/pageSize or cursor strategy
* sorting fields
* sort direction
* response metadata

Make it concrete and frontend-friendly.

---

# Validation rules

Define practical validation expectations for:

* patient create/update
* doctor create/update
* doctor assignment
* service create/update
* room create/update
* stock adjustment
* supplier create/update
* invoice create/pay/cancel
* source create/update

Include:

* required fields
* uniqueness checks
* scope validation
* state transition validation
* safe destructive/change rules

---

# Error handling

Define Clinic Admin API error behavior for:

* invalid payload
* forbidden clinic/branch access
* missing entity
* invalid doctor/patient assignment
* invalid stock adjustment
* insufficient stock
* invalid invoice transition
* duplicate supplier/service/product identifiers where relevant
* invalid source template/type usage

Use a consistent backend error structure.

---

# Audit requirements

Specify which operations must create audit logs, including:

* patient created/updated/assigned
* doctor created/updated/status changed/services assigned
* service created/updated/linked
* room created/updated/assignments changed
* stock adjusted / product expired / status changed
* supplier created/updated/links changed
* invoice created/updated/paid/cancelled
* payment recorded/refunded if supported
* source created/updated/status changed
* branch detail changes

Explain:

* what to log
* actor identity
* affected entity
* before/after values where appropriate

---

# Testing strategy

Generate a recommended testing strategy for Clinic Admin APIs, including:

* dashboard aggregation tests
* patient list/create/update/detail tests
* doctor list/create/update/detail/analytics tests
* service and room assignment tests
* warehouse overview aggregation tests
* product stock adjustment tests
* supplier detail/history tests
* invoice create/pay/cancel tests
* payment overview tests
* source performance tests
* clinic/branch scope enforcement tests
* authorization tests
* audit log generation tests

Focus on business-critical clinic operations.

---

# Engineering best practices

Include practical recommendations for:

* DTO separation
* query optimization
* analytics read models
* immutable finance and stock events
* safe stock adjustments
* transactional boundaries for billing + inventory
* avoiding god-services
* module-level service contracts
* API documentation
* consistent naming
* background jobs for non-blocking tasks if needed

---

## Output style requirement

Generate the Clinic Admin API design as a **clear structured technical blueprint** that developers can directly use to implement the backend.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **Doctor Backend/API layer** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **backend/API blueprint** for all **Doctor** features.

This API design must be:

* scalable
* modular
* maintainable by developers globally
* secure
* tenant-aware
* doctor-scope aware
* practical for frontend integration
* suitable for medical workflow, encounter recording, and controlled inventory usage

The Doctor layer must support the doctor’s personal workspace only, not clinic-wide or platform-wide management.

---

## Scope of this prompt

Design backend/API contracts and architecture only for these Doctor modules:

1. Doctor Dashboard
2. My Patients
3. Patient Detail
4. Add Consultation / Create Encounter
5. Goods Usage
6. My Performance

Do **not** design Super Admin APIs or Clinic Admin APIs in this prompt.

---

## Doctor route context

These APIs must support frontend routes such as:

* `/doctor/dashboard`
* `/doctor/patients`
* `/doctor/patients/:id`
* `/doctor/encounters/create`
* `/doctor/goods-usage`
* `/doctor/performance`

---

## Access and scope rules

The Doctor must:

* access only their allowed clinic / branch scope
* access only their assigned or permission-allowed patients
* create and update only consultation/encounter data within doctor scope
* record goods usage only for allowed services/encounters
* not access clinic-wide admin settings or cross-clinic data

The API design must clearly enforce:

* doctor identity scope
* clinic/branch scope
* patient access rules
* encounter ownership or permission rules
* goods usage restrictions
* personal analytics scope

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Module-by-module API design**
2. **REST endpoints**
3. **Request DTOs**
4. **Response DTOs**
5. **Pagination / filtering / sorting conventions**
6. **Permissions and access rules**
7. **Service/use-case boundaries**
8. **Validation rules**
9. **Error handling approach**
10. **Audit requirements**
11. **Cross-module dependencies**
12. **Implementation notes for maintainability**

Make the output practical and implementation-oriented.

---

# Global API conventions

## API style

Use:

* REST-style endpoints
* versioned routes such as `/api/v1/...`
* consistent JSON request/response contracts
* paginated list responses where relevant
* structured filtering and sorting

## Scope conventions

Every Doctor API must be designed with:

* current authenticated doctor context
* current clinic / branch context
* explicit patient/encounter access checks
* safe rejection if entity falls outside doctor permission scope

Explain whether scope comes from:

* auth context
* doctor profile mapping
* patient assignment rules
* explicit request parameters validated against allowed scope

---

# 1. Doctor Dashboard API

## Route scope

This module must support:

* `/doctor/dashboard`

## Dashboard requirements

The API must provide doctor-personal dashboard data such as:

* today’s patients
* total patients
* new patients
* returning patients
* monthly income
* completed consultations
* recent consultations
* upcoming appointments
* personal patient trend
* income trend
* top services
* quick alerts/tasks
* mini patient summary

## Required endpoints to design

At minimum design:

* dashboard summary overview
* recent consultations
* upcoming appointments
* patient trend
* income trend
* top services
* alerts/tasks
* mini patient summary

Include:

* filter parameters
* date range behavior
* response shape
* doctor-scope enforcement
* performance approach

---

# 2. My Patients API

## Route scope

This module must support:

* `/doctor/patients`

## Patients list requirements

The API must support:

* list doctor-accessible patients
* search/filter/sort/paginate patients
* patient quick preview
* follow-up queue
* summary metrics for doctor patient list

The frontend needs fields such as:

* full name
* age
* gender
* phone
* source
* last visit
* total visits
* follow-up status
* notes indicator

## Access rule requirement

The design must clearly explain:

* which patients a doctor may see
* whether access is based on primary doctor, served-patient relationship, clinic policy, or explicit assignment
* how to prevent unauthorized patient visibility

## Required endpoints to design

At minimum design:

* list my patients
* get patient quick preview
* follow-up queue
* my patient summary metrics

Include:

* DTOs
* filtering rules
* doctor scope rules
* audit requirements for patient access if appropriate

---

# 3. Doctor Patient Detail API

## Route scope

This module must support:

* `/doctor/patients/:id`

## Patient detail requirements

The API must support doctor-oriented patient detail data such as:

* overview
* clinical notes
* visit history
* medical documents
* services record
* quick summary / alert context

This is different from the Clinic Admin patient detail because it is care-focused and doctor-workflow-focused.

## Required endpoints to design

At minimum design:

* get patient detail overview
* list clinical notes
* create clinical note
* list visit history
* list medical documents
* upload document metadata if doctor is allowed
* list services record
* get patient quick summary card data

Include:

* DTOs
* doctor-scope access checks
* note categories
* document access rules
* audit requirements for sensitive patient access

Explain:

* what patient data should be visible to doctor by default
* what should remain restricted unless explicit permission exists
* how to keep medical access safe and minimal

---

# 4. Add Consultation / Create Encounter API

## Route scope

This module must support:

* `/doctor/encounters/create`

## Encounter workflow requirements

The API must support:

* selecting patient
* creating encounter / consultation
* draft/in-progress/completed states
* adding diagnosis summary
* adding clinical notes
* adding performed services
* adding service quantities
* adding goods/products consumed during service
* follow-up flag / next-step info
* completing the encounter safely

The workflow must support:

* doctor records what happened in a visit
* doctor records performed services
* doctor records goods used during service
* result can later connect to billing and inventory

## Required endpoints to design

At minimum design:

* patient search/select for encounter
* create encounter draft
* update encounter details
* add/update encounter services
* add/update encounter goods usage rows
* complete encounter
* save draft
* encounter summary preview

Include:

* request/response DTOs
* validation rules
* encounter status transition rules
* doctor ownership/scope rules
* audit requirements

Explain:

* whether to use one large create/update endpoint or several task-specific endpoints
* how to preserve partial drafts safely
* how encounter completion should trigger downstream domain actions (billing eligibility, stock movement, analytics events) if appropriate

---

# 5. Goods Usage API

## Route scope

This module must support:

* `/doctor/goods-usage`

## Goods usage requirements

The API must support:

* recording goods/products used during service
* linking usage to patient
* linking usage to encounter
* linking usage to service
* checking stock availability
* surfacing low stock / critical stock warnings
* viewing recent goods usage records
* supporting suggested goods by service if useful

This is not the warehouse admin page.
This is a doctor operational recording page.

## Required endpoints to design

At minimum design:

* list recent goods usage records
* create goods usage record
* save draft goods usage if supported
* validate stock availability
* get suggested goods by selected service
* get frequently used goods
* get goods usage summary metrics

Include:

* DTOs
* validation rules
* stock availability rules
* insufficient stock behavior
* encounter/service linkage rules
* audit requirements

Explain:

* whether goods usage should be recorded only inside encounter workflow or also through a dedicated page
* how to prevent double-counting usage
* how inventory movement is triggered safely
* what happens if goods usage is edited after confirmation

---

# 6. My Performance API

## Route scope

This module must support:

* `/doctor/performance`

## Performance requirements

The API must support personal doctor analytics such as:

* patients served
* monthly patients
* total income by doctor
* monthly income by doctor
* total income by doctor’s patients
* average rating
* patient trend
* income trend
* service performance
* monthly patient behavior
* workload / schedule load
* personal insights

This is a personal analytics page, not a clinic comparison page.

## Required endpoints to design

At minimum design:

* performance KPI summary
* patient trend
* income trend
* service performance
* monthly patient breakdown
* workload trend
* rating summary/trend
* personal insights

Include:

* filter parameters
* date range behavior
* response shapes
* read-model/performance strategy if useful

Explain:

* difference between “income by doctor” and “income by doctor’s patients”
* how ratings are aggregated if ratings exist
* whether this should use analytical read models

---

# Cross-module relationships

Explain clearly how Doctor APIs depend on lower modules such as:

* auth/access context
* doctor profile
* patients
* encounters
* services
* products/goods
* warehouse stock availability
* notes/documents
* billing eligibility events
* analytics projections

Make the design modular and avoid tangled dependencies.

---

# Filtering, sorting, and pagination

Define a consistent approach for Doctor list-style endpoints:

* search query
* filters
* page/pageSize or cursor strategy
* sorting fields
* sort direction
* response metadata

Make it concrete and frontend-friendly.

---

# Validation rules

Define practical validation expectations for:

* patient visibility requests
* clinical note creation
* encounter creation/update/completion
* service addition to encounter
* goods usage recording
* stock availability checks
* follow-up fields
* doctor performance filters

Include:

* required fields
* scope validation
* state transition validation
* service/goods consistency rules
* safe workflow completion rules

---

# Error handling

Define Doctor API error behavior for:

* invalid payload
* forbidden patient access
* missing entity
* invalid encounter status transition
* invalid service selection
* insufficient stock
* goods usage duplication/conflict
* unauthorized document access
* invalid filter/scope use

Use a consistent backend error structure.

---

# Audit requirements

Specify which operations must create audit logs, including:

* patient detail viewed if sensitive logging is required
* clinical note created/updated
* encounter created/updated/completed
* goods usage recorded/updated
* document uploaded/accessed if appropriate
* follow-up created/updated
* service record changes

Explain:

* what to log
* actor identity
* affected patient/encounter/service/product entities
* before/after values where appropriate

---

# Testing strategy

Generate a recommended testing strategy for Doctor APIs, including:

* dashboard aggregation tests
* my patients scope tests
* patient detail authorization tests
* clinical note creation tests
* encounter draft/update/complete tests
* service addition tests
* goods usage stock validation tests
* duplicate/double-count prevention tests
* performance analytics tests
* doctor-scope enforcement tests
* audit log generation tests

Focus on business-critical doctor workflows.

---

# Engineering best practices

Include practical recommendations for:

* DTO separation
* scope enforcement in service/policy layers
* draft-safe encounter workflows
* transactional boundaries for encounter + goods usage
* immutable usage events where needed
* safe integration with billing/inventory
* avoiding god-services
* API documentation
* consistent naming
* background jobs for non-blocking downstream reactions if useful

---

## Output style requirement

Generate the Doctor API design as a **clear structured technical blueprint** that developers can directly use to implement the backend.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **cross-cutting backend/API layer** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **cross-cutting backend/API blueprint** for shared platform capabilities that are used by:

* Super Admin
* Clinic Admin
* Doctor
* future staff roles

This layer must be:

* scalable
* modular
* maintainable by developers globally
* secure
* tenant-aware
* reusable across modules
* practical for frontend integration
* suitable for medical/business operations

This prompt is about **shared infrastructure-facing APIs and reusable platform contracts**, not one business module only.

---

## Scope of this prompt

Design backend/API contracts and architecture for these shared capabilities:

1. Files / Documents
2. Audit Logs
3. Notifications
4. Global Search
5. Shared Filters / Lookup Endpoints
6. Export APIs
7. Webhooks / External Callback Handling
8. Reusable infrastructure contracts and conventions

Do **not** redesign Super Admin, Clinic Admin, or Doctor business modules here.
Instead, design the cross-cutting APIs and architectural contracts those modules will depend on.

---

## Product context

This is a **multi-tenant medical CRM / clinic management SaaS** with:

* platform-level management
* clinic and branch operations
* patient records
* doctor workflows
* billing and payments
* warehouse and supplier operations
* source/integration tracking

Because it is a medical/business system, the shared layer must support:

* secure document access
* auditability
* notification delivery
* powerful but scoped search
* export of filtered data
* safe external integrations
* reusable conventions that prevent duplication across modules

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Shared module-by-module API design**
2. **REST endpoints**
3. **Request DTOs**
4. **Response DTOs**
5. **Permissions and access rules**
6. **Tenant/branch/patient scope rules**
7. **Validation rules**
8. **Error handling approach**
9. **Audit and security requirements**
10. **Background processing recommendations**
11. **Storage/infrastructure strategy notes**
12. **Implementation notes for maintainability**

Make the output practical and implementation-oriented.

---

# Global API conventions

## API style

Use:

* REST-style endpoints
* versioned routes such as `/api/v1/...`
* consistent JSON contracts
* reusable response shapes
* shared pagination/filter/export conventions
* safe access control across all shared modules

## Access control rule

Every shared API must explicitly define:

* who can access it
* whether access is platform-wide, clinic-wide, branch-wide, doctor-scoped, or record-scoped
* whether sensitive data requires elevated access
* how scope is validated

---

# 1. Files / Documents API

## Purpose

The system must support files/documents such as:

* patient medical documents
* identity documents
* lab results
* x-rays / scans
* consent forms
* invoice PDFs
* optional doctor/supplier/branch-related files

The design must support:

* file upload flow
* file metadata storage
* secure file access
* scope-aware download/view
* future cloud storage use

---

## Design requirements

Explain the best architecture for:

* binary file storage vs metadata storage
* storage abstraction layer
* private/signed access
* file ownership and linking
* upload validation
* secure retrieval
* retention or soft-delete behavior if useful

Explain which part should live in:

* files module
* document metadata tables
* storage provider abstraction
* access policy layer

---

## Required endpoints to design

At minimum design:

* upload file metadata/initiate upload
* finalize file attachment if using two-step upload
* get file by id / metadata
* get secure download/view link
* delete/archive file if allowed
* attach file to entity
* list files by entity

Support entity linkage examples such as:

* patient
* encounter
* invoice
* supplier
* branch

Include:

* request/response DTOs
* validation rules
* mime/type limits
* role-based access rules
* audit requirements

---

## Access rules

Explain how file access should differ for:

* Super Admin
* Clinic Admin
* Doctor
* future staff roles

Especially for:

* patient medical documents
* sensitive identity files
* invoice PDFs
* supplier files

Make the rules safe and practical.

---

# 2. Audit Logs API

## Purpose

This system needs strong auditability for:

* patient access
* clinical record changes
* invoice/payment actions
* stock adjustments
* role/permission changes
* settings changes
* file access
* auth events

The audit system must support:

* secure internal event logging
* queryable audit log viewing
* filtered access by role/scope
* export if allowed

---

## Design requirements

Explain the best backend design for:

* centralized audit log writing
* actor identity capture
* tenant/branch context capture
* entity type / entity id tracking
* before/after value snapshots where appropriate
* result/status fields
* search/filter efficiency

---

## Required endpoints to design

At minimum design:

* list audit logs
* get audit log detail if needed
* export audit logs if supported

Support filters such as:

* date range
* actor/user
* module
* entity type
* clinic/branch
* result/status
* action type

Include:

* response shape
* pagination
* masking/redaction strategy
* permission rules

---

## Access rules

Explain how audit viewing differs for:

* Super Admin
* Clinic Admin
* Doctor

For example:

* Super Admin may see platform-wide audit logs
* Clinic Admin may see clinic/branch-scoped audit logs
* Doctor may not access general audit logs, but might generate them implicitly

---

# 3. Notifications API

## Purpose

The platform should support notifications for use cases such as:

* password reset / auth alerts
* invite emails/SMS
* low stock alerts
* upcoming appointment reminders
* payment or invoice reminders
* source/integration events
* follow-up reminders
* system/admin notices

The design must support:

* in-app notifications
* email notifications
* SMS or future provider notifications
* background delivery
* read/unread tracking if useful

---

## Design requirements

Explain the best architecture for:

* notification templates
* notification events
* channel abstraction
* delivery tracking
* retry logic
* user-scoped notification inbox
* notification preferences if useful for future support

---

## Required endpoints to design

At minimum design:

* list my notifications
* mark notification as read
* mark all as read
* get unread count
* optional admin send/broadcast endpoint if appropriate
* optional notification preferences endpoint if useful

Explain which endpoints are:

* end-user facing
* admin/internal
* background delivery only

Include:

* DTOs
* status fields
* delivery states
* audit requirements where relevant

---

## Access rules

Explain:

* how notifications are targeted to a user
* how tenant/branch scope influences notification generation
* how admins can send scoped notifications safely
* what should never be exposed in notification previews if sensitive

---

# 4. Global Search API

## Purpose

The frontend headers include search across pages.
The system needs a reusable search API for quickly finding:

* patients
* doctors
* clinics
* branches
* suppliers
* products
* invoices
* maybe services

The search must be:

* fast
* scope-aware
* permission-aware
* suitable for search bars and quick selectors

---

## Design requirements

Explain the best design for:

* unified search endpoint vs per-entity search endpoints
* lightweight search result contracts
* minimum fields returned for global search
* role-aware result filtering
* search ranking relevance
* performance optimization

---

## Required endpoints to design

At minimum design:

* global search
* entity-specific lightweight selector endpoints if needed

Support examples such as:

* patient search for encounter creation
* doctor selector for patient assignment
* service selector for invoice or encounter creation
* product selector for warehouse and goods usage
* supplier selector

Include:

* query parameters
* result grouping strategy
* result item shape
* scope filtering
* pagination/limit strategy

---

## Access rules

Explain how search differs for:

* Super Admin
* Clinic Admin
* Doctor

For example:

* Super Admin can search platform-wide
* Clinic Admin only within allowed clinic/branch scope
* Doctor only within allowed care and operational scope

---

# 5. Shared Filters / Lookup Endpoints

## Purpose

Many frontend pages need reusable lookup/filter data such as:

* statuses
* role options
* doctor selectors
* patient selectors
* service selectors
* payment method lists
* source type lists
* category lists
* branch/clinic options
* room type lists

The backend should provide clean shared lookup APIs to avoid duplicating logic in every module.

---

## Design requirements

Explain the best approach for:

* centralized lookup endpoints
* static enums vs database-driven lookups
* scope-aware lookup lists
* frontend-ready option contracts

---

## Required endpoints to design

At minimum design:

* general lookup catalog endpoint or grouped lookups endpoint
* scoped selectors for:

  * doctors
  * patients
  * services
  * products
  * suppliers
  * clinics
  * branches
  * rooms
* enum/config endpoints for:

  * statuses
  * roles
  * source types
  * payment methods
  * product types
  * room types

Include:

* response shapes
* caching strategy if useful
* validation of scope

---

# 6. Export APIs

## Purpose

Many pages need export support, such as:

* clinics list
* branches list
* users list
* patients list
* doctors list
* invoices
* audit logs
* sources performance
* warehouse low-stock items

The export layer must support:

* filtered exports
* permission-aware exports
* secure downloadable results
* potentially asynchronous generation for large datasets

---

## Design requirements

Explain the best design for:

* synchronous small export vs async export jobs
* reusable export request contract
* export file storage and expiry
* CSV/XLSX/PDF strategy where relevant
* permission-aware export generation

---

## Required endpoints to design

At minimum design:

* create export job
* get export job status
* get export download link/result
* optional list my export jobs

Include:

* request DTO shape
* export target/module identification
* filters snapshot
* output format
* result metadata

Explain:

* when async export is preferred
* how to prevent export abuse
* how to secure generated export files

---

# 7. Webhooks / External Callback Handling API

## Purpose

The system must support external callbacks/integrations such as:

* payment gateway callbacks
* possible messaging provider callbacks
* future app/source integrations
* partner system event pushes

The webhook layer must be:

* secure
* idempotent
* observable
* easy to extend

---

## Design requirements

Explain the best design for:

* dedicated webhook module
* signature verification
* idempotency keys
* event persistence
* retry-safe processing
* background job processing
* operational observability

---

## Required endpoints to design

At minimum design:

* payment provider callback endpoint(s)
* generic webhook event persistence contract if appropriate
* webhook delivery processing/replay support internally if useful

Include:

* request validation rules
* signature validation logic
* idempotency behavior
* duplicate event protection
* error handling behavior
* logging and audit strategy

---

## Payment webhook specifics

Because this platform has payments/invoices, explain how payment callbacks should safely trigger:

* payment status update
* invoice payment allocation
* audit log entry
* notification event
* duplicate callback protection

This is critical.

---

# 8. Reusable infrastructure contracts and conventions

## Purpose

Define reusable infrastructure-facing contracts so business modules do not invent inconsistent patterns.

The design should explain shared contracts for:

* pagination
* sorting
* filtering
* search results
* audit event shape
* file metadata shape
* export job shape
* notification payload shape
* webhook event shape
* error response shape

This should help make the platform implementation consistent.

---

## Required output for shared contracts

Define recommended reusable DTO/model conventions for:

### Pagination

* page
* pageSize
* total
* hasNext / hasPrevious
* sortBy
* sortDirection

### Filtering

* common filter object shape
* date range handling
* multi-select handling
* status filtering
* search query handling

### Errors

* machine-readable error codes
* human-readable message
* field errors
* trace/request id if useful

### Audit event shape

* actor
* action
* entity type/id
* scope
* before/after values
* result
* timestamp

### Notification shape

* title
* message
* type
* severity
* read/unread
* createdAt
* action link if useful

### File metadata shape

* file id
* file name
* mime type
* size
* linked entity
* uploaded by
* access level
* createdAt

### Export job shape

* job id
* module
* format
* status
* requested by
* createdAt
* completedAt
* download url if ready

### Webhook event shape

* provider
* external event id
* receivedAt
* processed status
* error info
* payload reference

---

# Security and access rules

Because this is a medical platform, explain safe practices for:

* document access
* audit log visibility
* export restrictions
* scoped search
* safe notification content
* webhook verification
* signed/private download links
* avoiding data leakage in global/shared endpoints

---

# Validation rules

Define practical validation expectations for:

* file upload metadata
* export request
* notification input if admin-generated
* search query limits
* selector query limits
* webhook signature validation
* audit log filter validation

---

# Error handling

Define shared API error behavior for:

* invalid file upload metadata
* forbidden document access
* invalid export request
* export job expired/not ready
* webhook signature invalid
* duplicate webhook event
* invalid search parameters
* forbidden audit log access

Use a consistent backend error structure.

---

# Audit requirements

Specify which cross-cutting operations themselves must be audited, including:

* file uploaded/downloaded/deleted if relevant
* export generated/downloaded
* webhook processed
* admin notification sent
* audit logs accessed/exported
* sensitive search usage if relevant
* document access events

Explain:

* what to log
* actor identity
* affected target/entity
* whether payloads should be masked or redacted

---

# Testing strategy

Generate a recommended testing strategy for these cross-cutting APIs, including:

* file upload and secure access tests
* document permission tests
* audit log filter and scope tests
* notification delivery/inbox tests
* global search scope tests
* shared selector endpoint tests
* export job lifecycle tests
* webhook signature/idempotency tests
* duplicate callback protection tests
* error contract consistency tests

Focus on platform-critical shared infrastructure behavior.

---

# Engineering best practices

Include practical recommendations for:

* storage abstraction
* background job usage
* signed file access
* secure export handling
* generic search result design
* consistent DTO reuse
* internal event contracts
* masking/redaction strategy
* observability for exports and webhooks
* avoiding cross-module duplication

---

## Output style requirement

Generate the cross-cutting API design as a **clear structured technical blueprint** that developers can directly use to implement the backend.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **shared validation and error contract standards** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **platform-wide API contract standard** for:

* validation
* request DTO rules
* response DTO rules
* pagination
* filtering
* sorting
* status enums
* success response shapes
* error response shapes
* consistency rules across all modules

This contract must be:

* scalable
* maintainable by developers globally
* easy for frontend teams to integrate with
* safe for medical/business data
* consistent across Super Admin, Clinic Admin, Doctor, Auth, and shared infrastructure modules

---

## Scope of this prompt

Design shared standards only.

This prompt must define the common API contract rules used by:

* Auth APIs
* Super Admin APIs
* Clinic Admin APIs
* Doctor APIs
* Shared infrastructure APIs

Do **not** redesign each business module in detail here.
Instead, define the reusable standards every module must follow.

---

## Product context

This is a **multi-tenant medical CRM / clinic management SaaS** with:

* platform management
* clinic and branch operations
* patient records
* doctor workflows
* encounters
* invoices/payments
* warehouse/products/suppliers
* sources
* documents
* audit logs
* notifications
* exports
* integrations

Because it is a medical/business platform, API consistency matters a lot for:

* safety
* frontend predictability
* permission-aware errors
* structured validation
* auditability
* maintainability

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Request DTO standards**
2. **Response DTO standards**
3. **List response conventions**
4. **Pagination contract**
5. **Filtering contract**
6. **Sorting contract**
7. **Search contract**
8. **Status enum conventions**
9. **Date/time/value formatting conventions**
10. **Success response shapes**
11. **Error response shapes**
12. **Validation error format**
13. **Permission/forbidden error format**
14. **Domain/business-rule error format**
15. **Not found/conflict/state-transition error format**
16. **Consistency rules across modules**
17. **Frontend integration recommendations**
18. **Engineering best practices for implementation**

Make the output practical and implementation-oriented.

---

# 1. Request DTO standards

## Goal

Define how request DTOs should be designed across the whole backend.

The design must explain:

* naming rules
* structure rules
* when to split create/update/filter DTOs
* how to avoid leaking domain entities into API contracts
* how to support validation cleanly

## Required output

Define standards for DTO categories such as:

* create request DTO
* update request DTO
* detail query DTO if needed
* list/filter request DTO
* action-specific DTO
* bulk-action DTO if useful

## Rules to define

Explain clearly:

* request DTOs must be explicit
* do not reuse database entity models as API payloads
* separate list filters from create/update DTOs
* action-specific DTOs should be used for things like:

  * assign doctor
  * change status
  * mark as paid
  * adjust stock
  * reset password
* nested payload rules
* optional vs required fields
* patch vs put style recommendation

---

# 2. Response DTO standards

## Goal

Define how response DTOs should be structured consistently.

The design must explain:

* list item DTOs
* detail DTOs
* summary DTOs
* analytics DTOs
* action result DTOs
* lookup/select-option DTOs

## Rules to define

Explain clearly:

* never return raw database entities directly
* use stable frontend-friendly field names
* keep list responses lightweight
* keep detail responses richer
* use summary objects for dashboard cards
* use dedicated DTOs for analytics/aggregates
* avoid mixing unrelated concerns in one DTO

---

# 3. List response conventions

## Goal

All list endpoints across the platform must feel identical to frontend developers.

This applies to:

* clinics
* branches
* users
* patients
* doctors
* services
* products
* suppliers
* invoices
* sources
* notifications
* audit logs
* files
* exports

## Required output

Define a standard list response shape with:

* items
* pagination metadata
* applied filters if useful
* sorting metadata if useful

Explain:

* what fields every list response should always contain
* what can vary by module
* whether `items` should always be an array
* how empty responses should look

---

# 4. Pagination contract

## Goal

Define one reusable pagination contract for all paginated endpoints.

## Required output

Design a standard pagination request/response model.

### Request side

Support fields like:

* page
* pageSize

Or explain if cursor pagination should be used for some endpoints.

### Response side

Support fields like:

* page
* pageSize
* total
* totalPages
* hasNext
* hasPrevious

Explain:

* standard defaults
* page size limits
* when cursor pagination might be better
* whether audit logs/notifications/exports need special pagination rules

Make it concrete and frontend-friendly.

---

# 5. Filtering contract

## Goal

Define one reusable filtering contract across modules.

This applies to endpoints with filters such as:

* status
* date range
* branch/clinic
* doctor
* source
* service
* product category
* invoice state
* payment state
* stock state

## Required output

Define how filters should be passed:

* query params
* structured object
* repeated params for multi-select
* range filters
* date filters
* enum filters
* search filters

Explain:

* how multi-select filters should work
* how date range filters should work
* how empty filters should behave
* how invalid filters should be rejected

---

# 6. Sorting contract

## Goal

Define a consistent sorting standard across all list endpoints.

## Required output

Define:

* sort field parameter
* sort direction parameter
* multi-sort support if needed
* allowed sortable field validation

Explain:

* how sorting errors should be handled
* whether modules should advertise allowed sorts
* how default sort should be chosen for each module category

---

# 7. Search contract

## Goal

Define a consistent search standard across all searchable endpoints.

Search applies to:

* clinics
* branches
* users
* patients
* doctors
* products
* suppliers
* invoices
* sources
* audit logs
* notifications
* global search

## Required output

Define:

* search param naming
* search scope behavior
* minimum length rules if useful
* search sanitization
* fuzzy vs exact behavior recommendation
* selector/search endpoint consistency

Explain:

* how search combines with pagination/filter/sort
* how empty search behaves
* how to limit search abuse

---

# 8. Status enum conventions

## Goal

Many modules have statuses:

* clinic status
* branch status
* user status
* patient status
* doctor status
* service status
* room status
* stock status
* invoice status
* payment status
* source status
* export job status
* webhook processing status

These must be predictable and consistent.

## Required output

Define conventions for:

* enum naming style
* whether statuses should be uppercase constants internally and normalized strings in API
* how to document allowed statuses
* whether labels should be returned separately for UI convenience

Explain:

* how to prevent inconsistent status naming across modules
* how transition validation should be handled
* how statuses differ from derived health indicators

---

# 9. Date/time/value formatting conventions

## Goal

Define consistent formatting rules for:

* timestamps
* dates
* money values
* quantities
* percentages
* durations
* IDs

## Required output

Explain:

* timestamp format standard
* timezone handling
* whether APIs should always return UTC timestamps
* date-only field handling
* money representation strategy
* quantity precision strategy
* ID exposure conventions
* nullable field conventions

This is especially important for:

* invoices/payments
* warehouse/product quantities
* analytics charts
* audit logs
* patient/encounter history

---

# 10. Success response shapes

## Goal

Define when endpoints should return:

* plain object
* wrapped success envelope
* message + data
* 204 No Content
* action result object

## Required output

Define a consistent success response pattern for:

* list endpoints
* detail endpoints
* create endpoints
* update endpoints
* delete/archive endpoints
* status change endpoints
* action endpoints
* analytics endpoints

Explain:

* whether to use a top-level `success` field
* whether to always include `data`
* when to include `message`
* how to keep success responses minimal but clear

---

# 11. Error response shapes

## Goal

All frontend teams should receive predictable errors across the platform.

Define one clean error structure that supports:

* validation issues
* authorization failures
* business-rule failures
* state transition failures
* not found cases
* conflict cases
* external integration failures
* unexpected server errors

## Required output

Design a standard error response object with fields such as:

* code
* message
* details
* fieldErrors
* traceId / requestId if useful
* status

Explain:

* which fields are always present
* which are optional
* how much detail should be exposed safely
* how to avoid leaking sensitive information

---

# 12. Validation error format

## Goal

Frontend forms across auth/admin/doctor pages must be able to render validation errors consistently.

Examples:

* login
* forgot/reset password
* patient create/edit
* doctor create/edit
* service create/edit
* stock adjustment
* invoice creation
* payment action
* source creation

## Required output

Define:

* field-level validation error shape
* non-field / global validation error shape
* multiple-error handling
* nested field error handling if needed

Explain:

* how frontend can map field errors reliably
* how server should normalize validation library output into one consistent contract

---

# 13. Permission and forbidden error format

## Goal

Access errors must be clear, safe, and scope-aware.

Examples:

* doctor tries to access unauthorized patient
* clinic admin tries to access another clinic’s data
* user without permission tries to update settings

## Required output

Define how forbidden errors should be returned for:

* missing permission
* out-of-scope entity
* inactive/suspended account
* blocked role action

Explain:

* what message should be shown
* what internal detail should be hidden
* whether to differentiate 401 vs 403 clearly
* when to use 404 instead of 403 for safe concealment

---

# 14. Domain/business-rule error format

## Goal

Not all failures are validation errors.
Many are domain rule errors, such as:

* insufficient stock
* invoice cannot be marked paid twice
* invalid doctor assignment
* room/service incompatibility
* invalid status transition
* duplicate supplier link
* expired reset token
* duplicate webhook event

## Required output

Define:

* machine-readable business error codes
* user-friendly message shape
* optional structured details
* retryability hints if useful

Explain:

* how business-rule errors differ from validation errors
* how frontend can handle them consistently

---

# 15. Not found / conflict / state-transition error format

## Goal

Define consistent handling for:

* entity not found
* duplicate entity
* optimistic locking or stale update if used
* invalid state transitions
* already processed requests

## Required output

Define standard codes and response patterns for:

* not found
* conflict
* already exists
* invalid transition
* already completed/cancelled/processed

Make this concrete and easy for developers to apply.

---

# 16. API consistency rules across modules

## Goal

Prevent every module from inventing its own style.

## Required output

Define hard consistency rules such as:

* route naming style
* DTO naming style
* field naming style
* enum naming style
* response naming style
* pagination/filter/sort consistency
* timestamp consistency
* error code naming style

Explain:

* what must be globally standardized
* what can vary per module

---

# 17. Frontend integration recommendations

## Goal

Make the API easy for frontend teams to use across:

* Super Admin pages
* Clinic Admin pages
* Doctor pages
* Auth pages

## Required output

Explain best practices for frontend/backend contract compatibility such as:

* stable field names
* predictable null handling
* selector/lookup result consistency
* status badge friendliness
* chart/analytics response design
* form error mapping
* optimistic UI suitability where safe

Make it implementation-friendly.

---

# 18. Engineering best practices

## Goal

Define practical implementation guidance for developers.

## Required output

Include recommendations for:

* DTO validation library usage
* response mappers/serializers
* enum centralization
* shared pagination/filter helpers
* reusable error factory/exception mapping
* API documentation consistency
* versioning compatibility
* backward compatibility planning
* request/response contract tests

---

# Extra design requirements

Because this is a medical/business platform, the standard should also consider:

* safe nullability handling for medical data
* precision for money and quantities
* auditability of business/state-change errors
* clear separation between user-safe messages and developer/internal error detail

---

## Output style requirement

Generate the validation and error contract design as a **clear structured technical blueprint** that developers can directly use to standardize the backend.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **permissions matrix and access-control blueprint** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **authorization blueprint** that defines exactly **who can do what** across the entire platform.

This permissions design must be:

* clear
* scalable
* maintainable by developers globally
* tenant-aware
* branch-aware
* safe for medical/business data
* practical to implement in backend and frontend
* suitable for role-based access plus permission-based refinement

The output must help developers and product teams avoid ambiguity.

---

## Product role context

The platform supports these roles at minimum:

* Platform Super Admin
* Clinic Admin
* Branch Admin
* Doctor
* Receptionist
* Cashier
* Nurse
* Warehouse Manager

The permissions design must support:

* role-based access control
* permission bundles
* record-level access rules
* clinic scope
* branch scope
* doctor-specific scope
* future extensibility for custom permission overrides if needed

---

## Product scope context

The platform includes these main areas:

### Authentication

* login
* forgot password
* reset password
* session/profile

### Super Admin modules

* dashboard
* clinics
* branches
* users
* analytics
* settings

### Clinic Admin modules

* dashboard
* branch details
* patients
* doctors
* doctor analytics
* services
* rooms
* warehouse
* products
* suppliers
* payments
* invoices
* sources

### Doctor modules

* dashboard
* my patients
* patient detail
* create encounter / consultation
* goods usage
* my performance

### Shared/cross-cutting modules

* files / documents
* audit logs
* notifications
* exports
* search / lookup
* integrations / webhooks
* settings / permission management

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Role definitions**
2. **Permission naming strategy**
3. **Module-by-module permission catalog**
4. **Exact permissions matrix by role**
5. **Clinic scope rules**
6. **Branch scope rules**
7. **Doctor/patient record-level rules**
8. **Sensitive data access rules**
9. **File/document access rules**
10. **Audit log access rules**
11. **Export permissions**
12. **Status-change / destructive action permissions**
13. **Protected operations**
14. **Default permission bundle recommendations**
15. **Backend enforcement strategy**
16. **Frontend usage strategy**
17. **Testing strategy**
18. **Engineering best practices**

Make the output precise and implementation-oriented.

---

# 1. Role definitions

## Goal

Define each role clearly in business terms.

Generate precise definitions for:

* Platform Super Admin
* Clinic Admin
* Branch Admin
* Doctor
* Receptionist
* Cashier
* Nurse
* Warehouse Manager

For each role, explain:

* what scope they operate in
* what they are responsible for
* what they should never be able to do by default
* what typical modules they use most

---

# 2. Permission naming strategy

## Goal

Define a clean, scalable permission naming convention.

Use a consistent pattern such as:

* `module.action`
* `module.submodule.action`
* `module.action.scope` only if really needed

Examples:

* `patients.read`
* `patients.create`
* `patients.update`
* `patients.assign_doctor`
* `doctors.read`
* `invoices.mark_paid`
* `warehouse.adjust_stock`
* `settings.update_permissions`

The output must define:

* naming rules
* singular vs plural rule
* action verb consistency
* when to create special action permissions
* how to avoid permission explosion

---

# 3. Module-by-module permission catalog

## Goal

Create the full permission catalog across the system.

Generate a structured permission list for modules such as:

* auth
* profile/session
* clinics
* branches
* users
* roles
* permissions
* patients
* patient_documents
* patient_notes
* doctors
* doctor_analytics
* services
* rooms
* encounters
* goods_usage
* warehouse
* products
* suppliers
* payments
* invoices
* sources
* analytics
* files
* audit_logs
* notifications
* exports
* integrations
* branding
* settings

For each module, define relevant actions such as:

* read
* create
* update
* delete/archive
* assign
* export
* approve
* cancel
* mark_paid
* adjust_stock
* upload_document
* view_sensitive
* configure
* manage_permissions

Do not stay generic — make it specific to this medical CRM.

---

# 4. Exact permissions matrix by role

## Goal

Generate a **clear role-to-permission matrix**.

For each role:

* Platform Super Admin
* Clinic Admin
* Branch Admin
* Doctor
* Receptionist
* Cashier
* Nurse
* Warehouse Manager

Define exactly:

* allowed modules
* allowed actions
* disallowed actions
* special restrictions
* scope limitations

The output should be detailed enough that backend developers could translate it into seed data or a policy table.

---

# 5. Clinic scope rules

## Goal

Define how clinic-level access works.

Explain:

* which roles are clinic-scoped
* whether a role can belong to one clinic or multiple clinics
* how clinic admins differ from branch admins
* how clinic scope affects:

  * patients
  * doctors
  * warehouse
  * invoices/payments
  * analytics
  * sources

Define the permission behavior when a clinic-scoped user tries to access another clinic’s data.

---

# 6. Branch scope rules

## Goal

Define how branch-level access works.

Explain:

* branch admin scope
* doctor scope relative to branch
* future support for users attached to multiple branches
* branch filtering behavior
* branch-limited access to:

  * patients
  * doctors
  * rooms
  * warehouse
  * suppliers
  * invoices/payments
  * analytics

The blueprint must clearly state which roles are:

* platform-wide
* clinic-wide
* branch-wide
* personally scoped

---

# 7. Doctor and patient record-level rules

## Goal

This system has sensitive doctor-patient access constraints.

Define exact rules such as:

* doctor can see assigned/access-allowed patients only
* doctor can create encounters only for allowed patients
* doctor can add notes only within their care scope
* doctor can upload/view patient documents only if allowed
* doctor cannot browse unrelated clinic patients by default
* clinic admin can manage clinic patients within scope
* receptionist may register/manage patient intake but not see all sensitive clinical data if restricted
* nurse may view/update only relevant care-support records if allowed

Explain how record-level access should be enforced on:

* patient profile
* patient documents
* notes
* encounter history
* services record
* billing visibility
* goods usage linked to patient care

---

# 8. Sensitive data access rules

## Goal

Define permissions for sensitive medical/business information.

Sensitive examples:

* patient medical documents
* clinical notes
* diagnosis summaries
* financial/payment data
* audit logs
* settings/permission controls
* auth/security actions

Create clear rules for:

* who can read sensitive patient fields
* who can edit them
* who can export them
* who can never see them by default

This section should differentiate:

* ordinary operational data
* sensitive medical data
* highly privileged admin/security data

---

# 9. File and document access rules

## Goal

Define who can:

* upload files
* view files
* download files
* delete/archive files

File examples:

* patient medical docs
* identity docs
* lab results
* x-rays/scans
* consent forms
* supplier files
* invoice PDFs
* branding assets

Explain exact access by role and by file type.
This must be practical, not vague.

---

# 10. Audit log access rules

## Goal

Define who can:

* generate audit events implicitly
* view audit logs
* filter audit logs
* export audit logs

Rules should distinguish:

* Platform Super Admin
* Clinic Admin
* Branch Admin
* Doctor
* other staff roles

Explain:

* which roles can see platform-wide audit logs
* which can see only clinic-scoped logs
* which should not access logs at all
* whether patient-sensitive access should be specially logged

---

# 11. Export permissions

## Goal

Exports are risky and must be permission-controlled.

Define who can export:

* clinics
* branches
* users
* patients
* doctors
* invoices
* payments
* audit logs
* sources analytics
* warehouse reports

Explain:

* who can export each entity
* whether sensitive exports require stronger permissions
* whether doctor should export anything
* whether audit log export is Super Admin only
* whether patient-sensitive exports should be restricted

---

# 12. Status-change and destructive action permissions

## Goal

Define who can perform sensitive state changes such as:

* activate/deactivate clinic
* activate/deactivate branch
* suspend/reactivate user
* cancel invoice
* mark invoice as paid
* adjust stock
* mark product expired
* change source status
* change doctor/patient assignments
* update permissions
* change integration settings

For each action type, clearly assign allowed roles and scope restrictions.

Also define:

* which actions need approval or stronger permission
* which actions require audit logging
* which destructive operations should never be available to certain roles

---

# 13. Protected operations

## Goal

Some actions are so sensitive they should be specially protected.

Examples:

* role/permission changes
* branding/settings changes
* integration config changes
* payment provider config changes
* audit export
* clinic/branch status changes
* stock correction
* invoice cancellation
* force password reset or account disable
* access to sensitive patient documents

Define:

* protected operations list
* minimum role required
* extra permission required
* audit requirement
* optional step-up confirmation ideas if useful

---

# 14. Default permission bundle recommendations

## Goal

Recommend default permission bundles for each role.

For each role, provide a practical default permission bundle that a developer/product manager could seed into the system.

The bundle should be:

* realistic
* minimal but usable
* safe by default

Explain how bundles differ from:

* individual permission overrides
* future custom tenant-level role configs

---

# 15. Backend enforcement strategy

## Goal

Explain how this permissions matrix should be enforced in backend architecture.

Cover:

* middleware / guards
* policy layer
* module-level permission checks
* record-level access checks
* scope-aware repository/query filters
* controller vs service enforcement
* token/session permission context
* protected operation handlers

This section must explain:

* where simple permission checks happen
* where scope checks happen
* where record-level checks happen
* how to prevent bypassing permission checks accidentally

---

# 16. Frontend usage strategy

## Goal

Explain how frontend apps should use the permissions model safely.

Cover:

* menu rendering based on permissions
* button/action visibility rules
* route guards
* role labels vs real permissions
* hiding UI vs backend enforcement
* read-only vs editable states
* safe fallback behavior if permissions change mid-session

Make it useful for:

* Super Admin frontend
* Clinic Admin frontend
* Doctor frontend

---

# 17. Testing strategy

## Goal

Generate a recommended testing strategy for permissions and access control.

Include tests for:

* role-permission mappings
* clinic-scope enforcement
* branch-scope enforcement
* doctor patient access enforcement
* forbidden sensitive field access
* file/document restrictions
* export restrictions
* audit log restrictions
* destructive action restrictions
* protected settings/integration access

Focus on real business-critical access scenarios, not just generic unit tests.

---

# 18. Engineering best practices

## Goal

Provide implementation guidance for teams.

Include recommendations for:

* seeding permissions
* avoiding hardcoded role checks everywhere
* centralizing permission constants
* documenting permission catalog
* avoiding permission duplication
* designing for future custom roles
* migration strategy when permissions evolve
* auditability of permission changes
* backward compatibility when adding new permissions

---

# Extra requirement: output format quality

The final result must be explicit enough that developers can turn it into:

* seed data
* policy classes
* permission enums/constants
* frontend access maps
* test cases

Do not keep it high level only.
Do not say “depends on business needs” without resolving it.
Make grounded recommendations for this exact product.

---

## Output style requirement

Generate the permissions matrix and access-control design as a **clear structured technical blueprint** that developers can directly use to implement authorization.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **overall database-to-API mapping foundation** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **mapping blueprint** that explains how:

* database entities
* business modules
* API endpoints
* DTOs
* frontend pages

should connect cleanly without creating confusion, duplication, or overly coupled architecture.

This blueprint must help developers understand:

* which database tables/entities are the source of truth
* which API endpoints expose which data
* which DTOs should be list/detail/summary/write models
* when to use read models or aggregated projections
* how frontend pages should consume data safely and efficiently

---

## Product context

This is a **multi-tenant medical CRM / clinic management SaaS** with these major scopes:

### Super Admin

* dashboard
* clinics
* branches
* users
* analytics
* settings

### Clinic Admin

* dashboard
* branch details
* patients
* patient detail
* doctors
* doctor detail
* doctor analytics
* services
* rooms
* warehouse
* products
* suppliers
* supplier detail
* payments
* invoices
* create invoice
* sources

### Doctor

* dashboard
* my patients
* patient detail
* create encounter
* goods usage
* my performance

### Shared

* auth
* files/documents
* audit logs
* notifications
* search/lookups
* exports
* integrations/webhooks

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Source-of-truth entity strategy**
2. **Entity-to-module ownership mapping**
3. **Database entity vs API DTO separation**
4. **Read model vs write model strategy**
5. **List/detail/summary/analytics DTO mapping**
6. **Page-to-endpoint consumption principles**
7. **How one entity can appear differently on different pages**
8. **Cross-module relationship rules**
9. **ID/reference strategy**
10. **Aggregation/projection strategy**
11. **Event-driven or derived data guidance**
12. **Performance and query-boundary rules**
13. **How to avoid leaking DB schema directly into frontend**
14. **Practical frontend consumption recommendations**
15. **Engineering best practices**

Make the output practical and implementation-oriented.

---

# 1. Source-of-truth entity strategy

## Goal

Explain how the backend should decide:

* which database entity is the source of truth
* which API data is derived
* which frontend values are computed projections

The system includes entities such as:

* organization / clinic
* branch
* user
* staff profile
* doctor profile
* patient
* patient-doctor assignment
* service
* room
* encounter
* encounter service
* encounter goods usage
* invoice
* invoice item
* payment
* product
* stock movement
* supplier
* source
* audit log
* file/document

### Required output

Define the rule set for:

* primary source-of-truth entities
* derived summary values
* projected analytics values
* when totals should be stored vs computed vs cached

Examples to address:

* patient total income
* monthly patient income
* doctor total income
* service usage count
* room compatibility summary
* branch doctor count
* clinic patient count
* stock current quantity
* low-stock indicator
* invoice paid amount
* payment summaries

---

# 2. Entity-to-module ownership mapping

## Goal

Define which backend module owns which entity and which modules may read it secondarily.

Example ownership areas:

* auth owns user credentials/session data
* organizations owns clinic/group
* branches owns branch
* patients owns patient and assignment context
* doctors owns doctor profile context
* encounters owns consultation records
* billing owns invoices/payments
* warehouse owns stock/product/supplier movement logic
* sources owns acquisition source data
* files owns file metadata
* audit owns audit records

### Required output

Generate a clear ownership map showing:

* module owner
* primary entity ownership
* allowed dependent readers
* which modules must not mutate another module’s data directly

This should help avoid tangled logic like:

* invoices updating patients directly
* warehouse updating service definitions directly
* doctors module mutating branch settings directly

---

# 3. Database entity vs API DTO separation

## Goal

Define how database models must be separated from API contracts.

The answer must explain:

* entities are not API contracts
* frontend pages should not receive raw relational schema shapes
* write DTOs must be purpose-specific
* read DTOs must be tailored to page needs

### Required output

Explain the correct separation for:

* entities
* domain models if used
* repositories
* read projections
* create/update DTOs
* list DTOs
* detail DTOs
* analytics DTOs

Also define anti-patterns to avoid, such as:

* returning full patient entity everywhere
* embedding deep nested relational trees without need
* reusing create DTO as detail DTO
* exposing internal enum storage format without normalization

---

# 4. Read model vs write model strategy

## Goal

Many pages need different data shapes than the DB write model.

Define when to use:

* direct entity-backed reads
* lightweight read DTOs
* projection tables
* materialized views
* analytics read models

### Required output

Explain this strategy for categories such as:

* CRUD detail pages
* paginated list pages
* dashboard pages
* analytics pages
* lookup/select endpoints
* export data

Examples:

* patient create/update uses write DTO
* patient list uses list projection
* patient detail uses composed detail DTO
* doctor analytics uses aggregated read model
* warehouse overview uses summary projection

Make it clear when not to query raw transactional tables directly.

---

# 5. List/detail/summary/analytics DTO mapping

## Goal

Define a reusable mental model for page DTOs.

### Required output

Explain how every important entity should typically have:

* list item DTO
* detail DTO
* summary DTO
* selector option DTO
* analytics DTO if relevant
* create DTO
* update DTO
* action-specific DTO

Use examples for:

* clinics
* branches
* users
* patients
* doctors
* services
* rooms
* products
* suppliers
* invoices
* payments
* sources

Also explain:

* why list DTOs must stay small
* why detail DTOs can be composed
* why dashboard/analytics DTOs should be separate from CRUD DTOs

---

# 6. Page-to-endpoint consumption principles

## Goal

Define how frontend pages should consume backend data cleanly.

Pages should not:

* call too many tiny endpoints when one composed endpoint is better
* fetch massive detail trees when only a list is needed
* rely on hidden DB assumptions

### Required output

Explain principles such as:

* one main page = one main data contract + supporting lookups
* dashboards use summary endpoints, not many table endpoints
* forms use selector/lookup endpoints plus write DTOs
* detail pages use one composed detail endpoint plus tabbed subresources if needed
* analytics pages use dedicated aggregate endpoints
* modal actions use focused action endpoints

Also define when:

* one page should use one aggregated endpoint
* one page should use multiple specialized endpoints
* lazy loading/tab loading is better

---

# 7. How one entity can appear differently on different pages

## Goal

One database entity may appear in several frontend contexts with different shapes.

Examples:

* patient on patient list
* patient on patient detail
* patient on doctor patient preview
* patient on invoice form selector
* patient inside dashboard metrics

### Required output

Explain how to model these differences correctly without duplication chaos.

Use examples such as:

* patient
* doctor
* service
* product
* supplier
* invoice

Show that the same entity can map to:

* compact selector DTO
* list row DTO
* detail DTO
* analytics metric DTO
* export row DTO

This is critical for avoiding poor API design.

---

# 8. Cross-module relationship rules

## Goal

Define safe mapping rules when one page requires data from multiple modules.

Examples:

* patient detail needs patients + billing + documents + notes + encounters
* doctor profile needs doctors + patients + services + analytics
* create invoice needs patients + doctors + services + products + pricing + encounter linkage
* warehouse overview needs products + stock movements + suppliers + analytics
* doctor encounter creation needs patients + services + goods + stock availability

### Required output

Explain:

* when to compose data at service layer
* when to query read models
* when one module should call another module contract
* when to use orchestration layer
* how to avoid circular dependencies

---

# 9. ID and reference strategy

## Goal

Define how entities should be referenced through APIs.

### Required output

Explain:

* UUID vs numeric ID guidance
* stable public IDs
* foreign key exposure rules
* selector DTO shapes
* nested vs flat references
* when to return both `id` and `displayName`
* when to return summary reference objects

Examples:

* patient reference in invoice list
* doctor reference in encounter
* supplier reference in product detail
* branch reference in user assignment
* service reference in room mapping

Make it frontend-friendly and consistent.

---

# 10. Aggregation and projection strategy

## Goal

Many values shown in the UI are not direct table columns.

Examples:

* total patients
* monthly income
* total visits
* services count
* branch operational summary
* invoice status breakdown
* source revenue
* top spent goods
* recent activity feed

### Required output

Explain how to handle:

* live aggregation
* cached aggregation
* daily summary tables
* event-based projection updates
* materialized views if useful

Define rules for:

* what can be computed on demand
* what should be pre-aggregated
* what should be denormalized carefully
* what should never be manually edited because it is derived

---

# 11. Event-driven or derived data guidance

## Goal

Some cross-module data should update from events rather than direct table mutation.

Examples:

* invoice created updates analytics projections
* payment recorded updates invoice paid amount projection
* encounter completed updates doctor metrics
* goods usage recorded updates stock movement and low-stock indicators
* patient created from source updates source metrics
* document uploaded creates audit trail

### Required output

Explain:

* which flows are best handled synchronously
* which flows are good candidates for events/background jobs
* which derived values should come from event-updated projections
* how to avoid duplicate derived updates

Keep it practical, not microservice-heavy.

---

# 12. Performance and query-boundary rules

## Goal

Define practical rules so teams do not build slow APIs.

### Required output

Explain best practices such as:

* list pages should use projected queries
* detail pages can compose a few bounded joins/subqueries
* dashboards should not do many uncached COUNTs over huge raw tables every request
* analytics should prefer dedicated read models
* lookup endpoints must stay lightweight
* exports may use background jobs

Also address:

* N+1 avoidance
* eager vs selective loading
* lightweight selectors
* avoiding giant nested response payloads
* preloading summary counts cleanly

---

# 13. How to avoid leaking DB schema into frontend

## Goal

Define hard rules that prevent frontend/backend coupling to the raw DB model.

### Required output

Explain anti-patterns such as:

* exposing join table details directly
* returning DB-only flags with unclear meaning
* exposing many nullable columns without UI meaning
* returning storage internals for files
* leaking internal payment provider payload structure
* returning stock ledger rows where the page only needs stock summary

Also explain the correct alternative:

* normalized DTOs
* UI-friendly field names
* scoped response objects
* dedicated summary views

---

# 14. Practical frontend consumption recommendations

## Goal

Help frontend teams use the mapped contracts well.

### Required output

Explain recommendations such as:

* page bootstrapping data shape
* lookup-loading strategy
* list vs detail requests
* how modals should call focused endpoints
* how analytics pages should consume chart-ready payloads
* when to lazy load tabs
* how to minimize frontend transformation logic

Make it useful for:

* Super Admin frontend
* Clinic Admin frontend
* Doctor frontend

---

# 15. Engineering best practices

## Goal

Provide implementation guidance for backend teams.

### Required output

Include practical recommendations for:

* mapper/serializer placement
* DTO naming
* read-model naming
* projection update ownership
* avoiding duplicated summary logic
* consistent field naming across DTOs
* entity reference object patterns
* migration-safe API evolution
* backward compatibility for DTO changes
* contract tests between pages and APIs

---

# Extra requirement: mapping examples

The final output must include **concrete example mappings** for at least these cases:

1. **Patient**

* DB entity/entities involved
* list DTO
* detail DTO
* selector DTO
* analytics/summary fields

2. **Doctor**

* DB entity/entities involved
* list DTO
* detail DTO
* analytics DTO
* performance DTO

3. **Invoice**

* DB entity/entities involved
* list DTO
* detail DTO
* create DTO
* payment-related derived fields

4. **Product**

* DB entity/entities involved
* list DTO
* stock summary DTO
* adjustment DTO
* warehouse overview contribution

5. **Source**

* DB entity/entities involved
* list DTO
* performance DTO
* summary metrics

These examples should be specific enough that teams can directly follow the pattern.

---

## Output style requirement

Generate the database-to-API mapping foundation as a **clear structured technical blueprint** that developers can directly use as the platform-wide mapping standard.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **Super Admin page-to-API database mapping** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **page-to-API mapping blueprint** for all **Super Admin** pages, showing exactly:

* which frontend page needs which backend endpoint(s)
* which database entities are involved
* which read models/projections should be used
* which DTOs each page should consume
* how list/detail/summary/analytics data should be separated
* how to keep frontend integration clean, efficient, and maintainable

This blueprint must help developers connect:

* **Super Admin pages**
* to **API endpoints**
* to **database entities and derived projections**
  without confusion or overfetching.

---

## Scope of this prompt

Design mapping only for these Super Admin pages:

1. `/super-admin/dashboard`
2. `/super-admin/clinics`
3. `/super-admin/branches`
4. `/super-admin/users`
5. `/super-admin/analytics`
6. `/super-admin/settings`

Do **not** design Clinic Admin or Doctor page mappings here.

---

## Platform context

This is a **multi-tenant medical CRM / clinic management SaaS** with these core hierarchy levels:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor
* future staff roles

The **Super Admin** can see all platform data across all clinics and branches.

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Page-by-page mapping**
2. **Each page’s main API endpoints**
3. **Each page’s supporting lookup/config endpoints**
4. **Database entities involved per page**
5. **Read models / projection tables recommended per page**
6. **List DTOs / detail DTOs / summary DTOs / analytics DTOs used**
7. **Page bootstrapping strategy**
8. **Which data should be loaded eagerly vs lazily**
9. **Which data should be aggregated vs queried live**
10. **How to avoid N+1 or overfetching**
11. **Practical frontend consumption recommendations**
12. **Engineering best practices for maintaining the mapping**

Make the output practical and implementation-oriented.

---

# Global mapping rules for Super Admin pages

## API conventions

Assume the backend uses:

* REST-style APIs
* `/api/v1/...`
* paginated list responses
* dedicated analytics endpoints
* dedicated settings/configuration endpoints
* tenant-aware and permission-aware access control

## Data mapping principles

The answer must explain and apply these principles:

* list pages use lightweight list DTOs
* detail/configuration pages use composed detail DTOs
* dashboards use summary/analytics DTOs
* analytics pages use dedicated aggregate DTOs
* settings pages use configuration DTOs
* do not expose raw DB schema directly to frontend
* use projection/read models where needed for scale

---

# 1. Super Admin Dashboard mapping

## Frontend page

* `/super-admin/dashboard`

## Page goal

This page gives a platform-wide overview:

* total clinics
* total branches
* total doctors
* total patients
* total revenue
* active users
* recent activity
* new clinics added
* top performing clinics
* revenue trend
* clinic growth
* platform health

## Required mapping output

For this page, define:

### A. Main page endpoints

Which endpoint(s) should the dashboard call?

Examples to resolve:

* one dashboard bootstrap endpoint
* multiple dedicated widget endpoints
* hybrid strategy

Choose the best practical approach and explain why.

### B. Database entities involved

Examples likely involved:

* organizations / clinics
* branches
* users / staff / doctors
* patients
* invoices/payments
* audit/activity events

Explain which are source-of-truth and which are only used through projections.

### C. Recommended read models/projections

Explain which values should come from:

* direct query
* pre-aggregated dashboard summary table
* trend projection
* recent activity projection

### D. DTOs

Define which DTOs this page should consume:

* dashboard summary DTO
* revenue trend DTO
* clinic growth DTO
* top clinics DTO
* recent activity DTO
* platform health DTO

### E. Eager vs lazy loading

Explain what should load on first page render and what can load separately.

### F. Frontend consumption guidance

Explain the cleanest way for frontend to bootstrap this page.

---

# 2. Clinics page mapping

## Frontend page

* `/super-admin/clinics`

## Page goal

This page manages clinic organizations/groups and shows:

* clinic/group name
* branches count
* doctors count
* patients count
* total revenue
* status
* created date
* create/edit/assign-admin actions

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* clinics list
* create clinic
* update clinic
* change clinic status
* assign clinic admin
* clinic detail preview

Define the exact set this page needs.

### B. Database entities involved

Examples likely involved:

* organization / clinic entity
* branch
* users / assignments
* doctor profiles
* patients
* revenue/payment/invoice aggregates

Explain what comes from primary tables vs summary projections.

### C. Recommended projections

Define whether the clinics list should read from:

* live joins
* clinics summary projection
* denormalized management view

Explain which fields should be precomputed:

* branch count
* doctor count
* patient count
* total revenue

### D. DTOs

Define:

* clinic list item DTO
* clinic detail DTO or preview DTO
* create clinic DTO
* update clinic DTO
* assign clinic admin DTO
* clinic status change DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* page load
* search/filter/sort
* open create modal
* submit create
* open assign admin modal
* submit assignment
* activate/deactivate clinic

### F. Frontend consumption guidance

Explain how frontend should manage optimistic vs refetch behavior for this page.

---

# 3. Branches page mapping

## Frontend page

* `/super-admin/branches`

## Page goal

This page manages branches and shows:

* branch name
* clinic/group
* location
* admins
* doctors count
* patients count
* status
* created date

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* branches list
* create branch
* update branch
* change status
* assign branch admin
* branch detail preview

### B. Database entities involved

Examples:

* branch entity
* organization/clinic relation
* admin assignments
* doctor profiles
* patient assignments or scoped counts

Explain what is source-of-truth vs derived projection.

### C. Recommended projections

Define whether the branches page should use:

* branch management projection
* live joins
* admin preview projection

Explain how to supply:

* clinic name
* admin names/count
* doctor count
* patient count

### D. DTOs

Define:

* branch list item DTO
* branch detail/preview DTO
* create branch DTO
* update branch DTO
* assign branch admin DTO
* branch status change DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* page load
* search/filter
* create branch
* assign admin
* edit branch
* activate/deactivate

### F. Frontend consumption guidance

Explain how to load clinic options and related lookups efficiently.

---

# 4. Users page mapping

## Frontend page

* `/super-admin/users`

## Page goal

This page manages platform users and shows:

* full name
* role
* clinic/group
* branch
* phone/email
* status
* last login
* invite/edit/reassign actions

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* users list
* invite/create user
* update user role/scope
* update status
* resend invite
* user detail if needed
* role options
* clinic/branch assignment options

### B. Database entities involved

Examples:

* user
* organization user / assignment
* role
* doctor/staff profile if relevant
* last login/session data

Explain clearly:

* which entity holds identity
* which entity holds tenant assignment
* which entity holds profile/role context

### C. Recommended projections

Define whether the users list should use:

* user management projection
* live join across user + assignments + roles
* last login summary projection

### D. DTOs

Define:

* user list item DTO
* user detail/assignment DTO
* invite user DTO
* update role/scope DTO
* user status change DTO
* role option DTO
* clinic option DTO
* branch option DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* page load
* search/filter/sort
* invite user
* edit assignment
* suspend/deactivate/reactivate
* resend invite

### F. Frontend consumption guidance

Explain how to handle:

* one user with multiple assignments
* displaying role/scope cleanly
* lookup loading for clinic/branch selectors

---

# 5. Analytics page mapping

## Frontend page

* `/super-admin/analytics`

## Page goal

This page provides platform-wide analytics such as:

* total revenue
* total patients
* total clinics
* total branches
* active doctors
* average revenue per clinic
* revenue trend
* revenue by clinic
* revenue by branch
* patient acquisition by source
* clinic comparison
* doctor comparison
* invoice status breakdown
* goods consumption trends
* branch performance
* insights

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* analytics summary
* revenue trend
* revenue by clinic
* revenue by branch
* patient acquisition by source
* clinic comparison
* doctor comparison
* invoice status breakdown
* goods consumption trend
* branch performance
* insights

Explain whether:

* one large analytics bootstrap endpoint
* multiple chart-specific endpoints
* hybrid model
  is best.

### B. Database entities involved

Examples:

* invoices
* payments
* clinics
* branches
* patients
* doctors
* sources
* products/stock movements

Explain which are direct sources of truth vs analytics projections.

### C. Recommended projections/read models

This section must be concrete.

Explain which analytics should use:

* daily aggregated tables
* materialized views
* live queries
* event-driven projection tables

Cover specifically:

* revenue trend
* source analytics
* doctor comparison
* goods consumption trend
* branch performance
* invoice status breakdown

### D. DTOs

Define:

* analytics KPI summary DTO
* trend series DTO
* comparison row DTO
* source distribution DTO
* invoice status DTO
* goods trend DTO
* insights DTO

### E. Filter mapping

Explain how frontend filters map to backend filters:

* date range
* clinic/group multi-select
* branch multi-select
* source multi-select
* service multi-select

### F. Frontend consumption guidance

Explain how frontend should:

* load chart data
* cache filters
* avoid over-requesting
* re-query chart sections cleanly

---

# 6. Settings page mapping

## Frontend page

* `/super-admin/settings`

## Page goal

This page manages platform settings sections:

1. Global Permissions
2. Integrations
3. Payment Methods
4. Source Templates
5. Branding
6. Audit Logs

## Required mapping output

For this page, define mapping per section.

---

## 6.1 Global Permissions mapping

Define:

* endpoints needed
* database entities involved
* DTOs needed
* role/permission summary projection if useful

Examples:

* roles
* permissions
* role-permission mapping

Map actions such as:

* load role matrix
* load permission catalog
* update role permissions

---

## 6.2 Integrations mapping

Define:

* endpoints needed
* DB/config storage involved
* DTOs needed
* secure secret masking strategy in response DTOs

Examples:

* integration config entity
* provider settings entity or config store
* connection status projection

Map actions such as:

* list integrations
* edit integration
* enable/disable
* test connection

---

## 6.3 Payment Methods mapping

Define:

* endpoints needed
* entities/config involved
* DTOs needed

Examples:

* payment method config
* provider config
* enabled status
* provider-specific fields

Map actions such as:

* list methods
* update config
* enable/disable

---

## 6.4 Source Templates mapping

Define:

* endpoints needed
* entities involved
* DTOs needed

Examples:

* source template entity
* source type catalog
* template availability/scope

Map actions such as:

* list templates
* create/edit template
* activate/deactivate

---

## 6.5 Branding mapping

Define:

* endpoints needed
* entities/config involved
* DTOs needed

Examples:

* branding settings entity
* file/document linkage for logo/favicon

Map actions such as:

* load branding
* update branding
* upload logo/favicon

---

## 6.6 Audit Logs mapping

Define:

* endpoints needed
* audit log entities/projections involved
* DTOs needed
* pagination/filter mapping

Map actions such as:

* load logs
* filter logs
* export logs

Explain what should be:

* paged live
* indexed
* export-optimized

---

# Page bootstrapping strategy

## Goal

Define a clean bootstrapping plan for each Super Admin page.

For each page, explain:

* what data should load immediately
* what lookups should load separately
* what modal-specific data should lazy load
* what should be cached
* what should be filter-triggered re-fetch

This section must be practical and page-specific.

---

# Eager vs lazy loading rules

## Goal

Explain page-by-page:

* which main page data should be fetched on initial render
* which details should open only on interaction
* which tabs/sections should load lazily
* which lookups should be cached

Examples:

* dashboard recent activity can load separately
* clinic admin assignment lookup loads on modal open
* analytics chart sections may load by filter group
* audit logs export should not block table loading

---

# Cross-page shared lookups

## Goal

Some Super Admin pages need shared lookups:

* clinic options
* branch options
* role options
* status enums
* source types
* provider lists

Define:

* which lookups should come from shared lookup endpoints
* which should be page-specific
* how frontend should cache them

---

# Projection and aggregation strategy

## Goal

For each Super Admin page, state clearly whether it should use:

* direct normalized table reads
* management projections
* analytics projections
* materialized summaries
* event-updated read models

This section should resolve:

* clinics page counts
* branches page counts
* users last login
* analytics series
* dashboard summary cards
* audit log filtering

---

# Performance and query-boundary rules

## Goal

Prevent slow admin APIs.

For each Super Admin page, explain:

* what must never be fetched through giant deep joins
* what counts should be precomputed
* what detail should be lazy loaded
* what filters need indexes
* what analytics should use pre-aggregated data

Be practical and explicit.

---

# Frontend consumption recommendations

## Goal

Help frontend teams consume these APIs cleanly.

For each Super Admin page, explain:

* preferred main page endpoint strategy
* how to structure page-level query hooks
* how to handle search/filter/sort state
* how to handle modal create/update flows
* when to refetch vs patch local state
* how to render counts, charts, statuses, and detail previews cleanly

---

# Engineering best practices

## Goal

Provide implementation guidance for backend teams.

Include recommendations for:

* page-oriented projection naming
* DTO naming
* analytics DTO separation
* avoiding duplicated summary logic
* keeping settings/config DTOs stable
* using read services/query services for admin pages
* contract tests per page
* API documentation grouped by frontend page/module

---

# Extra requirement: concrete examples

The final output must include at least one concrete mapping example for each of these Super Admin pages:

1. Dashboard
2. Clinics
3. Branches
4. Users
5. Analytics
6. Settings

For each example, explicitly show:

* page
* endpoint(s)
* source entities
* projection(s)
* DTO(s)
* why this mapping is correct

---

## Output style requirement

Generate the Super Admin page-to-API mapping as a **clear structured technical blueprint** that developers can directly use to implement backend/frontend integration.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **Clinic Admin page-to-API database mapping** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **page-to-API mapping blueprint** for all **Clinic Admin** pages, showing exactly:

* which frontend page needs which backend endpoint(s)
* which database entities are involved
* which read models/projections should be used
* which DTOs each page should consume
* how list/detail/summary/analytics data should be separated
* how to keep frontend integration clean, efficient, and maintainable

This blueprint must help developers connect:

* **Clinic Admin pages**
* to **API endpoints**
* to **database entities and derived projections**
  without confusion, overfetching, or cross-module coupling.

---

## Scope of this prompt

Design mapping only for these Clinic Admin pages:

1. `/clinic-admin/dashboard`
2. `/clinic-admin/branch-details`
3. `/clinic-admin/patients`
4. `/clinic-admin/patients/:id`
5. `/clinic-admin/doctors`
6. `/clinic-admin/doctors/:id`
7. `/clinic-admin/doctors/analytics`
8. `/clinic-admin/services`
9. `/clinic-admin/services/rooms`
10. `/clinic-admin/warehouse`
11. `/clinic-admin/warehouse/products`
12. `/clinic-admin/warehouse/suppliers`
13. `/clinic-admin/warehouse/suppliers/:id`
14. `/clinic-admin/payments`
15. `/clinic-admin/payments/invoices`
16. `/clinic-admin/payments/invoices/create`
17. `/clinic-admin/sources`

Do **not** design Super Admin or Doctor page mappings here.

---

## Clinic Admin context

This is a **multi-tenant medical CRM / clinic management SaaS** with these hierarchy levels:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor
* future staff roles

The **Clinic Admin** can see and manage data only inside the current clinic / allowed branch scope.

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Page-by-page mapping**
2. **Each page’s main API endpoints**
3. **Each page’s supporting lookup/config endpoints**
4. **Database entities involved per page**
5. **Read models / projection tables recommended per page**
6. **List DTOs / detail DTOs / summary DTOs / analytics DTOs used**
7. **Page bootstrapping strategy**
8. **Which data should be loaded eagerly vs lazily**
9. **Which data should be aggregated vs queried live**
10. **How to avoid N+1 or overfetching**
11. **Practical frontend consumption recommendations**
12. **Engineering best practices for maintaining the mapping**

Make the output practical and implementation-oriented.

---

# Global mapping rules for Clinic Admin pages

## API conventions

Assume the backend uses:

* REST-style APIs
* `/api/v1/...`
* paginated list responses
* dedicated analytics endpoints
* dedicated settings/configuration endpoints only where needed
* clinic-aware and branch-aware access control

## Scope rules

Every mapping in this prompt must explicitly respect:

* clinic scope
* branch scope
* permission-aware module access
* safe record filtering

The mapping must explain whether scope comes from:

* auth context
* current branch selector
* explicit filter parameters validated against allowed branches

## Data mapping principles

The answer must apply these principles:

* list pages use lightweight list DTOs
* detail pages use composed detail DTOs
* dashboards use summary/analytics DTOs
* analytics pages use dedicated aggregate DTOs
* forms use write DTOs plus lookup DTOs
* do not expose raw DB schema directly to frontend
* use projections/read models where needed for scale

---

# 1. Clinic Dashboard mapping

## Frontend page

* `/clinic-admin/dashboard`

## Page goal

This page gives a clinic/branch-scoped operational overview:

* monthly income
* total patients
* new patients
* returning patients
* paid invoices
* outstanding amount
* income trend
* patients trend
* patients by source
* most active doctors
* invoice status statistics
* warehouse summary
* top services
* top patient source channels
* recent activity/alerts

## Required mapping output

For this page, define:

### A. Main page endpoints

Which endpoint(s) should the dashboard call?

Resolve whether the best model is:

* one dashboard bootstrap endpoint
* several dedicated widget endpoints
* hybrid approach

Choose the best practical approach and explain why.

### B. Database entities involved

Examples likely involved:

* branch
* patients
* patient source events
* encounters
* encounter services
* invoices
* payments
* doctors
* products / stock movements
* activity/audit events

Explain which are source-of-truth and which should be accessed via projections.

### C. Recommended read models/projections

Explain which values should come from:

* direct query
* branch dashboard summary projection
* daily income trend projection
* daily patient trend projection
* source metrics projection
* doctor activity projection
* invoice status summary projection
* warehouse summary projection

### D. DTOs

Define which DTOs this page should consume:

* dashboard summary DTO
* income trend DTO
* patient trend DTO
* source trend DTO
* most active doctors DTO
* invoice status breakdown DTO
* warehouse summary DTO
* top services DTO
* recent activity DTO

### E. Eager vs lazy loading

Explain what should load immediately and what can load separately.

### F. Frontend consumption guidance

Explain the cleanest way for frontend to bootstrap this page.

---

# 2. Branch Details mapping

## Frontend page

* `/clinic-admin/branch-details`

## Page goal

This page shows branch operational identity and quick management data:

* branch name
* clinic/group name
* branch code
* status
* timezone
* contact information
* location
* active doctors
* active rooms
* active services
* branch admins
* doctors preview
* rooms preview
* services preview
* operational summary

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* get current branch detail
* update branch detail
* list branch admins
* assign/add branch admin
* doctors preview
* rooms preview
* services preview
* branch operational status summary

### B. Database entities involved

Examples:

* organization / clinic
* branch
* organization_users / branch assignments
* doctors
* rooms
* services
* payment/source readiness indicators if shown

### C. Recommended projections

Define whether the page should use:

* one branch detail projection
* separate preview query endpoints
* branch operational readiness projection

### D. DTOs

Define:

* branch detail DTO
* branch contact/location DTO
* branch admin preview DTO
* doctor preview DTO
* room preview DTO
* service preview DTO
* operational status DTO
* update branch DTO
* assign branch admin DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* page load
* edit branch
* manage admins
* open doctor/room/service previews

### F. Frontend consumption guidance

Explain how to keep this page fast while showing several previews.

---

# 3. Patients list mapping

## Frontend page

* `/clinic-admin/patients`

## Page goal

This page manages clinic patients and shows:

* full name
* age
* gender
* phone
* source
* primary doctor
* last visit
* total visits
* total income
* monthly income
* status

Supports:

* search/filter/sort/paginate
* create patient
* assign doctor
* quick preview
* summary cards

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* patients list
* create patient
* update patient if inline edit used
* assign doctor
* patient summary metrics
* patient quick preview

### B. Database entities involved

Examples:

* patient
* patient-doctor assignment
* lead/source
* encounters
* invoices/payments or billing projections
* patient notes indicators

### C. Recommended projections

Define whether the page should use:

* patient list management projection
* patient billing summary projection
* patient visit summary projection
* patient source reference projection

Explain how to supply:

* total visits
* total income
* monthly income
* primary doctor display
* last visit

### D. DTOs

Define:

* patient list item DTO
* patient quick preview DTO
* patient create DTO
* patient update DTO
* assign doctor DTO
* patient summary cards DTO
* doctor selector DTO
* source selector DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* page load
* search/filter/sort
* create patient
* assign doctor
* open preview

### F. Frontend consumption guidance

Explain how frontend should combine main list query plus modal/lookup queries.

---

# 4. Patient detail mapping

## Frontend page

* `/clinic-admin/patients/:id`

## Page goal

This page shows a rich patient profile with tabs:

* Overview
* Medical Documents
* Visit History
* Billing
* Notes

It includes:

* full profile and contact data
* source and primary doctor
* first/last visit
* total times serviced
* total income and monthly income
* documents
* visit/encounter history
* invoices/payments summary
* notes
* quick actions

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* get patient detail overview
* list medical documents
* upload document metadata
* list visit history
* get billing summary
* list invoices/payments preview
* list notes
* create note
* assign doctor
* update patient

### B. Database entities involved

Examples:

* patient
* patient documents
* encounters
* encounter services
* invoices
* payments
* notes
* doctor assignment

### C. Recommended projections

Define whether the page should use:

* patient detail composed DTO
* separate tab endpoints
* billing summary projection
* visit history projection
* notes feed projection

### D. DTOs

Define:

* patient detail DTO
* patient overview DTO
* document list item DTO
* visit history row DTO
* billing summary DTO
* invoice/payment preview DTO
* note list item DTO
* create note DTO
* upload document DTO
* assign doctor DTO

### E. Eager vs lazy loading

Explain which tab data should load immediately and which should lazy load.

### F. Frontend consumption guidance

Explain how to avoid overfetching while keeping tabs responsive.

---

# 5. Doctors list mapping

## Frontend page

* `/clinic-admin/doctors`

## Page goal

This page manages doctors and shows:

* full name
* profession
* years of experience
* services count
* patients served
* total income
* monthly income
* rating
* status

Supports:

* search/filter/sort/paginate
* create doctor
* update doctor
* manage services
* summary cards

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* doctors list
* create doctor
* update doctor
* change status
* assign services
* doctor summary metrics
* doctor quick preview if useful

### B. Database entities involved

Examples:

* user
* staff profile
* doctor profile
* doctor-services link
* encounter projections
* invoice/payment revenue projections
* ratings projections if supported

### C. Recommended projections

Define whether the page should use:

* doctor management projection
* doctor revenue summary projection
* doctor service count projection
* doctor patient count projection

### D. DTOs

Define:

* doctor list item DTO
* doctor create DTO
* doctor update DTO
* manage services DTO
* doctor summary cards DTO
* profession/specialty lookup DTO
* service selector DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* page load
* search/filter/sort
* add doctor
* edit doctor
* manage services
* deactivate

### F. Frontend consumption guidance

Explain how to handle doctor identity, profile, and assignment data cleanly in UI.

---

# 6. Doctor detail mapping

## Frontend page

* `/clinic-admin/doctors/:id`

## Page goal

This page shows a rich doctor profile with tabs:

* Overview
* Patients Served
* Monthly Patients
* Performance

It includes:

* profession
* career start date / experience
* branch
* contact
* rating
* services
* patients served
* monthly patients
* income by doctor
* income by doctor’s patients
* top services
* patient trend

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* get doctor detail overview
* list patients served
* list monthly patients
* get doctor performance summary
* manage services
* update doctor

### B. Database entities involved

Examples:

* doctor profile
* user/staff profile
* doctor-services
* encounters
* patients
* invoices/payments or derived doctor revenue projections
* ratings

### C. Recommended projections

Define whether this page should use:

* doctor detail projection
* patients-served list projection
* monthly patients projection
* doctor performance summary projection

### D. DTOs

Define:

* doctor detail DTO
* overview DTO
* patients-served row DTO
* monthly patients row DTO
* doctor performance DTO
* update doctor DTO
* manage services DTO

### E. Eager vs lazy loading

Explain which tabs should lazy load.

### F. Frontend consumption guidance

Explain how frontend should render doctor detail cleanly without huge initial payloads.

---

# 7. Doctor analytics mapping

## Frontend page

* `/clinic-admin/doctors/analytics`

## Page goal

This page provides clinic-scoped doctor analytics with filters:

* one doctor / many / all
* date range
* one/many/all services

It shows:

* total patients today
* average consultation
* new patients
* returning patients
* total income
* daily patient trend
* doctors rating
* age distribution
* service distribution
* highest-times heatmap
* doctor comparison
* insights

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* analytics KPI summary
* daily patient trend
* ratings comparison
* demographics distribution
* service distribution
* 24x7 heatmap
* doctor comparison
* insights

Resolve whether the best model is:

* one analytics bootstrap endpoint
* multiple chart endpoints
* hybrid approach

### B. Database entities involved

Examples:

* encounters
* patients
* doctor profiles
* encounter services
* ratings
* invoices/payments if income included

### C. Recommended projections/read models

Be concrete about:

* doctor analytics daily aggregates
* doctor-service aggregates
* doctor-patient demographics aggregates
* rating aggregates
* hourly/weekday heatmap projections

### D. DTOs

Define:

* analytics KPI summary DTO
* trend series DTO
* rating comparison DTO
* demographics DTO
* service distribution DTO
* heatmap DTO
* doctor comparison DTO
* insights DTO

### E. Filter mapping

Explain how frontend filters map to backend parameters and validated scopes.

### F. Frontend consumption guidance

Explain the cleanest chart loading strategy.

---

# 8. Services mapping

## Frontend page

* `/clinic-admin/services`

## Page goal

This page manages services and shows:

* service name
* category
* price
* duration
* room requirement
* doctor requirement
* linked goods/products
* status

Supports:

* create/update service
* link goods
* assign doctors
* summary cards

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* services list
* create service
* update service
* change status
* link products to service
* assign doctors to service
* service summary metrics

### B. Database entities involved

Examples:

* service
* service category
* service-product link
* doctor-service link

### C. Recommended projections

Define whether services list should use:

* service management projection
* service requirement projection
* service linked-goods count projection

### D. DTOs

Define:

* service list item DTO
* service detail/preview DTO if needed
* create service DTO
* update service DTO
* link goods DTO
* assign doctors DTO
* service summary DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* list load
* create/update
* link goods
* assign doctors
* open rooms navigation

### F. Frontend consumption guidance

Explain which lookups should load separately:

* categories
* doctors
* products

---

# 9. Rooms mapping

## Frontend page

* `/clinic-admin/services/rooms`

## Page goal

This page manages rooms and shows:

* room name
* room type
* floor
* available services
* assigned doctors
* status

Supports:

* create/update room
* assign services
* assign doctors
* summary cards
* optional table/card view

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* rooms list
* create room
* update room
* change status
* assign services
* assign doctors
* rooms summary metrics

### B. Database entities involved

Examples:

* room
* room-service link
* doctor-room link
* room type config if lookup-based

### C. Recommended projections

Define whether the rooms page should use:

* room management projection
* room-service summary projection
* room-doctor summary projection

### D. DTOs

Define:

* room list item DTO
* room card DTO
* create room DTO
* update room DTO
* assign services DTO
* assign doctors DTO
* room summary DTO

### E. Frontend consumption guidance

Explain table vs card view consumption and shared lookups.

---

# 10. Warehouse overview mapping

## Frontend page

* `/clinic-admin/warehouse`

## Page goal

This page shows warehouse analytics:

* total left goods
* total spent
* total output
* low stock items
* out of stock items
* kirim vs chiqim
* stock movement trend
* top spent goods
* few remainings
* category consumption
* insights

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* warehouse KPI summary
* kirim vs chiqim trend
* stock movement trend
* top spent goods
* low stock list
* category consumption
* warehouse insights

### B. Database entities involved

Examples:

* products
* stock movements
* inventory batches if tracked
* categories
* supplier/product relations for some insights

### C. Recommended projections

Be concrete about:

* stock summary projection
* daily movement projection
* low stock projection
* category consumption projection

### D. DTOs

Define:

* warehouse summary DTO
* trend DTO
* top spent goods DTO
* low stock item DTO
* category consumption DTO
* warehouse insights DTO

### E. Frontend consumption guidance

Explain how to structure this page to avoid direct heavy queries against ledger rows.

---

# 11. Products mapping

## Frontend page

* `/clinic-admin/warehouse/products`

## Page goal

This page manages products/goods and shows:

* product name
* category
* SKU
* unit
* current stock
* min stock
* purchase price
* selling price
* product type
* expiry
* status

Supports:

* create/update product
* adjust stock
* mark expired
* summary cards
* optional table/card view

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* products list
* create product
* update product
* adjust stock
* mark expired
* change status
* product summary metrics
* product movement preview if needed

### B. Database entities involved

Examples:

* product
* product category
* stock movements
* inventory batches/expiry tracking

### C. Recommended projections

Define whether the products list should use:

* product stock summary projection
* expiry status projection
* low stock projection

### D. DTOs

Define:

* product list item DTO
* product card DTO
* create product DTO
* update product DTO
* adjust stock DTO
* product summary DTO
* stock movement preview DTO if needed

### E. Frontend consumption guidance

Explain how to keep current stock/status data consistent after adjustments.

---

# 12. Suppliers list mapping

## Frontend page

* `/clinic-admin/warehouse/suppliers`

## Page goal

This page manages suppliers and shows:

* supplier name
* contact
* products count
* total orders
* recent supply date
* status

Supports:

* create/update supplier
* link products
* summary cards
* optional table/card view

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* suppliers list
* create supplier
* update supplier
* change status
* link products
* supplier summary metrics

### B. Database entities involved

Examples:

* supplier
* supplier-product link
* purchase order / supply history tables if present

### C. Recommended projections

Define whether the suppliers list should use:

* supplier management projection
* supplier product count projection
* recent supply summary projection

### D. DTOs

Define:

* supplier list item DTO
* supplier card DTO
* create supplier DTO
* update supplier DTO
* link products DTO
* supplier summary DTO

### E. Frontend consumption guidance

Explain how to lazy-load detail history later.

---

# 13. Supplier detail mapping

## Frontend page

* `/clinic-admin/warehouse/suppliers/:id`

## Page goal

This page shows a supplier profile with tabs:

* Overview
* Linked Products
* Purchase History
* Recent Orders
* Notes

It includes:

* contact info
* products linked
* total supplied value
* total orders
* recent supply date
* notes
* purchase/supply history

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* get supplier detail overview
* list linked products
* list purchase history
* list recent orders
* list notes
* create note
* add purchase record
* link products
* update supplier

### B. Database entities involved

Examples:

* supplier
* supplier-product links
* purchase orders / receipts
* notes

### C. Recommended projections

Define whether the page should use:

* supplier detail projection
* linked product projection
* purchase history projection
* recent orders projection
* supplier notes feed projection

### D. DTOs

Define:

* supplier detail DTO
* linked product row DTO
* purchase history row DTO
* recent order row DTO
* note list item DTO
* create note DTO
* add purchase record DTO

### E. Eager vs lazy loading

Explain which tabs should lazy load.

### F. Frontend consumption guidance

Explain how to keep the detail page responsive.

---

# 14. Payments overview mapping

## Frontend page

* `/clinic-admin/payments`

## Page goal

This page shows payments analytics:

* total collected
* successful payments
* failed payments
* refunded amount
* pending transactions
* average payment size
* payment volume trend
* payment methods distribution
* payment status breakdown
* recent transactions
* provider/method highlights
* risk signals

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* payment KPI summary
* payment trend
* payment methods distribution
* payment status breakdown
* recent transactions
* provider highlights
* risk signals

### B. Database entities involved

Examples:

* payments
* payment allocations
* invoices
* payment provider callbacks/logs if used
* refunds

### C. Recommended projections

Be concrete about:

* payment summary projection
* payment trend projection
* payment method distribution projection
* recent transaction projection
* risk signals projection

### D. DTOs

Define:

* payment summary DTO
* trend DTO
* method distribution DTO
* status breakdown DTO
* transaction row DTO
* provider highlight DTO
* risk signals DTO

### E. Frontend consumption guidance

Explain how to load charts and recent transactions efficiently.

---

# 15. Invoices mapping

## Frontend page

* `/clinic-admin/payments/invoices`

## Page goal

This page manages invoices and shows:

* invoice number
* patient
* doctor
* date
* total
* paid
* due
* status

Supports:

* list/filter/sort/paginate
* mark as paid
* cancel invoice
* duplicate invoice
* detail drawer
* summary cards
* optional table/card view

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* invoices list
* get invoice detail
* mark as paid
* cancel invoice
* duplicate invoice
* invoice summary metrics

### B. Database entities involved

Examples:

* invoice
* invoice items
* patient
* doctor
* payments / allocations
* status transitions

### C. Recommended projections

Define whether the invoices list should use:

* invoice management projection
* invoice financial summary projection
* invoice detail composed DTO for drawer

### D. DTOs

Define:

* invoice list item DTO
* invoice card DTO
* invoice detail DTO
* mark as paid DTO
* cancel invoice DTO
* duplicate invoice DTO
* invoice summary DTO

### E. Frontend consumption guidance

Explain how detail drawer should load and how list refetch/patch should work.

---

# 16. Create invoice mapping

## Frontend page

* `/clinic-admin/payments/invoices/create`

## Page goal

This page creates invoices using:

* patient
* doctor
* service lines
* product lines
* adjustments
* totals
* draft/unpaid states
* optional save & collect payment flow

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* create invoice
* save draft
* update draft if draft editing is supported
* helper lookups for patient/doctor/service/product selectors
* import services from encounter if supported
* optional save & collect payment action

### B. Database entities involved

Examples:

* invoice
* invoice items
* patient
* doctor
* services
* products
* encounter/encounter services
* payments if immediate collection supported

### C. Recommended write/read model strategy

Explain:

* invoice create DTO vs invoice detail DTO
* line item DTOs
* summary/totals recomputation strategy
* server-side canonical total calculation

### D. DTOs

Define:

* create invoice DTO
* draft invoice DTO
* invoice service line DTO
* invoice product line DTO
* adjustment DTO
* invoice form bootstrap DTO
* create-and-collect-payment DTO if used

### E. Frontend consumption guidance

Explain the best way to bootstrap this form:

* lookup endpoints
* selector search endpoints
* totals preview behavior
* draft save behavior

---

# 17. Sources mapping

## Frontend page

* `/clinic-admin/sources`

## Page goal

This page manages clinic-level acquisition sources and shows:

* source name
* type
* linked patients
* conversions
* revenue generated
* activity trend
* status

Supports:

* create/update source
* change status
* performance drawer
* summary cards
* ranking and chart sections
* optional table/card view

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* sources list
* create source
* update source
* change source status
* source performance detail
* source summary metrics
* source trend
* top source rankings

### B. Database entities involved

Examples:

* clinic source instance
* source template
* patient source events
* patient counts
* revenue attribution projection

### C. Recommended projections

Define whether the page should use:

* source management projection
* source performance projection
* daily source trend projection
* source ranking projection

### D. DTOs

Define:

* source list item DTO
* source card DTO
* create source DTO
* update source DTO
* source performance DTO
* source summary DTO
* ranking DTO
* trend DTO

### E. Frontend consumption guidance

Explain how to combine management table plus analytics sections without overfetching.

---

# Page bootstrapping strategy

## Goal

Define a clean bootstrapping plan for each Clinic Admin page.

For each page, explain:

* what data should load immediately
* what lookups should load separately
* what modal-specific data should lazy load
* what should be cached
* what should be filter-triggered re-fetch

This section must be practical and page-specific.

---

# Eager vs lazy loading rules

## Goal

Explain page-by-page:

* which main page data should be fetched on initial render
* which details should open only on interaction
* which tabs/sections should load lazily
* which lookups should be cached

Examples:

* patient detail tabs lazy load
* doctor detail tabs lazy load
* supplier detail tabs lazy load
* create invoice selector lookups load on demand
* dashboard charts may load separately from KPI cards

---

# Cross-page shared lookups

## Goal

Some Clinic Admin pages need shared lookups:

* doctor options
* patient options
* service options
* product options
* supplier options
* source types
* categories
* statuses
* room types
* payment methods

Define:

* which lookups should come from shared lookup/select endpoints
* which should be page-specific
* how frontend should cache them

---

# Projection and aggregation strategy

## Goal

For each Clinic Admin page, state clearly whether it should use:

* direct normalized reads
* management projections
* analytics projections
* materialized summaries
* event-updated read models

This section should explicitly resolve:

* patient list income/visit counts
* doctor list counts/revenue/rating
* dashboard KPIs
* doctor analytics charts
* warehouse stock summaries
* supplier recent supply metrics
* payment/invoice summaries
* source performance metrics

---

# Performance and query-boundary rules

## Goal

Prevent slow clinic APIs.

For each Clinic Admin page, explain:

* what must never be fetched through giant deep joins
* what counts should be precomputed
* what tabbed detail should be lazy loaded
* what filters need indexes
* what analytics should use pre-aggregated data
* what transactional tables should not be abused for dashboards

Be practical and explicit.

---

# Frontend consumption recommendations

## Goal

Help frontend teams consume these APIs cleanly.

For each Clinic Admin page, explain:

* preferred main page endpoint strategy
* how to structure page-level query hooks
* how to handle search/filter/sort state
* how to handle modal create/update/assign flows
* when to refetch vs patch local state
* how to render counts, charts, statuses, previews, and drawers cleanly

---

# Engineering best practices

## Goal

Provide implementation guidance for backend teams.

Include recommendations for:

* page-oriented projection naming
* DTO naming
* detail vs tab DTO separation
* analytics DTO separation
* avoiding duplicated summary logic
* using query/read services for management pages
* contract tests per page
* API documentation grouped by frontend page/module

---

# Extra requirement: concrete examples

The final output must include at least one concrete mapping example for each of these Clinic Admin pages:

1. Dashboard
2. Patients
3. Patient Detail
4. Doctors
5. Doctor Analytics
6. Services
7. Rooms
8. Warehouse
9. Products
10. Suppliers
11. Supplier Detail
12. Payments
13. Invoices
14. Create Invoice
15. Sources

For each example, explicitly show:

* page
* endpoint(s)
* source entities
* projection(s)
* DTO(s)
* why this mapping is correct

---

## Output style requirement

Generate the Clinic Admin page-to-API mapping as a **clear structured technical blueprint** that developers can directly use to implement backend/frontend integration.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


Design the **Doctor page-to-API database mapping** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **page-to-API mapping blueprint** for all **Doctor** pages, showing exactly:

* which frontend page needs which backend endpoint(s)
* which database entities are involved
* which read models/projections should be used
* which DTOs each page should consume
* how list/detail/summary/analytics/workflow data should be separated
* how to keep frontend integration clean, efficient, and maintainable

This blueprint must help developers connect:

* **Doctor pages**
* to **API endpoints**
* to **database entities and derived projections**
  without confusion, overfetching, or unsafe access.

---

## Scope of this prompt

Design mapping only for these Doctor pages:

1. `/doctor/dashboard`
2. `/doctor/patients`
3. `/doctor/patients/:id`
4. `/doctor/encounters/create`
5. `/doctor/goods-usage`
6. `/doctor/performance`

Do **not** design Super Admin or Clinic Admin page mappings here.

---

## Doctor context

This is a **multi-tenant medical CRM / clinic management SaaS** with these hierarchy levels:

* Platform Super Admin
* Clinic Organization / Clinic Group
* Branch
* Clinic Admin
* Doctor

The **Doctor** can only access their allowed clinic/branch scope and only the patients and workflows allowed by business rules.

The Doctor pages are **personal workspace pages**, not clinic-wide management pages.

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Page-by-page mapping**
2. **Each page’s main API endpoints**
3. **Each page’s supporting lookup/config endpoints**
4. **Database entities involved per page**
5. **Read models / projection tables recommended per page**
6. **List DTOs / detail DTOs / summary DTOs / workflow DTOs / analytics DTOs used**
7. **Page bootstrapping strategy**
8. **Which data should be loaded eagerly vs lazily**
9. **Which data should be aggregated vs queried live**
10. **How to avoid N+1 or overfetching**
11. **Practical frontend consumption recommendations**
12. **Engineering best practices for maintaining the mapping**

Make the output practical and implementation-oriented.

---

# Global mapping rules for Doctor pages

## API conventions

Assume the backend uses:

* REST-style APIs
* `/api/v1/...`
* paginated list responses where needed
* dedicated summary/analytics endpoints
* doctor-scope and patient-scope access control

## Scope rules

Every mapping in this prompt must explicitly respect:

* current authenticated doctor
* clinic/branch scope
* patient access rules
* encounter ownership or encounter-allowed access
* goods usage rules
* safe record-level authorization

The mapping must explain whether scope comes from:

* auth context
* doctor profile
* patient-doctor assignment
* served-patient relationship
* encounter ownership
* explicit filters validated against doctor scope

## Data mapping principles

The answer must apply these principles:

* list pages use lightweight list DTOs
* detail pages use composed detail DTOs
* dashboards use summary/analytics DTOs
* encounter/goods usage pages use workflow DTOs
* performance page uses dedicated aggregate DTOs
* do not expose raw DB schema directly to frontend
* use projections/read models where needed for scale
* keep medical access minimal and safe

---

# 1. Doctor Dashboard mapping

## Frontend page

* `/doctor/dashboard`

## Page goal

This page gives a doctor-personal overview:

* today’s patients
* total patients
* new patients
* returning patients
* monthly income
* completed consultations
* recent consultations
* upcoming appointments
* patient trend
* income trend
* top services
* alerts/tasks
* mini patient summary

## Required mapping output

For this page, define:

### A. Main page endpoints

Which endpoint(s) should the dashboard call?

Resolve whether the best model is:

* one dashboard bootstrap endpoint
* several dedicated widget endpoints
* hybrid approach

Choose the best practical approach and explain why.

### B. Database entities involved

Examples likely involved:

* doctor profile
* patient-doctor assignments
* encounters
* appointments
* encounter services
* invoices/payments or revenue projections
* follow-up tasks/alerts
* service usage aggregates

Explain which are source-of-truth and which should be accessed via projections.

### C. Recommended read models/projections

Explain which values should come from:

* direct query
* doctor dashboard summary projection
* daily doctor patient trend projection
* daily doctor income projection
* recent consultation projection
* upcoming appointment projection
* doctor service summary projection
* doctor alerts/tasks projection

### D. DTOs

Define which DTOs this page should consume:

* dashboard summary DTO
* recent consultations DTO
* upcoming appointments DTO
* patient trend DTO
* income trend DTO
* top services DTO
* alerts/tasks DTO
* mini patient summary DTO

### E. Eager vs lazy loading

Explain what should load immediately and what can load separately.

### F. Frontend consumption guidance

Explain the cleanest way for frontend to bootstrap this page.

---

# 2. My Patients mapping

## Frontend page

* `/doctor/patients`

## Page goal

This page shows the doctor’s assigned/access-allowed patients and supports:

* search/filter/sort/pagination
* patient quick preview
* follow-up queue
* summary cards

It shows:

* full name
* age
* gender
* phone
* source
* last visit
* total visits
* follow-up status
* notes indicator

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* list my patients
* patient quick preview
* follow-up queue
* patient summary metrics

### B. Database entities involved

Examples:

* patient
* patient-doctor assignment
* encounters
* sources
* notes summary flags
* follow-up/task data

Explain exactly how patient eligibility for this doctor is determined.

### C. Recommended projections

Define whether the page should use:

* doctor patient list projection
* follow-up queue projection
* patient notes indicator projection
* patient visit summary projection

Explain how to supply:

* total visits
* last visit
* follow-up status
* notes indicator
* source display

### D. DTOs

Define:

* patient list item DTO
* patient quick preview DTO
* follow-up queue item DTO
* patient summary cards DTO
* source badge DTO if useful

### E. Page interaction mapping

Map frontend actions to APIs:

* page load
* search/filter/sort
* open quick preview
* open patient detail
* quick add consultation action

### F. Frontend consumption guidance

Explain how frontend should combine list query plus quick-preview/follow-up data.

---

# 3. Doctor Patient Detail mapping

## Frontend page

* `/doctor/patients/:id`

## Page goal

This page shows a doctor-oriented patient profile with tabs:

* Overview
* Clinical Notes
* Visit History
* Medical Documents
* Services Record

It includes:

* patient overview and alerts
* clinical notes
* visit history
* medical documents
* services received
* quick care actions

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* get patient overview for doctor
* list clinical notes
* create clinical note
* list visit history
* list medical documents
* upload document metadata if allowed
* list services record
* get quick patient summary

### B. Database entities involved

Examples:

* patient
* patient documents
* clinical notes
* encounters
* encounter services
* doctor access scope / patient assignment
* alerts/allergies summary

### C. Recommended projections

Define whether the page should use:

* doctor-facing patient detail projection
* clinical notes feed projection
* visit history projection
* medical documents projection
* services record projection
* patient quick summary projection

### D. DTOs

Define:

* patient detail overview DTO
* clinical note list item DTO
* create note DTO
* visit history row DTO
* document list item DTO
* upload document DTO
* services record row DTO
* quick patient summary DTO

### E. Eager vs lazy loading

Explain which tab data should load immediately and which should lazy load.

### F. Frontend consumption guidance

Explain how to keep the page responsive while respecting doctor access and sensitive data limits.

---

# 4. Add Consultation / Create Encounter mapping

## Frontend page

* `/doctor/encounters/create`

## Page goal

This page is the main doctor workflow for:

* selecting patient
* creating encounter/consultation
* recording diagnosis summary
* writing clinical notes
* adding performed services
* adding goods/products consumed
* setting follow-up info
* saving draft or completing encounter

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* patient selector search
* create encounter draft
* update encounter details
* add/update encounter services
* add/update encounter goods usage rows
* save draft
* complete encounter
* encounter summary preview
* import services from recent encounter if supported

Resolve whether the best model is:

* one big create/update endpoint
* several focused workflow endpoints
* hybrid workflow model

Choose the best practical approach and explain why.

### B. Database entities involved

Examples:

* patient
* encounter
* encounter services
* clinical notes
* products/goods usage
* service catalog
* stock availability
* room if relevant
* follow-up/reminder entity if used

### C. Recommended write/read model strategy

Explain:

* draft encounter write model
* completed encounter write model
* encounter summary preview projection
* service line DTO vs persisted entity
* goods usage row DTO vs persisted movement staging

### D. DTOs

Define:

* create encounter DTO
* update encounter DTO
* encounter basic info DTO
* clinical notes DTO
* encounter service line DTO
* encounter goods usage line DTO
* follow-up DTO
* encounter summary DTO
* complete encounter DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* patient search/select
* save encounter draft
* add/remove service lines
* add/remove goods lines
* validate stock availability
* complete encounter

### F. Frontend consumption guidance

Explain how frontend should manage draft state, line items, validation, and completion safely.

---

# 5. Goods Usage mapping

## Frontend page

* `/doctor/goods-usage`

## Page goal

This page is a doctor operational page for:

* recording goods/products used during service
* linking usage to patient and encounter
* linking usage to service
* checking stock availability
* showing stock warnings
* showing recent usage records
* optionally suggesting goods by service

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* list recent goods usage
* create goods usage record
* save draft goods usage if supported
* validate stock
* get suggested goods by service
* get frequently used goods
* get goods usage summary metrics

### B. Database entities involved

Examples:

* goods usage record or encounter-linked goods rows
* product
* stock summary / stock movement
* patient
* encounter
* service
* doctor profile

### C. Recommended projections

Define whether the page should use:

* recent goods usage projection
* stock availability projection
* suggested goods by service projection
* doctor frequent goods projection
* goods usage summary projection

### D. DTOs

Define:

* goods usage list item DTO
* create goods usage DTO
* goods usage line DTO
* stock validation DTO
* suggested goods DTO
* frequently used goods DTO
* usage summary DTO

### E. Page interaction mapping

Map frontend actions to APIs:

* page load
* filter/search
* create usage record
* validate stock
* view recent usage

### F. Frontend consumption guidance

Explain how this page should coexist with encounter workflow without double-counting or UX duplication.

---

# 6. My Performance mapping

## Frontend page

* `/doctor/performance`

## Page goal

This page shows doctor-personal analytics:

* patients served
* monthly patients
* total income by doctor
* monthly income by doctor
* total income by doctor’s patients
* average rating
* patient trend
* income trend
* service performance
* monthly patient behavior
* workload trend
* personal insights

## Required mapping output

For this page, define:

### A. Main endpoints

Examples:

* performance KPI summary
* patient trend
* income trend
* service performance
* monthly patient breakdown
* workload trend
* rating summary
* personal insights

Resolve whether the best model is:

* one performance bootstrap endpoint
* multiple chart endpoints
* hybrid approach

Choose the best practical approach and explain why.

### B. Database entities involved

Examples:

* encounters
* encounter services
* patient-doctor assignments or served-patient relationships
* invoices/payments or revenue projections
* ratings
* appointment/workload data

### C. Recommended projections/read models

Be concrete about:

* doctor performance summary projection
* daily doctor income projection
* daily patient trend projection
* service performance aggregate
* workload aggregate
* rating aggregate

### D. DTOs

Define:

* performance KPI DTO
* patient trend DTO
* income trend DTO
* service performance DTO
* monthly patient mix DTO
* workload DTO
* rating DTO
* insights DTO

### E. Filter mapping

Explain how frontend filters map to backend parameters:

* date range
* service filter
* patient type filter

### F. Frontend consumption guidance

Explain the cleanest way to load analytics for a personal performance page.

---

# Page bootstrapping strategy

## Goal

Define a clean bootstrapping plan for each Doctor page.

For each page, explain:

* what data should load immediately
* what lookups should load separately
* what modal-specific data should lazy load
* what should be cached
* what should be filter-triggered re-fetch

This section must be practical and page-specific.

---

# Eager vs lazy loading rules

## Goal

Explain page-by-page:

* which main page data should be fetched on initial render
* which previews/tabs should load on demand
* which lookups should be cached
* which workflow data should be fetched lazily

Examples:

* patient detail tab content lazy loads
* encounter selectors search lazily
* performance chart sections may load independently
* goods suggestions by service load only after service selection

---

# Cross-page shared lookups

## Goal

Some Doctor pages need shared lookups:

* patient options
* service options
* product options
* encounter options
* follow-up types if used
* note types
* encounter type options

Define:

* which lookups should come from shared selector endpoints
* which should be page-specific
* how frontend should cache them safely within doctor scope

---

# Projection and aggregation strategy

## Goal

For each Doctor page, state clearly whether it should use:

* direct normalized reads
* doctor-scope projections
* encounter workflow models
* analytics projections
* event-updated read models

This section should explicitly resolve:

* dashboard KPIs
* my patients last-visit and follow-up signals
* patient detail tabs
* encounter draft/completion data
* goods usage recent activity
* personal performance metrics

---

# Performance and query-boundary rules

## Goal

Prevent slow doctor APIs.

For each Doctor page, explain:

* what must never be fetched through giant deep joins
* what summaries should be projected
* what patient tabs must lazy load
* what selectors must stay lightweight
* what analytics should use pre-aggregated data
* what workflow endpoints must remain transactional

Be practical and explicit.

---

# Frontend consumption recommendations

## Goal

Help frontend teams consume these APIs cleanly.

For each Doctor page, explain:

* preferred main page endpoint strategy
* how to structure page-level query hooks
* how to handle search/filter state
* how to handle draft encounter state
* when to refetch vs patch local state
* how to render care history, notes, services, usage, and analytics cleanly

---

# Engineering best practices

## Goal

Provide implementation guidance for backend teams.

Include recommendations for:

* page-oriented projection naming
* DTO naming
* patient-access-safe read services
* workflow DTO separation
* analytics DTO separation
* avoiding duplicated summary logic
* using query/read services for doctor pages
* contract tests per page
* API documentation grouped by doctor workflow/module

---

# Extra requirement: concrete examples

The final output must include at least one concrete mapping example for each of these Doctor pages:

1. Dashboard
2. My Patients
3. Patient Detail
4. Add Consultation / Create Encounter
5. Goods Usage
6. My Performance

For each example, explicitly show:

* page
* endpoint(s)
* source entities
* projection(s)
* DTO(s)
* why this mapping is correct

---

## Output style requirement

Generate the Doctor page-to-API mapping as a **clear structured technical blueprint** that developers can directly use to implement backend/frontend integration.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.

Design the **cross-cutting page-to-API database mapping** for a scalable, multi-tenant **medical CRM / clinic management SaaS**.

## Main goal

Create a production-ready **page-to-API mapping blueprint** for all **shared / cross-cutting platform capabilities**, showing exactly:

* which frontend surfaces need which backend endpoint(s)
* which database entities are involved
* which read models/projections should be used
* which DTOs each UI surface should consume
* how shared infrastructure data should be separated from business-module data
* how frontend integration should remain clean, efficient, and maintainable

This blueprint must help developers connect:

* **shared UI/system capabilities**
* to **API endpoints**
* to **database entities and derived projections**
  without duplication, overfetching, or inconsistent contracts.

---

## Scope of this prompt

Design mapping only for these cross-cutting/shared areas:

1. Files / Documents
2. Audit Logs
3. Notifications
4. Global Search
5. Shared Selectors / Lookups / Filters
6. Export flows
7. Webhooks / external callback visibility where surfaced in admin tools
8. Shared infrastructure consumption patterns across pages

Do **not** redesign Super Admin, Clinic Admin, or Doctor business pages here.
Instead, design how shared capabilities should be consumed by those pages.

---

## Product context

This is a **multi-tenant medical CRM / clinic management SaaS** with:

* platform administration
* clinic/branch operations
* patient records
* doctor workflows
* billing/payments
* warehouse/products/suppliers
* source tracking
* files and documents
* auditability
* notifications
* exports
* integrations

Because it is a medical/business platform, the shared layer must support:

* secure document access
* audit visibility
* safe notifications
* powerful but scoped search
* reusable lookups/selectors
* filtered exports
* safe integration monitoring

---

## Required output

Generate a detailed technical blueprint that includes:

1. **Shared capability-by-capability mapping**
2. **Main frontend surfaces that consume each shared capability**
3. **Each shared capability’s main API endpoints**
4. **Database entities involved**
5. **Read models / projection tables recommended**
6. **DTOs used**
7. **Bootstrapping and lazy-loading strategy**
8. **Scope and permission implications**
9. **How to avoid duplication across pages**
10. **Practical frontend consumption recommendations**
11. **Engineering best practices for maintaining the mapping**

Make the output practical and implementation-oriented.

---

# Global mapping rules for shared capabilities

## API conventions

Assume the backend uses:

* REST-style APIs
* `/api/v1/...`
* paginated responses where relevant
* selector/search endpoints
* file/document endpoints
* shared export job endpoints
* notification inbox endpoints
* audit log endpoints
* webhook/admin integration endpoints where needed

## Scope rules

Every shared mapping must explicitly respect:

* platform scope
* clinic scope
* branch scope
* doctor scope
* patient-sensitive record scope
* entity-level document scope
* export and audit restrictions

The mapping must explain whether scope comes from:

* auth context
* requested entity reference
* module ownership
* current clinic/branch context
* role/permission gates

## Data mapping principles

The answer must apply these principles:

* shared capabilities must not leak raw DB schema
* selectors must stay lightweight
* file/document metadata must be separate from binary storage internals
* audit log viewing DTOs must be redacted where needed
* notifications should use inbox-ready DTOs
* exports should use job/result DTOs
* search results should be compact, typed, and permission-aware

---

# 1. Files / Documents mapping

## Frontend surfaces using this capability

Examples:

* Clinic Admin patient detail documents tab
* Doctor patient detail documents tab
* branding/logo upload in settings
* invoice PDF previews/downloads
* supplier-related files if supported
* future clinic/branch documents

## Goal

Map how frontend pages should consume:

* file upload
* file listing
* file preview/download
* file attachment to entities
* file metadata display

## Required mapping output

For this capability, define:

### A. Main endpoints

Examples:

* initiate upload / upload metadata
* finalize attachment
* list files by entity
* get file metadata
* get secure view/download link
* archive/delete file if allowed

### B. Database entities involved

Examples:

* file metadata entity
* file-to-entity link
* patient document metadata
* branding asset reference
* invoice PDF reference
* audit event on file access

### C. Recommended projections

Define whether file listing on pages should use:

* direct metadata query
* entity file-list projection
* secure file-access projection

### D. DTOs

Define:

* file metadata DTO
* entity file list item DTO
* file upload request DTO
* finalize attachment DTO
* secure link DTO
* file preview DTO

### E. Per-page consumption examples

Explain how these pages should consume file APIs differently:

* patient documents tab
* branding asset upload
* invoice PDF view/download
* supplier file list if supported

### F. Frontend consumption guidance

Explain how to:

* separate upload flow from final entity attachment
* lazy load files per tab
* handle secure download URLs
* avoid exposing raw storage info

---

# 2. Audit Logs mapping

## Frontend surfaces using this capability

Examples:

* Super Admin Settings → Audit Logs
* possible Clinic Admin limited audit viewer
* export audit logs
* future security/admin tooling

## Goal

Map how admin pages should consume:

* audit log list
* filters
* detail preview if needed
* export flows

## Required mapping output

For this capability, define:

### A. Main endpoints

Examples:

* list audit logs
* get audit log detail
* export audit logs
* audit filter metadata if useful

### B. Database entities involved

Examples:

* audit log entity/event store
* actor reference
* clinic/branch scope fields
* entity type/id references
* result/status fields

### C. Recommended projections

Define whether audit list pages should use:

* direct indexed audit table
* audit search projection
* redacted audit view projection

### D. DTOs

Define:

* audit list row DTO
* audit detail DTO
* audit export job DTO
* audit filter option DTO if useful

### E. Frontend surface mapping

Explain consumption for:

* paginated audit table
* filter/search toolbar
* export action
* optional detail drawer/modal

### F. Frontend consumption guidance

Explain how to:

* lazy load details
* preserve filter state
* use export jobs for large result sets
* handle restricted/redacted fields safely

---

# 3. Notifications mapping

## Frontend surfaces using this capability

Examples:

* top header notification icon in Super Admin layout
* top header notification icon in Clinic Admin layout
* top header notification icon in Doctor layout
* unread badge counters
* mark-as-read actions
* future admin broadcast UI if supported

## Goal

Map how frontend layouts and pages should consume:

* notification list
* unread count
* mark as read
* mark all as read
* notification action links

## Required mapping output

For this capability, define:

### A. Main endpoints

Examples:

* list my notifications
* get unread count
* mark one as read
* mark all as read
* optional send/broadcast admin endpoint if surfaced in settings/admin tools

### B. Database entities involved

Examples:

* notification entity
* notification delivery status
* user-notification link
* optional notification template entity

### C. Recommended projections

Define whether notification UI should use:

* notification inbox projection
* unread count projection
* action link projection

### D. DTOs

Define:

* notification list item DTO
* unread count DTO
* mark-as-read action result DTO
* optional broadcast request DTO if applicable

### E. Frontend surface mapping

Explain consumption for:

* header dropdown preview
* full notifications drawer/dropdown
* unread badge
* deep links into module pages

### F. Frontend consumption guidance

Explain how layouts should load notifications efficiently across roles.

---

# 4. Global Search mapping

## Frontend surfaces using this capability

Examples:

* Super Admin top header global search
* Clinic Admin top header search
* Doctor top header search
* modal/entity pickers
* command-palette style search if added later

## Goal

Map how frontend search surfaces should consume:

* global search
* scoped search
* grouped search results
* lightweight selector results

## Required mapping output

For this capability, define:

### A. Main endpoints

Examples:

* global search endpoint
* scoped entity search endpoints
* lightweight selector endpoints

### B. Database entities involved

Examples:

* patients
* doctors
* clinics
* branches
* suppliers
* products
* invoices
* services
* sources

Explain which are direct search targets and which may need projections.

### C. Recommended projections

Define whether search should use:

* direct indexed queries
* search projection/index table
* lightweight entity selector views

### D. DTOs

Define:

* grouped global search result DTO
* compact entity result DTO
* selector option DTO
* search metadata DTO if useful

### E. Per-role/frontend surface mapping

Explain how:

* Super Admin global search
* Clinic Admin scoped search
* Doctor scoped search
  should differ in consumed results and scope filtering.

### F. Frontend consumption guidance

Explain:

* typeahead behavior
* debounce/search timing expectations
* grouped result rendering
* selector caching vs fresh search

---

# 5. Shared Selectors / Lookups / Filters mapping

## Frontend surfaces using this capability

Used across many pages:

* patient selector
* doctor selector
* service selector
* product selector
* supplier selector
* clinic selector
* branch selector
* role selector
* status lists
* source type lists
* room type lists
* payment method/provider lists

## Goal

Map how forms and filters across the product should consume:

* lightweight options
* searchable selectors
* enum/config lookups
* scoped filter metadata

## Required mapping output

For this capability, define:

### A. Main endpoints

Examples:

* grouped lookup catalog
* entity selector endpoints
* enum/config endpoints
* filter metadata endpoints for pages if useful

### B. Database entities involved

Examples:

* patients
* doctors
* services
* products
* suppliers
* clinics
* branches
* roles
* settings/config catalogs

### C. Recommended projections

Define whether lookups should use:

* lightweight selector projection
* enum/config static map
* page-specific lookup projections

### D. DTOs

Define:

* generic selector option DTO
* grouped lookup DTO
* page filter metadata DTO
* enum option DTO

### E. Per-page/frontend mapping examples

Explain how selectors should be consumed for:

* create invoice
* assign doctor
* create encounter
* link supplier products
* service-doctor assignment
* room-service assignment

### F. Frontend consumption guidance

Explain what should be cached globally vs page-locally.

---

# 6. Export mapping

## Frontend surfaces using this capability

Examples:

* clinics page export
* branches page export
* users page export
* patients page export
* doctors page export
* invoices export
* audit log export
* sources export
* warehouse low-stock export

## Goal

Map how pages should consume:

* export request
* export job status
* export result download

## Required mapping output

For this capability, define:

### A. Main endpoints

Examples:

* create export job
* get export job status
* get export result/download
* list my export jobs if useful

### B. Database entities involved

Examples:

* export job entity
* export file result metadata
* source module projections queried by export builder

### C. Recommended projections

Explain whether exports should read from:

* same list projections used by UI
* dedicated export projections
* background query pipeline

### D. DTOs

Define:

* export request DTO
* export job DTO
* export result DTO
* export history row DTO if used

### E. Per-page/frontend mapping examples

Explain how a page like:

* patients list
* invoices list
* audit logs
  should submit current filters into export jobs.

### F. Frontend consumption guidance

Explain:

* async export UX
* showing job progress/toasts
* download link expiry handling
* keeping export filters aligned with current table filters

---

# 7. Webhooks / external callback visibility mapping

## Frontend surfaces using this capability

Possible surfaces:

* Super Admin settings/integrations view
* payment integration diagnostics
* webhook event logs if shown
* integration health/connection testing panels

## Goal

Map how admin-facing pages should consume limited webhook/integration visibility, not the raw processing internals.

## Required mapping output

For this capability, define:

### A. Main endpoints

Examples:

* integration status view
* webhook event log list if exposed
* webhook processing status detail if exposed
* connection test result endpoints

### B. Database entities involved

Examples:

* webhook event log
* integration config
* provider processing state
* retry/result metadata

### C. Recommended projections

Define whether admin UI should use:

* integration health projection
* webhook event summary projection
* provider error summary projection

### D. DTOs

Define:

* integration status DTO
* webhook event row DTO
* webhook event detail DTO
* connection test result DTO

### E. Frontend consumption guidance

Explain how to keep this operational and safe without exposing sensitive raw payloads unnecessarily.

---

# 8. Shared infrastructure consumption patterns across pages

## Goal

Explain how business pages should reuse shared capabilities cleanly.

The final output must define patterns for:

* page + documents tab
* page + notifications badge
* page + export button
* page + lookup selectors
* page + global search
* page + audit-view/admin security tools
* page + file upload modal
* page + async export status handling

### Required output

Define reusable consumption patterns such as:

* a page with one main query + one shared lookup query + one shared export action
* a detail page with lazy-loaded files tab
* a list page with shared selector filters
* a layout with notifications and global search loaded independently
* an admin settings page with audit/export/integration tools loaded lazily

Explain what should be:

* page-owned
* shared-hook/service-owned
* layout-owned
* modal-owned

---

# Page bootstrapping strategy for shared capabilities

## Goal

Define a clean bootstrapping plan for shared capabilities in frontend apps.

For each shared capability, explain:

* what should load globally in layout
* what should load only when page needs it
* what should load only when modal opens
* what should be cached
* what should always re-fetch fresh

Examples:

* unread notification count in layout
* global search only on interaction
* patient documents only when tab opens
* export jobs on demand
* lookup data cached per scope

---

# Eager vs lazy loading rules

## Goal

Explain capability-by-capability:

* what should be eager
* what should be lazy
* what should be background-prefetched
* what must never block first render unnecessarily

Examples:

* notifications badge eager
* notification list lazy on dropdown open
* file tab lazy
* export polling only after user starts export
* global search lazy on input
* audit detail lazy on row click

---

# Projection and aggregation strategy

## Goal

For each shared capability, state clearly whether it should use:

* direct normalized reads
* specialized projections
* inbox/search/export/job projections
* integration/webhook summary projections

This section should explicitly resolve:

* file list views
* audit tables
* unread counts
* notification inbox previews
* search result groups
* selector datasets
* export job histories
* webhook event summaries

---

# Performance and query-boundary rules

## Goal

Prevent slow shared APIs.

For each shared capability, explain:

* what must stay lightweight
* what should be indexed heavily
* what should use background jobs
* what should never return huge payloads inline
* what should use summary rows instead of raw event logs
* what should be rate-limited or paginated aggressively

Be practical and explicit.

---

# Frontend consumption recommendations

## Goal

Help frontend teams consume shared capabilities cleanly.

For each shared capability, explain:

* preferred query strategy
* how to structure shared hooks/services
* how to handle caching
* how to handle scope changes
* how to avoid duplicated mapping logic across pages
* how to keep shared contracts stable

Make it useful for:

* Super Admin frontend
* Clinic Admin frontend
* Doctor frontend

---

# Engineering best practices

## Goal

Provide implementation guidance for backend teams.

Include recommendations for:

* shared DTO naming
* selector DTO standardization
* file metadata DTO stability
* export job contract stability
* notification DTO stability
* audit redaction policy
* search result grouping rules
* page-module docs for shared capability reuse
* contract tests for shared infrastructure APIs

---

# Extra requirement: concrete examples

The final output must include at least one concrete mapping example for each of these shared capabilities:

1. Files/Documents
2. Audit Logs
3. Notifications
4. Global Search
5. Shared Selectors/Lookups
6. Export
7. Webhook/Admin integration visibility

For each example, explicitly show:

* frontend surface
* endpoint(s)
* source entities
* projection(s)
* DTO(s)
* why this mapping is correct

---

## Output style requirement

Generate the cross-cutting page-to-API mapping as a **clear structured technical blueprint** that developers can directly use to implement backend/frontend integration.

The answer should be:

* concrete
* practical
* implementation-oriented
* not vague
* not overly theoretical

Avoid generic textbook language.
Make it specific to this **medical CRM / clinic management SaaS**.


