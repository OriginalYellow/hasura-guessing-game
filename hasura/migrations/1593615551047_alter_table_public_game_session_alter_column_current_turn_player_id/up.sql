ALTER TABLE ONLY "public"."game_session" ALTER COLUMN "current_turn_player_id" SET DEFAULT 0;
ALTER TABLE "public"."game_session" ALTER COLUMN "current_turn_player_id" SET NOT NULL;
alter table "public"."game_session" rename column "current_turn_player_id" to "turn_index";
