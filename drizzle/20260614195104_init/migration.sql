CREATE TABLE "bookmarks" (
	"user_id" uuid,
	"snack_item_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookmarks_pkey" PRIMARY KEY("user_id","snack_item_id")
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "comment_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"comment_id" uuid NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comment_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"reporter_id" uuid NOT NULL,
	"comment_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"review_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "review_reactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"review_id" uuid NOT NULL,
	"type" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"reporter_id" uuid NOT NULL,
	"review_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"token_hash" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "snack_item_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"snack_item_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "snack_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"brand_id" uuid,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"description" text,
	"price" numeric(10,2),
	"barcode" text,
	"avg_rating" numeric(3,2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "snack_review_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"review_id" uuid NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "snack_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"snack_item_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "snack_tags" (
	"snack_item_id" uuid,
	"tag_id" uuid,
	CONSTRAINT "snack_tags_pkey" PRIMARY KEY("snack_item_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL UNIQUE,
	"slug" text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"first_name" text,
	"last_name" text,
	"profile_picture_url" text,
	"role" text DEFAULT 'user' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"email_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "comment_reactions_user_comment_unique_idx" ON "comment_reactions" ("user_id","comment_id");--> statement-breakpoint
CREATE INDEX "comment_reactions_comment_id_idx" ON "comment_reactions" ("comment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "comment_reports_reporter_comment_unique_idx" ON "comment_reports" ("reporter_id","comment_id");--> statement-breakpoint
CREATE INDEX "comments_review_id_idx" ON "comments" ("review_id");--> statement-breakpoint
CREATE INDEX "comments_parent_comment_id_idx" ON "comments" ("parent_comment_id");--> statement-breakpoint
CREATE INDEX "email_verifications_user_id_idx" ON "email_verifications" ("user_id");--> statement-breakpoint
CREATE INDEX "password_resets_user_id_idx" ON "password_resets" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_reactions_user_review_unique_idx" ON "review_reactions" ("user_id","review_id");--> statement-breakpoint
CREATE INDEX "review_reactions_review_id_idx" ON "review_reactions" ("review_id");--> statement-breakpoint
CREATE UNIQUE INDEX "review_reports_reporter_review_unique_idx" ON "review_reports" ("reporter_id","review_id");--> statement-breakpoint
CREATE INDEX "sessions_user_id_idx" ON "sessions" ("user_id");--> statement-breakpoint
CREATE INDEX "snack_item_images_snack_item_id_idx" ON "snack_item_images" ("snack_item_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "snack_items_barcode_unique_idx" ON "snack_items" ("barcode") WHERE barcode IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "snack_items_slug_unique_idx" ON "snack_items" ("slug") WHERE slug IS NOT NULL AND deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "snack_review_images_review_id_idx" ON "snack_review_images" ("review_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "snack_reviews_snack_user_unique_idx" ON "snack_reviews" ("snack_item_id","user_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "snack_reviews_snack_item_id_idx" ON "snack_reviews" ("snack_item_id");--> statement-breakpoint
CREATE INDEX "snack_reviews_user_id_idx" ON "snack_reviews" ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" ("email") WHERE deleted_at IS NULL;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_snack_item_id_snack_items_id_fkey" FOREIGN KEY ("snack_item_id") REFERENCES "snack_items"("id");--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "comment_reactions" ADD CONSTRAINT "comment_reactions_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id");--> statement-breakpoint
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_reporter_id_users_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "comment_reports" ADD CONSTRAINT "comment_reports_comment_id_comments_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_review_id_snack_reviews_id_fkey" FOREIGN KEY ("review_id") REFERENCES "snack_reviews"("id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_comment_id_comments_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "comments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "review_reactions" ADD CONSTRAINT "review_reactions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "review_reactions" ADD CONSTRAINT "review_reactions_review_id_snack_reviews_id_fkey" FOREIGN KEY ("review_id") REFERENCES "snack_reviews"("id");--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_reporter_id_users_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_snack_reviews_id_fkey" FOREIGN KEY ("review_id") REFERENCES "snack_reviews"("id");--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "snack_item_images" ADD CONSTRAINT "snack_item_images_snack_item_id_snack_items_id_fkey" FOREIGN KEY ("snack_item_id") REFERENCES "snack_items"("id");--> statement-breakpoint
ALTER TABLE "snack_items" ADD CONSTRAINT "snack_items_brand_id_brands_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id");--> statement-breakpoint
ALTER TABLE "snack_review_images" ADD CONSTRAINT "snack_review_images_review_id_snack_reviews_id_fkey" FOREIGN KEY ("review_id") REFERENCES "snack_reviews"("id");--> statement-breakpoint
ALTER TABLE "snack_reviews" ADD CONSTRAINT "snack_reviews_snack_item_id_snack_items_id_fkey" FOREIGN KEY ("snack_item_id") REFERENCES "snack_items"("id");--> statement-breakpoint
ALTER TABLE "snack_reviews" ADD CONSTRAINT "snack_reviews_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "snack_tags" ADD CONSTRAINT "snack_tags_snack_item_id_snack_items_id_fkey" FOREIGN KEY ("snack_item_id") REFERENCES "snack_items"("id");--> statement-breakpoint
ALTER TABLE "snack_tags" ADD CONSTRAINT "snack_tags_tag_id_tags_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id");