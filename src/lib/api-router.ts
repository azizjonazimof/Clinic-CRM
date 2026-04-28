import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";
import { auditLog } from "@/lib/audit";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { hasPermission, permissions } from "@/lib/permissions";
import { canAccessBranch, canAccessClinic } from "@/lib/scope";
import { paginationQuerySchema } from "@/lib/validation";
import { getCurrentUser } from "@/server/session";
import {
  branchCreateSchema,
  clinicCreateSchema,
  consultationCreateSchema,
  invoiceCreateSchema,
  patientCreateSchema,
  paymentCreateSchema,
  productCreateSchema,
  roomCreateSchema,
  serviceCreateSchema,
  sourceCreateSchema,
  stockAdjustmentSchema,
  supplierCreateSchema,
  userCreateSchema
} from "@/server/dto";
import { hashPassword } from "@/server/security";
import type { Role, SessionUser } from "@/types/domain";

type ResourceKey =
  | "dashboard"
  | "clinics"
  | "branches"
  | "users"
  | "analytics"
  | "settings"
  | "patients"
  | "doctors"
  | "doctor-analytics"
  | "services"
  | "rooms"
  | "warehouse"
  | "products"
  | "stock-adjustments"
  | "suppliers"
  | "payments"
  | "invoices"
  | "sources"
  | "consultations"
  | "goods-usage"
  | "performance";

function normalizeResource(parts: string[]): { key: ResourceKey; id?: string; action?: string } {
  if (!parts.length) return { key: "dashboard" };
  if (parts[0] === "warehouse" && !parts[1]) return { key: "warehouse" };
  if (parts[0] === "warehouse" && parts[1] === "products") return { key: "products", id: parts[2], action: parts[3] };
  if (parts[0] === "warehouse" && parts[1] === "suppliers") return { key: "suppliers", id: parts[2] };
  if (parts[0] === "products" && parts[2] === "stock-adjustments") return { key: "stock-adjustments", id: parts[1] };
  if (parts[0] === "payments" && parts[1] === "invoices") return { key: "invoices", id: parts[2], action: parts[3] };
  if (parts[0] === "services" && parts[1] === "rooms") return { key: "rooms", id: parts[2] };
  if (parts[0] === "doctors" && parts[2] === "analytics") return { key: "doctor-analytics", id: parts[1] };
  if (parts[0] === "goods-usage") return { key: "goods-usage" };
  return { key: parts[0] as ResourceKey, id: parts[1], action: parts[2] };
}

function requiredReadPermission(key: ResourceKey) {
  if (key === "clinics") return permissions.clinics.read;
  if (key === "branches") return permissions.branches.read;
  if (key === "users") return permissions.users.read;
  if (key === "doctors" || key === "doctor-analytics") return permissions.doctors.read;
  if (key === "warehouse" || key === "products" || key === "suppliers" || key === "goods-usage") return permissions.warehouse.read;
  if (key === "payments") return permissions.payments.read;
  if (key === "invoices") return permissions.invoices.read;
  if (key === "analytics" || key === "performance" || key === "dashboard") return permissions.analytics.read;
  if (key === "consultations") return permissions.consultations.read;
  return permissions.patients.read;
}

function requiredWritePermission(key: ResourceKey) {
  if (key === "clinics") return permissions.clinics.create;
  if (key === "branches") return permissions.branches.create;
  if (key === "users") return permissions.users.create;
  if (key === "doctors") return permissions.doctors.create;
  if (key === "warehouse" || key === "products" || key === "suppliers") return permissions.warehouse.manage;
  if (key === "stock-adjustments" || key === "goods-usage") return permissions.warehouse.adjustStock;
  if (key === "payments") return permissions.payments.create;
  if (key === "invoices") return permissions.invoices.create;
  if (key === "consultations") return permissions.consultations.create;
  return permissions.patients.create;
}

