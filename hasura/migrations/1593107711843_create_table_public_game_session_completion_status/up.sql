CREATE TABLE "public"."game_session_completion_status"("game_session" integer NOT NULL, "completion_status" text NOT NULL, PRIMARY KEY ("game_session","completion_status") , FOREIGN KEY ("completion_status") REFERENCES "public"."completion_status"("value") ON UPDATE restrict ON DELETE restrict, FOREIGN KEY ("game_session") REFERENCES "public"."game_session"("id") ON UPDATE restrict ON DELETE restrict);
