export type Role = "SUPER_ADMIN" | "CLINIC_ADMIN" | "DOCTOR";

export type UserStatus = "ACTIVE" | "INVITED" | "SUSPENDED" | "ARCHIVED";
export type EntityStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED";
export type PatientStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER" | "INSURANCE" | "OTHER";

export type ApiResponse<T> = {
  data: T | null;
  meta?: Record<string, unknown>;
  error: null | {
    code: string;
    message: string;
    details?: unknown[];
  };
};

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  permissions: string[];
  clinicIds: string[];
  branchIds: string[];
};

export type MetricCard = {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type TableColumn<T> = {
  key: keyof T | string;
  label: string;
};

export type ListQuery = {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  clinicId?: string;
  branchId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export type ClinicListItem = {
  id: string;
  name: string;
  owner: string;
  region: string;
  branches: number;
  users: number;
  status: EntityStatus;
  createdAt: string;
};

export type BranchListItem = {
  id: string;
  clinic: string;
  name: string;
  address: string;
  doctors: number;
  patients: number;
  rooms: number;
  status: EntityStatus;
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: Role;
  clinicScope: string;
  branchScope: string;
  status: UserStatus;
  lastLogin: string;
};

export type PatientListItem = {
  id: string;
  name: string;
  phone: string;
  branch: string;
  assignedDoctor: string;
  lastVisit: string;
  source: string;
  status: PatientStatus;
  balance: string;
};

export type DoctorListItem = {
  id: string;
  name: string;
  specialty: string;
  branch: string;
  activePatients: number;
  consultations: number;
  status: EntityStatus;
};

export type ServiceListItem = {
  id: string;
  name: string;
  category: string;
  price: string;
  duration: string;
  branch: string;
  status: EntityStatus;
};

export type RoomListItem = {
  id: string;
  branch: string;
  name: string;
  type: string;
  services: string;
  status: EntityStatus;
};

export type ProductListItem = {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  stock: string;
  threshold: string;
  supplier: string;
  status: EntityStatus;
};

export type SupplierListItem = {
  id: string;
  name: string;
  phone: string;
  products: number;
  balance: string;
  status: EntityStatus;
};

export type PaymentListItem = {
  id: string;
  patient: string;
  invoice: string;
  amount: string;
  method: PaymentMethod;
  date: string;
  status: PaymentStatus;
  branch: string;
};

export type InvoiceListItem = {
  id: string;
  number: string;
  patient: string;
  doctor: string;
  branch: string;
  total: string;
  paid: string;
  due: string;
  status: InvoiceStatus;
  createdAt: string;
};

export type SourceListItem = {
  id: string;
  name: string;
  type: string;
  patients: number;
  revenue: string;
  status: EntityStatus;
};

