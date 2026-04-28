import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ resource: string }>;
};

const resourceToModel: Record<string, string> = {
  patients: "patient",
  branches: "branch",
  doctors: "doctorProfile",
  products: "product",
  services: "service",
  sources: "source",
  suppliers: "supplier"
};

export async function GET(request: Request, { params }: Context) {
  try {
    const user = await getCurrentUser();
    const { resource } = await params;
    const model = resourceToModel[resource];
    const clinicId = user.clinicIds[0];

    if (!model) return NextResponse.json({ error: "Unsupported resource" }, { status: 400 });
    if (!clinicId) return NextResponse.json({ error: "No clinic assigned" }, { status: 403 });

    let data;

    if (resource === "doctors") {
      const doctors = await prisma.doctorProfile.findMany({
        where: { branch: { clinicId } },
        include: { staffProfile: true }
      });
      data = doctors.map(d => ({
        id: d.id,
        name: `${d.staffProfile.firstName} ${d.staffProfile.lastName}`
      }));
    } else if (resource === "patients") {
      const patients = await prisma.patient.findMany({
        where: { clinicId },
        select: { id: true, firstName: true, lastName: true }
      });
      data = patients.map(p => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`
      }));
    } else {
      data = await (prisma as any)[model].findMany({
        where: { OR: [{ clinicId }, { organizationId: clinicId }] },
        select: { id: true, name: true }
      });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
