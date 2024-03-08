DO $$ BEGIN
 CREATE TYPE "mime_type" AS ENUM('audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/flac', 'audio/mp4', 'audio/mov', 'audio/wma', 'audio/ogg', 'audio/m4a', 'application/json', 'image/png', 'audio/sp-midi', 'audio/x-wav');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "provider_id" AS ENUM('github', 'google');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "track_asset_type" AS ENUM('generation', 'remix', 'original', 'vocals', 'accompaniment', 'bass', 'drums', 'guitar', 'piano', 'analysis', 'analysis_sonic', 'analysis_viz', 'midi', 'lyrics');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "replicate_task_status" AS ENUM('processing', 'succeeded', 'failed', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "asset" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"track_id" varchar(15),
	"track_type" "track_asset_type",
	"name" text NOT NULL,
	"mime_type" "mime_type",
	"updated_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "asset_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_verification_code" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(6) NOT NULL,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_account" (
	"provider_id" "provider_id" NOT NULL,
	"provider_user_id" text NOT NULL,
	"user_id" text NOT NULL,
	CONSTRAINT "oauth_account_provider_id_provider_user_id_pk" PRIMARY KEY("provider_id","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "password_reset_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "track" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"public" boolean DEFAULT false NOT NULL,
	"music_generation_status" "replicate_task_status",
	"style_remix_status" "replicate_task_status",
	"track_separation_status" "replicate_task_status",
	"track_analysis_status" "replicate_task_status",
	"midi_transcription_status" "replicate_task_status",
	"lyrics_transcription_status" "replicate_task_status",
	"updated_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"username" text NOT NULL,
	"username_lower" text NOT NULL,
	"hashed_password" text,
	"updated_at" timestamp NOT NULL,
	"created_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username"),
	CONSTRAINT "user_username_lower_unique" UNIQUE("username_lower")
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_user_id_idx" ON "asset" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "asset_track_id_idx" ON "asset" ("track_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_verification_user_id_idx" ON "email_verification_code" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_account_provider_id_idx" ON "oauth_account" ("provider_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_account_provider_user_id_idx" ON "oauth_account" ("provider_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "oauth_account_user_id_idx" ON "oauth_account" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "password_reset_user_id_idx" ON "password_reset_token" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "track_user_id_idx" ON "track" ("user_id");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset" ADD CONSTRAINT "asset_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "asset" ADD CONSTRAINT "asset_track_id_track_id_fk" FOREIGN KEY ("track_id") REFERENCES "track"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_verification_code" ADD CONSTRAINT "email_verification_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_account" ADD CONSTRAINT "oauth_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "password_reset_token" ADD CONSTRAINT "password_reset_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "track" ADD CONSTRAINT "track_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
