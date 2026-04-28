import { z } from "zod";

export const paginationQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),
  clinicId: z.string().optional(),
  branchId: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export const resetPasswordSchema = z.object({
  token: z.string().min(8),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export async function parseJson<T>(request: Request, schema: z.ZodType<T>) {
  const body = await request.json().catch(() => ({}));
  return schema.safeParse(body);
}

