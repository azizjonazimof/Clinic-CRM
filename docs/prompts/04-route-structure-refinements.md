# Route and Structure Refinements

## Corrected Clinic Admin Structure

The Clinic Admin portal must use grouped modules:

- Doctors includes analytics.
- Services includes rooms.
- Warehouse includes products and suppliers.
- Payments includes invoices and create invoice.

## Corrected Routes

Doctors:

- `/clinic-admin/doctors`
- `/clinic-admin/doctors/:doctorId`
- `/clinic-admin/doctors/:doctorId/analytics`

Services:

- `/clinic-admin/services`
- `/clinic-admin/services/rooms`

Warehouse:

- `/clinic-admin/warehouse`
- `/clinic-admin/warehouse/products`
- `/clinic-admin/warehouse/suppliers`
- `/clinic-admin/warehouse/suppliers/:supplierId`

Payments:

- `/clinic-admin/payments`
- `/clinic-admin/payments/invoices`
- `/clinic-admin/payments/invoices/create`

## Frontend Behavior

- Sidebar parent groups should expand when a child route is active.
- Breadcrumbs should reflect grouped hierarchy.
- Page titles should match the active route.
- Keep all future nested routes compatible with these groups.

## API Behavior

Frontend grouping does not require API paths to mirror every route exactly. Backend paths should stay domain-oriented:

- Services and rooms can be separate backend resources.
- Products and suppliers can be separate backend resources.
- Payments and invoices can be separate backend resources.

## Implementation Rule

When regenerating prompts or code, always use this corrected grouped structure instead of flat Clinic Admin navigation.

