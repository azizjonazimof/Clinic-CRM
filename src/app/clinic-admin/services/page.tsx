import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function ServicesPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const services = await prisma.service.findMany({
    where: { organizationId: clinicId },
    include: { category: true },
    orderBy: { name: "asc" }
  });

  const rows = services.map(s => ({
    id: s.id,
    name: s.name,
    category: s.category?.name || "General",
    price: `${s.basePrice.toString()} UZS`,
    duration: `${s.durationMinutes || 0} min`,
    status: s.isActive ? "ACTIVE" : "INACTIVE"
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Medical Services"
      description="Manage procedures, consultations, and pricing."
      metrics={[
        { label: "Total Services", value: services.length.toString(), tone: "neutral" }
      ]}
      filters={["Category", "Status"]}
      table={{
        title: "Service Menu",
        actionLabel: "Add Service",
        createEndpoint: "/api/resources/services",
        createFields: [
          { name: "name", label: "Service Name" },
          { name: "basePrice", label: "Base Price", type: "number" },
          { name: "durationMinutes", label: "Duration (min)", type: "number" }
        ],
        columns: [
          { key: "name", label: "Service" },
          { key: "category", label: "Category" },
          { key: "price", label: "Price" },
          { key: "duration", label: "Duration" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
