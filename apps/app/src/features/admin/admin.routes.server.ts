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