function guard(role: Role, permission: string) {
  if (!hasPermission(role, permission)) {
    throw new Error("Forbidden");
  }
}

function clinicFilter(user: SessionUser, clinicId?: string) {
  if (clinicId && !canAccessClinic(user, clinicId)) throw new Error("Scope denied");
  if (user.role === "SUPER_ADMIN") return clinicId ? { clinicId } : {};
  return { clinicId: { in: user.clinicIds } };
}

function branchFilter(user: SessionUser, branchId?: string) {
  if (branchId && !canAccessBranch(user, branchId)) throw new Error("Scope denied");
  if (user.role === "SUPER_ADMIN") return branchId ? { branchId } : {};
  return { branchId: { in: user.branchIds } };
}

async function getDoctorProfileId(user: SessionUser) {
  const profile = await prisma.doctorProfile.findUnique({ where: { userId: user.id } });
  return profile?.id;
}

async function listResource(user: SessionUser, key: ResourceKey, id: string | undefined, query: ReturnType<typeof paginationQuerySchema.parse>) {
  const skip = (query.page - 1) * query.limit;
  const take = query.limit;
  const search = query.search?.trim();

  switch (key) {
    case "dashboard":
      return dashboard(user, query.branchId);
    case "analytics":
      return analytics(user, query.branchId);
    case "clinics":
      return id
        ? prisma.clinic.findUnique({ where: { id }, include: { branches: true, assignments: true } })
        : prisma.clinic.findMany({
            where: { ...(query.status ? { status: query.status as never } : {}), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) },
            skip,
            take,
            orderBy: { createdAt: "desc" }
          });
    case "branches":
      return id
        ? prisma.branch.findUnique({ where: { id }, include: { doctors: { include: { user: true } }, rooms: true, services: true } })
        : prisma.branch.findMany({
            where: { ...clinicFilter(user, query.clinicId), ...(query.branchId ? { id: query.branchId } : {}) },
            include: { clinic: true, _count: { select: { doctors: true, patients: true, rooms: true } } },
            skip,
            take
          });
    case "users":
      return prisma.user.findMany({
        where: search
          ? { OR: [{ email: { contains: search, mode: "insensitive" } }, { firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }] }
          : {},
        include: { clinicAssignments: { include: { clinic: true } }, branchAssignments: { include: { branch: true } } },
        skip,
        take
      });
    case "patients": {
      const doctorProfileId = user.role === "DOCTOR" ? await getDoctorProfileId(user) : undefined;
      return id
        ? prisma.patient.findFirst({
            where: { id, ...clinicFilter(user), ...(user.role === "DOCTOR" ? { assignedDoctorId: doctorProfileId } : {}) },
            include: { branch: true, assignedDoctor: { include: { user: true } }, consultations: true, invoices: true, payments: true, stockMoves: true }
          })
        : prisma.patient.findMany({
            where: {
              ...clinicFilter(user, query.clinicId),
              ...branchFilter(user, query.branchId),
              ...(user.role === "DOCTOR" ? { assignedDoctorId: doctorProfileId } : {}),
              ...(search ? { OR: [{ firstName: { contains: search, mode: "insensitive" } }, { lastName: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] } : {})
            },
            include: { branch: true, assignedDoctor: { include: { user: true } }, source: true },
            skip,
            take
          });
    }
    case "doctors":
      return id
        ? prisma.doctorProfile.findFirst({ where: { id, branch: { ...clinicFilter(user, query.clinicId) } }, include: { user: true, branch: true, patients: true, consultations: true } })
        : prisma.doctorProfile.findMany({ where: { ...branchFilter(user, query.branchId) }, include: { user: true, branch: true, _count: { select: { patients: true, consultations: true } } }, skip, take });
    case "doctor-analytics":
      return doctorAnalytics(user, id, query.branchId);
    case "services":
      return prisma.service.findMany({ where: { ...branchFilter(user, query.branchId), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) }, include: { branch: true }, skip, take });
    case "rooms":
      return prisma.room.findMany({ where: { ...branchFilter(user, query.branchId) }, include: { branch: true, services: { include: { service: true } } }, skip, take });
    case "warehouse":
      return warehouseSummary(user, query.branchId);
    case "products":
      return prisma.product.findMany({ where: { ...branchFilter(user, query.branchId), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) }, include: { branch: true, supplier: true }, skip, take });
    case "suppliers":
      return id
        ? prisma.supplier.findFirst({ where: { id, ...clinicFilter(user, query.clinicId) }, include: { products: true } })
        : prisma.supplier.findMany({ where: { ...clinicFilter(user, query.clinicId), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) }, include: { _count: { select: { products: true } } }, skip, take });
    case "payments":
      return prisma.payment.findMany({ where: { ...clinicFilter(user, query.clinicId), ...branchFilter(user, query.branchId) }, include: { patient: true, invoice: true, branch: true }, skip, take, orderBy: { paidAt: "desc" } });
    case "invoices":
      return id
        ? prisma.invoice.findFirst({ where: { id, ...clinicFilter(user, query.clinicId) }, include: { items: true, patient: true, payments: true, doctorProfile: { include: { user: true } } } })
        : prisma.invoice.findMany({ where: { ...clinicFilter(user, query.clinicId), ...branchFilter(user, query.branchId) }, include: { patient: true, doctorProfile: { include: { user: true } }, branch: true }, skip, take, orderBy: { createdAt: "desc" } });
    case "sources":
      return prisma.source.findMany({ where: { ...clinicFilter(user, query.clinicId), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) }, include: { _count: { select: { patients: true } } }, skip, take });
    case "consultations": {
      const doctorProfileId = user.role === "DOCTOR" ? await getDoctorProfileId(user) : undefined;
      return prisma.consultation.findMany({ where: { ...(doctorProfileId ? { doctorProfileId } : {}) }, include: { patient: true, doctorProfile: { include: { user: true } }, stockMoves: true }, skip, take, orderBy: { createdAt: "desc" } });
    }
    case "goods-usage":
      return prisma.stockMovement.findMany({ where: { doctorUserId: user.role === "DOCTOR" ? user.id : undefined, ...branchFilter(user, query.branchId) }, include: { product: true, patient: true, consultation: true }, skip, take, orderBy: { createdAt: "desc" } });
    case "performance":
      return doctorAnalytics(user, await getDoctorProfileId(user), query.branchId);
    default:
      return [];
  }
}

