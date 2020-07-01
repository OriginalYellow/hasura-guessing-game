alter table "public"."game_session_user" drop constraint "game_session_user_game_session_id_fkey",
          add constraint "game_session_user_game_session_id_fkey"
          foreign key ("game_session_id")
          references "public"."game_session"
          ("id")
          on update restrict
          on delete restrict;
