alter table "public"."game_session"
           add constraint "game_session_host_fkey"
           foreign key ("host")
           references "public"."user"
           ("id") on update restrict on delete restrict;