async function createResource(user: SessionUser, key: ResourceKey, request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  switch (key) {
    case "clinics": {
      const data = clinicCreateSchema.parse(body);
      return prisma.clinic.create({ data });
    }
    case "branches": {
      const data = branchCreateSchema.parse(body);
      if (!canAccessClinic(user, data.clinicId)) throw new Error("Scope denied");
      return prisma.branch.create({ data });
    }
    case "users": {
      const data = userCreateSchema.parse(body);
      const created = await prisma.$transaction(async (tx) => {
        const createdUser = await tx.user.create({
          data: {
            email: data.email,
            passwordHash: await hashPassword(data.password),
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            role: data.role
          }
        });
        if (data.clinicIds.length) {
          await tx.userClinicAssignment.createMany({ data: data.clinicIds.map((clinicId) => ({ userId: createdUser.id, clinicId })), skipDuplicates: true });
        }
        if (data.branchIds.length) {
          await tx.userBranchAssignment.createMany({ data: data.branchIds.map((branchId) => ({ userId: createdUser.id, branchId })), skipDuplicates: true });
        }
        if (data.role === "DOCTOR" && data.doctorProfile) {
          await tx.doctorProfile.create({ data: { userId: createdUser.id, ...data.doctorProfile } });
        }
        return createdUser;
      });
      return created;
    }
    case "patients": {
      const data = patientCreateSchema.parse(body);
      if (!canAccessClinic(user, data.clinicId) || !canAccessBranch(user, data.branchId)) throw new Error("Scope denied");
      return prisma.patient.create({ data: { ...data, birthDate: data.birthDate ? new Date(data.birthDate) : undefined } });
    }
    case "services": {
      const data = serviceCreateSchema.parse(body);
      if (!canAccessBranch(user, data.branchId)) throw new Error("Scope denied");
      return prisma.service.create({ data });
    }
    case "rooms": {
      const data = roomCreateSchema.parse(body);
      if (!canAccessBranch(user, data.branchId)) throw new Error("Scope denied");
      return prisma.room.create({ data: { branchId: data.branchId, name: data.name, type: data.type, services: { create: data.serviceIds.map((serviceId) => ({ serviceId })) } } });
    }
    case "suppliers": {
      const data = supplierCreateSchema.parse(body);
      if (!canAccessClinic(user, data.clinicId)) throw new Error("Scope denied");
      return prisma.supplier.create({ data });
    }
    case "products": {
      const data = productCreateSchema.parse(body);
      if (!canAccessBranch(user, data.branchId)) throw new Error("Scope denied");
      return prisma.product.create({ data: { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined } });
    }
    case "stock-adjustments":
    case "goods-usage": {
      const data = stockAdjustmentSchema.parse(body);
      if (!canAccessBranch(user, data.branchId)) throw new Error("Scope denied");
      return applyStockMovement(user, data);
    }
    case "sources": {
      const data = sourceCreateSchema.parse(body);
      if (!canAccessClinic(user, data.clinicId)) throw new Error("Scope denied");
      return prisma.source.create({ data });
    }
    case "invoices": {
      const data = invoiceCreateSchema.parse(body);
      if (!canAccessClinic(user, data.clinicId) || !canAccessBranch(user, data.branchId)) throw new Error("Scope denied");
      return createInvoice(data);
    }
    case "payments": {
      const data = paymentCreateSchema.parse(body);
      if (!canAccessClinic(user, data.clinicId) || !canAccessBranch(user, data.branchId)) throw new Error("Scope denied");
      return createPayment(data);
    }
    case "consultations": {
      const data = consultationCreateSchema.parse(body);
      return createConsultation(user, data);
    }
    default:
      throw new Error("Unsupported resource");
  }
}

