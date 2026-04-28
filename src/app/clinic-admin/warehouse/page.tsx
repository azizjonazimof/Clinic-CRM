import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function WarehouseDashboardPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const [products, stockMovements] = await Promise.all([
    prisma.product.findMany({
      where: { organizationId: clinicId },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.stockMovement.findMany({
      where: { branch: { clinicId } },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  const rows = stockMovements.map(m => ({
    id: m.id,
    date: m.createdAt.toLocaleDateString(),
    product: m.product.name,
    quantity: m.quantity.toString(),
    type: m.type,
    note: m.note || "N/A"
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Warehouse Dashboard"
      description="Overall inventory status, stock movements, and alerts."
      metrics={[
        { label: "Critical Stock", value: "0", tone: "danger" }
      ]}
      filters={["Today", "Branch"]}
      table={{
        title: "Recent Stock Movements",
        columns: [
          { key: "date", label: "Date" },
          { key: "product", label: "Product" },
          { key: "quantity", label: "Qty" },
          { key: "type", label: "Type" },
          { key: "note", label: "Note" }
        ],
        rows: rows
      }}
    />
  );
}
