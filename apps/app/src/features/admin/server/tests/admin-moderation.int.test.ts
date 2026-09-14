import {
  createAdminRepository,
  type AdminRepository,
} from "#/features/admin/server/admin.repository";
import type { Database } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";
import { noopGetFileUrl } from "#/tests/utils";

let db: Database;
let repository: AdminRepository;

beforeAll(() => {
  db = getDb();
  repository = createAdminRepository({ db, getFileUrl: noopGetFileUrl });
});

describe("admin snack moderation", () => {
  it("lists only pending snacks", async () => {
    const pending = await createSnack({ status: "pending" });
    await createSnack({ status: "published" });
    await createSnack({ status: "rejected" });

    const result = await repository.listPendingSnacks({ limit: 20, cursor: null });

    const ids = result.snacks.map((s) => s.id);
    expect(ids).toContain(pending.id);
    expect(result.snacks.every((s) => s.id !== undefined)).toBe(true);
  });

  it("accepts a pending snack", async () => {
    const snack = await createSnack({ status: "pending" });

    const status = await repository.reviewSnack(snack.id, "accept");

    expect(status).toBe("published");
    const row = await db.query.snackItems.findFirst({ where: { id: snack.id } });
    expect(row?.status).toBe("published");
  });

  it("rejects a pending snack", async () => {
    const snack = await createSnack({ status: "pending" });

    const status = await repository.reviewSnack(snack.id, "reject");

    expect(status).toBe("rejected");
  });

  it("returns null when reviewing an already-reviewed or missing snack", async () => {
    const snack = await createSnack({ status: "pending" });

    expect(await repository.reviewSnack(snack.id, "accept")).toBe("published");
    expect(await repository.reviewSnack(snack.id, "reject")).toBeNull();
    expect(
      await repository.reviewSnack("00000000-0000-0000-0000-000000000000", "accept"),
    ).toBeNull();
  });
});
