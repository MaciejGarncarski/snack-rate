import { ORPCError } from "@orpc/server";
import { getCookie } from "@orpc/server/helpers";
import { setCookie } from "@tanstack/react-start/server";
import * as z from "zod";

import { adminRepository } from "#/features/admin/server/admin.repository.instance";
import { getMainDb } from "#/infrastructure/db/db";
import { cookies } from "#/lib/cookie.config";
import { baseProcedure } from "#/lib/orpc";
import { serverEnv } from "#/lib/server.env";

function getExpectedPassword(): string {
  return serverEnv.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD ?? "admin123";
}

function requireAdminAuth(requestHeaders: Headers) {
  const cookieValue = getCookie(requestHeaders, cookies.adminAuth.name);
  const expected = getExpectedPassword();
  if (!cookieValue || cookieValue !== expected) {
    throw new ORPCError("UNAUTHORIZED", { message: "Nieprawidłowe hasło administratora" });
  }
}

export const verifyAdminPasswordProcedure = baseProcedure
  .input(z.object({ password: z.string().min(1) }))
  .handler(({ input }) => {
    const expected = getExpectedPassword();
    if (input.password !== expected) {
      throw new ORPCError("UNAUTHORIZED", { message: "Nieprawidłowe hasło administratora" });
    }
    setCookie(cookies.adminAuth.name, expected, cookies.adminAuth.options);
    return { ok: true };
  });

export const checkAdminAuthProcedure = baseProcedure.handler(({ context }) => {
  requireAdminAuth(context.requestHeaders);
  return { ok: true };
});

export const logoutAdminProcedure = baseProcedure.input(z.object({}).optional()).handler(() => {
  setCookie(cookies.adminAuth.name, "", {
    ...cookies.adminAuth.options,
    maxAge: 0,
    expires: new Date(0),
  });
  return { ok: true };
});

export const listAdminCommentsProcedure = baseProcedure
  .input(
    z.object({
      limit: z.number().int().min(1).max(50).default(20).optional(),
      cursor: z.string().optional().nullable(),
    }),
  )
  .handler(({ input, context }) => {
    requireAdminAuth(context.requestHeaders);
    return adminRepository.listComments({
      limit: input.limit ?? 20,
      cursor: input.cursor ?? null,
    });
  });

export const deleteAdminCommentProcedure = baseProcedure
  .input(
    z.object({
      commentId: z.uuid(),
    }),
  )
  .handler(({ input, context }) => {
    requireAdminAuth(context.requestHeaders);
    const db = getMainDb();
    return db.transaction(async (tx) => {
      const snackItemId = await adminRepository.deleteComment(input.commentId, tx);
      if (!snackItemId) {
        throw new ORPCError("NOT_FOUND", { message: "Komentarz nie znaleziony" });
      }
      return { ok: true };
    });
  });
