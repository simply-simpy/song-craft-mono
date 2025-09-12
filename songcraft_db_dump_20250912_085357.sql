--
-- PostgreSQL database dump
--

\restrict Nl80KsGVLrcJ8EDfg8UMeifSUfaFnNtwmyiBHTqy0EzfaxiRl6IjfOfK2i4H1yV

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
    LANGUAGE plpgsql
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
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.accounts OWNER TO songcraft;

--
-- Name: lyric_versions; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.lyric_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    short_id character varying(50) NOT NULL,
    song_id uuid NOT NULL,
    version_name character varying(40) DEFAULT 'draft'::character varying NOT NULL,
    content_md text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id uuid
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
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
    short_id character varying(50) DEFAULT "left"(replace((gen_random_uuid())::text, '-'::text, ''::text), 12) NOT NULL,
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
    account_id uuid
);


ALTER TABLE public.songs OWNER TO songcraft;

--
-- Name: users; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clerk_id character varying(191) NOT NULL,
    email character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_login_at timestamp with time zone
);


ALTER TABLE public.users OWNER TO songcraft;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: songcraft
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: songcraft
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	07d886db749f8847bb3202709ee323c33fed303b9c982818f3034fa01dd22416	1757639516538
2	fc11c07634278c616ae400933754f2f537b004e511681f888120477c0194874b	1757639543047
\.


--
-- Data for Name: accounts; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.accounts (id, org_id, owner_user_id, name, plan, status, is_default, created_at) FROM stdin;
681e169e-5051-4f94-adfe-58685016de96	a836ec3f-6c26-433d-a587-2944a1827030	e80ac87c-58b6-4628-864e-285e0f80d707	Default	Free	active	t	2025-09-12 00:58:04.78308+00
382ec03c-81c9-4f5f-af19-b0de1e903cb5	9f393c43-6b1a-4640-9d72-07a1a78d32ea	6d7cc01f-65fd-423b-a59e-ecc8104bb884	Default	Free	active	t	2025-09-12 00:58:04.78308+00
b9d08f27-c019-48a1-ab9b-994629b71f59	107d1db4-e1fe-40b3-88ec-815572a0c32a	70390081-df70-4f88-b40e-1dce4ada68cb	AcctA	Free	active	t	2025-09-12 15:24:57.320771+00
834065ad-0997-4259-85ea-4722ecfe34c4	add7c98e-c5ef-4472-99cb-25b1ce4612cc	48028cdf-d7c7-43f1-89a9-cbc609941528	AcctB	Free	active	t	2025-09-12 15:24:57.320771+00
\.


--
-- Data for Name: lyric_versions; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.lyric_versions (id, short_id, song_id, version_name, content_md, created_at, account_id) FROM stdin;
\.


--
-- Data for Name: memberships; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.memberships (id, user_id, account_id, role, created_at) FROM stdin;
0a5b5fda-9f15-430b-9df2-fbffd90e4f97	e80ac87c-58b6-4628-864e-285e0f80d707	681e169e-5051-4f94-adfe-58685016de96	owner	2025-09-12 00:58:04.787377+00
e1fd1cb6-ec54-433e-9cac-74a4bc5efcd6	6d7cc01f-65fd-423b-a59e-ecc8104bb884	382ec03c-81c9-4f5f-af19-b0de1e903cb5	owner	2025-09-12 00:58:04.787377+00
fefb9359-5ac8-4abe-9d21-da755f90f3c6	70390081-df70-4f88-b40e-1dce4ada68cb	b9d08f27-c019-48a1-ab9b-994629b71f59	owner	2025-09-12 15:24:57.348598+00
08e88864-1dad-455a-9fd2-3a7bce76ffe0	48028cdf-d7c7-43f1-89a9-cbc609941528	834065ad-0997-4259-85ea-4722ecfe34c4	owner	2025-09-12 15:24:57.348598+00
\.


--
-- Data for Name: orgs; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.orgs (id, name, status, created_at) FROM stdin;
9f393c43-6b1a-4640-9d72-07a1a78d32ea	Personal · temp-user-id	active	2025-09-12 00:58:04.781949+00
a836ec3f-6c26-433d-a587-2944a1827030	Personal · dev-user	active	2025-09-12 00:58:04.781949+00
107d1db4-e1fe-40b3-88ec-815572a0c32a	OrgA	active	2025-09-12 15:24:57.294006+00
add7c98e-c5ef-4472-99cb-25b1ce4612cc	OrgB	active	2025-09-12 15:24:57.294006+00
\.


