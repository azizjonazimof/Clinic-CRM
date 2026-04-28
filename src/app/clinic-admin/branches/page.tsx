import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function ClinicBranchesPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const branches = await prisma.branch.findMany({
    where: { clinicId },
    include: {
      _count: {
        select: { doctors: true, patients: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const rows = branches.map(b => ({
    id: b.id,
    name: b.name,
    address: b.address,
    doctors: b._count.doctors.toString(),
    patients: b._count.patients.toString(),
    status: b.status
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Clinic Branches"
      description="Manage your clinic's physical locations and branch-specific settings."
      metrics={[
        { label: "Total Branches", value: branches.length.toString(), tone: "neutral" }
      ]}
      table={{
        title: "Branch Locations",
        actionLabel: "Add Branch",
        createEndpoint: "/api/resources/branches",
        createFields: [
          { name: "name", label: "Branch Name" },
          { name: "address", label: "Address" },
          { name: "city", label: "City" }
        ],
        columns: [
          { key: "name", label: "Branch Name" },
          { key: "address", label: "Address" },
          { key: "doctors", label: "Doctors" },
          { key: "patients", label: "Patients" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
