ALTER TABLE "snack_items" DROP CONSTRAINT "snack_items_brand_id_brands_id_fkey";--> statement-breakpoint
DROP TABLE "brands";--> statement-breakpoint
ALTER TABLE "snack_items" DROP COLUMN "brand_id";