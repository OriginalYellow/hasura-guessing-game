ALTER TABLE ONLY "public"."game_session" ALTER COLUMN "current_turn_player_id" DROP DEFAULT;
ALTER TABLE "public"."game_session" ALTER COLUMN "current_turn_player_id" DROP NOT NULL;
alter table "public"."game_session" rename column "turn_index" to "current_turn_player_id";
