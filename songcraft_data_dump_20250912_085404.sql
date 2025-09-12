--
-- PostgreSQL database dump
--

\restrict NvwbarCMZxg7LLGhdVCFH1M74puJUCaXg9nuyeg3DWdxUwiaGOEQcFP6NcKaqCc

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
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: songcraft
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	07d886db749f8847bb3202709ee323c33fed303b9c982818f3034fa01dd22416	1757639516538
2	fc11c07634278c616ae400933754f2f537b004e511681f888120477c0194874b	1757639543047
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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.users (id, clerk_id, email, created_at, last_login_at) FROM stdin;
e80ac87c-58b6-4628-864e-285e0f80d707	dev-user	\N	2025-09-12 00:58:04.778109+00	\N
6d7cc01f-65fd-423b-a59e-ecc8104bb884	temp-user-id	\N	2025-09-12 00:58:04.778109+00	\N
70390081-df70-4f88-b40e-1dce4ada68cb	clerk_user_A	a@example.com	2025-09-12 15:08:01.536532+00	\N
48028cdf-d7c7-43f1-89a9-cbc609941528	clerk_user_B	b@example.com	2025-09-12 15:08:01.536532+00	\N
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
-- Data for Name: songs; Type: TABLE DATA; Schema: public; Owner: songcraft
--

COPY public.songs (id, short_id, owner_clerk_id, title, artist, bpm, key, tags, created_at, updated_at, lyrics, midi_data, collaborators, account_id) FROM stdin;
9d8c5643-cb4f-481a-a9c1-b3735b6d5300	song-E8sLIV	dev-user	Test Song	\N	\N	\N	[]	2025-09-05 15:39:21.926451+00	2025-09-05 15:39:21.926451+00	\N	\N	[]	681e169e-5051-4f94-adfe-58685016de96
2851fac2-83b9-456d-bef2-00fd72755c4a	song-Cef-sD	temp-user-id	new again	\N	\N	\N	[]	2025-09-05 15:41:12.326608+00	2025-09-05 15:41:12.326608+00	\N	\N	[]	382ec03c-81c9-4f5f-af19-b0de1e903cb5
9e947d31-37c2-4d73-b4d4-df4d8e7abf6d	30893d36f650	clerk_user_A	Song in A	\N	\N	\N	{}	2025-09-12 15:39:54.213137+00	2025-09-12 15:39:54.213137+00	\N	\N	[]	b9d08f27-c019-48a1-ab9b-994629b71f59
46214f6e-6ae4-4e35-a277-d6215690f30b	a2d7720793d0	clerk_user_B	Song in B	\N	\N	\N	{}	2025-09-12 15:39:54.213137+00	2025-09-12 15:39:54.213137+00	\N	\N	[]	834065ad-0997-4259-85ea-4722ecfe34c4
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
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: songcraft
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- PostgreSQL database dump complete
--

\unrestrict NvwbarCMZxg7LLGhdVCFH1M74puJUCaXg9nuyeg3DWdxUwiaGOEQcFP6NcKaqCc

