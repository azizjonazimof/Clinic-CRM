import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function SuperAdminDashboardPage() {
  const user = await getCurrentUser();
  
  const [clinics, users, appointments] = await Promise.all([
    prisma.clinic.findMany({
      take: 10,
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count(),
    prisma.appointment.count()
  ]);

  const rows = clinics.map(c => ({
    id: c.id,
    name: c.name,
    owner: "N/A", // Owner logic could be added later
    region: c.region || "Tashkent",
    branches: "1", // Simplified
    status: c.status
  }));

  const metrics = [
    { label: "Total Clinics", value: clinics.length.toString(), tone: "neutral" },
    { label: "Platform Users", value: users.toString(), tone: "success" },
    { label: "Total Appointments", value: appointments.toString(), tone: "neutral" }
  ];

  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="Platform Dashboard"
      description="Platform-wide clinic, branch, user, and revenue overview."
      metrics={metrics}
      filters={["Clinic status"]}
      table={{
        title: "Recent Clinics",
        columns: [
          { key: "name", label: "Clinic" },
          { key: "owner", label: "Owner" },
          { key: "region", label: "Region" },
          { key: "branches", label: "Branches" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
