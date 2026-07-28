ALTER TABLE "comments" DROP CONSTRAINT "comments_review_id_snack_reviews_id_fkey";--> statement-breakpoint
DROP TABLE "review_reactions";--> statement-breakpoint
DROP TABLE "review_reports";--> statement-breakpoint
DROP TABLE "snack_review_images";--> statement-breakpoint
DROP INDEX "snack_reviews_snack_user_unique_idx";--> statement-breakpoint
DROP INDEX "snack_reviews_snack_item_id_idx";--> statement-breakpoint
DROP INDEX "snack_reviews_user_id_idx";--> statement-breakpoint
DROP INDEX "comments_review_id_idx";--> statement-breakpoint
DROP INDEX "comments_parent_comment_id_idx";--> statement-breakpoint
ALTER TABLE "comments" DROP COLUMN "review_id";--> statement-breakpoint
ALTER TABLE "snack_reviews" DROP COLUMN "comment";--> statement-breakpoint
CREATE UNIQUE INDEX "snack_reviews_user_snack_unique_idx" ON "snack_reviews" ("user_id","snack_item_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "snack_reviews_snack_item_idx" ON "snack_reviews" ("snack_item_id");