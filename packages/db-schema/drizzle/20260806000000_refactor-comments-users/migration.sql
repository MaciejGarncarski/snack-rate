-- Migration: Refactor snack_comments (userId/guestId → authorId/authorType)
--          and users (firstName/lastName → username)

-- ===========================================================================
-- 1. users: firstName/lastName → username
-- ===========================================================================

ALTER TABLE "users" ADD COLUMN "username" text;

UPDATE "users"
SET "username" = TRIM(
  COALESCE("first_name", '') ||
  CASE WHEN "first_name" IS NOT NULL AND "last_name" IS NOT NULL THEN ' ' ELSE '' END ||
  COALESCE("last_name", '')
)
WHERE "first_name" IS NOT NULL OR "last_name" IS NOT NULL;

ALTER TABLE "users" DROP COLUMN "first_name";
ALTER TABLE "users" DROP COLUMN "last_name";

-- ===========================================================================
-- 2. snack_comments: userId/guestId → authorId (uuid) + authorType
-- ===========================================================================

ALTER TABLE "snack_comments" ADD COLUMN "author_id" uuid;
ALTER TABLE "snack_comments" ADD COLUMN "author_type" text;

-- Migrate user rows (user_id is already a uuid)
UPDATE "snack_comments"
SET "author_id" = "user_id",
    "author_type" = 'user'
WHERE "user_id" IS NOT NULL;

-- Migrate guest rows (guest_id is nanoid string → generate new uuids)
UPDATE "snack_comments"
SET "author_id" = gen_random_uuid(),
    "author_type" = 'guest'
WHERE "guest_id" IS NOT NULL;

ALTER TABLE "snack_comments" ALTER COLUMN "author_id" SET NOT NULL;
ALTER TABLE "snack_comments" ALTER COLUMN "author_type" SET NOT NULL;

-- Drop old constraints and columns
ALTER TABLE "snack_comments" DROP CONSTRAINT "snack_comments_user_id_users_id_fkey";
DROP INDEX "snack_comments_user_snack_unique_idx";
DROP INDEX "snack_comments_guest_snack_unique_idx";
ALTER TABLE "snack_comments" DROP COLUMN "user_id";
ALTER TABLE "snack_comments" DROP COLUMN "guest_id";

-- New unique index
CREATE UNIQUE INDEX "snack_comments_author_snack_unique_idx"
  ON "snack_comments" ("author_id", "snack_item_id")
  WHERE rating IS NOT NULL AND deleted_at IS NULL;

-- Check constraints
ALTER TABLE "snack_comments"
  ADD CONSTRAINT "snack_comments_author_type_check"
  CHECK (author_type IN ('user', 'guest'));
