import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const invoices = await prisma.invoice.findMany({
    where: { clinicId },
    include: {
      patient: true,
      branch: true
    },
    orderBy: { createdAt: "desc" }
  });

  const rows = invoices.map(inv => ({
    id: inv.id,
    number: inv.number,
    patient: `${inv.patient.firstName} ${inv.patient.lastName}`,
    total: `${inv.totalAmount.toString()} UZS`,
    paid: `${inv.paidAmount.toString()} UZS`,
    status: inv.status
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Invoices"
      description="Manage patient billing, insurance claims, and receivables."
      metrics={[
        { label: "Total Receivables", value: invoices.reduce((acc, inv) => acc + inv.totalAmount.toNumber() - inv.paidAmount.toNumber(), 0).toString() + " UZS", tone: "danger" }
      ]}
      filters={["Status"]}
      table={{
        title: "Billing Records",
        createEndpoint: "/api/resources/invoices",
        createFields: [
          { name: "status", label: "Status", options: ["DRAFT", "ISSUED", "PAID", "PARTIALLY_PAID", "CANCELLED"] }
        ],
        columns: [
          { key: "number", label: "Invoice #" },
          { key: "patient", label: "Patient" },
          { key: "total", label: "Total" },
          { key: "paid", label: "Paid" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
