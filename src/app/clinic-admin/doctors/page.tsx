import { ResourcePage } from "@/components/pages/resource-page";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

export default async function DoctorsPage() {
  const user = await getCurrentUser();
  const clinicId = user.clinicIds[0];

  const doctors = await prisma.doctorProfile.findMany({
    where: {
      user: {
        organizationUsers: { some: { organizationId: clinicId } }
      }
    },
    include: {
      staffProfile: true,
      branch: true,
      user: true
    },
    orderBy: { createdAt: "desc" }
  });

  const rows = doctors.map(d => ({
    id: d.id,
    name: `${d.staffProfile.firstName} ${d.staffProfile.lastName}`,
    specialty: d.specialty || "General",
    branch: d.branch.name,
    activePatients: 0, // TODO: Count active patients
    consultations: 0, // TODO: Count consultations
    status: d.status
  }));

  return (
    <ResourcePage
      role="CLINIC_ADMIN"
      title="Doctors"
      description="Manage doctors, assignments, and status."
      metrics={[
        { label: "Total Doctors", value: doctors.length.toString(), tone: "neutral" },
        { label: "Active Now", value: "0", tone: "success" }
      ]}
      filters={["Branch", "Specialty", "Status"]}
      table={{
        title: "Medical Staff",
        actionLabel: "Add Doctor",
        createEndpoint: "/api/resources/doctors",
        createFields: [
          { name: "firstName", label: "First Name" },
          { name: "lastName", label: "Last Name" },
          { name: "email", label: "Email" },
          { 
            name: "specialty", 
            label: "Profession/Specialty", 
            options: [
              "Medical Doctor (MD)",
              "Doctor of Osteopathic Medicine (DO)",
              "Dentist (DDS/DMD)",
              "Optometrist (OD)",
              "Podiatrist (DPM)",
              "Pharmacist (PharmD)",
              "Veterinarian (DVM)",
              "Chiropractor (DC)",
              "Physician Assistant (PA)",
              "Nurse Practitioner (NP)",
              "Certified Registered Nurse Anesthetist (CRNA)",
              "Certified Nurse-Midwife (CNM)",
              "Registered Nurse (RN)",
              "Licensed Practical/Vocational Nurse (LPN/LVN)",
              "Physical Therapist (PT)",
              "Occupational Therapist (OT)",
              "Speech-Language Pathologist (SLP)",
              "Audiologist (AuD)",
              "Respiratory Therapist (RT)",
              "Radiation Therapist",
              "Psychiatrist (MD/DO)",
              "Clinical Psychologist (PhD/PsyD)",
              "Licensed Clinical Social Worker (LCSW)",
              "Licensed Professional Counselor (LPC)",
              "Marriage and Family Therapist (LMFT)",
              "Medical Laboratory Scientist (MLS/MT)",
              "Radiologic Technologist",
              "Diagnostic Medical Sonographer",
              "Paramedic",
              "Emergency Medical Technician (EMT)",
              "Dietitian/Nutritionist (RD/RDN)",
              "Genetic Counselor"
            ] 
          }
        ],
        columns: [
          { key: "name", label: "Doctor" },
          { key: "specialty", label: "Specialty" },
          { key: "branch", label: "Branch" },
          { key: "activePatients", label: "Patients" },
          { key: "consultations", label: "Consultations" },
          { key: "status", label: "Status" }
        ],
        rows: rows
      }}
    />
  );
}
