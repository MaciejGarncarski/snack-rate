CREATE TABLE "snack_comments" (
	"id" uuid PRIMARY KEY DEFAULT uuidv7(),
	"snack_item_id" uuid NOT NULL,
	"user_id" uuid,
	"guest_id" text,
	"parent_comment_id" uuid,
	"rating" integer,
	"body" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "snack_comments_rating_check" CHECK (rating IS NULL OR (parent_comment_id IS NULL AND rating BETWEEN 1 AND 5))
);
--> statement-breakpoint
INSERT INTO "snack_comments" ("id", "snack_item_id", "user_id", "guest_id", "rating", "created_at", "updated_at", "deleted_at")
SELECT "id", "snack_item_id", "user_id", "guest_id", "rating", "created_at", "updated_at", "deleted_at"
FROM "snack_reviews";--> statement-breakpoint
DELETE FROM "comment_reactions" WHERE "comment_id" NOT IN (SELECT "id" FROM "snack_comments");--> statement-breakpoint
DELETE FROM "comment_reports" WHERE "comment_id" NOT IN (SELECT "id" FROM "snack_comments");--> statement-breakpoint
ALTER TABLE "comment_reactions" DROP CONSTRAINT "comment_reactions_comment_id_comments_id_fkey";--> statement-breakpoint
ALTER TABLE "comment_reports" DROP CONSTRAINT "comment_reports_comment_id_comments_id_fkey";--> statement-breakpoint
DROP TABLE "comments";--> statement-breakpoint
DROP TABLE "snack_reviews";--> statement-breakpoint
CREATE UNIQUE INDEX "snack_comments_user_snack_unique_idx" ON "snack_comments" ("user_id","snack_item_id") WHERE user_id IS NOT NULL AND rating IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "snack_comments_guest_snack_unique_idx" ON "snack_comments" ("guest_id","snack_item_id") WHERE guest_id IS NOT NULL AND rating IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "snack_comments_snack_item_idx" ON "snack_comments" ("snack_item_id");--> statement-breakpoint
CREATE INDEX "snack_comments_parent_comment_idx" ON "snack_comments" ("parent_comment_id");--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_snack_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "snack_comments"("id");--> statement-breakpoint
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_comment_id_snack_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "snack_comments"("id");--> statement-breakpoint
ALTER TABLE "snack_comments" ADD CONSTRAINT "snack_comments_snack_item_id_snack_items_id_fkey" FOREIGN KEY ("snack_item_id") REFERENCES "snack_items"("id");--> statement-breakpoint
ALTER TABLE "snack_comments" ADD CONSTRAINT "snack_comments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "snack_comments" ADD CONSTRAINT "snack_comments_parent_comment_id_snack_comments_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "snack_comments"("id") ON DELETE CASCADE;