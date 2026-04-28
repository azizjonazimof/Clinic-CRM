import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function DoctorDashboardPage() {
  const user = await getCurrentUser();
  
  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
    include: {
      patients: {
        include: { source: true },
        take: 10,
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  if (!doctor) {
    return <div>Doctor profile not found. Please contact admin.</div>;
  }

  const rows = doctor.patients.map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    phone: p.phone,
    lastVisit: p.updatedAt.toLocaleDateString(),
    status: p.status
  }));

  const metrics = [
    { label: "My Patients", value: doctor.patients.length.toString(), tone: "neutral" },
    { label: "New Messages", value: "0", tone: "success" }
  ];

  return (
    <ResourcePage
      role="DOCTOR"
      title="Doctor Dashboard"
      description="Daily work, assigned patients, and clinical tasks."
      metrics={metrics}
      filters={["Status"]}
      table={{
        title: "Assigned Patients",
        columns: [
          { key: "name", label: "Patient" },
          { key: "phone", label: "Phone" },
          { key: "lastVisit", label: "Last activity" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
