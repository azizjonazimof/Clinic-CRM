import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function SuperAdminAnalyticsPage() {
  const user = await getCurrentUser();
  
  const clinics = await prisma.clinic.findMany({
    include: {
      _count: {
        select: { patients: true, invoices: true }
      }
    }
  });

  const rows = clinics.map(c => ({
    id: c.id,
    name: c.name,
    patients: c._count.patients.toString(),
    invoices: c._count.invoices.toString(),
    status: c.status
  }));

  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="Platform Analytics"
      description="Detailed performance data across all clinic instances."
      metrics={[
        { label: "Growth Rate", value: "0%", tone: "neutral" }
      ]}
      table={{
        title: "Clinic Performance Overview",
        columns: [
          { key: "name", label: "Clinic" },
          { key: "patients", label: "Total Patients" },
          { key: "invoices", label: "Invoices Issued" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
