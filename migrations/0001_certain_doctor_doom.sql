ALTER TYPE "replicate_task_status" ADD VALUE 'pending';--> statement-breakpoint
ALTER TABLE "asset" ALTER COLUMN "mime_type" DROP NOT NULL;