import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function PatientsPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const patients = await prisma.patient.findMany({
    where: { clinicId },
    include: {
      branch: true,
      assignedDoctor: {
        include: {
          staffProfile: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  const rows = patients.map(p => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    phone: p.phone,
    branch: p.branch.name,
    assignedDoctor: p.assignedDoctor ? `${p.assignedDoctor.staffProfile.firstName} ${p.assignedDoctor.staffProfile.lastName}` : "None",
    lastVisit: p.lastVisitAt ? p.lastVisitAt.toLocaleDateString() : "Never",
    status: p.status,
    balance: "0 UZS" // TODO: Calculate balance
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Patients"
      description="Search and manage clinic patients."
      metrics={[
        { label: "Total Patients", value: patients.length.toString(), tone: "success" },
        { label: "New this week", value: "0", tone: "neutral" }
      ]}
      filters={["Branch", "Doctor", "Status", "Source"]}
      table={{
        title: "Patient Directory",
        actionLabel: "Add Patient",
        createEndpoint: "/api/resources/patients",
        createFields: [
          { name: "firstName", label: "First Name" },
          { name: "lastName", label: "Last Name" },
          { name: "phone", label: "Phone Number" },
          { name: "email", label: "Email Address" },
          { name: "gender", label: "Gender", options: ["MALE", "FEMALE", "NOT_CHOSEN"] },
          { name: "medicalSummary", label: "Medical Summary" }
        ],
        columns: [
          { key: "name", label: "Full name" },
          { key: "phone", label: "Phone" },
          { key: "branch", label: "Branch" },
          { key: "assignedDoctor", label: "Doctor" },
          { key: "lastVisit", label: "Last visit" },
          { key: "status", label: "Status" },
          { key: "balance", label: "Balance" }
        ],
        rows: rows
      }}
    />
  );
}
