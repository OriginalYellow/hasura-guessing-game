CREATE FUNCTION random_secret_number() RETURNS trigger AS $game_session$
      BEGIN
          NEW.secret_number := random_between(-100, 100);
          RETURN NEW;
      END;
  $game_session$ LANGUAGE plpgsql;

  CREATE TRIGGER random_secret_number_trigger BEFORE INSERT ON game_session
      FOR EACH ROW EXECUTE PROCEDURE random_secret_number();
