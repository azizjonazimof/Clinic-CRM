import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ doctorId: string }>;
};

export default async function DoctorDetailPage({ params }: Context) {
  const { doctorId } = await params;
  const user = await getCurrentUser();

  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: {
      staffProfile: true,
      patients: {
        include: { source: true },
        take: 20,
        orderBy: { updatedAt: "desc" }
      },
      _count: {
        select: { patients: true, encounters: true }
      }
    }
  });

  if (!doctor) return <div>Doctor not found</div>;

  const rows = doctor.patients.map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    phone: p.phone,
    lastVisit: p.updatedAt.toLocaleDateString(),
    status: p.status,
    balance: "0 UZS"
  }));

  const metrics = [
    { label: "Active Patients", value: doctor._count.patients.toString(), tone: "neutral" },
    { label: "Total Encounters", value: doctor._count.encounters.toString(), tone: "neutral" }
  ];

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title={`Dr. ${doctor.staffProfile.firstName} ${doctor.staffProfile.lastName}`}
      description={`Specialty: ${doctor.specialty}. Viewing assigned patients and clinical history.`}
      metrics={metrics}
      filters={["Status"]}
      table={{
        title: "Assigned Patients",
        columns: [
          { key: "name", label: "Patient" },
          { key: "phone", label: "Phone" },
          { key: "lastVisit", label: "Last visit" },
          { key: "status", label: "Status" },
          { key: "balance", label: "Balance" }
        ],
        rows: rows
      }}
    />
  );
}
