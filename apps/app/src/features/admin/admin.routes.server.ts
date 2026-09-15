import { ORPCError } from "@orpc/server";
import * as z from "zod";

import { adminRepository } from "#/features/admin/server/admin.repository.instance";
import { getMainDb } from "#/infrastructure/db/db";
import { baseProcedure } from "#/lib/orpc/procedure";
import { adminAuthMiddleware } from "#/middlewares/auth-middleware.server.ts";

export const listAdminCommentsProcedure = baseProcedure
  .use(adminAuthMiddleware)
  .input(
    z.object({
      limit: z.number().int().min(1).max(50).default(20).optional(),
      cursor: z.string().optional().nullable(),
    }),
  )
  .handler(({ input }) => {
    return adminRepository.listComments({
      limit: input.limit ?? 20,
      cursor: input.cursor ?? null,
    });
  });

export const deleteAdminCommentProcedure = baseProcedure
  .use(adminAuthMiddleware)
  .input(
    z.object({
      commentId: z.uuid(),
    }),
  )
  .handler(({ input }) => {
    const db = getMainDb();
    return db.transaction(async (tx) => {
      const snackItemId = await adminRepository.deleteComment(input.commentId, tx);
      if (!snackItemId) {
        throw new ORPCError("NOT_FOUND", { message: "Komentarz nie znaleziony" });
      }
      return { ok: true };
    });
  });

export const listPendingSnacksProcedure = baseProcedure
  .use(adminAuthMiddleware)
  .input(
    z.object({
      limit: z.number().int().min(1).max(50).default(20).optional(),
      cursor: z.string().optional().nullable(),
    }),
  )
  .handler(({ input }) => {
    return adminRepository.listPendingSnacks({
      limit: input.limit ?? 20,
      cursor: input.cursor ?? null,
    });
  });

export const reviewSnackProcedure = baseProcedure
  .use(adminAuthMiddleware)
  .input(
    z.object({
      snackItemId: z.uuid(),
      decision: z.enum(["accept", "reject"]),
    }),
  )
  .handler(async ({ input }) => {
    const status = await adminRepository.reviewSnack(input.snackItemId, input.decision);
    if (!status) {
      throw new ORPCError("NOT_FOUND", {
        message: "Produkt nie znaleziony lub już rozpatrzony",
      });
    }
    return { ok: true, status };
  });

export const getSnackProcedure = baseProcedure
  .use(adminAuthMiddleware)
  .input(
    z.object({
      snackItemId: z.uuid(),
    }),
  )
  .handler(async ({ input }) => {
    const snack = await adminRepository.getSnack(input.snackItemId);
    if (!snack) {
      throw new ORPCError("NOT_FOUND", { message: "Produkt nie znaleziony" });
    }
    return { snack };
  });

export const updateSnackProcedure = baseProcedure
  .use(adminAuthMiddleware)
  .input(
    z.object({
      snackItemId: z.uuid(),
      name: z.string().trim().min(1).max(200),
      description: z.string().trim().max(500).nullable(),
      typeId: z.uuid(),
    }),
  )
  .handler(async ({ input }) => {
    const result = await adminRepository.updateSnack({
      snackItemId: input.snackItemId,
      name: input.name,
      description: input.description?.length ? input.description : null,
      typeId: input.typeId,
    });
    if (result.status === "not-found") {
      throw new ORPCError("NOT_FOUND", { message: "Produkt nie znaleziony" });
    }
    if (result.status === "unknown-type") {
      throw new ORPCError("BAD_REQUEST", { message: "Nieznany rodzaj produktu" });
    }
    return { snack: result.snack };
  });

export const reorderSnackImagesProcedure = baseProcedure
  .use(adminAuthMiddleware)
  .input(
    z.object({
      snackItemId: z.uuid(),
      orderedImageIds: z.array(z.uuid()).min(1).max(20),
    }),
  )
  .handler(async ({ input }) => {
    const ok = await adminRepository.reorderSnackImages(input.snackItemId, input.orderedImageIds);
    if (!ok) {
      throw new ORPCError("NOT_FOUND", {
        message: "Produkt nie znaleziony lub lista grafik jest niekompletna",
      });
    }
    const snack = await adminRepository.getSnack(input.snackItemId);
    return { snack };
  });

export const deleteSnackImageProcedure = baseProcedure
  .use(adminAuthMiddleware)
  .input(
    z.object({
      snackItemId: z.uuid(),
      imageId: z.uuid(),
    }),
  )
  .handler(async ({ input }) => {
    const result = await adminRepository.deleteSnackImage(input.snackItemId, input.imageId);
    if (!result) {
      throw new ORPCError("NOT_FOUND", { message: "Grafika nie znaleziona" });
    }
    const snack = await adminRepository.getSnack(input.snackItemId);
    return { snack };
  });
