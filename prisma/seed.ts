import { PrismaClient, UserStatus, EntityStatus, StockMovementType } from "@prisma/client";
import { hashPassword } from "../src/server/security";

const prisma = new PrismaClient();

async function main() {
  // 1. Core Clinic & Branch
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
      region: "Tashkent",
      timezone: "Asia/Tashkent",
      currencyCode: "UZS"
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

  // 2. Roles & Permissions
  const adminRole = await prisma.role.upsert({
    where: { code: "CLINIC_ADMIN" },
    update: {},
    create: {
      code: "CLINIC_ADMIN",
      name: "Clinic Administrator"
    }
  });

  const doctorRole = await prisma.role.upsert({
    where: { code: "DOCTOR" },
    update: {},
    create: {
      code: "DOCTOR",
      name: "Medical Doctor"
    }
  });

  // 3. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@medcrm.local" },
    update: {},
    create: {
      email: "admin@medcrm.local",
      passwordHash: await hashPassword("Password123"),
      firstName: "Clinic",
      lastName: "Admin",
      status: UserStatus.ACTIVE
    }
  });

  const orgAdmin = await prisma.organizationUser.upsert({
    where: { organizationId_userId_roleId: { organizationId: clinic.id, userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: {
      organizationId: clinic.id,
      userId: adminUser.id,
      roleId: adminRole.id,
      status: UserStatus.ACTIVE
    }
  });

  await prisma.userClinicAssignment.upsert({
    where: { userId_clinicId: { userId: adminUser.id, clinicId: clinic.id } },
    update: {},
    create: { userId: adminUser.id, clinicId: clinic.id }
  });

  await prisma.userBranchAssignment.upsert({
    where: { userId_branchId: { userId: adminUser.id, branchId: branch.id } },
    update: {},
    create: { userId: adminUser.id, branchId: branch.id }
  });

  // 4. Doctor User
  const doctorUser = await prisma.user.upsert({
    where: { email: "doctor@medcrm.local" },
    update: {},
    create: {
      email: "doctor@medcrm.local",
      passwordHash: await hashPassword("Password123"),
      firstName: "Bekzod",
      lastName: "Aliyev",
      status: UserStatus.ACTIVE
    }
  });

  const orgDoctor = await prisma.organizationUser.upsert({
    where: { organizationId_userId_roleId: { organizationId: clinic.id, userId: doctorUser.id, roleId: doctorRole.id } },
    update: {},
    create: {
      organizationId: clinic.id,
      userId: doctorUser.id,
      roleId: doctorRole.id,
      status: UserStatus.ACTIVE
    }
  });

  const staffProfile = await prisma.staffProfile.upsert({
    where: { organizationUserId: orgDoctor.id },
    update: {},
    create: {
      organizationUserId: orgDoctor.id,
      firstName: "Bekzod",
      lastName: "Aliyev",
      phone: "+998 90 111 22 33"
    }
  });

  const doctorProfile = await prisma.doctorProfile.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      staffProfileId: staffProfile.id,
      branchId: branch.id,
      specialty: "Cardiology",
      licenseNumber: "UZ-MED-1001",
      status: EntityStatus.ACTIVE
    }
  });

  // 5. Units & Categories
  const unitBox = await prisma.unit.upsert({
    where: { code: "box" },
    update: {},
    create: { code: "box", name: "Box" }
  });

  const catConsumable = await prisma.productCategory.upsert({
    where: { id: "cat-1" },
    update: {},
    create: { id: "cat-1", organizationId: clinic.id, name: "Consumables" }
  });

  // 6. Lead Source
  const leadSource = await prisma.leadSource.upsert({
    where: { id: "source-1" },
    update: {},
    create: {
      id: "source-1",
      organizationId: clinic.id,
      sourceType: "social",
      name: "Instagram",
      isActive: true
    }
  });

  // 7. Patient
  const patient = await prisma.patient.upsert({
    where: { id: "patient-1" },
    update: {},
    create: {
      id: "patient-1",
      clinicId: clinic.id,
      branchId: branch.id,
      assignedDoctorId: doctorProfile.id,
      sourceId: leadSource.id,
      firstName: "Dilnoza",
      lastName: "Akhmedova",
      phone: "+998 90 123 45 67",
      status: "ACTIVE",
      medicalSummary: "No known allergies."
    }
  });

  // 8. Service
  const service = await prisma.service.upsert({
    where: { id: "service-1" },
    update: {},
    create: {
      id: "service-1",
      organizationId: clinic.id,
      branchId: branch.id,
      name: "Primary Consultation",
      basePrice: 350000,
      durationMinutes: 30,
      isActive: true
    }
  });

  // 9. Warehouse & Inventory
  const warehouse = await prisma.warehouse.upsert({
    where: { id: "wh-1" },
    update: {},
    create: {
      id: "wh-1",
      organizationId: clinic.id,
      branchId: branch.id,
      name: "Main Warehouse",
      isDefault: true
    }
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: "supplier-1" },
    update: {},
    create: {
      id: "supplier-1",
      organizationId: clinic.id,
      name: "MedSupply UZ",
      phone: "+998 71 222 33 44"
    }
  });

  const product = await prisma.product.upsert({
    where: { branchId_sku: { branchId: branch.id, sku: "MED-GLV-001" } },
    update: {},
    create: {
      organizationId: clinic.id,
      branchId: branch.id,
      categoryId: catConsumable.id,
      sku: "MED-GLV-001",
      name: "Nitrile Gloves",
      unitId: unitBox.id,
      productType: "consumable",
      purchasePrice: 45000,
      sellingPrice: 0,
      isActive: true
    }
  });

  // 10. Initial Stock
  await prisma.stockMovement.create({
    data: {
      organizationId: clinic.id,
      branchId: branch.id,
      warehouseId: warehouse.id,
      productId: product.id,
      movementType: StockMovementType.IN,
      quantity: 50,
      unitCost: 45000,
      createdByUserId: adminUser.id,
      notes: "Initial stock"
    }
  });

  console.log("Seed complete");
  console.log("Admin: admin@medcrm.local / Password123");
  console.log("Doctor: doctor@medcrm.local / Password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
