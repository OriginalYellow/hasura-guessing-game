alter table "public"."game_session"
           add constraint "game_session_closest_guesser_id_fkey"
           foreign key ("closest_guesser_id")
           references "public"."user"
           ("id") on update restrict on delete restrict;
