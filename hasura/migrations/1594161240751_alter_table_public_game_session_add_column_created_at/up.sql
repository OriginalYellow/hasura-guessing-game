ALTER TABLE "public"."game_session" ADD COLUMN "created_at" timestamptz NULL DEFAULT now();
