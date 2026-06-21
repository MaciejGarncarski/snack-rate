CREATE TABLE "snack_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	CONSTRAINT "snack_types_name_unique" UNIQUE("name"),
	CONSTRAINT "snack_types_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "snack_items" ADD COLUMN "type_id" uuid;--> statement-breakpoint
ALTER TABLE "snack_items" ADD CONSTRAINT "snack_items_type_id_snack_types_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."snack_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
DROP TABLE "snack_tags";--> statement-breakpoint
DROP TABLE "tags";
