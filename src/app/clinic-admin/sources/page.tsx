import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function SourcesPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const sources = await prisma.source.findMany({
    where: { organizationId: clinicId },
    include: {
      _count: {
        select: { patients: true }
      }
    },
    orderBy: { name: "asc" }
  });

  const rows = sources.map(s => ({
    id: s.id,
    name: s.name,
    patientCount: s._count.patients.toString(),
    status: s.status
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Patient Sources"
      description="Track where your patients are coming from (e.g., Instagram, Referral, Walk-in)."
      metrics={[
        { label: "Active Sources", value: sources.length.toString(), tone: "neutral" }
      ]}
      filters={["Status"]}
      table={{
        title: "Marketing Channels",
        actionLabel: "Add Source",
        createEndpoint: "/api/resources/sources",
        createFields: [
          { name: "name", label: "Source Name" },
          { name: "type", label: "Category", options: ["Social Media", "Referral", "Partner", "Offline"] }
        ],
        columns: [
          { key: "name", label: "Source" },
          { key: "patientCount", label: "Total Patients" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
