ALTER TABLE "public"."game_session" ADD COLUMN "host" text;
ALTER TABLE "public"."game_session" ALTER COLUMN "host" DROP NOT NULL;
