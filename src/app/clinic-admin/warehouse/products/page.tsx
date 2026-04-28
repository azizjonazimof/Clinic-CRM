import { ResourcePage } from "@/components/pages/resource-page";
import { metrics, products } from "@/data/mock";

export default function ProductsPage() {
  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Products"
      description="Manage warehouse products and inventory."
      metrics={metrics.slice(0, 3)}
      filters={["Branch", "Category", "Supplier", "Status"]}
      table={{
        title: "Products",
        actionLabel: "Create product",
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
        rows: products
      }}
      detailSections={["Stock adjustment modal", "Deactivate confirmation"]}
    />
  );
}

