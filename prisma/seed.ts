import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/server/security";

const prisma = new PrismaClient();

async function main() {
  const clinic = await prisma.clinic.upsert({
    where: { id: "clinic-1" },
    update: {},
    create: {
      id: "clinic-1",
      name: "Central Medical Group",
      legalName: "Central Medical Group LLC",
      phone: "+998 71 200 11 22",
      email: "admin@centralmed.local",
      address: "18 Amir Temur Ave",
      region: "Tashkent"
    }
  });

  const branch = await prisma.branch.upsert({
    where: { id: "branch-1" },
    update: {},
    create: {
      id: "branch-1",
      clinicId: clinic.id,
      name: "Yunusabad Branch",
      address: "18 Amir Temur Ave",
      city: "Tashkent",
      region: "Tashkent",
      phone: "+998 71 200 11 23"
    }
  });

  const superAdmin = await prisma.user.upsert({
    where: { email: "super@medcrm.local" },
    update: {},
    create: {
      email: "super@medcrm.local",
      passwordHash: await hashPassword("Password123"),
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN"
    }
  });

  const clinicAdmin = await prisma.user.upsert({
    where: { email: "admin@medcrm.local" },
    update: {},
    create: {
      email: "admin@medcrm.local",
      passwordHash: await hashPassword("Password123"),
      firstName: "Clinic",
      lastName: "Admin",
      role: "CLINIC_ADMIN",
      clinicAssignments: { create: { clinicId: clinic.id } },
      branchAssignments: { create: { branchId: branch.id } }
    }
  });

  await prisma.userClinicAssignment.upsert({
    where: { userId_clinicId: { userId: clinicAdmin.id, clinicId: clinic.id } },
    update: {},
    create: { userId: clinicAdmin.id, clinicId: clinic.id }
  });
  await prisma.userBranchAssignment.upsert({
    where: { userId_branchId: { userId: clinicAdmin.id, branchId: branch.id } },
    update: {},
    create: { userId: clinicAdmin.id, branchId: branch.id }
  });

  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor@medcrm.local" },
    update: {},
    create: {
      email: "doctor@medcrm.local",
      passwordHash: await hashPassword("Password123"),
      firstName: "Bekzod",
      lastName: "Aliyev",
      role: "DOCTOR",
      clinicAssignments: { create: { clinicId: clinic.id } },
      branchAssignments: { create: { branchId: branch.id } }
    }
  });

  await prisma.userClinicAssignment.upsert({
    where: { userId_clinicId: { userId: doctorUser.id, clinicId: clinic.id } },
    update: {},
    create: { userId: doctorUser.id, clinicId: clinic.id }
  });
  await prisma.userBranchAssignment.upsert({
    where: { userId_branchId: { userId: doctorUser.id, branchId: branch.id } },
    update: {},
    create: { userId: doctorUser.id, branchId: branch.id }
  });

  const doctor = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      branchId: branch.id,
      specialty: "Cardiology",
      licenseNumber: "UZ-MED-1001"
    }
  });

  const source = await prisma.source.upsert({
    where: { id: "source-1" },
    update: {},
    create: { id: "source-1", clinicId: clinic.id, name: "Instagram", type: "Social" }
  });

  const patient = await prisma.patient.upsert({
    where: { id: "patient-1" },
    update: {},
    create: {
      id: "patient-1",
      clinicId: clinic.id,
      branchId: branch.id,
      assignedDoctorId: doctor.id,
      sourceId: source.id,
      firstName: "Dilnoza",
      lastName: "Akhmedova",
      phone: "+998 90 123 45 67",
      medicalSummary: "No known allergies."
    }
  });

  const service = await prisma.service.upsert({
    where: { id: "service-1" },
    update: {},
    create: {
      id: "service-1",
      branchId: branch.id,
      name: "Primary Consultation",
      category: "Consultation",
      price: 35,
      durationMin: 30
    }
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: "supplier-1" },
    update: {},
    create: {
      id: "supplier-1",
      clinicId: clinic.id,
      name: "MedSupply UZ",
      phone: "+998 71 222 33 44"
    }
  });

  const product = await prisma.product.upsert({
    where: { branchId_sku: { branchId: branch.id, sku: "MED-GLV-001" } },
    update: {},
    create: {
      branchId: branch.id,
      supplierId: supplier.id,
      sku: "MED-GLV-001",
      name: "Nitrile Gloves",
      category: "Consumables",
      unit: "box",
      stockQuantity: 38,
      lowStockThreshold: 25
    }
  });

  await prisma.invoice.upsert({
    where: { number: "INV-SEED-001" },
    update: {},
    create: {
      clinicId: clinic.id,
      branchId: branch.id,
      patientId: patient.id,
      doctorProfileId: doctor.id,
      number: "INV-SEED-001",
      subtotal: 35,
      total: 35,
      status: "ISSUED",
      issuedAt: new Date(),
      items: {
        create: {
          serviceId: service.id,
          type: "SERVICE",
          description: service.name,
          quantity: 1,
          unitPrice: 35,
          total: 35
        }
      }
    }
  });

  await prisma.stockMovement.create({
    data: {
      branchId: branch.id,
      productId: product.id,
      type: "PURCHASE",
      quantity: 38,
      note: "Initial stock"
    }
  });

  console.log("Seed complete");
  console.log("Super Admin: super@medcrm.local / Password123");
  console.log("Clinic Admin: admin@medcrm.local / Password123");
  console.log("Doctor: doctor@medcrm.local / Password123");
  console.log(`Super admin id: ${superAdmin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

