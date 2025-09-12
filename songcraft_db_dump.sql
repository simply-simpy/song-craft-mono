--
-- PostgreSQL database dump
--

\restrict zJR8Z5MmkajuthhfUyHUsXsHcNPs1d9NDYr81x09GUOJfa1nzi7wffwPeeHmZV2

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
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: lyric_versions; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.lyric_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    short_id character varying(50) NOT NULL,
    song_id uuid NOT NULL,
    version_name character varying(40) DEFAULT 'draft'::character varying NOT NULL,
    content_md text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lyric_versions OWNER TO songcraft;

--
-- Name: songs; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.songs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    short_id character varying(50) NOT NULL,
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
    collaborators jsonb DEFAULT '[]'::jsonb NOT NULL
);


ALTER TABLE public.songs OWNER TO songcraft;

--
-- Name: users; Type: TABLE; Schema: public; Owner: songcraft
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    clerk_id character varying(191) NOT NULL,
    email character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO songcraft;

--
-- Data for Name: lyric_versions; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.lyric_versions (id, short_id, song_id, version_name, content_md, created_at) FROM stdin;
\.


--
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.songs (id, short_id, owner_clerk_id, title, artist, bpm, key, tags, created_at, updated_at, lyrics, midi_data, collaborators) FROM stdin;
9d8c5643-cb4f-481a-a9c1-b3735b6d5300	song-E8sLIV	dev-user	Test Song	\N	\N	\N	[]	2025-09-05 15:39:21.926451+00	2025-09-05 15:39:21.926451+00	\N	\N	[]
2851fac2-83b9-456d-bef2-00fd72755c4a	song-Cef-sD	temp-user-id	new again	\N	\N	\N	[]	2025-09-05 15:41:12.326608+00	2025-09-05 15:41:12.326608+00	\N	\N	[]
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.users (id, clerk_id, email, created_at) FROM stdin;
\.


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
-- Name: lyric_versions lyric_versions_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: songcraft
--

ALTER TABLE ONLY public.lyric_versions
    ADD CONSTRAINT lyric_versions_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.songs(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict zJR8Z5MmkajuthhfUyHUsXsHcNPs1d9NDYr81x09GUOJfa1nzi7wffwPeeHmZV2

