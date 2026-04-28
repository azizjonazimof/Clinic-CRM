import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function DoctorPatientsPage() {
  const user = await getCurrentUser();
  
  const doctor = await prisma.doctorProfile.findUnique({
    where: { userId: user.id },
    include: {
      patients: {
        orderBy: { updatedAt: "desc" }
      }
    }
  });

  if (!doctor) return <div>Doctor profile not found</div>;

  const rows = doctor.patients.map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    phone: p.phone,
    email: p.email || "N/A",
    status: p.status
  }));

  return (
    <ResourcePage
      role="DOCTOR"
      title="My Patients"
      description="List of all patients assigned to your care."
      metrics={[
        { label: "Active Patients", value: doctor.patients.length.toString(), tone: "neutral" }
      ]}
      table={{
        title: "Patient List",
        columns: [
          { key: "name", label: "Patient" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
