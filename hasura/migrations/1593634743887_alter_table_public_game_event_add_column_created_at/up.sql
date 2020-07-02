ALTER TABLE "public"."game_event" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
