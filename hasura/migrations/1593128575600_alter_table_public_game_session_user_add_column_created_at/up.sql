ALTER TABLE "public"."game_session_user" ADD COLUMN "created_at" timestamptz NOT NULL DEFAULT now();
