import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function DoctorPerformancePage() {
  const user = await getCurrentUser();
  
  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
    include: {
      encounters: {
        include: { patient: true },
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!doctor) return <div>Doctor profile not found</div>;

  const rows = doctor.encounters.map(e => ({
    id: e.id,
    date: e.createdAt.toLocaleDateString(),
    patient: `${e.patient.firstName} ${e.patient.lastName}`,
    type: e.encounterType,
    status: e.status
  }));

  return (
    <ResourcePage
      role="DOCTOR"
      title="Performance Metrics"
      description="Overview of your clinical activity and productivity."
      metrics={[
        { label: "Total Encounters", value: doctor.encounters.length.toString(), tone: "neutral" }
      ]}
      table={{
        title: "Recent Clinical Activity",
        columns: [
          { key: "date", label: "Date" },
          { key: "patient", label: "Patient" },
          { key: "type", label: "Type" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
