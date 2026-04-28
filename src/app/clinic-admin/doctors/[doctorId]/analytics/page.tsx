import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ doctorId: string }>;
};

export default async function DoctorAnalyticsPage({ params }: Context) {
  const { doctorId } = await params;
  
  const doctor = await prisma.doctorProfile.findUnique({
    where: { id: doctorId },
    include: {
      staffProfile: true,
      encounters: {
        include: { services: { include: { service: true } } },
        take: 50,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!doctor) return <div>Doctor not found</div>;

  // Aggregate service mix from encounters
  const serviceStats = new Map<string, { name: string; count: number; total: number }>();
  doctor.encounters.forEach(enc => {
    enc.services.forEach(es => {
      const s = es.service;
      const current = serviceStats.get(s.id) || { name: s.name, count: 0, total: 0 };
      current.count += 1;
      current.total += es.unitPrice.toNumber();
      serviceStats.set(s.id, current);
    });
  });

  const rows = Array.from(serviceStats.values()).map(stat => ({
    name: stat.name,
    count: stat.count.toString(),
    revenue: `${stat.total.toLocaleString()} UZS`
  }));

  const metrics = [
    { label: "Total Revenue", value: `${Array.from(serviceStats.values()).reduce((acc, s) => acc + s.total, 0).toLocaleString()} UZS`, tone: "success" },
    { label: "Avg Ticket", value: "0 UZS", tone: "neutral" } // TODO: Implement avg ticket
  ];

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title={`Analytics: Dr. ${doctor.staffProfile.firstName} ${doctor.staffProfile.lastName}`}
      description="Clinical performance breakdown by service revenue and patient volume."
      metrics={metrics}
      filters={["This Month", "Last Month"]}
      table={{
        title: "Service Mix & Revenue",
        columns: [
          { key: "name", label: "Service" },
          { key: "count", label: "Quantity" },
          { key: "revenue", label: "Total Revenue" }
        ],
        rows: rows
      }}
    />
  );
}