async function patchResource(user: SessionUser, key: ResourceKey, id: string | undefined, request: NextRequest) {
  if (!id) throw new Error("Missing id");
  const body = await request.json().catch(() => ({}));

  switch (key) {
    case "clinics":
      return prisma.clinic.update({ where: { id }, data: body });
    case "branches":
      return prisma.branch.update({ where: { id }, data: body });
    case "users":
      return prisma.user.update({ where: { id }, data: body });
    case "patients":
      return prisma.patient.update({ where: { id }, data: body });
    case "doctors":
      return prisma.doctorProfile.update({ where: { id }, data: body });
    case "services":
      return prisma.service.update({ where: { id }, data: body });
    case "rooms":
      return prisma.room.update({ where: { id }, data: body });
    case "products":
      return prisma.product.update({ where: { id }, data: body });
    case "suppliers":
      return prisma.supplier.update({ where: { id }, data: body });
    case "sources":
      return prisma.source.update({ where: { id }, data: body });
    case "invoices":
      if (body.status === "ISSUED") return prisma.invoice.update({ where: { id }, data: { status: "ISSUED", issuedAt: new Date() } });
      return prisma.invoice.update({ where: { id }, data: body });
    default:
      throw new Error("Unsupported update");
  }
}

async function applyStockMovement(user: SessionUser, data: z.infer<typeof stockAdjustmentSchema>) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({ where: { id: data.productId } });
    const quantity = new Prisma.Decimal(data.quantity);
    const signedQuantity = data.type === "USAGE" || data.type === "EXPIRED" ? quantity.negated() : quantity;
    const nextStock = product.stockQuantity.add(signedQuantity);
    if (nextStock.lessThan(0)) throw new Error("Insufficient stock");
    await tx.product.update({ where: { id: product.id }, data: { stockQuantity: nextStock } });
    return tx.stockMovement.create({
      data: {
        branchId: data.branchId,
        productId: data.productId,
        patientId: data.patientId,
        consultationId: data.consultationId,
        doctorUserId: user.role === "DOCTOR" ? user.id : undefined,
        type: data.type,
        quantity,
        note: data.note
      }
    });
  });
}

