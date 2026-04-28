import Link from "next/link";
import { Activity, BarChart3, Building2, CreditCard, FileText, Home, LockKeyhole, Package, Settings, Stethoscope, Users } from "lucide-react";
import { routes } from "@/lib/routes";
import type { Role } from "@/types/domain";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
};

const nav: Record<Role, NavItem[]> = {
  SUPER_ADMIN: [
    { label: "Dashboard", href: routes.superAdmin.dashboard, icon: Home },
    { label: "Clinics", href: routes.superAdmin.clinics, icon: Building2 },
    { label: "Branches", href: routes.superAdmin.branches, icon: Activity },
    { label: "Users", href: routes.superAdmin.users, icon: Users },
    { label: "Analytics", href: routes.superAdmin.analytics, icon: BarChart3 },
    { label: "Settings", href: routes.superAdmin.settings, icon: Settings }
  ],
  CLINIC_ADMIN: [
    { label: "Dashboard", href: routes.clinicAdmin.dashboard, icon: Home },
    { label: "Branch Details", href: routes.clinicAdmin.branchDetails, icon: Building2 },
    { label: "Patients", href: routes.clinicAdmin.patients, icon: Users },
    {
      label: "Doctors",
      href: routes.clinicAdmin.doctors,
      icon: Stethoscope,
      children: [
        { label: "Doctor List", href: routes.clinicAdmin.doctors },
        { label: "Doctor Detail", href: routes.clinicAdmin.doctorDetail },
        { label: "Doctor Analytics", href: routes.clinicAdmin.doctorAnalytics }
      ]
    },
    {
      label: "Services",
      href: routes.clinicAdmin.services,
      icon: FileText,
      children: [
        { label: "Services", href: routes.clinicAdmin.services },
        { label: "Rooms", href: routes.clinicAdmin.rooms }
      ]
    },
    {
      label: "Warehouse",
      href: routes.clinicAdmin.warehouse,
      icon: Package,
      children: [
        { label: "Overview", href: routes.clinicAdmin.warehouse },
        { label: "Products", href: routes.clinicAdmin.products },
        { label: "Suppliers", href: routes.clinicAdmin.suppliers },
        { label: "Supplier Detail", href: routes.clinicAdmin.supplierDetail }
      ]
    },
    {
      label: "Payments",
      href: routes.clinicAdmin.payments,
      icon: CreditCard,
      children: [
        { label: "Payments", href: routes.clinicAdmin.payments },
        { label: "Invoices", href: routes.clinicAdmin.invoices },
        { label: "Create Invoice", href: routes.clinicAdmin.createInvoice }
      ]
    },
    { label: "Sources", href: routes.clinicAdmin.sources, icon: Activity }
  ],
  DOCTOR: [
    { label: "Dashboard", href: routes.doctor.dashboard, icon: Home },
    { label: "My Patients", href: routes.doctor.patients, icon: Users },
    { label: "Add Consultation", href: routes.doctor.addConsultation, icon: FileText },
    { label: "Goods Usage", href: routes.doctor.goodsUsage, icon: Package },
    { label: "My Performance", href: routes.doctor.performance, icon: BarChart3 }
  ]
};

export function Sidebar({ role }: { role: Role }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white md:block">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
        <LockKeyhole className="h-5 w-5 text-primary-600" />
        <span className="font-semibold text-slate-950">Medical CRM</span>
      </div>
      <nav className="space-y-1 p-3">
        {nav[role].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.href}>
              <Link className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" href={item.href}>
                {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
                {item.label}
              </Link>
              {item.children ? (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link key={child.href} className="block rounded-md px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800" href={child.href}>
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
