import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ resource: string; id: string }>;
};

const resourceToModel: Record<string, string> = {
  patients: "patient",
  doctors: "doctorProfile",
  services: "service",
  products: "product",
  invoices: "invoice",
  branches: "branch",
  suppliers: "supplier"
};

export async function GET(request: Request, { params }: Context) {
  try {
    const user = await getCurrentUser();
    const { resource, id } = await params;
    const model = resourceToModel[resource];
    const clinicId = user.clinicIds[0];

    if (!model) return NextResponse.json({ error: "Unsupported resource" }, { status: 400 });

    const record = await (prisma as any)[model].findFirst({
      where: { id, OR: [{ clinicId }, { organizationId: clinicId }] }
    });

    return NextResponse.json({ data: record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { resource, id } = await params;
    const model = resourceToModel[resource];
    const clinicId = user.clinicIds[0];

    if (!model) return NextResponse.json({ error: "Unsupported resource" }, { status: 400 });

    const result = await (prisma as any)[model].update({
      where: { id, OR: [{ clinicId }, { organizationId: clinicId }] },
      data: body
    });

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    const user = await getCurrentUser();
    const { resource, id } = await params;
    const model = resourceToModel[resource];
    const clinicId = user.clinicIds[0];

    if (!model) return NextResponse.json({ error: "Unsupported resource" }, { status: 400 });

    await (prisma as any)[model].delete({
      where: { id, OR: [{ clinicId }, { organizationId: clinicId }] }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
