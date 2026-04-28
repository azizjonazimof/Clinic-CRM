import { NextRequest } from "next/server";
import { handleRoleApi, handleRoleMutation } from "@/lib/api-router";

type Context = {
  params: Promise<{ resource?: string[] }>;
};

export async function GET(request: NextRequest, context: Context) {
  const params = await context.params;
  return handleRoleApi(request, "CLINIC_ADMIN", params.resource ?? []);
}

export async function POST(request: NextRequest, context: Context) {
  const params = await context.params;
  return handleRoleMutation(request, "CLINIC_ADMIN", params.resource ?? []);
}

export async function PATCH(request: NextRequest, context: Context) {
  const params = await context.params;
  return handleRoleMutation(request, "CLINIC_ADMIN", params.resource ?? []);
}

