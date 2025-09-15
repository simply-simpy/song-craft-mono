--
-- PostgreSQL database dump
--

\restrict YJBS5kZuXgRW9Os3xkecjXJsorfOipU7cChdyEXIb07hEAJUqo11y81DCtZv8gJ

-- Dumped from database version 15.14
-- Dumped by pg_dump version 15.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: songcraft
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO songcraft;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


--
-- Name: app_current_account_id(); Type: FUNCTION; Schema: public; Owner: songcraft
--

CREATE FUNCTION public.app_current_account_id() RETURNS uuid
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE v uuid;
BEGIN
  BEGIN
    v := current_setting('app.account_id')::uuid;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'app.account_id is not set; caller must set tenant context'
      USING ERRCODE = '28000';
  END;
  RETURN v;
END; $$;


ALTER FUNCTION public.app_current_account_id() OWNER TO songcraft;

--
-- Name: lyric_versions_infer_account(); Type: FUNCTION; Schema: public; Owner: songcraft
--

CREATE FUNCTION public.lyric_versions_infer_account() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.account_id IS NULL THEN
        SELECT s.account_id INTO NEW.account_id FROM songs s WHERE s.id = NEW.song_id;
    END IF;
    RETURN NEW;
END$$;


ALTER FUNCTION public.lyric_versions_infer_account() OWNER TO songcraft;

--
-- Name: set_tenant_by_account_name(text); Type: FUNCTION; Schema: public; Owner: songcraft
--

CREATE FUNCTION public.set_tenant_by_account_name(p_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE v uuid;
BEGIN
    SELECT id INTO v FROM accounts WHERE name = p_name LIMIT 1;
    IF v IS NULL THEN RAISE EXCEPTION 'Account % not found', p_name; END IF;
    PERFORM set_config('app.account_id', v::text, false);
END$$;


ALTER FUNCTION public.set_tenant_by_account_name(p_name text) OWNER TO songcraft;

--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: songcraft
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;


ALTER FUNCTION public.set_updated_at() OWNER TO songcraft;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: songcraft
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO songcraft;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: songcraft
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE drizzle.__drizzle_migrations_id_seq OWNER TO songcraft;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: songcraft
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: accounts; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.accounts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    org_id uuid NOT NULL,
    owner_user_id uuid,
    name text NOT NULL,
    plan text DEFAULT 'Free'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    is_default boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT accounts_plan_check CHECK ((plan = ANY (ARRAY['Free'::text, 'Pro'::text, 'Team'::text, 'Enterprise'::text]))),
    CONSTRAINT accounts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text, 'cancelled'::text])))
);


ALTER TABLE public.accounts OWNER TO songcraft;

--
-- Name: lyric_versions; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.lyric_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    short_id character varying(50) DEFAULT "left"(replace((gen_random_uuid())::text, '-'::text, ''::text), 16) NOT NULL,
    song_id uuid NOT NULL,
    version_name character varying(40) DEFAULT 'draft'::character varying NOT NULL,
    content_md text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id uuid NOT NULL,
    CONSTRAINT lyric_versions_short_id_format_chk CHECK (((length((short_id)::text) = 16) AND ((short_id)::text ~ '^[0-9a-f]{16}$'::text)))
);


ALTER TABLE public.lyric_versions OWNER TO songcraft;

--
-- Name: memberships; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.memberships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    account_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT memberships_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text, 'viewer'::text])))
);


ALTER TABLE public.memberships OWNER TO songcraft;

--
-- Name: orgs; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.orgs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.orgs OWNER TO songcraft;

--
-- Name: song_account_links; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.song_account_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    song_id uuid NOT NULL,
    account_id uuid NOT NULL,
    is_current boolean DEFAULT true NOT NULL,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.song_account_links OWNER TO songcraft;

--
-- Name: song_authors; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.song_authors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    song_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'writer'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.song_authors OWNER TO songcraft;

--
-- Name: songs; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.songs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    short_id character varying(50) DEFAULT "left"(replace((gen_random_uuid())::text, '-'::text, ''::text), 16) NOT NULL,
    owner_clerk_id character varying(191) NOT NULL,
    title character varying(200) NOT NULL,
    artist character varying(200),
    bpm integer,
    key character varying(12),
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    lyrics text,
    midi_data text,
    collaborators jsonb DEFAULT '[]'::jsonb NOT NULL,
    account_id uuid NOT NULL,
    CONSTRAINT songs_short_id_format_chk CHECK (((length((short_id)::text) = 16) AND ((short_id)::text ~ '^[0-9a-f]{16}$'::text)))
);


