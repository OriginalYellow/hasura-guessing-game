alter table "public"."game_event"
           add constraint "game_event_event_type_fkey"
           foreign key ("event_type")
           references "public"."game_event_type"
           ("value") on update restrict on delete restrict;