async function createInvoice(data: z.infer<typeof invoiceCreateSchema>) {
  const subtotal = data.items.reduce((sum: number, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal - data.discount + data.tax;
  return prisma.invoice.create({
    data: {
      clinicId: data.clinicId,
      branchId: data.branchId,
      patientId: data.patientId,
      doctorProfileId: data.doctorProfileId,
      number: `INV-${Date.now()}`,
      subtotal,
      discount: data.discount,
      tax: data.tax,
      total,
      items: {
        create: data.items.map((item) => ({
          serviceId: item.serviceId,
          productId: item.productId,
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice
        }))
      }
    },
    include: { items: true }
  });
}

async function createPayment(data: z.infer<typeof paymentCreateSchema>) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({ data });
    if (data.invoiceId) {
      const invoice = await tx.invoice.findUniqueOrThrow({ where: { id: data.invoiceId } });
      const paid = invoice.paid.add(data.amount);
      const status = paid.greaterThanOrEqualTo(invoice.total) ? "PAID" : "PARTIALLY_PAID";
      await tx.invoice.update({ where: { id: invoice.id }, data: { paid, status } });
    }
    return payment;
  });
}

async function createConsultation(user: SessionUser, data: z.infer<typeof consultationCreateSchema>) {
  return prisma.$transaction(async (tx) => {
    const consultation = await tx.consultation.create({
      data: {
        patientId: data.patientId,
        doctorProfileId: data.doctorProfileId,
        doctorUserId: user.id,
        complaints: data.complaints,
        diagnosis: data.diagnosis,
        treatmentPlan: data.treatmentPlan,
        notes: data.notes,
        followUpAt: data.followUpAt ? new Date(data.followUpAt) : undefined,
        status: data.status
      }
    });
    for (const item of data.goodsUsed) {
      await applyStockMovement(user, { ...item, type: "USAGE", consultationId: consultation.id });
    }
    return consultation;
  });
}

async function dashboard(user: SessionUser, branchId?: string) {
  const branchWhere = branchFilter(user, branchId);
  const clinicWhere = clinicFilter(user);
  const [patients, doctors, invoices, payments, lowStock] = await Promise.all([
    prisma.patient.count({ where: { ...clinicWhere, ...branchWhere } }),
    prisma.doctorProfile.count({ where: { ...branchWhere } }),
    prisma.invoice.count({ where: { ...clinicWhere, ...branchWhere } }),
    prisma.payment.aggregate({ where: { ...clinicWhere, ...branchWhere }, _sum: { amount: true } }),
    prisma.product.count({ where: { ...branchWhere, stockQuantity: { lte: prisma.product.fields.lowStockThreshold } } })
  ]);

  return {
    metrics: [
      { label: "Patients", value: String(patients) },
      { label: "Doctors", value: String(doctors) },
      { label: "Invoices", value: String(invoices) },
      { label: "Revenue", value: String(payments._sum.amount ?? 0) },
      { label: "Low stock", value: String(lowStock) }
    ]
  };
}

async function analytics(user: SessionUser, branchId?: string) {
  const branchWhere = branchFilter(user, branchId);
  const clinicWhere = clinicFilter(user);
  const [patientGrowth, revenue, consultations] = await Promise.all([
    prisma.patient.groupBy({ by: ["branchId"], where: { ...clinicWhere, ...branchWhere }, _count: true }),
    prisma.payment.aggregate({ where: { ...clinicWhere, ...branchWhere }, _sum: { amount: true } }),
    prisma.consultation.count()
  ]);
  return { patientGrowth, revenue: revenue._sum.amount ?? 0, consultations };
}

