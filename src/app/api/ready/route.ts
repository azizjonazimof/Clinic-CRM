import { Prisma } from "@prisma/client";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw(Prisma.sql`SELECT 1`);
    return ok({
      status: "ready",
      database: "ok",
      timestamp: new Date().toISOString()
    });
  } catch {
    return fail("NOT_READY", "Database connection is not ready.", 503);
  }
}

