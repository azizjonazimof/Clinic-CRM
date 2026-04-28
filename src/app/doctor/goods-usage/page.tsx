import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function DoctorGoodsUsagePage() {
  const user = await getCurrentUser();
  
  const movements = await prisma.stockMovement.findMany({
    where: { 
      type: "USAGE",
      // Scoped to clinic/branches of the user
      branch: { clinic: { users: { some: { userId: user.id } } } }
    },
    include: {
      product: true,
      patient: true
    },
    orderBy: { createdAt: "desc" }
  });

  const rows = movements.map(m => ({
    id: m.id,
    date: m.createdAt.toLocaleDateString(),
    product: m.product.name,
    quantity: m.quantity.toString(),
    patient: m.patient ? `${m.patient.firstName} ${m.patient.lastName}` : "N/A"
  }));

  return (
    <ResourcePage
      role="DOCTOR"
      title="Goods Usage"
      description="Track medical supplies consumed during consultations."
      table={{
        title: "Recent Consumption",
        columns: [
          { key: "date", label: "Date" },
          { key: "product", label: "Product" },
          { key: "quantity", label: "Qty" },
          { key: "patient", label: "Patient" }
        ],
        rows: rows
      }}
    />
  );
}
