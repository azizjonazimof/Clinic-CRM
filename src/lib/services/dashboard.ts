import { prisma } from "@/lib/prisma";
import type { MetricCard, InvoiceListItem } from "@/types/domain";

export async function getClinicDashboardMetrics(clinicId: string): Promise<MetricCard[]> {
  const [patientCount, invoiceSummary, appointmentCount, doctorCount] = await Promise.all([
    prisma.patient.count({ where: { clinicId } }),
    prisma.invoice.aggregate({
      where: { organizationId: clinicId },
      _sum: { totalAmount: true, paidAmount: true }
    }),
    prisma.appointment.count({ where: { organizationId: clinicId } }),
    prisma.doctorProfile.count({ where: { branch: { clinicId } } })
  ]);

  const totalRevenue = invoiceSummary._sum.totalAmount?.toNumber() || 0;
  const totalPaid = invoiceSummary._sum.paidAmount?.toNumber() || 0;
  const receivables = totalRevenue - totalPaid;

  return [
    {
      label: "Total Patients",
      value: patientCount.toString(),
      tone: "neutral"
    },
    {
      label: "Revenue (Total)",
      value: `${totalRevenue.toLocaleString()} UZS`,
      tone: "success"
    },
    {
      label: "Receivables",
      value: `${receivables.toLocaleString()} UZS`,
      tone: receivables > 0 ? "warning" : "neutral"
    },
    {
      label: "Active Doctors",
      value: doctorCount.toString(),
      tone: "neutral"
    }
  ];
}

export async function getRecentInvoices(clinicId: string): Promise<InvoiceListItem[]> {
  const invoices = await prisma.invoice.findMany({
    where: { organizationId: clinicId },
    include: {
      patient: true,
      doctorProfile: {
        include: {
          staffProfile: true
        }
      },
      branch: true
    },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  return invoices.map((inv) => ({
    id: inv.id,
    number: inv.invoiceNumber,
    patient: `${inv.patient.firstName} ${inv.patient.lastName}`,
    doctor: inv.doctorProfile ? `${inv.doctorProfile.staffProfile.firstName} ${inv.doctorProfile.staffProfile.lastName}` : "N/A",
    branch: inv.branch.name,
    total: `${inv.totalAmount.toNumber().toLocaleString()} UZS`,
    paid: `${inv.paidAmount.toNumber().toLocaleString()} UZS`,
    due: `${(inv.totalAmount.toNumber() - inv.paidAmount.toNumber()).toLocaleString()} UZS`,
    status: inv.status as any,
    createdAt: inv.createdAt.toISOString()
  }));
}
