import type { SessionUser } from "@/types/domain";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type AuditAction = {
  actor: SessionUser;
  action: string;
  entity: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export async function auditLog(action: AuditAction) {
  return prisma.auditLog.create({
    data: {
      actorId: action.actor.id,
      clinicId: action.actor.clinicIds[0],
      action: action.action,
      entity: action.entity,
      entityId: action.entityId,
      metadata: action.metadata as Prisma.InputJsonValue | undefined
    }
  });
}
