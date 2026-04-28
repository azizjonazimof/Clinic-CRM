import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ branchId: string }>;
};

export default async function BranchDetailPage({ params }: Context) {
  const { branchId } = await params;
  
  const branch = await prisma.branch.findUnique({
    where: { id: branchId },
    include: {
      doctors: {
        include: { staffProfile: true }
      },
      _count: {
        select: { patients: true, rooms: true }
      }
    }
  });

  if (!branch) return <div>Branch not found</div>;

  const rows = branch.doctors.map(d => ({
    id: d.id,
    name: `${d.staffProfile.firstName} ${d.staffProfile.lastName}`,
    specialty: d.specialty,
    status: d.status
  }));

  const metrics = [
    { label: "Total Patients", value: branch._count.patients.toString(), tone: "neutral" },
    { label: "Total Rooms", value: branch._count.rooms.toString(), tone: "neutral" }
  ];

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title={`Branch: ${branch.name}`}
      description={`Location: ${branch.address}. Viewing staff roster and branch metrics.`}
      metrics={metrics}
      table={{
        title: "Medical Staff",
        columns: [
          { key: "name", label: "Doctor" },
          { key: "specialty", label: "Specialty" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
