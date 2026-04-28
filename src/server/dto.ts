import { z } from "zod";

export const idSchema = z.string().min(1);

export const clinicCreateSchema = z.object({
  name: z.string().min(2),
  legalName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  region: z.string().optional()
});

export const branchCreateSchema = z.object({
  clinicId: z.string().min(1),
  name: z.string().min(2),
  address: z.string().min(2),
  city: z.string().optional(),
  region: z.string().optional(),
  phone: z.string().optional()
});

export const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.enum(["SUPER_ADMIN", "CLINIC_ADMIN", "DOCTOR"]),
  clinicIds: z.array(z.string()).default([]),
  branchIds: z.array(z.string()).default([]),
  doctorProfile: z
    .object({
      branchId: z.string().min(1),
      specialty: z.string().min(1),
      licenseNumber: z.string().optional(),
      bio: z.string().optional()
    })
    .optional()
});

export const patientCreateSchema = z.object({
  clinicId: z.string().min(1),
  branchId: z.string().min(1),
  assignedDoctorId: z.string().optional(),
  sourceId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(3),
  email: z.string().email().optional(),
  birthDate: z.string().datetime().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  medicalSummary: z.string().optional()
});

export const serviceCreateSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(2),
  category: z.string().optional(),
  price: z.coerce.number().nonnegative(),
  durationMin: z.coerce.number().int().positive().optional()
});

export const roomCreateSchema = z.object({
  branchId: z.string().min(1),
  name: z.string().min(1),
  type: z.string().optional(),
  serviceIds: z.array(z.string()).default([])
});

export const supplierCreateSchema = z.object({
  clinicId: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional()
});

export const productCreateSchema = z.object({
  branchId: z.string().min(1),
  supplierId: z.string().optional(),
  sku: z.string().min(1),
  name: z.string().min(2),
  category: z.string().optional(),
  unit: z.string().min(1),
  stockQuantity: z.coerce.number().default(0),
  lowStockThreshold: z.coerce.number().default(0),
  expiresAt: z.string().datetime().optional()
});

export const stockAdjustmentSchema = z.object({
  branchId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.coerce.number(),
  type: z.enum(["PURCHASE", "USAGE", "ADJUSTMENT", "RETURN", "EXPIRED"]).default("ADJUSTMENT"),
  patientId: z.string().optional(),
  consultationId: z.string().optional(),
  note: z.string().optional()
});

export const sourceCreateSchema = z.object({
  clinicId: z.string().min(1),
  name: z.string().min(2),
  type: z.string().optional()
});

export const invoiceCreateSchema = z.object({
  clinicId: z.string().min(1),
  branchId: z.string().min(1),
  patientId: z.string().min(1),
  doctorProfileId: z.string().optional(),
  discount: z.coerce.number().default(0),
  tax: z.coerce.number().default(0),
  items: z.array(
    z.object({
      serviceId: z.string().optional(),
      productId: z.string().optional(),
      type: z.enum(["SERVICE", "PRODUCT", "CUSTOM"]),
      description: z.string().min(1),
      quantity: z.coerce.number().positive(),
      unitPrice: z.coerce.number().nonnegative()
    })
  ).min(1)
});

export const paymentCreateSchema = z.object({
  clinicId: z.string().min(1),
  branchId: z.string().min(1),
  invoiceId: z.string().optional(),
  patientId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "INSURANCE", "OTHER"]),
  note: z.string().optional()
});

export const consultationCreateSchema = z.object({
  patientId: z.string().min(1),
  doctorProfileId: z.string().min(1),
  complaints: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  notes: z.string().optional(),
  followUpAt: z.string().datetime().optional(),
  status: z.enum(["DRAFT", "COMPLETED", "CANCELLED"]).default("COMPLETED"),
  goodsUsed: z.array(stockAdjustmentSchema.omit({ type: true, consultationId: true })).default([])
});

export const patchStatusSchema = z.object({
  status: z.string().optional()
}).passthrough();

