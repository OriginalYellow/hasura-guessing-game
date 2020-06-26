alter table "public"."game_session"
           add constraint "game_session_current_turn_player_fkey"
           foreign key ("current_turn_player")
           references "public"."user"
           ("id") on update restrict on delete restrict;