ALTER TABLE public.songs OWNER TO songcraft;

--
-- Name: users; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clerk_id character varying(191) NOT NULL,
    email character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO songcraft;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: songcraft
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: songcraft
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: accounts accounts_org_name_key; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_org_name_key UNIQUE (org_id, name);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: lyric_versions lyric_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.lyric_versions
    ADD CONSTRAINT lyric_versions_pkey PRIMARY KEY (id);


--
-- Name: lyric_versions lyric_versions_short_id_key; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.lyric_versions
    ADD CONSTRAINT lyric_versions_short_id_key UNIQUE (short_id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: memberships memberships_user_id_account_id_key; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_user_id_account_id_key UNIQUE (user_id, account_id);


--
-- Name: orgs orgs_name_key; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.orgs
    ADD CONSTRAINT orgs_name_key UNIQUE (name);


--
-- Name: orgs orgs_pkey; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.orgs
    ADD CONSTRAINT orgs_pkey PRIMARY KEY (id);


--
-- Name: song_account_links song_account_links_pkey; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.song_account_links
    ADD CONSTRAINT song_account_links_pkey PRIMARY KEY (id);


--
-- Name: song_authors song_authors_pkey; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.song_authors
    ADD CONSTRAINT song_authors_pkey PRIMARY KEY (id);


--
-- Name: song_authors song_authors_song_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.song_authors
    ADD CONSTRAINT song_authors_song_id_user_id_key UNIQUE (song_id, user_id);


--
-- Name: songs songs_pkey; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_pkey PRIMARY KEY (id);


--
-- Name: songs songs_short_id_key; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_short_id_key UNIQUE (short_id);


--
-- Name: users users_clerk_id_unique; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_clerk_id_unique UNIQUE (clerk_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: accounts_active_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX accounts_active_idx ON public.accounts USING btree (org_id) WHERE (status = 'active'::text);


--
-- Name: accounts_org_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX accounts_org_idx ON public.accounts USING btree (org_id);


--
-- Name: lyric_versions_account_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX lyric_versions_account_idx ON public.lyric_versions USING btree (account_id);


--
-- Name: lyric_versions_song_created_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX lyric_versions_song_created_idx ON public.lyric_versions USING btree (song_id, created_at DESC);


--
-- Name: memberships_account_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX memberships_account_idx ON public.memberships USING btree (account_id);


--
-- Name: memberships_user_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX memberships_user_idx ON public.memberships USING btree (user_id);


--
-- Name: memberships_user_role_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX memberships_user_role_idx ON public.memberships USING btree (user_id, role);


--
-- Name: song_account_links_account_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX song_account_links_account_idx ON public.song_account_links USING btree (account_id);


--
-- Name: song_account_links_only_one_current; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE UNIQUE INDEX song_account_links_only_one_current ON public.song_account_links USING btree (song_id) WHERE (is_current = true);


--
-- Name: song_account_links_song_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX song_account_links_song_idx ON public.song_account_links USING btree (song_id);


--
-- Name: song_authors_song_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX song_authors_song_idx ON public.song_authors USING btree (song_id);


--
-- Name: songs_account_created_desc_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX songs_account_created_desc_idx ON public.songs USING btree (account_id, created_at DESC);


--
-- Name: songs_owner_clerk_id_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX songs_owner_clerk_id_idx ON public.songs USING btree (owner_clerk_id);


--
-- Name: songs_title_trgm_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX songs_title_trgm_idx ON public.songs USING gin (title public.gin_trgm_ops);


--
-- Name: songs_updated_at_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX songs_updated_at_idx ON public.songs USING btree (updated_at DESC NULLS LAST);


--
-- Name: users_clerk_id_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX users_clerk_id_idx ON public.users USING btree (clerk_id);


--
-- Name: lyric_versions trg_lyric_versions_infer_account; Type: TRIGGER; Schema: public; Owner: songcraft
--

CREATE TRIGGER trg_lyric_versions_infer_account BEFORE INSERT ON public.lyric_versions FOR EACH ROW EXECUTE FUNCTION public.lyric_versions_infer_account();


--
-- Name: songs trg_songs_updated_at; Type: TRIGGER; Schema: public; Owner: songcraft
--

CREATE TRIGGER trg_songs_updated_at BEFORE UPDATE ON public.songs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: accounts accounts_org_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_org_id_fkey FOREIGN KEY (org_id) REFERENCES public.orgs(id) ON DELETE RESTRICT;


--
-- Name: accounts accounts_owner_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.accounts
    ADD CONSTRAINT accounts_owner_user_id_fkey FOREIGN KEY (owner_user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: lyric_versions lyric_versions_account_fk; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.lyric_versions
    ADD CONSTRAINT lyric_versions_account_fk FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT;


--
-- Name: lyric_versions lyric_versions_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.lyric_versions
    ADD CONSTRAINT lyric_versions_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE;


--
-- Name: memberships memberships_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE CASCADE;


--
-- Name: memberships memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.memberships
    ADD CONSTRAINT memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: song_account_links song_account_links_account_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.song_account_links
    ADD CONSTRAINT song_account_links_account_id_fkey FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT;


--
-- Name: song_account_links song_account_links_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.song_account_links
    ADD CONSTRAINT song_account_links_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE;


--
-- Name: song_authors song_authors_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.song_authors
    ADD CONSTRAINT song_authors_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE;


--
-- Name: song_authors song_authors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.song_authors
    ADD CONSTRAINT song_authors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: songs songs_account_fk; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_account_fk FOREIGN KEY (account_id) REFERENCES public.accounts(id) ON DELETE RESTRICT;


--
-- Name: songs songs_owner_clerk_fk; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.songs
    ADD CONSTRAINT songs_owner_clerk_fk FOREIGN KEY (owner_clerk_id) REFERENCES public.users(clerk_id) ON DELETE RESTRICT;


--
-- Name: lyric_versions; Type: ROW SECURITY; Schema: public; Owner: songcraft
--

ALTER TABLE public.lyric_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: lyric_versions lyric_versions_read; Type: POLICY; Schema: public; Owner: songcraft
--

CREATE POLICY lyric_versions_read ON public.lyric_versions FOR SELECT USING ((account_id = public.app_current_account_id()));


--
-- Name: lyric_versions lyric_versions_write; Type: POLICY; Schema: public; Owner: songcraft
--

CREATE POLICY lyric_versions_write ON public.lyric_versions USING ((account_id = public.app_current_account_id())) WITH CHECK ((account_id = public.app_current_account_id()));


--
-- Name: song_account_links; Type: ROW SECURITY; Schema: public; Owner: songcraft
--

ALTER TABLE public.song_account_links ENABLE ROW LEVEL SECURITY;

--
-- Name: song_account_links song_account_links_rw; Type: POLICY; Schema: public; Owner: songcraft
--

CREATE POLICY song_account_links_rw ON public.song_account_links USING ((EXISTS ( SELECT 1
   FROM public.songs s
  WHERE ((s.id = song_account_links.song_id) AND (s.account_id = public.app_current_account_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.songs s
  WHERE ((s.id = song_account_links.song_id) AND (s.account_id = public.app_current_account_id())))));


--
-- Name: song_authors; Type: ROW SECURITY; Schema: public; Owner: songcraft
--

ALTER TABLE public.song_authors ENABLE ROW LEVEL SECURITY;

--
-- Name: song_authors song_authors_rw; Type: POLICY; Schema: public; Owner: songcraft
--

CREATE POLICY song_authors_rw ON public.song_authors USING ((EXISTS ( SELECT 1
   FROM public.songs s
  WHERE ((s.id = song_authors.song_id) AND (s.account_id = public.app_current_account_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.songs s
  WHERE ((s.id = song_authors.song_id) AND (s.account_id = public.app_current_account_id())))));


--
-- Name: songs; Type: ROW SECURITY; Schema: public; Owner: songcraft
--

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

--
-- Name: songs songs_read; Type: POLICY; Schema: public; Owner: songcraft
--

CREATE POLICY songs_read ON public.songs FOR SELECT USING ((account_id = public.app_current_account_id()));


--
-- Name: songs songs_write; Type: POLICY; Schema: public; Owner: songcraft
--

CREATE POLICY songs_write ON public.songs USING ((account_id = public.app_current_account_id())) WITH CHECK ((account_id = public.app_current_account_id()));


--
-- PostgreSQL database dump complete
--

\unrestrict YJBS5kZuXgRW9Os3xkecjXJsorfOipU7cChdyEXIb07hEAJUqo11y81DCtZv8gJ

