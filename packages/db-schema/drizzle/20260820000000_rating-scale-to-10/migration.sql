-- Migration: change rating scale from 1-5 to 1-10

-- ===========================================================================
-- 1. Relax the check constraint before scaling data (5 * 2 = 10 would violate
--    the old 1-5 bound)
-- ===========================================================================

ALTER TABLE "snack_comments" DROP CONSTRAINT "snack_comments_rating_check";

-- ===========================================================================
-- 2. Data migration: double existing ratings to preserve relative meaning
--    (avg_rating is widened to numeric(4,2) first — 10.00 overflows numeric(3,2))
-- ===========================================================================

ALTER TABLE "snack_items" ALTER COLUMN "avg_rating" TYPE numeric(4, 2);

UPDATE "snack_comments" SET "rating" = "rating" * 2 WHERE "rating" IS NOT NULL;

UPDATE "snack_items" SET "avg_rating" = "avg_rating" * 2;

-- ===========================================================================
-- 3. Re-add the check constraint for the 1-10 scale
-- ===========================================================================

ALTER TABLE "snack_comments" ADD CONSTRAINT "snack_comments_rating_check"
  CHECK (rating IS NULL OR (parent_comment_id IS NULL AND rating BETWEEN 1 AND 10));