import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const products = await prisma.product.findMany({
    where: { organizationId: clinicId },
    include: {
      category: true,
      unit: true,
      suppliers: {
        include: { supplier: true }
      },
      branch: true
    },
    orderBy: { createdAt: "desc" }
  });

  const rows = products.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category?.name || "Uncategorized",
    unit: p.unit?.name || "N/A",
    stock: "0", // TODO: Aggregate from InventoryBatch
    threshold: p.minStockLevel.toString(),
    supplier: p.suppliers[0]?.supplier.name || "N/A",
    status: p.isActive ? "ACTIVE" : "INACTIVE"
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Inventory Products"
      description="Manage warehouse products and inventory levels."
      metrics={[
        { label: "Total Items", value: products.length.toString(), tone: "neutral" },
        { label: "Low Stock", value: "0", tone: "danger" }
      ]}
      filters={["Branch", "Category", "Supplier"]}
      table={{
        title: "Product Catalog",
        actionLabel: "Add Product",
        createEndpoint: "/api/resources/products",
        createFields: [
          { name: "name", label: "Product Name" },
          { name: "sku", label: "SKU / Code" },
          { name: "productType", label: "Type", options: ["consumable", "medication", "equipment"] },
          { name: "purchasePrice", label: "Purchase Price", type: "number" }
        ],
        columns: [
          { key: "sku", label: "SKU" },
          { key: "name", label: "Name" },
          { key: "category", label: "Category" },
          { key: "unit", label: "Unit" },
          { key: "stock", label: "Stock" },
          { key: "threshold", label: "Threshold" },
          { key: "supplier", label: "Supplier" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
