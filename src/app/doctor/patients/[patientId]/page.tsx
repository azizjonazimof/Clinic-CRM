import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ patientId: string }>;
};

export default async function DoctorPatientDetailPage({ params }: Context) {
  const { patientId } = await params;
  
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      encounters: {
        include: { services: { include: { service: true } } },
        orderBy: { createdAt: "desc" },
        take: 20
      }
    }
  });

  if (!patient) return <div>Patient not found</div>;

  const rows = patient.encounters.map(e => ({
    id: e.id,
    date: e.createdAt.toLocaleDateString(),
    type: e.encounterType,
    diagnosis: e.diagnosisSummary || "N/A",
    status: e.status
  }));

  return (
    <ResourcePage
      role="DOCTOR"
      title={`Clinical Record: ${patient.firstName} ${patient.lastName}`}
      description={`Viewing medical history, diagnosis summaries, and clinical encounters for ${patient.firstName}.`}
      metrics={[
        { label: "Total Visits", value: patient.encounters.length.toString(), tone: "neutral" }
      ]}
      table={{
        title: "Clinical History",
        columns: [
          { key: "date", label: "Date" },
          { key: "type", label: "Type" },
          { key: "diagnosis", label: "Diagnosis Summary" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
