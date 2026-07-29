ALTER TABLE "snack_reviews" ADD COLUMN "guest_id" text;--> statement-breakpoint
ALTER TABLE "snack_reviews" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
DROP INDEX "snack_reviews_user_snack_unique_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "snack_reviews_user_snack_unique_idx" ON "snack_reviews" ("user_id","snack_item_id") WHERE user_id IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "snack_reviews_guest_snack_unique_idx" ON "snack_reviews" ("guest_id","snack_item_id") WHERE guest_id IS NOT NULL AND deleted_at IS NULL;