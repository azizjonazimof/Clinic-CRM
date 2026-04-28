import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ supplierId: string }>;
};

export default async function SupplierDetailPage({ params }: Context) {
  const { supplierId } = await params;
  
  const supplier = await prisma.supplier.findUnique({
    where: { id: supplierId },
    include: {
      products: {
        include: { category: true }
      }
    }
  });

  if (!supplier) return <div>Supplier not found</div>;

  const rows = supplier.products.map(p => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category?.name || "N/A",
    status: p.isActive ? "ACTIVE" : "INACTIVE"
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title={`Supplier: ${supplier.name}`}
      description={`Contact: ${supplier.phone || "N/A"}. Viewing product catalog and supply chain status.`}
      metrics={[
        { label: "Total Products", value: supplier.products.length.toString(), tone: "neutral" }
      ]}
      table={{
        title: "Product Catalog",
        columns: [
          { key: "sku", label: "SKU" },
          { key: "name", label: "Product" },
          { key: "category", label: "Category" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
