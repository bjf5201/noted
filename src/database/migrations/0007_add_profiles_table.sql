CREATE TABLE "profiles" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"name" varchar(50) DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"bio" text DEFAULT '' NOT NULL,
	"keywords" text[] DEFAULT '{}' NOT NULL,
	"profile_image_uri" text DEFAULT 'https://localhost:3000/images/defaultProfile.jpg' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
DROP TYPE "public"."visibility";