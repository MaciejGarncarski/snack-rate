ALTER TABLE "snack_items" ADD COLUMN "author_id" text;--> statement-breakpoint
CREATE INDEX "snack_items_author_id_idx" ON "snack_items" ("author_id");--> statement-breakpoint
ALTER TABLE "snack_items" ADD CONSTRAINT "snack_items_author_id_user_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL;