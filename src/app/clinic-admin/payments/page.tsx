import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const payments = await prisma.payment.findMany({
    where: { organizationId: clinicId },
    include: {
      patient: true,
      Branch: true
    },
    orderBy: { createdAt: "desc" }
  });

  const rows = payments.map(p => ({
    id: p.id,
    date: p.createdAt.toLocaleDateString(),
    patient: p.patient ? `${p.patient.firstName} ${p.patient.lastName}` : "Walk-in",
    amount: `${p.amount.toString()} UZS`,
    method: p.paymentMethod,
    status: p.status
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Payments"
      description="Track all incoming and outgoing financial transactions."
      metrics={[
        { label: "Total Revenue", value: payments.reduce((acc, p) => acc + p.amount.toNumber(), 0).toString() + " UZS", tone: "success" }
      ]}
      filters={["Method", "Status"]}
      table={{
        title: "Transaction History",
        columns: [
          { key: "date", label: "Date" },
          { key: "patient", label: "Patient" },
          { key: "amount", label: "Amount" },
          { key: "method", label: "Method" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
