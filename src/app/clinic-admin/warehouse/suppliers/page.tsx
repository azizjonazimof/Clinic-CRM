import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function SuppliersPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const suppliers = await prisma.supplier.findMany({
    where: { organizationId: clinicId },
    include: {
      _count: {
        select: { products: true }
      }
    },
    orderBy: { name: "asc" }
  });

  const rows = suppliers.map(s => ({
    id: s.id,
    name: s.name,
    phone: s.phone || "N/A",
    products: s._count.products.toString(),
    balance: "0 UZS", // TODO: Implement supplier balance
    status: s.status
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Suppliers"
      description="Manage medical suppliers and procurement relations."
      metrics={[
        { label: "Active Suppliers", value: suppliers.length.toString(), tone: "neutral" }
      ]}
      filters={["Status"]}
      table={{
        title: "Supplier Directory",
        actionLabel: "Add Supplier",
        createEndpoint: "/api/resources/suppliers",
        createFields: [
          { name: "name", label: "Supplier Name" },
          { name: "phone", label: "Contact Phone" },
          { name: "email", label: "Email Address" },
          { name: "address", label: "Address" }
        ],
        columns: [
          { key: "name", label: "Name" },
          { key: "phone", label: "Phone" },
          { key: "products", label: "Products" },
          { key: "balance", label: "Balance" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
