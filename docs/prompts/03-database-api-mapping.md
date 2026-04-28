# Database-to-API Mapping Prompts

## Mapping Foundation

Define database entities, API DTOs, and read models around the page needs. Use normalized tables for core transactions and page-specific projections for dashboards, analytics, and tables.

Core entities:

- User
- Clinic
- Branch
- UserClinicAssignment
- UserBranchAssignment
- Patient
- DoctorProfile
- Consultation
- Service
- Room
- Product
- StockMovement
- Supplier
- SupplierProduct
- Invoice
- InvoiceItem
- Payment
- Source
- AuditLog

## Super Admin Page Mapping

### Dashboard

- Entities: Clinic, Branch, User, Patient, Invoice, Payment, Consultation.
- Projection: platform dashboard metrics.
- Eager load only aggregate counts and recent activity.

### Clinics

- Entities: Clinic, Branch, UserClinicAssignment.
- DTO: clinic list item with branch count, user count, status, owner/admin.
- Lazy load full clinic details.

### Branches

- Entities: Branch, Clinic, DoctorProfile, Patient, Room.
- DTO: branch list item with clinic name and operational counts.

### Users

- Entities: User, UserClinicAssignment, UserBranchAssignment, Clinic, Branch.
- DTO: user list item with role and scope summaries.

### Analytics

- Entities: Invoice, Payment, Consultation, Patient, Clinic, Branch.
- Projection: analytics time-series and rankings.

## Clinic Admin Page Mapping

### Dashboard

- Entities: Patient, DoctorProfile, Invoice, Payment, Product, StockMovement, Source.
- Projection: clinic dashboard metrics scoped to clinic and branch filter.

### Branch Details

- Entities: Branch, DoctorProfile, Room, Service, Patient.
- Eager load branch profile and summary counts.
- Lazy load related tables when sections open if data is large.

### Patients and Patient Detail

- Entities: Patient, DoctorProfile, Branch, Source, Consultation, Invoice, Payment, StockMovement.
- List DTO: patient summary.
- Detail DTO: patient profile plus latest consultations, invoices, payments, goods usage.
- Lazy load files, full notes, and long histories.

### Doctors, Doctor Detail, Doctor Analytics

- Entities: User, DoctorProfile, Branch, Consultation, Patient, Service, Invoice, InvoiceItem, StockMovement.
- List DTO: doctor summary.
- Detail DTO: doctor profile, assignments, services, recent activity.
- Analytics projection: performance metrics by date and branch.

### Services and Rooms

- Entities: Service, Room, Branch.
- DTOs: service list item, room list item.
- Support branch availability and active/inactive state.

### Warehouse, Products, Suppliers

- Entities: Product, StockMovement, Supplier, SupplierProduct, Branch.
- Warehouse projection: low stock, expiring products, recent movements.
- Product DTO: SKU, stock, unit, threshold, supplier summary.
- Supplier detail DTO: supplier profile, products, purchases/payments summary.

### Payments, Invoices, Create Invoice

- Entities: Invoice, InvoiceItem, Payment, Patient, DoctorProfile, Branch, Service, Product.
- Invoice create needs patient, branch, doctor, services, products, totals.
- Invoice list should not eagerly load full item details unless requested.

### Sources

- Entities: Source, Patient, Invoice, Payment.
- DTO: source performance summary with patient count and revenue.

## Doctor Page Mapping

### Dashboard

- Entities: Consultation, Patient, DoctorProfile, StockMovement, InvoiceItem if revenue is allowed.
- Projection: doctor daily summary.

### My Patients and Patient Detail

- Entities: Patient, Consultation, DoctorProfile.
- Scope: assigned patients or patients with doctor consultations.
- Hide fields outside doctor permission scope.

### Add Consultation

- Entities: Consultation, Patient, Service, Product, StockMovement.
- Must validate patient access and branch stock availability.

### Goods Usage

- Entities: StockMovement, Product, Consultation, Patient.
- Scope to logged-in doctor.

### My Performance

- Entities: Consultation, Patient, Service, StockMovement, InvoiceItem.
- Projection: doctor performance metrics.

## Loading Rules

- Eager load small lookup data needed to render forms.
- Lazy load long histories, analytics details, audit logs, and heavy related collections.
- Use read models for dashboards and analytics.
- Use cursor or page pagination for high-volume tables.

