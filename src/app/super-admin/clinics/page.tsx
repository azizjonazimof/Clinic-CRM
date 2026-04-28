import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function SuperAdminClinicsPage() {
  const user = await getCurrentUser();
  
  const clinics = await prisma.clinic.findMany({
    orderBy: { createdAt: "desc" }
  });

  const rows = clinics.map(c => ({
    id: c.id,
    name: c.name,
    legalName: c.legalName || "N/A",
    phone: c.phone || "N/A",
    email: c.email || "N/A",
    status: c.status
  }));

  return (
    <ResourcePage
      role="SUPER_ADMIN"
      title="Clinics"
      description="Manage all medical organizations and clinic instances."
      metrics={[
        { label: "Total Clinics", value: clinics.length.toString(), tone: "neutral" }
      ]}
      table={{
        title: "Global Organizations",
        actionLabel: "Add Clinic",
        createEndpoint: "/api/resources/clinics",
        createFields: [
          { name: "name", label: "Clinic Name" },
          { name: "legalName", label: "Legal Entity Name" },
          { name: "email", label: "Contact Email" },
          { name: "phone", label: "Phone" },
          { name: "status", label: "Status", options: ["ACTIVE", "INACTIVE", "SUSPENDED"] }
        ],
        columns: [
          { key: "name", label: "Clinic" },
          { key: "legalName", label: "Legal Name" },
          { key: "phone", label: "Phone" },
          { key: "email", label: "Email" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
