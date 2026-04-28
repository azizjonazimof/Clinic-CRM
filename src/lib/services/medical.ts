import { prisma } from "@/lib/prisma";
import { StockMovementType, EncounterServiceStatus, InventoryBatchStatus } from "@prisma/client";

export async function completeEncounterService(encounterServiceId: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Get the service and its required products
    const encounterService = await tx.encounterService.findUnique({
      where: { id: encounterServiceId },
      include: {
        encounter: {
          include: {
            branch: {
              include: {
                warehouses: {
                  where: { isDefault: true },
                  take: 1
                }
              }
            }
          }
        },
        service: {
          include: {
            requiredProducts: true
          }
        }
      }
    });

    if (!encounterService || encounterService.status === EncounterServiceStatus.COMPLETED) {
      throw new Error("Service not found or already completed");
    }

    const warehouse = encounterService.encounter.branch.warehouses[0];
    if (!warehouse) {
      throw new Error("No default warehouse found for this branch");
    }

    // 2. Handle product consumption
    for (const reqProduct of encounterService.service.requiredProducts) {
      let remainingToConsume = reqProduct.quantity.toNumber() * encounterService.quantity.toNumber();

      // Find batches for this product in the warehouse (FEFO: First Expiry First Out)
      const batches = await tx.inventoryBatch.findMany({
        where: {
          productId: reqProduct.productId,
          warehouseId: warehouse.id,
          quantityRemaining: { gt: 0 },
          status: InventoryBatchStatus.ACTIVE
        },
        orderBy: [
          { expiryDate: "asc" },
          { createdAt: "asc" }
        ]
      });

      for (const batch of batches) {
        if (remainingToConsume <= 0) break;

        const consumeFromBatch = Math.min(batch.quantityRemaining.toNumber(), remainingToConsume);

        // Create consumption record
        await tx.encounterProductConsumption.create({
          data: {
            encounterServiceId: encounterService.id,
            productId: reqProduct.productId,
            batchId: batch.id,
            quantity: consumeFromBatch,
            unitCost: batch.unitCost,
            totalCost: batch.unitCost.toNumber() * consumeFromBatch
          }
        });

        // Create stock movement
        await tx.stockMovement.create({
          data: {
            organizationId: encounterService.encounter.organizationId,
            branchId: encounterService.encounter.branchId,
            warehouseId: warehouse.id,
            productId: reqProduct.productId,
            batchId: batch.id,
            movementType: StockMovementType.CONSUME,
            referenceType: "encounter_service",
            referenceId: encounterService.id,
            quantity: consumeFromBatch,
            unitCost: batch.unitCost,
            createdByUserId: userId,
            notes: `Consumed for encounter ${encounterService.encounterId}`
          }
        });

        // Update batch
        await tx.inventoryBatch.update({
          where: { id: batch.id },
          data: {
            quantityRemaining: { decrement: consumeFromBatch },
            status: (batch.quantityRemaining.toNumber() - consumeFromBatch) <= 0 ? InventoryBatchStatus.EXHAUSTED : InventoryBatchStatus.ACTIVE
          }
        });

        remainingToConsume -= consumeFromBatch;
      }

      if (remainingToConsume > 0 && !reqProduct.isOptional) {
        throw new Error(`Insufficient stock for product ${reqProduct.productId}`);
      }
    }

    // 3. Update service status
    return await tx.encounterService.update({
      where: { id: encounterServiceId },
      data: {
        status: EncounterServiceStatus.COMPLETED,
        serviceEndedAt: new Date()
      }
    });
  });
}

export async function createInvoiceFromEncounter(encounterId: string, userId: string) {
  return await prisma.$transaction(async (tx) => {
    const encounter = await tx.encounter.findUnique({
      where: { id: encounterId },
      include: {
        services: {
          include: {
            service: true
          }
        },
        patient: true,
        organization: true
      }
    });

    if (!encounter) throw new Error("Encounter not found");

    // Calculate totals
    let subtotal = 0;
    const itemsData = encounter.services.map(es => {
      const lineTotal = es.totalAmount.toNumber();
      subtotal += lineTotal;
      return {
        itemType: "service",
        serviceId: es.serviceId,
        encounterServiceId: es.id,
        description: es.service.name,
        quantity: es.quantity,
        unitPrice: es.unitPrice,
        discountAmount: es.discountAmount,
        taxAmount: es.taxAmount,
        lineTotal: es.totalAmount
      };
    });

    // Generate invoice number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await tx.invoice.count({ where: { organizationId: encounter.organizationId } });
    const invoiceNumber = `INV-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

    return await tx.invoice.create({
      data: {
        organizationId: encounter.organizationId,
        branchId: encounter.branchId,
        patientId: encounter.patientId,
        encounterId: encounter.id,
        doctorProfileId: encounter.doctorProfileId,
        invoiceNumber,
        subtotal,
        totalAmount: subtotal,
        currencyCode: encounter.organization.currencyCode || "UZS",
        createdByUserId: userId,
        status: "ISSUED",
        items: {
          create: itemsData
        }
      }
    });
  });
}
