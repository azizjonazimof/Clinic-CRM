import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ patientId: string }>;
};

export default async function PatientDetailPage({ params }: Context) {
  const { patientId } = await params;
  const user = await getCurrentUser();

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10
      },
      encounters: {
        orderBy: { createdAt: "desc" },
        take: 10
      }
    }
  });

  if (!patient) return <div>Patient not found</div>;

  const rows = patient.invoices.map(inv => ({
    id: inv.id,
    number: inv.invoiceNumber,
    date: inv.createdAt.toLocaleDateString(),
    total: `${inv.totalAmount.toString()} UZS`,
    paid: `${inv.paidAmount.toString()} UZS`,
    status: inv.status
  }));

  const metrics = [
    { label: "Total Spent", value: `${patient.invoices.reduce((acc, inv) => acc + inv.paidAmount.toNumber(), 0).toLocaleString()} UZS`, tone: "success" },
    { label: "Encounters", value: patient.encounters.length.toString(), tone: "neutral" }
  ];

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title={`${patient.firstName} ${patient.lastName}`}
      description={`Patient record for ${patient.firstName}. Viewing billing history and clinical records.`}
      metrics={metrics}
      filters={["Invoices", "Encounters"]}
      table={{
        title: "Billing History",
        columns: [
          { key: "number", label: "Invoice #" },
          { key: "date", label: "Date" },
          { key: "total", label: "Total" },
          { key: "paid", label: "Paid" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
