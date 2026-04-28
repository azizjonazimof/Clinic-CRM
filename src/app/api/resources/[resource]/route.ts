import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/session";

type Context = {
  params: Promise<{ resource: string }>;
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
    const { resource } = await params;
    const model = resourceToModel[resource];
    const clinicId = user.clinicIds[0];

    if (!model) return NextResponse.json({ error: "Unsupported resource" }, { status: 400 });
    if (!clinicId) return NextResponse.json({ error: "No clinic assigned" }, { status: 403 });

    const records = await (prisma as any)[model].findMany({
      where: { OR: [{ clinicId }, { organizationId: clinicId }] },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ data: records });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Context) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const { resource } = await params;
    const clinicId = body.clinicId || user.clinicIds[0];

    if (!user.clinicIds.includes(clinicId)) {
      return NextResponse.json({ error: "Unauthorized scope" }, { status: 403 });
    }

    let result;

    switch (resource) {
      case "patients": {
        const branch = await prisma.branch.findFirst({ where: { clinicId } });
        if (!branch) throw new Error("No branch found for clinic. Please create a branch first.");

        result = await prisma.patient.create({
          data: {
            ...body,
            clinicId,
            branchId: body.branchId || branch.id,
            createdByUserId: user.id,
            status: "ACTIVE"
          }
        });
        break;
      }
      case "services": {
        const branch = await prisma.branch.findFirst({ where: { clinicId } });
        result = await prisma.service.create({
          data: {
            name: body.name,
            basePrice: body.basePrice,
            durationMinutes: body.durationMinutes || body.estimatedDuration,
            organizationId: clinicId,
            branchId: body.branchId || branch?.id || null,
            isActive: true
          }
        });
        break;
      }
      case "products":
        result = await prisma.product.create({
          data: {
            ...body,
            organizationId: clinicId,
            isActive: true
          }
        });
        break;
      case "branches":
        result = await prisma.branch.create({
          data: {
            ...body,
            clinicId,
            status: "ACTIVE"
          }
        });
        break;
      case "doctors": {
        const doctorRole = await prisma.role.findUnique({ where: { code: "DOCTOR" } });
        if (!doctorRole) throw new Error("Doctor role not found");

        result = await prisma.$transaction(async (tx) => {
          const newUser = await tx.user.create({
            data: {
              email: body.email,
              firstName: body.firstName,
              lastName: body.lastName,
              passwordHash: "CHANGE_ME",
              role: "DOCTOR"
            }
          });

          const orgUser = await tx.organizationUser.create({
            data: {
              organizationId: clinicId,
              userId: newUser.id,
              roleId: doctorRole.id,
              status: "ACTIVE"
            }
          });

          const staff = await tx.staffProfile.create({
            data: {
              organizationUserId: orgUser.id,
              firstName: body.firstName,
              lastName: body.lastName
            }
          });

          const branch = await tx.branch.findFirst({ where: { clinicId } });
          if (!branch) throw new Error("No branch found for clinic");

          return await tx.doctorProfile.create({
            data: {
              userId: newUser.id,
              staffProfileId: staff.id,
              branchId: branch.id,
              specialty: body.specialty || "General Medicine",
              licenseNumber: body.licenseNumber || null,
              status: "ACTIVE"
            }
          });
        });
        break;
      }
      default:
        return NextResponse.json({ error: "Unsupported resource" }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error(error);
    let message = error.message;
    
    // Handle Prisma Unique Constraint Violation
    if (error.code === "P2002") {
      const target = error.meta?.target || [];
      if (target.includes("email")) {
        message = resource === "doctors" || resource === "users" 
          ? "A staff member with this email already exists"
          : "This email is already associated with an account";
      } else {
        message = "A record with this information already exists in the system";
      }
    }
    
    return NextResponse.json({ error: message }, { status: error.code === "P2002" ? 409 : 500 });
  }
}
