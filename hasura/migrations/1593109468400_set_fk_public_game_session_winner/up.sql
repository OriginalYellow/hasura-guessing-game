alter table "public"."game_session"
           add constraint "game_session_winner_fkey"
           foreign key ("winner")
           references "public"."user"
           ("id") on update restrict on delete restrict;
