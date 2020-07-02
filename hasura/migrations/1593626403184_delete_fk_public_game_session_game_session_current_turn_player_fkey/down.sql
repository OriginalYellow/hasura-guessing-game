alter table "public"."game_session" add foreign key ("turn_index") references "public"."user"("id") on update restrict on delete restrict;