async function doctorAnalytics(user: SessionUser, doctorProfileId?: string, branchId?: string) {
  const profileId = doctorProfileId ?? (await getDoctorProfileId(user));
  if (!profileId) return { metrics: [] };
  const [consultations, patients, invoices, goods] = await Promise.all([
    prisma.consultation.count({ where: { doctorProfileId: profileId } }),
    prisma.patient.count({ where: { assignedDoctorId: profileId, ...branchFilter(user, branchId) } }),
    prisma.invoice.aggregate({ where: { doctorProfileId: profileId, ...branchFilter(user, branchId) }, _sum: { total: true } }),
    prisma.stockMovement.count({ where: { doctorUserId: user.role === "DOCTOR" ? user.id : undefined, ...branchFilter(user, branchId) } })
  ]);
  return { consultations, patients, revenue: invoices._sum.total ?? 0, goods };
}

async function warehouseSummary(user: SessionUser, branchId?: string) {
  const where = branchFilter(user, branchId);
  const [products, lowStock, recentMovements] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({ where: { ...where, stockQuantity: { lte: prisma.product.fields.lowStockThreshold } }, take: 20 }),
    prisma.stockMovement.findMany({ where, include: { product: true, patient: true }, orderBy: { createdAt: "desc" }, take: 20 })
  ]);
  return { products, lowStock, recentMovements };
}

export async function handleRoleApi(request: NextRequest, expectedRole: Role, resource: string[] = []) {
  try {
    const user = await getCurrentUser();
    if (expectedRole !== user.role && user.role !== "SUPER_ADMIN") return fail("FORBIDDEN", "Wrong portal for current role.", 403);
    const normalized = normalizeResource(resource);
    guard(user.role, requiredReadPermission(normalized.key));
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = paginationQuerySchema.parse(params);
    const data = await listResource(user, normalized.key, normalized.id, query);
    return ok(data, { page: query.page, limit: query.limit, role: user.role, resource: normalized.key });
  } catch (error) {
    return mapError(error);
  }
}

export async function handleRoleMutation(request: NextRequest, expectedRole: Role, resource: string[] = []) {
  try {
    const user = await getCurrentUser();
    if (expectedRole !== user.role && user.role !== "SUPER_ADMIN") return fail("FORBIDDEN", "Wrong portal for current role.", 403);
    const normalized = normalizeResource(resource);
    guard(user.role, requiredWritePermission(normalized.key));
    const data = request.method === "PATCH" ? await patchResource(user, normalized.key, normalized.id, request) : await createResource(user, normalized.key, request);
    const entityId = typeof data === "object" && data && "id" in data ? String(data.id) : normalized.id;
    await auditLog({ actor: user, action: `${request.method} ${normalized.key}`, entity: normalized.key, entityId, metadata: { path: request.nextUrl.pathname } });
    return ok(data, { resource: normalized.key });
  } catch (error) {
    return mapError(error);
  }
}

function mapError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return fail("DATABASE_ERROR", error.message, 400);
  }
  if (error instanceof Error) {
    if (error.message === "Unauthorized") return fail("UNAUTHORIZED", "Authentication is required.", 401);
    if (error.message === "Forbidden" || error.message === "Scope denied") return fail("FORBIDDEN", "You do not have access to this resource.", 403);
    if (error.message === "Insufficient stock") return fail("INSUFFICIENT_STOCK", error.message, 409);
    if (error.name === "ZodError") return fail("VALIDATION_ERROR", "Invalid request payload.", 422, JSON.parse(error.message));
    return fail("BAD_REQUEST", error.message, 400);
  }
  return fail("INTERNAL_ERROR", "Unexpected server error.", 500);
}