--
-- Data for Name: song_account_links; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.song_account_links (id, song_id, account_id, is_current, reason, created_at) FROM stdin;
c234cf32-387a-45f2-8016-6ba057247041	9d8c5643-cb4f-481a-a9c1-b3735b6d5300	681e169e-5051-4f94-adfe-58685016de96	t	initial backfill	2025-09-12 00:58:04.786711+00
556a0fdb-af0c-47db-9769-f3f225bcdebc	2851fac2-83b9-456d-bef2-00fd72755c4a	382ec03c-81c9-4f5f-af19-b0de1e903cb5	t	initial backfill	2025-09-12 00:58:04.786711+00
3ff8583a-8c2c-4394-bb83-09b2d1d06a12	46214f6e-6ae4-4e35-a277-d6215690f30b	834065ad-0997-4259-85ea-4722ecfe34c4	t	seed	2025-09-12 15:39:54.291985+00
d9a3be44-5deb-46f9-a97c-1153050f2a6a	9e947d31-37c2-4d73-b4d4-df4d8e7abf6d	b9d08f27-c019-48a1-ab9b-994629b71f59	t	seed	2025-09-12 15:39:54.291985+00
\.


--
-- Data for Name: song_authors; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.song_authors (id, song_id, user_id, role, created_at) FROM stdin;
2cdbdf0e-7485-4e8c-a1a0-0c66df21b480	2851fac2-83b9-456d-bef2-00fd72755c4a	6d7cc01f-65fd-423b-a59e-ecc8104bb884	writer	2025-09-12 00:58:04.785745+00
c72c92c7-0634-4c29-8b85-2e38b975054c	9d8c5643-cb4f-481a-a9c1-b3735b6d5300	e80ac87c-58b6-4628-864e-285e0f80d707	writer	2025-09-12 00:58:04.785745+00
8f117701-c94d-47e2-a4b2-067f4159d16c	9e947d31-37c2-4d73-b4d4-df4d8e7abf6d	70390081-df70-4f88-b40e-1dce4ada68cb	writer	2025-09-12 15:39:54.27811+00
1b75cdf6-2505-4c4e-84c1-9198eb75b7da	46214f6e-6ae4-4e35-a277-d6215690f30b	48028cdf-d7c7-43f1-89a9-cbc609941528	writer	2025-09-12 15:39:54.27811+00
\.


--
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.songs (id, short_id, owner_clerk_id, title, artist, bpm, key, tags, created_at, updated_at, lyrics, midi_data, collaborators, account_id) FROM stdin;
9d8c5643-cb4f-481a-a9c1-b3735b6d5300	song-E8sLIV	dev-user	Test Song	\N	\N	\N	[]	2025-09-05 15:39:21.926451+00	2025-09-05 15:39:21.926451+00	\N	\N	[]	681e169e-5051-4f94-adfe-58685016de96
2851fac2-83b9-456d-bef2-00fd72755c4a	song-Cef-sD	temp-user-id	new again	\N	\N	\N	[]	2025-09-05 15:41:12.326608+00	2025-09-05 15:41:12.326608+00	\N	\N	[]	382ec03c-81c9-4f5f-af19-b0de1e903cb5
9e947d31-37c2-4d73-b4d4-df4d8e7abf6d	30893d36f650	clerk_user_A	Song in A	\N	\N	\N	{}	2025-09-12 15:39:54.213137+00	2025-09-12 15:39:54.213137+00	\N	\N	[]	b9d08f27-c019-48a1-ab9b-994629b71f59
46214f6e-6ae4-4e35-a277-d6215690f30b	a2d7720793d0	clerk_user_B	Song in B	\N	\N	\N	{}	2025-09-12 15:39:54.213137+00	2025-09-12 15:39:54.213137+00	\N	\N	[]	834065ad-0997-4259-85ea-4722ecfe34c4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.users (id, clerk_id, email, created_at, last_login_at) FROM stdin;
e80ac87c-58b6-4628-864e-285e0f80d707	dev-user	\N	2025-09-12 00:58:04.778109+00	\N
6d7cc01f-65fd-423b-a59e-ecc8104bb884	temp-user-id	\N	2025-09-12 00:58:04.778109+00	\N
70390081-df70-4f88-b40e-1dce4ada68cb	clerk_user_A	a@example.com	2025-09-12 15:08:01.536532+00	\N
48028cdf-d7c7-43f1-89a9-cbc609941528	clerk_user_B	b@example.com	2025-09-12 15:08:01.536532+00	\N
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: songcraft
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


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
-- Name: song_account_links song_account_links_one_current; Type: CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.song_account_links
    ADD CONSTRAINT song_account_links_one_current UNIQUE (song_id, is_current);


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
-- Name: accounts_org_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX accounts_org_idx ON public.accounts USING btree (org_id);


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
-- Name: song_account_links_account_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX song_account_links_account_idx ON public.song_account_links USING btree (account_id);


--
-- Name: song_account_links_song_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX song_account_links_song_idx ON public.song_account_links USING btree (song_id);


--
-- Name: song_authors_song_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX song_authors_song_idx ON public.song_authors USING btree (song_id);


--
-- Name: songs_account_created_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX songs_account_created_idx ON public.songs USING btree (account_id, created_at DESC);


--
-- Name: songs_title_trgm_idx; Type: INDEX; Schema: public; Owner: songcraft
--

CREATE INDEX songs_title_trgm_idx ON public.songs USING gin (title public.gin_trgm_ops);


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

\unrestrict Nl80KsGVLrcJ8EDfg8UMeifSUfaFnNtwmyiBHTqy0EzfaxiRl6IjfOfK2i4H1yV

