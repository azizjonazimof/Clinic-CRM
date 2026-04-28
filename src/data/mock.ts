import type {
  BranchListItem,
  ClinicListItem,
  DoctorListItem,
  InvoiceListItem,
  MetricCard,
  PatientListItem,
  PaymentListItem,
  ProductListItem,
  RoomListItem,
  ServiceListItem,
  SourceListItem,
  SupplierListItem,
  UserListItem
} from "@/types/domain";

export const metrics: MetricCard[] = [
  { label: "Patients", value: "1,284", delta: "+12%", tone: "success" },
  { label: "Revenue", value: "$84,920", delta: "+8%", tone: "success" },
  { label: "Open invoices", value: "146", delta: "23 due", tone: "warning" },
  { label: "Low stock", value: "18", delta: "needs review", tone: "danger" }
];

export const clinics: ClinicListItem[] = [
  {
    id: "clinic-1",
    name: "Central Medical Group",
    owner: "Madina Karimova",
    region: "Tashkent",
    branches: 3,
    users: 42,
    status: "ACTIVE",
    createdAt: "2026-01-12"
  },
  {
    id: "clinic-2",
    name: "Samarqand Health",
    owner: "Aziz Rahmonov",
    region: "Samarqand",
    branches: 2,
    users: 19,
    status: "ACTIVE",
    createdAt: "2026-02-03"
  }
];

export const branches: BranchListItem[] = [
  {
    id: "branch-1",
    clinic: "Central Medical Group",
    name: "Yunusabad Branch",
    address: "18 Amir Temur Ave",
    doctors: 16,
    patients: 612,
    rooms: 12,
    status: "ACTIVE"
  },
  {
    id: "branch-2",
    clinic: "Central Medical Group",
    name: "Chilonzor Branch",
    address: "42 Bunyodkor St",
    doctors: 11,
    patients: 398,
    rooms: 8,
    status: "ACTIVE"
  }
];

export const users: UserListItem[] = [
  {
    id: "user-1",
    name: "Madina Karimova",
    email: "madina@centralmed.local",
    role: "CLINIC_ADMIN",
    clinicScope: "Central Medical Group",
    branchScope: "All branches",
    status: "ACTIVE",
    lastLogin: "Today"
  },
  {
    id: "user-2",
    name: "Dr. Bekzod Aliyev",
    email: "bekzod@centralmed.local",
    role: "DOCTOR",
    clinicScope: "Central Medical Group",
    branchScope: "Yunusabad Branch",
    status: "ACTIVE",
    lastLogin: "Yesterday"
  }
];

export const patients: PatientListItem[] = [
  {
    id: "demo-patient",
    name: "Dilnoza Akhmedova",
    phone: "+998 90 123 45 67",
    branch: "Yunusabad Branch",
    assignedDoctor: "Dr. Bekzod Aliyev",
    lastVisit: "2026-04-26",
    source: "Instagram",
    status: "ACTIVE",
    balance: "$120"
  },
  {
    id: "patient-2",
    name: "Rustam Saidov",
    phone: "+998 91 456 78 90",
    branch: "Chilonzor Branch",
    assignedDoctor: "Dr. Nargiza Umarova",
    lastVisit: "2026-04-24",
    source: "Referral",
    status: "ACTIVE",
    balance: "$0"
  }
];

export const doctors: DoctorListItem[] = [
  {
    id: "demo-doctor",
    name: "Dr. Bekzod Aliyev",
    specialty: "Cardiology",
    branch: "Yunusabad Branch",
    activePatients: 128,
    consultations: 342,
    status: "ACTIVE"
  },
  {
    id: "doctor-2",
    name: "Dr. Nargiza Umarova",
    specialty: "Dermatology",
    branch: "Chilonzor Branch",
    activePatients: 96,
    consultations: 211,
    status: "ACTIVE"
  }
];

export const services: ServiceListItem[] = [
  {
    id: "service-1",
    name: "Primary Consultation",
    category: "Consultation",
    price: "$35",
    duration: "30 min",
    branch: "All branches",
    status: "ACTIVE"
  },
  {
    id: "service-2",
    name: "ECG",
    category: "Diagnostics",
    price: "$18",
    duration: "15 min",
    branch: "Yunusabad Branch",
    status: "ACTIVE"
  }
];

export const rooms: RoomListItem[] = [
  {
    id: "room-1",
    branch: "Yunusabad Branch",
    name: "Room 204",
    type: "Consultation",
    services: "Primary Consultation, ECG",
    status: "ACTIVE"
  }
];

export const products: ProductListItem[] = [
  {
    id: "product-1",
    sku: "MED-GLV-001",
    name: "Nitrile Gloves",
    category: "Consumables",
    unit: "box",
    stock: "38",
    threshold: "25",
    supplier: "MedSupply UZ",
    status: "ACTIVE"
  },
  {
    id: "product-2",
    sku: "MED-SYR-005",
    name: "5ml Syringes",
    category: "Consumables",
    unit: "pack",
    stock: "12",
    threshold: "20",
    supplier: "Prime Pharma",
    status: "ACTIVE"
  }
];

export const suppliers: SupplierListItem[] = [
  {
    id: "demo-supplier",
    name: "MedSupply UZ",
    phone: "+998 71 200 11 22",
    products: 24,
    balance: "$1,240",
    status: "ACTIVE"
  }
];

export const payments: PaymentListItem[] = [
  {
    id: "payment-1",
    patient: "Dilnoza Akhmedova",
    invoice: "INV-2026-0042",
    amount: "$80",
    method: "CARD",
    date: "2026-04-26",
    status: "COMPLETED",
    branch: "Yunusabad Branch"
  }
];

export const invoices: InvoiceListItem[] = [
  {
    id: "invoice-1",
    number: "INV-2026-0042",
    patient: "Dilnoza Akhmedova",
    doctor: "Dr. Bekzod Aliyev",
    branch: "Yunusabad Branch",
    total: "$200",
    paid: "$80",
    due: "$120",
    status: "PARTIALLY_PAID",
    createdAt: "2026-04-26"
  }
];

export const sources: SourceListItem[] = [
  {
    id: "source-1",
    name: "Instagram",
    type: "Social",
    patients: 218,
    revenue: "$18,400",
    status: "ACTIVE"
  },
  {
    id: "source-2",
    name: "Referral",
    type: "Word of mouth",
    patients: 164,
    revenue: "$22,100",
    status: "ACTIVE"
  }
];

