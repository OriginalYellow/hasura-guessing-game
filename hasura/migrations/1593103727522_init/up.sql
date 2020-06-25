CREATE TABLE public.completion_status (
    value text NOT NULL
);
CREATE TABLE public.game_session (
    id integer NOT NULL,
    secret_number integer,
    closest_guess integer,
    completion_status text NOT NULL,
    host text NOT NULL,
    winner text NOT NULL
);
CREATE SEQUENCE public.game_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.game_session_id_seq OWNED BY public.game_session.id;
ALTER TABLE ONLY public.game_session ALTER COLUMN id SET DEFAULT nextval('public.game_session_id_seq'::regclass);
ALTER TABLE ONLY public.completion_status
    ADD CONSTRAINT completion_status_pkey PRIMARY KEY (value);
ALTER TABLE ONLY public.game_session
    ADD CONSTRAINT game_session_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.game_session
    ADD CONSTRAINT game_session_completion_status_fkey FOREIGN KEY (completion_status) REFERENCES public.completion_status(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
