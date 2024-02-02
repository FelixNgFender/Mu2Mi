ALTER TABLE "asset" ALTER COLUMN "id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "original_asset_id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "vocals_asset_id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "accompaniment_asset_id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "bass_asset_id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "drums_asset_id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "guitar_asset_id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "piano_asset_id" SET DATA TYPE varchar(15);--> statement-breakpoint
ALTER TABLE "track" ALTER COLUMN "midi_asset_id" SET DATA TYPE varchar(15);