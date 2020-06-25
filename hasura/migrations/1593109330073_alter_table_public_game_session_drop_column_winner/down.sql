ALTER TABLE "public"."game_session" ADD COLUMN "winner" text;
ALTER TABLE "public"."game_session" ALTER COLUMN "winner" DROP NOT NULL;
