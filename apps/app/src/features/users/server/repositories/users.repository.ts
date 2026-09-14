import type { Database, DbTransaction } from "#/infrastructure/db/db";

export type UserRole = "user" | "moderator" | "admin";
export type UserStatus = "active" | "suspended" | "banned";

export type UserPermissions = {
  role: UserRole;
  status: UserStatus;
  canPublishSnacks: boolean;
};

const PUBLISH_ROLES: ReadonlySet<string> = new Set(["admin", "moderator"]);

type UsersRepositoryDeps = {
  db: Database;
};

export function createUsersRepository({ db }: UsersRepositoryDeps) {
  return {
    getUserPermissions: async (
      userId: string,
      tx?: DbTransaction,
    ): Promise<UserPermissions | null> => {
      const client = tx ?? db;

      const found = await client.query.user.findFirst({
        where: { id: userId },
        columns: { role: true, status: true },
      });

      if (!found) return null;

      const role = (found.role ?? "user") as UserRole;
      const status = (found.status ?? "active") as UserStatus;

      return {
        role,
        status,
        // Fail closed: only active admins/moderators auto-publish.
        // Guests, regular users, and suspended/banned accounts go to moderation.
        canPublishSnacks: status === "active" && PUBLISH_ROLES.has(role),
      };
    },
  };
}

export type UsersRepository = ReturnType<typeof createUsersRepository>;
