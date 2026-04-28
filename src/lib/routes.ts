export const routes = {
  auth: {
    login: "/login",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password"
  },
  superAdmin: {
    dashboard: "/super-admin/dashboard",
    clinics: "/super-admin/clinics",
    branches: "/super-admin/branches",
    users: "/super-admin/users",
    analytics: "/super-admin/analytics",
    settings: "/super-admin/settings"
  },
  clinicAdmin: {
    dashboard: "/clinic-admin/dashboard",
    branches: "/clinic-admin/branches",
    patients: "/clinic-admin/patients",
    doctors: "/clinic-admin/doctors",
    services: "/clinic-admin/services",
    rooms: "/clinic-admin/services/rooms",
    warehouse: "/clinic-admin/warehouse",
    products: "/clinic-admin/warehouse/products",
    suppliers: "/clinic-admin/warehouse/suppliers",
    payments: "/clinic-admin/payments",
    invoices: "/clinic-admin/payments/invoices",
    createInvoice: "/clinic-admin/payments/invoices/create",
    sources: "/clinic-admin/sources"
  },
  doctor: {
    dashboard: "/doctor/dashboard",
    patients: "/doctor/patients",
    addConsultation: "/doctor/consultations/create",
    goodsUsage: "/doctor/goods-usage",
    performance: "/doctor/performance"
  }
} as const;

