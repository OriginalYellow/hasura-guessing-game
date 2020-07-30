CREATE TABLE "public"."game_event_type"("value" text NOT NULL, PRIMARY KEY ("value") );

INSERT INTO "public"."game_event_type" (value) VALUES
  ('START'),
  ('GUESS');