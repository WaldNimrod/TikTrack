-- TikTrack Phoenix Database Backup
-- Created: 2026-02-10 09:57:53
-- Database: TikTrack-phoenix-db
-- Host: localhost:5432
-- User: TikTrackDbAdmin

-- ============================================
-- SCHEMA DEFINITIONS
-- ============================================


-- Table: market_data.data_refresh_logs
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.exchanges
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.external_data_providers
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.industries
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.market_cap_groups
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.sectors
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.system_trading_calendar
-- Error getting table definition: unsupported operand type(s) for +: 'NoneType' and 'str'


-- Table: market_data.ticker_prices
CREATE TABLE IF NOT EXISTS market_data.ticker_prices (id uuid NOT NULL DEFAULT gen_random_uuid(), ticker_id uuid NOT NULL, provider_id uuid, price numeric(20,8) NOT NULL, open_price numeric(20,8), high_price numeric(20,8), low_price numeric(20,8), close_price numeric(20,8), volume bigint(64,0), price_timestamp timestamp with time zone NOT NULL, fetched_at timestamp with time zone NOT NULL DEFAULT now(), is_stale boolean NOT NULL DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now());


-- Table: market_data.tickers
CREATE TABLE IF NOT EXISTS market_data.tickers (id uuid NOT NULL DEFAULT gen_random_uuid(), symbol character varying(20) NOT NULL, exchange_id uuid, company_name character varying(255), ticker_type ticker_type NOT NULL DEFAULT 'STOCK'::market_data.ticker_type, sector_id uuid, industry_id uuid, market_cap_group_id uuid, cusip character varying(9), isin character varying(12), figi character varying(12), is_active boolean NOT NULL DEFAULT true, delisted_date date, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, metadata jsonb DEFAULT '{}'::jsonb);


-- Table: user_data.brokers_fees
CREATE TABLE IF NOT EXISTS user_data.brokers_fees (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, broker character varying(100) NOT NULL, commission_type commission_type NOT NULL, commission_value character varying(255) NOT NULL, minimum numeric(20,8) NOT NULL DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone);


-- Table: user_data.cash_flows
CREATE TABLE IF NOT EXISTS user_data.cash_flows (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, trading_account_id uuid NOT NULL, flow_type character varying(20) NOT NULL, amount numeric(20,6) NOT NULL, currency character varying(3) NOT NULL DEFAULT 'USD'::character varying, description text, transaction_date date NOT NULL, external_reference character varying(100), created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, metadata jsonb DEFAULT '{}'::jsonb);


-- Table: user_data.notes
CREATE TABLE IF NOT EXISTS user_data.notes (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, parent_type character varying(50) NOT NULL, parent_id uuid, title character varying(200), content text NOT NULL, category note_category NOT NULL DEFAULT 'GENERAL'::user_data.note_category, is_pinned boolean NOT NULL DEFAULT false, created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, metadata jsonb DEFAULT '{}'::jsonb, tags ARRAY);


-- Table: user_data.password_reset_requests
CREATE TABLE IF NOT EXISTS user_data.password_reset_requests (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, method reset_method NOT NULL, sent_to character varying(255) NOT NULL, reset_token character varying(64) NOT NULL, token_expires_at timestamp with time zone NOT NULL, verification_code character varying(6), code_expires_at timestamp with time zone, attempts_count integer(32,0) DEFAULT 0, max_attempts integer(32,0) DEFAULT 3, status character varying(20) NOT NULL DEFAULT 'PENDING'::character varying, used_at timestamp with time zone, used_from_ip character varying(45), created_at timestamp with time zone NOT NULL DEFAULT now());


-- Table: user_data.revoked_tokens
CREATE TABLE IF NOT EXISTS user_data.revoked_tokens (jti character varying(255) NOT NULL, expires_at timestamp with time zone NOT NULL, revoked_at timestamp with time zone NOT NULL DEFAULT now());


-- Table: user_data.trades
CREATE TABLE IF NOT EXISTS user_data.trades (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, ticker_id uuid NOT NULL, trading_account_id uuid NOT NULL, parent_trade_id uuid, strategy_id uuid, origin_plan_id uuid, trigger_alert_id uuid, direction trade_direction NOT NULL, quantity numeric(20,8) NOT NULL, avg_entry_price numeric(20,8), avg_exit_price numeric(20,8), stop_loss numeric(20,8), take_profit numeric(20,8), realized_pl numeric(20,6) DEFAULT 0, unrealized_pl numeric(20,6) DEFAULT 0, total_pl numeric(20,6), commission numeric(20,6) DEFAULT 0, fees numeric(20,6) DEFAULT 0, status trade_status NOT NULL DEFAULT 'DRAFT'::user_data.trade_status, calculated_status calculated_trade_status, entry_date timestamp with time zone, exit_date timestamp with time zone, created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, version integer(32,0) NOT NULL DEFAULT 1, metadata jsonb DEFAULT '{}'::jsonb, tags ARRAY);


-- Table: user_data.trading_accounts
CREATE TABLE IF NOT EXISTS user_data.trading_accounts (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, account_name character varying(100) NOT NULL, broker character varying(100), account_number character varying(50), external_account_id character varying(100), last_sync_at timestamp with time zone, initial_balance numeric(20,6) NOT NULL, cash_balance numeric(20,6) NOT NULL DEFAULT 0, total_deposits numeric(20,6) NOT NULL DEFAULT 0, total_withdrawals numeric(20,6) NOT NULL DEFAULT 0, currency character varying(3) NOT NULL DEFAULT 'USD'::character varying, is_active boolean NOT NULL DEFAULT true, created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, version integer(32,0) NOT NULL DEFAULT 1, metadata jsonb DEFAULT '{}'::jsonb);


-- Table: user_data.user_api_keys
CREATE TABLE IF NOT EXISTS user_data.user_api_keys (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, provider api_provider NOT NULL, provider_label character varying(100), api_key_encrypted text NOT NULL, api_secret_encrypted text, additional_config jsonb DEFAULT '{}'::jsonb, is_active boolean NOT NULL DEFAULT true, is_verified boolean NOT NULL DEFAULT false, last_verified_at timestamp with time zone, verification_error text, rate_limit_per_minute integer(32,0), rate_limit_per_day integer(32,0), quota_used_today integer(32,0) DEFAULT 0, quota_reset_at timestamp with time zone, created_by uuid NOT NULL, updated_by uuid NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, version integer(32,0) NOT NULL DEFAULT 1, metadata jsonb DEFAULT '{}'::jsonb);


-- Table: user_data.user_refresh_tokens
CREATE TABLE IF NOT EXISTS user_data.user_refresh_tokens (id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, token_hash character varying(255) NOT NULL, jti character varying(255) NOT NULL, expires_at timestamp with time zone NOT NULL, revoked_at timestamp with time zone, created_at timestamp with time zone NOT NULL DEFAULT now());


-- Table: user_data.users
CREATE TABLE IF NOT EXISTS user_data.users (id uuid NOT NULL DEFAULT gen_random_uuid(), username character varying(50) NOT NULL, email character varying(255) NOT NULL, password_hash character varying(255) NOT NULL, phone_number character varying(20), phone_verified boolean NOT NULL DEFAULT false, phone_verified_at timestamp with time zone, first_name character varying(100), last_name character varying(100), display_name character varying(100), role user_role NOT NULL DEFAULT 'USER'::user_data.user_role, timezone character varying(50) NOT NULL DEFAULT 'UTC'::character varying, language character varying(5) NOT NULL DEFAULT 'en'::character varying, is_active boolean NOT NULL DEFAULT true, is_email_verified boolean NOT NULL DEFAULT false, email_verified_at timestamp with time zone, last_login_at timestamp with time zone, last_login_ip character varying(45), failed_login_attempts integer(32,0) DEFAULT 0, locked_until timestamp with time zone, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), deleted_at timestamp with time zone, metadata jsonb DEFAULT '{}'::jsonb);


-- ============================================
-- DATA
-- ============================================


-- Data for market_data.data_refresh_logs
-- Error backing up data: permission denied for table data_refresh_logs

-- Skipping table market_data.data_refresh_logs


-- Data for market_data.exchanges
-- Error backing up data: permission denied for table exchanges

-- Skipping table market_data.exchanges


-- Data for market_data.external_data_providers
-- Error backing up data: permission denied for table external_data_providers

-- Skipping table market_data.external_data_providers


-- Data for market_data.industries
-- Error backing up data: permission denied for table industries

-- Skipping table market_data.industries


-- Data for market_data.market_cap_groups
-- Error backing up data: permission denied for table market_cap_groups

-- Skipping table market_data.market_cap_groups


-- Data for market_data.sectors
-- Error backing up data: permission denied for table sectors

-- Skipping table market_data.sectors


-- Data for market_data.system_trading_calendar
-- Error backing up data: permission denied for table system_trading_calendar

-- Skipping table market_data.system_trading_calendar


-- Data for market_data.ticker_prices
-- Rows: 0

-- Data for market_data.tickers
-- Rows: 0

-- Data for user_data.brokers_fees
-- Rows: 0

-- Data for user_data.cash_flows
-- Rows: 0

-- Data for user_data.notes
-- Rows: 0

-- Data for user_data.password_reset_requests
-- Rows: 0

-- Data for user_data.revoked_tokens
-- Rows: 7
COPY user_data.revoked_tokens (jti, expires_at, revoked_at) FROM stdin;
ac1ENCUng8oYLoErIZVwPqSkXtwcUmxXGwCSyZrAKO8	2026-02-02 10:39:15+00:00	2026-02-01 10:39:21.715563+00:00
NusBFJ_DOu1Auzft2gj4435tbVxO-0LmRffRFdCiGYQ	2026-02-02 10:39:39+00:00	2026-02-01 10:41:21.116290+00:00
n3-SuOikG3ijJSE8tXtLJG2d2DBtXkIYPzoNg8rkYy8	2026-02-02 10:41:25+00:00	2026-02-01 10:41:28.470107+00:00
YCw491S-4Cu07hGVIKm82dbSSt9qRct9ydsqnK8ilZM	2026-02-02 10:48:28+00:00	2026-02-01 11:16:13.708588+00:00
nh6iSGQRv4qqW1YQkmZoAdz02XLLWMhs7QehA45oXoM	2026-02-02 18:39:43+00:00	2026-02-02 00:05:59.777462+00:00
YH0hAE9D0_-lpK_Gp7VE-QTsoV9lNsuPNLZjuFxQqvA	2026-02-03 01:57:27+00:00	2026-02-02 02:10:04.438943+00:00
8PhaX8v7L6-cXtRF1Ugd_ccbOErJcQeyChatPJt3U5A	2026-02-03 02:11:47+00:00	2026-02-02 02:12:20.001404+00:00
\.


-- Data for user_data.trades
-- Rows: 0

-- Data for user_data.trading_accounts
-- Rows: 0

-- Data for user_data.user_api_keys
-- Rows: 0

-- Data for user_data.user_refresh_tokens
-- Rows: 297
COPY user_data.user_refresh_tokens (id, user_id, token_hash, jti, expires_at, revoked_at, created_at) FROM stdin;
2b34f60f-41f4-49b7-9ba5-46df339f27a2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	247cbdd963d3b136443cbaee92ad37c6c5771203dd5989f3aaecf31bcff2a273	pdFQq8af-ErwhX1QTTvi3eElZ8_aIVF1jKlNJ48IsSg	2026-02-08 06:06:07.231981+00:00	\N	2026-02-01 08:06:07.234320+00:00
2fa482a1-3577-4cd7-a72b-719527915871	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c55af3638da1b4035a9345a5b313f2fe515639ad624bbee2f63dc6cc9ba7de81	Lu_KRu9-585EM9TQC58toitjqORpy4r7kMcxdEGfOk0	2026-02-08 06:06:09.360128+00:00	\N	2026-02-01 08:06:09.360876+00:00
e54cc8a5-fcec-4e67-892f-c445071175ec	783587a7-5a20-4ab5-85eb-857b57ab9511	da96f1a0d0a2e8f6b3227d115d036c7fd8b90be7c798ed6071e54c576a21c4cc	eiQe0OgDKuFGJl6AEVFVTSHoWrbiz_V3ev9Dr_SUqf4	2026-02-08 06:06:12.318464+00:00	\N	2026-02-01 08:06:12.318714+00:00
7355ac80-43a5-476c-a8cd-5b4607c9fb6a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	146c61cb36b1ace2b9a85e13145f92ef0059ebf12afda2c7ce1a08e5d4b79199	dmpzeSA8dILvCnyhg9RPev8pwSfWAyqNagAY0NbsoxY	2026-02-08 06:06:17.311544+00:00	\N	2026-02-01 08:06:17.311890+00:00
97e658e8-08bc-4878-a194-a1fd0a7b44a6	a1ae2cec-e781-48f1-8d71-eb82571efaff	a400c2ac85675784c2320478f3d11b3fece7ee84be31053bdfcc2ccd7d16136f	CkI9AA9puyHgRtgecKJsoEW_LoZRfWN_6WTmryCBCDA	2026-02-08 06:06:19.344204+00:00	\N	2026-02-01 08:06:17.982304+00:00
b47c51a4-0158-48c5-b31b-5cd59440129f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c9baf6024d7dce3f79bd8823157e3b8cd31a7805e22427fa73c0505b7cb9d91b	ZCHBgc1L3HYuBnoSY9mdl7evc4TxtGgcMxNtbG83Yfo	2026-02-08 06:26:39.319576+00:00	\N	2026-02-01 08:26:39.320742+00:00
2240a102-e6d3-4691-9bc7-d0328ad0a729	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a84d2c5d97cefb966e7ad2d078f3ca59309518c6c7fb79635d03938cc38e3441	iTKkWzaXnfZAJIPaKGhUGWOUR8npLZzQif5jwo1___0	2026-02-08 06:38:39.786903+00:00	\N	2026-02-01 08:38:39.781620+00:00
e26e5cfe-9540-44b4-8606-980e28093cf1	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	69c3c027352c5f0a56f445f6c118747e873d44a3d667266efea9ea6541f7713b	TILan5-NFpWsgvkACoUrmnHILMxZt-W3ch0ME1sjrw0	2026-02-08 06:38:46.309326+00:00	\N	2026-02-01 08:38:46.301078+00:00
9530bd3c-3f59-4ac0-8f2a-7b08848928da	783587a7-5a20-4ab5-85eb-857b57ab9511	c13ca8f48b3a80e440bf6072dced3f1d2a6a6b2242a9714e4f4f3a6633d5917a	eVLkqBfwiTpifh3lP2SRdnrJ-T9YW4OTkKC8ToFouXQ	2026-02-08 06:38:51.415082+00:00	\N	2026-02-01 08:38:51.405840+00:00
5019e632-f736-4461-b660-b65f5fb1a1c2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	abf9dec8988ab22426081816a2d4661bcfe5d4be88cb04f69e14b2e4f11361d3	N95ql9pulluRad1K1UOFjNhMODoiGxjB2Lz4xEa5bWo	2026-02-08 06:39:21.983012+00:00	\N	2026-02-01 08:39:21.981458+00:00
522bc0ba-52e1-49d9-93f7-dbe0652d2b9c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a738a121a80d8b84669e5f4c3e6661d4699ace43d1d2508e1f6af67a211b1883	Hf02GwmV2z5nko4zWa4zc54NvBISfLGeQH2etEmYllc	2026-02-08 06:53:01.211726+00:00	\N	2026-02-01 08:53:01.209306+00:00
e4640e35-12dc-4771-a461-a1af5bd8e026	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	960cbe233ce4e7c39e3b5eab844e7ecc6fb162ac97ac046c2eaa68e36e744b3a	hACaEiAD-pqQ5zNv4pFkq1w2Gb_xON_Tihx1p7vvyHw	2026-02-08 06:53:02.666487+00:00	\N	2026-02-01 08:53:02.662064+00:00
de2d4ccc-176c-4d72-a0c5-0879a516c42e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d379f1a9e71311938300d9990adc4ec01d6f8d81b3a3ff26f53f2c7ed13e31fb	BFsVwKiBvqyRtFLqT3MMZluX9RT0Y3XXrwAvTfLfuXQ	2026-02-08 06:53:04.475721+00:00	\N	2026-02-01 08:53:04.471404+00:00
7e89a0d6-187a-4942-8ef9-dd9b1a8e350e	783587a7-5a20-4ab5-85eb-857b57ab9511	f84b606f869e70a5e82ebd4e7fba1fd22462eeecdd10483c9ef54acb48622ee8	ljTv_FZDzuC6M39lw5qUw3QdLrtEwf0yNdJBaDNwWnM	2026-02-08 06:53:08.927011+00:00	\N	2026-02-01 08:53:08.922667+00:00
b5209db3-066a-4efc-9ed1-77436c23443f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0ea176939d8150106c68a7d9157126adec8101c75f5739a7c517cecb9f0f5026	lB7OVu0R0ZIG96lbJ87G9tGShHYoi6h4K-cc_eG9Hbg	2026-02-08 06:53:18.928628+00:00	\N	2026-02-01 08:53:18.924296+00:00
90e4179c-7d7e-400c-8a58-bb0c81f434e2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	535d638f0b6a14b3c9fca580dd5a85dcc9541fa0e7e6b2201bb86c449b297522	yiaMJeNvg0CB5LI9osio392qDyiGJWdzoKNuKXQG0Os	2026-02-08 06:55:50.322752+00:00	\N	2026-02-01 08:55:50.323130+00:00
823d359d-bef3-4910-898e-1915a2475c7d	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a52f94fce8e885d47c4dbc223fe4684fa9ccb79c8df2d8b18f9e9eb283042280	2JYC-MPH2_CzY4DTxsx-UMezFWJShxJgpjPlihCrVlM	2026-02-08 06:55:53.967792+00:00	\N	2026-02-01 08:55:53.977810+00:00
a888e65a-c691-4a94-a4a3-7aaf8f508c87	4d00332f-3b1c-43df-a2eb-7261b03cdd46	227971b1e38c88285b3e64c4b90d326cfad7a1c859d2ab8ddc07c43c445d3171	QZLx37VbtclXp7lwBYCvSJe5xmpKMBE3xqvcutvEM2s	2026-02-08 06:57:53.933231+00:00	2026-02-01 06:57:59.494326+00:00	2026-02-01 08:57:53.500053+00:00
7ce9e103-483f-41a7-a2cd-7cfab9d60df2	4d00332f-3b1c-43df-a2eb-7261b03cdd46	28be6f0005527aaf9452faf211c29c0438b46211ef110ed439ecc25b304edfc1	wlTJXieZHaO_YGBMRowsu5uAPSa2DTUVIYFIWIDus-U	2026-02-08 06:57:59.494680+00:00	2026-02-01 06:58:03.921734+00:00	2026-02-01 08:57:59.471499+00:00
e21130ac-eddb-493b-bc11-36ad0cd304bb	4d00332f-3b1c-43df-a2eb-7261b03cdd46	245f6a6ce7980262573afb438d886771f8df5fc1727be7d5539a582ce8086de7	xzAy_w6iJ9m5oexMdmrxKEv47hUAVaQ6X4tx438eW3A	2026-02-08 06:58:03.916651+00:00	2026-02-01 06:58:03.936608+00:00	2026-02-01 08:58:03.903594+00:00
8fa468c8-95dd-46e9-a7f8-c1ed12ec50d2	4d00332f-3b1c-43df-a2eb-7261b03cdd46	678bcb38eeb99709aecf17dfccdd1bce88cd52aadb0016f7d7fc56072c7c8250	G8ZLbkSSdi5itOplkMyAS_6FrhdLzd7UrptuwMSYepo	2026-02-08 06:58:03.936877+00:00	\N	2026-02-01 08:58:03.931473+00:00
20433525-5e70-434c-8a92-7823cabd0a98	4d00332f-3b1c-43df-a2eb-7261b03cdd46	3ac09692b66dfe7a82cc54683aef08ea2bf0ecce67178a3180a4c386019b7009	sREn5GenJ_vnGhhZJCyxKNKN0iQt99fRj4pt01AOq4c	2026-02-08 06:58:03.921957+00:00	2026-02-01 06:58:03.939770+00:00	2026-02-01 08:58:03.897513+00:00
9e707990-70a9-4b80-a83e-d8ef572b4a9d	4d00332f-3b1c-43df-a2eb-7261b03cdd46	375434b93ce1c3f9fed24bcaf2581d60d984dec08e865c6363e539b3ed41854b	5i4WrKpGC6dQ7u_L8bwDt78tU9DJzjjK4rY0oMHw6is	2026-02-08 06:58:03.940005+00:00	2026-02-01 06:58:06.958522+00:00	2026-02-01 08:58:03.935654+00:00
c80ebcd9-88df-4a53-af76-2a6381bc254e	4d00332f-3b1c-43df-a2eb-7261b03cdd46	b540933fca2f3b7a7dcea25edcab6578a6e183aad98b14fac3c44a59b1ecbb8e	iKXw4AIwEKMbNG5zl5hCOMInbXnzl71RREUwcL43EfI	2026-02-08 06:58:08.228574+00:00	\N	2026-02-01 08:58:08.224480+00:00
fe2b2374-5d7f-4f66-ab03-8b18913a39c4	4d00332f-3b1c-43df-a2eb-7261b03cdd46	6e8142ef8e528ccceb78e8567981177b7ab1d5a64a6bb8455ca88b99090c1bdd	zZyjVIlhmwTeXblN_s2hpj4WR6f7u3WnN50NSm0-ghM	2026-02-08 06:58:06.959684+00:00	2026-02-01 06:58:08.229533+00:00	2026-02-01 08:58:06.951825+00:00
75c5eafc-ae1c-450f-a0c4-08c65c3c544c	4d00332f-3b1c-43df-a2eb-7261b03cdd46	69bda0428505af02328c1d36110d192ea51592625e0d3b2e226143d3b8d54486	5tpTHZNvhSOYW65mpsatyeGrm22dup70tKbcssBNLX4	2026-02-08 06:58:08.240304+00:00	\N	2026-02-01 08:58:08.236828+00:00
636893cd-5350-413c-9eb8-e49a05fa013e	4d00332f-3b1c-43df-a2eb-7261b03cdd46	cee60af76e416642331dc845734df69fe51e85662d2d1d081925e4442342034b	vxzFH6EW3_VM34qU20QwE9TuV3hALg8PnCtyFVxiDBU	2026-02-08 06:58:08.229655+00:00	2026-02-01 06:58:08.242504+00:00	2026-02-01 08:58:08.226468+00:00
5246b7f0-6163-4ec9-976b-8334fb409eff	4d00332f-3b1c-43df-a2eb-7261b03cdd46	27c8311e9aae80fce90d5168609b8d04d19eee6fa6ae8940b556281bc1e6490b	Sj2QcZaHw3EfN4vzHXSTUDfOh69ZwSNh_vT-UIBqsXM	2026-02-08 06:58:08.242606+00:00	2026-02-01 06:58:17.656864+00:00	2026-02-01 08:58:08.239366+00:00
b5a9e58a-64b9-4479-9cca-2df081da0e52	4d00332f-3b1c-43df-a2eb-7261b03cdd46	81a6e7ba67f332ab6ceb82963d72fc1db626c0cbf199cb42c0033d76d67e6440	mzDPpRom4FTamzfYqN7LZcdrMOkXmiyaKPoCbCfE8pY	2026-02-08 06:58:17.657414+00:00	\N	2026-02-01 08:58:17.652085+00:00
b6096467-3321-4bf4-a2a5-feb30547da8c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1dd7ae4e4de7772df6ae6d1199d443493ff2ddf4abece98102916dfda9ab63a9	4z8NVytpqXJszASoOGjpVO2acTPZHJ63mWaoAwIg0b0	2026-02-08 08:22:03.883598+00:00	\N	2026-02-01 10:22:03.884614+00:00
3b50f4bc-8f65-42e7-9a80-c2cc889fb91b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a39f1e074de17a0140019fa78198e13630f44f8f0272c7962ae228d7738bfbb7	VuNZXd1BQr-4OcxFiB_DoAEOW-ztZrwQ34CSIfsndCg	2026-02-08 08:22:07.332654+00:00	\N	2026-02-01 10:22:07.332344+00:00
38115e0d-f249-4770-bcc2-d3d4b81300c9	4d00332f-3b1c-43df-a2eb-7261b03cdd46	cdda650e79b97483cfcb4124462e70d036daa3aa7937c3365e13fce0abfb9ff8	XEgcmZGCiJMZ8F6rzaAgN38izKE5AnaU3PzGzSBTDTc	2026-02-08 10:35:51.068188+00:00	\N	2026-02-01 10:35:51.068665+00:00
ae69253e-dce0-4f7c-beb2-43783d77bfdf	4d00332f-3b1c-43df-a2eb-7261b03cdd46	6c5498fac78d874d9e82347a106a9fb7dea4cbdf00a1737f82ddf0b4a6be708f	bZxT9DiI6kfhOhGvak2Z6gfvrA2PfxG6e-frNilO7mI	2026-02-08 10:36:00.781086+00:00	\N	2026-02-01 10:36:00.781028+00:00
bf239690-7534-4077-8fb4-3f45d51907ce	4d00332f-3b1c-43df-a2eb-7261b03cdd46	0dd9f4108e228336237bb324d35d5b857948866c094d1cda609e4fb194284793	Yo-ztJ7je8_PdkSRcjhLvxFgqNbJmgAQCq1spauZQsE	2026-02-08 10:39:15.832967+00:00	2026-02-01 08:39:21.719320+00:00	2026-02-01 10:39:15.832603+00:00
1d189231-d33e-4e0f-b044-107aeea6a0b4	4d00332f-3b1c-43df-a2eb-7261b03cdd46	7d71df79bce4f256c1baf57d81740e0a64091a9fa3cf254776543fa920bcdc9f	Ed3sFN9a-5Dm7GN6CvQaLK0cAeBhNH9IflHeBHXCbNY	2026-02-08 10:40:46.585276+00:00	\N	2026-02-01 10:40:46.594184+00:00
e6b56be1-c208-48ab-af31-c571c6734942	4d00332f-3b1c-43df-a2eb-7261b03cdd46	7d88fe03dc995c2e88380a9be6e5b9f8c1bcd1d0ccca72326a1afd8c3002a658	ZKmoC6kET_zYq23Eo0nLUEvxZfLfLZTurqGCDrGxTWk	2026-02-08 10:40:50.610369+00:00	\N	2026-02-01 10:40:50.619196+00:00
0054ba24-0b48-4c9b-af46-61f969a07ae3	4d00332f-3b1c-43df-a2eb-7261b03cdd46	059eb8e00380802c113655199795d48fd6358cde1c327a3be11b987cc54ecd5d	6ulHKaY80iZaGqZTaYX1RmIzSmWNU2No2p-EOS8zC78	2026-02-08 10:40:55.076720+00:00	\N	2026-02-01 10:40:55.086284+00:00
a7d0adcb-2689-45fd-ac3b-c443a53fe048	4d00332f-3b1c-43df-a2eb-7261b03cdd46	57e8c33feaa4724e2bd89cd479913e59d458d6b80eb05458b04e9675a5313089	hFMaB-7_ij3OcZ836VctxfqTGw0iNc2gXJiwwvlHQ1c	2026-02-08 10:41:00.242071+00:00	\N	2026-02-01 10:41:00.252890+00:00
28d5e8fc-fbd9-4d7b-b7a1-37d62926e533	4d00332f-3b1c-43df-a2eb-7261b03cdd46	e347222bb4b1faa4316bf30d18603cf6ef758158e48792d160129ce05df69f84	BYaADSvJurdSVcevKIooTZoMlgeHK2ZlvlbamjCUF5U	2026-02-08 10:39:39.437108+00:00	2026-02-01 08:41:21.120288+00:00	2026-02-01 10:39:39.436879+00:00
29137fb1-ae81-4d86-af2b-bff2e0b2a287	4d00332f-3b1c-43df-a2eb-7261b03cdd46	42a14d268ebab997640b64b07813dfa6bc86992894e26a42f4e88f3b4ae22b6f	ZsRwjklskbCSAwfB9V9mQLgSposg6Wju900hrmHpJGM	2026-02-08 10:41:25.880284+00:00	2026-02-01 08:41:28.472445+00:00	2026-02-01 10:41:25.881813+00:00
e5252597-484e-45ad-9844-44cff8563615	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4daa2b32cbf70c2fdf6b611ee918c6d0a9f83f8cc9475704c330bcbeacd3c170	TrgfiNvYZEpt4om0dAClRyFKRf_dd6rnY4axDv4jKog	2026-02-08 10:46:28.621362+00:00	\N	2026-02-01 10:46:28.630911+00:00
4f258c95-defd-4790-a21f-59b07a468a14	a1ae2cec-e781-48f1-8d71-eb82571efaff	cbc09013e90e94d62dd0b0589eef44b16704e8328b4b5081022ab1241d105b41	_f8dQ2KeSsAmuEkPj5sQUggL_4RDs0zfdC9ki2nUhm4	2026-02-08 10:46:30.012166+00:00	\N	2026-02-01 10:46:30.011648+00:00
0144c115-4bd3-488d-9bf1-35ac0c82cd73	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	28ba378bbe17391558782c9aeda33b9b09762cbd1a5da1cf2c30593a51d6a468	YMKqGXe9SV5n2jpdAlIC7qezMJzPJGbr-61jQVr4gGs	2026-02-08 10:49:10.397277+00:00	\N	2026-02-01 10:49:10.390793+00:00
c5727c8d-2d90-4f44-9cfe-99291472040f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	913e1ab59b50212ef92e57211be163fe06d576c32b958968200f799bcbfddfba	jFZqfgE56Eftq-vNTc012uOPcf4CjxSGptEfhpOnh-I	2026-02-08 10:48:28.131648+00:00	2026-02-01 09:16:13.715297+00:00	2026-02-01 10:48:28.131663+00:00
777b7810-7c6a-4760-ae7b-af6a929d45c9	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	da55e1813b837937884cc3cf77b30da5baf34aba04236152dade2f8f47766d0e	fLQmBoiY2DZ9mAgfwCwFU_3apuUfpQh277P0RmvaB3Y	2026-02-08 11:16:21.806924+00:00	\N	2026-02-01 11:16:21.806202+00:00
19a9b328-f6ae-4bc2-805e-9f06ae29760e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	9ada35d9788049fc7a5a8606949c60e1f745eeae042b108bb8a30dc803373f18	jJBrQmfeBAJKbKrwpOGj2vZJfsnXY3OopWFi2K8sbWs	2026-02-08 11:40:20.452172+00:00	\N	2026-02-01 11:40:20.454555+00:00
d2ac17b3-599f-46aa-9ab8-77145ae0c277	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	5ed4649a4289bacbc8f735e16b666fb5e54260a4ec31d47869e1b1e58158dec3	lCX-xCQEQo1jW_5bBK441ovGsSSQQi1ZRQuXqdxv0Z4	2026-02-08 11:40:29.319780+00:00	\N	2026-02-01 11:40:29.320393+00:00
38b7e605-dc24-4065-b558-27cf66f6ac99	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	efe03649121358b430ddd08af0d90823d58eec05f87be1afd3c5a6fe7ffd694c	ZWCLpy2KKPPWQ1O0Zbsvl9JpCGnXztU2dOmkmeJwq5A	2026-02-08 18:42:20.111877+00:00	\N	2026-02-01 18:42:20.111273+00:00
dee0cebb-9674-41b9-b170-7a2384f4274e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	cf9d3c2ae52754952aaf302108f917c56a1a03d73a5be9aad36556d6e70593c5	8ADOUhL3SWFH2H1-oKGWma2Ctjs5aFcr1YYqXS8ylSU	2026-02-08 18:42:23.413662+00:00	\N	2026-02-01 18:42:23.413483+00:00
40d0519f-0019-4940-aee5-d19688bab4ef	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b88195e89d351deaf353106e06997e91297a9d3a236148cb1cff221fb14524fe	infDWpajgQXAfdYMQmdu0GmxK5FcyaVhf23NTyTqJcA	2026-02-08 18:42:27.870216+00:00	\N	2026-02-01 18:42:27.870187+00:00
85759b4f-a1d0-4c29-bbd7-1dd294bb8fd9	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	444612d1afb1765324f5cc5b63efb3b055b0d1efc7353ff6ff5d9c4bca2e40d4	FzO-yN2xbxKPKWs83YVY8F5ff2I7QCXKQhItjeuj8CA	2026-02-08 18:42:46.234245+00:00	\N	2026-02-01 18:42:46.234333+00:00
63942d43-2fd3-420e-bde6-5b190c6be281	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	356e0ecfb52f7c64b2dd6230eba8951055f0e083b78781471ec07353728e44ed	ody9poYfSqhaQPi8l5v_my3rJSnkXsnNR2ktLaG5LzM	2026-02-08 18:43:01.275844+00:00	\N	2026-02-01 18:43:01.273422+00:00
993d2c48-0fa7-4c59-a239-51ba78b7c24e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	f1f94c54261fa4b69614f71d0040e3f10d3e1d1c6a7a124b45f9cf855c5e0f64	66eS9oW9K9K5pUtJwFsbySwouyiCHXoJaOXsais3iXk	2026-02-08 18:43:11.314158+00:00	\N	2026-02-01 18:43:11.307186+00:00
5dc8450b-efa1-45a6-a26e-e1fd55474c84	a1ae2cec-e781-48f1-8d71-eb82571efaff	1d829b1380ecca11e17a2ac421e9ce90789a3a27506db5d7795f6b5631b60c12	UtF_sfkAyWKCkAHB03AgCP5TMAzJKQ90Iw6ozVInbJQ	2026-02-08 18:43:13.939223+00:00	\N	2026-02-01 18:43:13.931507+00:00
21da812d-dc9b-47f3-9117-e5aa713d3c63	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	fec994fa9098cc736726358672f5a6f68c80851a8a73415bd12e9edec45afa0c	tpFMtt3nWsQOBhHNxmdPz5u-dUbpAjo4Hu6XT3HLbYQ	2026-02-08 18:39:43.188443+00:00	2026-02-01 22:05:59.784463+00:00	2026-02-01 18:39:43.189638+00:00
d5e65cb3-cbcc-4a69-8d80-f05361d8fabf	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	6835e51cc9ef2442f5069d362a82b1f6889caaaca4ce0192addd69e7e0aa9fe5	DdfvwngrRn9EyJyX1OgxMfHGFCcPj6QAEckUbbCAlhE	2026-02-09 01:38:42.195236+00:00	\N	2026-02-02 01:38:42.195752+00:00
9c471d76-35ca-4f01-8284-e66e75c7d7ff	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	de384b0c6dfad4fd55b76d2840c13138dee5ab16e2c53ea4621c54b25b8622f6	S3m4H_1BAFQU7iessiQwa-ZqWuHX22gGZfHL7lU7Ivo	2026-02-09 01:38:43.911417+00:00	\N	2026-02-02 01:38:43.911200+00:00
a4d395e4-bbca-44d4-a75b-eaca556fa80f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	79d3994c0f529fc5fe57c2d64ff4694683a37ff94351496e504b6bfd9feb30bd	hOzgB1ueEVII01H5FtOvZmr2TmQnqIfWG1XTO78IPXo	2026-02-09 01:38:45.850809+00:00	\N	2026-02-02 01:38:45.850591+00:00
18cf4e51-c7ed-4b17-b706-ad08581d2abb	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	844c83dcc229d6c9109f9b0aec108ca05ca9224f9651d22dc7e1067a6b118bd5	2Y6mBMyH0Up5kuh06pPBDR8UUdabJBX1VNcfbe_FJ6A	2026-02-09 01:38:53.009582+00:00	\N	2026-02-02 01:38:53.009579+00:00
367ba828-9d83-45fd-b469-185d75ac3fe8	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d4c69e23ecc7539422746c4e8493673c6e1ec1b1cc31e56097fb3736d63dce7d	RbDKjiszE6QdrXVrAAgRdcAfKy7iT-8Qv01JXpb8pgQ	2026-02-09 01:57:27.545114+00:00	2026-02-02 00:10:04.445282+00:00	2026-02-02 01:57:27.545670+00:00
0f4c4720-18ea-426d-8169-90a6d51118f2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	84fc5d9feccbd3dedd03a583fb34862f979048a4b13dd45f0bf992ae3573c7fa	czBGTi5mpOUM6dwP6mgp_WNfxgLpuqa15i35YIJDou8	2026-02-09 02:11:47.911825+00:00	2026-02-02 00:12:20.005975+00:00	2026-02-02 02:11:47.912310+00:00
2e5d10c0-1f9c-40e3-acf5-86b5891aeee9	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	ad431b87e3f3ed9e39a2d299d110bed990b2fb9b797c6adda785fe09f5f4b742	8Se2Fu2FrSAyqFV26Lb5J4jdiUTQWr0vOVsVPZIiqJw	2026-02-09 13:23:19.161797+00:00	\N	2026-02-02 13:23:19.161827+00:00
86b63391-dcb0-4735-b637-54738e010cac	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	433b2dd90dd75c677367731e9f53a0a69b8fca822861a583b7eba65a019d24d4	BMaCtQ1t_eg08yFMz21jK4b2pCFq-0t7qrAeHT5NeDg	2026-02-09 13:24:31.789233+00:00	\N	2026-02-02 13:24:31.789161+00:00
345de893-2ed2-4175-a66a-96d0424efc50	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c04fb90455afb0d79aef932ad741fdb424604b12792b88a05d5aa492e940c0eb	rdEFo3anycdiN1D4vM_3_otT8VwLQLSRPAlNLrLPwY4	2026-02-10 21:56:22.468473+00:00	\N	2026-02-03 21:56:22.469032+00:00
00c62ce7-2004-4d25-99b0-bdf970e0427f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	fb7064727786c3f85819f21ebf525e9059bf10528e7e1362d358824c9c410a22	ERs6p5T-rNgVh034wPcHgY9ELC2xFmt90VJ1B_FKe2U	2026-02-10 22:18:49.563829+00:00	\N	2026-02-03 22:18:49.563094+00:00
a8efe5f3-cc9d-4604-aa68-2b3ec6553419	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1b32d10af1c1b6344fb7ab85ed10720669f3456f7d8e4b6f5514b3924bd15bf6	nSUS3Qpx2Na-_jzPne9QiNcDfRIt8CHk_AwBG1qzSEs	2026-02-10 22:48:46.808649+00:00	\N	2026-02-03 22:48:46.788129+00:00
74cfb962-00fd-4316-939e-ca6c9e53f072	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0c1924141cd98d2fe8c2ae12818aacf0838b3f3e7e673d61f7beb048f4213778	owOp5X4Tolor8sm2oL0So-i8T7uhXH13AATjQmZWpcY	2026-02-10 22:30:53.583607+00:00	2026-02-03 20:48:46.810867+00:00	2026-02-03 22:30:53.584427+00:00
a8132321-a9a9-4bca-9a77-d0539ed61532	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	3a12c07768bff124c2a6c65c97b03891e2aaf79e8903a16f4fe24be23fac5966	0sZv3CUlBRkk3EvTpZfGNR0emEL-sS_AoJWnZ45iJl4	2026-02-10 22:48:46.833202+00:00	\N	2026-02-03 22:48:46.828586+00:00
bb8465ff-fee0-4747-8069-8f28a06014a9	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	efeed4885a302c0c8aaffda04c8620f6d5730e68cdbfa9a813c90f9c179a8d14	YX5EUqBGmieBUh4FAQ56f_hYCc0IwgZklGEUG90Bki0	2026-02-10 22:48:46.811067+00:00	2026-02-03 20:48:46.834949+00:00	2026-02-03 22:48:46.788121+00:00
84877da6-eecf-4d8a-b82f-b470fec72508	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7881029fd26704861cde4c5d57c9d93fcdcd5c3f5c40b9e227c24fa6d91cfa76	psOAET-AsK25oeyjC38c5vF7llRF3haPqc5IwmPBYw0	2026-02-10 22:48:46.835072+00:00	\N	2026-02-03 22:48:46.832103+00:00
7f17d5cb-54db-4391-bd70-faf65b9dbb69	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	848becc0b9627cbde6f65f72f9d5ffb9afa0589d972f50fc4d91676dcd69e7e3	1SLIPoHxYAbfaDyfPPLk8zhgVFOM1optiLykLOYfqyw	2026-02-10 23:31:48.282180+00:00	\N	2026-02-03 23:31:48.283279+00:00
e71eb28c-3399-4a6a-90c3-4443733d25b7	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	31be436e409acfb2b35707a739d4af88b708f957a8721b3679b3689a2ff92a44	D1F98DQtDFZQLliGr4FuVvuwaUrrBi1bfDEfuKtnxYM	2026-02-10 23:48:01.786725+00:00	\N	2026-02-03 23:48:01.788499+00:00
6cebe29e-0071-4716-b530-c374e599a3dd	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d65389d792e42586751a59c2da0546111e0eea882962a6c5320db932ba69911c	5UcIdGfjO4696nCnAEDxNx3NBSF9r2ALY12ofy0JPv0	2026-02-14 17:30:57.062721+00:00	\N	2026-02-07 17:30:57.058321+00:00
e12c5b42-d0b4-4863-8bf4-541e390b687e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	842dbb2db8c311c075022b759d4686b146a767a7e0b55b1445ca5c3fac17a714	QdK6OuuJnci8h43Y8haHBBeyvvSUtuIzVNj_IsENU4I	2026-02-13 14:29:17.954770+00:00	\N	2026-02-06 14:29:17.923841+00:00
c7e6ea47-78c3-46ff-87ed-0935a7306e33	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	14dbe087ca08e0e89405a3aef645791514cb6f108c68dd27538e5d22f4abccad	crvsnQqmDAZnc2OJgua8IJc0iyjgYaBn0M3YhziArwI	2026-02-10 23:51:23.372837+00:00	2026-02-06 12:29:17.952880+00:00	2026-02-03 23:51:23.372880+00:00
fdfa9345-c2fb-4471-98fd-3b1231ae88fc	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	79d4f33ee1623e72e6cdd689bf4adb425c70446397929843b2c55b3f2303e147	-hmKo_B9yBVrp8cswBtbVyEubCO-57oBVXPmOo-TTfM	2026-02-14 17:30:56.912611+00:00	\N	2026-02-07 17:30:56.904493+00:00
b00bb4c8-6f4f-4ee9-af11-21fe4eb6dab5	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e1502737e5ccafeb5cf45dd1c5ff656fefe4fafff73b7854652048b17c025e65	jMW_QesFu1_rZDs28SRGFV7S4AcNDcHL2Xt2KCw6FRY	2026-02-13 14:29:17.973808+00:00	\N	2026-02-06 14:29:17.969749+00:00
4c551ab8-8058-46f0-8450-a581cccd3653	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	898af7082e35882c518c835cd313198e7e2832b03b3f1571c0260bb1d0ed51b5	cNB5haoPsv3LnNoKJsdfTQa02ws1mTYlxUxHT08i5Nw	2026-02-13 14:29:17.953056+00:00	2026-02-06 12:29:17.974924+00:00	2026-02-06 14:29:17.923957+00:00
53093af7-7587-4da4-be15-5f961983d0b5	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	8a685128e770addb1ac3bf4dd98257f722bf16350aceecb9ba8180f0f3529aa3	OnS1Kl_5VfQAFtyKt5JrVfB9DCUrT_KuZ3E1LAi2UvQ	2026-02-14 10:46:32.228488+00:00	\N	2026-02-07 10:46:32.230344+00:00
aba4ae04-2dd6-4913-8300-39a6d4f0492d	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1881f5f9438982f3b55ae58e541029869e8f5929d881a73ade16d63b4113db6a	GTp7v2GPdxAzii15ct7c8R5j8sxjLjWw0ZgiKaISrxs	2026-02-14 10:46:42.897488+00:00	\N	2026-02-07 10:46:42.897086+00:00
4d3fda63-14b1-4b23-8cd8-eaf37db3dba9	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	bd32d9d8f4bd645dd7cac95cef315b6b27d76ef59d12818c8c13a1ee61f1e356	fdr9fQ2aIRCRAzgAG3_zpM_5NiEhgrnUPXTk3gAUWSY	2026-02-14 10:47:54.081697+00:00	\N	2026-02-07 10:47:54.081325+00:00
116d7971-c741-4f7d-bb01-247e9b4638f0	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	99854f473df02c5d28cd6ee8ce4d1aa8d9014651596ecac19cb723fc621bf082	byfLrM2XeLzvmVaawUzga28c9C047A7pKUQ6N7z4-6c	2026-02-14 10:49:00.182214+00:00	\N	2026-02-07 10:49:00.181457+00:00
fb0c88c6-358c-4e6a-b5f6-3625cec2f4fc	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a5d7bc02092fc63754c33d3265585a03ac595b32ac283a15aec7a55da191ed7e	sRV182Q9x_NJyNhYJ5TDG-IoGZ4sb2QuR8RZDVamihk	2026-02-14 10:59:54.054975+00:00	\N	2026-02-07 10:59:54.055118+00:00
80ba919c-e26d-455f-a5d2-4a9875586d3f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d5d540b38de030e354bb8c6cb8f9502bbb6d5fb39850ad664afc5e8896e2e838	fkYfawFi-wbpR46QOoAKbYB90DzYTXX7OMOX9CZBRos	2026-02-14 11:08:06.152427+00:00	\N	2026-02-07 11:08:06.152052+00:00
a0e8aaea-3738-47ea-be4d-553869349c89	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e33f1383d66091dcbe664971cbffc865f146f7b9885e3d63a796b6da1c585925	L_TorVNVJO7bvcMLYtK_t2KBjdGApeQkn0LTwIzgQO0	2026-02-14 14:39:24.510349+00:00	\N	2026-02-07 14:39:24.510984+00:00
62d6c819-614b-4de3-998b-bd203a55cfc2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a814b6e1d92c501377415670494676eec95f395f0e288fdef63660cfc4892688	tEBXEJVGTftVbyZ0MZDzjetNxqeHEK6pxh3eJrk2uKA	2026-02-14 14:41:36.752110+00:00	\N	2026-02-07 14:41:36.752147+00:00
3738258a-ac54-4f01-83f3-232656320c60	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	39228e560a793419d1dccc4f57c4cc48a37954c59b36c344169590fb03e556be	9Yd3sfJnZLvNjrtRUy82Dgl0Ss_jFLo4KCirNbmQIFw	2026-02-14 14:41:53.509490+00:00	\N	2026-02-07 14:41:53.508962+00:00
879ec1da-0802-4938-99a0-4e55959f8038	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	25029d21111e63f0430718b45713695b739603b9e6419513bed1427180d82ff4	map9tJLT_yclANU5ihAc_f9C5SwOA1h8QtzE3VsOZLY	2026-02-14 14:42:07.028959+00:00	\N	2026-02-07 14:42:07.028440+00:00
30edbbef-cae7-4183-9073-8a07463848fe	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	548fab8c7eb51e6a8066aa4676fa291f18de374cc5465ef9c004bf520d0ebfa1	QhMyfSXpG5BnInBq_S8FFESFhyqyuPAlg96fKVA91qM	2026-02-14 14:42:20.708269+00:00	\N	2026-02-07 14:42:20.707799+00:00
5d3ec079-ae3b-4ce1-b8cc-1dd09df3a4d7	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	45507f7d51c1deabcf5077cab7476745aa2b0ad1ab14c53b0a4e190dcc86a89c	vGEOFT3MFeE6pLLpR6HLEiKI16qLcjJs57YCSkQAxgg	2026-02-14 14:42:34.211170+00:00	\N	2026-02-07 14:42:34.210511+00:00
8fb5be89-906d-4e3d-b690-dc185463f23a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e983c2292c7c30f0b5e02ef6230f0c8d94f607a9f101634511adf3d23e9ce2d1	PNeLcURENz5KOl1Ezev7DjEKvZ3NB3ugiCIrN9ZG3_0	2026-02-14 14:42:47.567227+00:00	\N	2026-02-07 14:42:47.566442+00:00
87af1e31-6b23-432c-8faf-aed0c2e77ba3	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	da30764e5d276f72cda18e52fae2d392e0fbb59d29e30b485b30a7775c15c391	o84O7yQhlxrv7TH89XtdXNGCCf669ZAl7UR3vfxHDRU	2026-02-14 14:43:00.896562+00:00	\N	2026-02-07 14:43:00.895987+00:00
2c15038e-dc65-43dc-ac36-41243dd1d6b8	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e37d0d071bd880e01df61db9cfb7d3a960d6c3c44cf8d44c890930a7c7c5e1b0	RgypRx7Q_3lA5peIdOO2ktrzPFHpaT7FJF0Gb-nyFdw	2026-02-14 14:43:15.361550+00:00	\N	2026-02-07 14:43:15.360886+00:00
3bf25209-942c-4837-86e2-80135b832dc0	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c53a7728f06390ead8116dd6c51044d93b249408e808fa278e5330258b7a8e7e	neoTWknKknDfbvQ4v0o2PGIETlu3l_XMbb1diKYm63Q	2026-02-14 14:43:34.936151+00:00	\N	2026-02-07 14:43:34.936115+00:00
c5d5cdba-46de-4a7b-b999-e959c6966596	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c2c77c5b83d40fe2a32b3dcc480c0143368191c0efff1424c4b235f54e571a5a	P1ovP0FwMWfPelsl_yZ_GkRpulAFFFzXBX_0KoG4Fb0	2026-02-14 16:46:56.842117+00:00	\N	2026-02-07 16:46:56.842765+00:00
52d619f0-b2eb-4a94-ae69-17e5a018fbdf	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	3d44986c35380fd7dd726a8fb22e68ce95e1d3944965492956ce1987acf15289	mX7tkWJIBAGiK-04EddCXMIMa3yRbyZlGXamIJMQ4oU	2026-02-14 16:47:13.284431+00:00	\N	2026-02-07 16:47:13.285146+00:00
7484f6c5-29a5-4a07-8242-e28172874e69	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	ede682bd20e6a4a69cc660100d1f244256bf311e2d76d62b182bc92c17b3438b	iujHhpApxhpOPpw0F9P9uToJyjf6OWr1nrjhJsNydys	2026-02-14 16:47:26.819278+00:00	\N	2026-02-07 16:47:26.819141+00:00
53d9efca-d7e0-4e03-9bec-d8c53730aa2c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	3771d9a7d18402185782ae640f09f84f2e049dd56af4b7fab75fac8ff9e4afa0	NxkFR49J6u_QK3hTQ8gHgUsNXe7Osfle8BhI2ybu-G8	2026-02-14 16:47:40.574469+00:00	\N	2026-02-07 16:47:40.574611+00:00
a3130a67-7da7-4cfe-ae33-2a11725a6c1b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c23ce48ce7d0eb4f9be7c3bce8f33dc2ee7c83bc990db4b08804250ef99fbc88	Kp5dMw1g1juY9JXCteKujpknbT-OHiHaI76jDy7I2ng	2026-02-14 16:47:53.984335+00:00	\N	2026-02-07 16:47:53.985129+00:00
a3c199a1-f236-4629-ab29-6c272b6ec3e0	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0f36d44cbe802aedf10605fdeb2fbbe4b7d66a94ba14dc0f57d44a1e0ec58ce9	c1UsUeUsnStikPs61kFoa1bPceJIcfzHprvomX8X0mM	2026-02-14 16:48:07.353387+00:00	\N	2026-02-07 16:48:07.353088+00:00
6e652c74-93d8-4d78-9d2e-97f2cdf475e9	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	19a4320fac20e73ae8fdb70166da7370e8c345bbcf65fcf85c575da758131cd6	OFfUiybJEAccwKTAvW6TyWdRl27ea6wMZXV4VgkcQTY	2026-02-14 16:48:20.684405+00:00	\N	2026-02-07 16:48:20.684273+00:00
5cbde2ff-8732-4e86-a01b-81390bdeadb8	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0feac88852d835e8ad4304bf9d8865c0bc2b38a01ac608241b3739b109a6d11d	egmDjEZqObo7EUkx3J6wwLKPuR3yqAP7LSdgAZVVkqQ	2026-02-14 16:48:35.070926+00:00	\N	2026-02-07 16:48:35.070538+00:00
3448f831-70c3-4b53-b862-87e9a21d0cff	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	78d298dc829daf9c59f48df63b2a2c2d1c864053944779465459f8e2d354da8a	boMZMkY7tKKVbIgNK3nGReazY_TGTS9Ei9I88MTbzjc	2026-02-14 17:23:39.407063+00:00	\N	2026-02-07 17:23:39.407512+00:00
e2a64ffc-114c-4019-b939-6232d15baed5	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4fc718cd32a6938ab01596f9d5b5f220eb869437c695f91efc64d8fd5a383c21	VulS5rjWrnUVnlUTUlEhCEfKP5smt-ezTXYroxYv7Ug	2026-02-14 17:23:45.561729+00:00	\N	2026-02-07 17:23:45.561676+00:00
795af4f3-0635-463f-93dd-e1d6f77f39bb	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	11ee5c07e1139da3072be8c2b403faf8c7ce1195afaecd1cde3cc36ba68750af	46W6_o55V-01B5dOI9q65mA8NHKsonsIEzRUDmwb-qk	2026-02-14 17:24:02.290784+00:00	\N	2026-02-07 17:24:02.290613+00:00
590df9fc-d09a-4791-baa9-f36559466e0b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	468c582d9edb0490e10412000cf257467e7287db3e7159e8ced4a257ce367912	srkDSniRvXQ5koydOZD9-Ig5r19zkpuVvGU7RxLH5bI	2026-02-14 17:24:15.793019+00:00	\N	2026-02-07 17:24:15.793102+00:00
65262789-fd0c-4d86-a935-2fc404c23c86	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e87eb3e3c69d03909f7545ccfb080b61316ad16d5e73950d546e2b54170bcee9	hM-c7yM2ZddJDTOpOuXOdaUY4GZutb9qXdt7_qdn13Q	2026-02-14 17:24:29.190061+00:00	\N	2026-02-07 17:24:29.189969+00:00
122a7b9f-ae16-4f5a-ad53-678a57590be0	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	2aaf2219c3ebf74329ab9e458311a22ce13bc39df05156532b6212a8a0586ee1	p6MR1vbbtxoDu6y26Mfafo2EsGqI7JqgXldk68Xj8v0	2026-02-14 17:24:42.601289+00:00	\N	2026-02-07 17:24:42.601618+00:00
af438bb3-649d-40a0-b84b-a71b45ca863a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	2e65ae13673ce195bd24d445d40e399d91400669aa76fa37892da7ff91fc35fe	sYn4N0xLrO9hP4rzDpbGEnu-oWUA1Kjyf_-TkMkBt-M	2026-02-14 17:24:55.858551+00:00	\N	2026-02-07 17:24:55.859042+00:00
c6ccadc8-7833-465d-bd49-1e9ce0c587d8	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e0b97c5c8a7cafa9a605f18b2f086d2c80debfdda4cb15f5d71bb6cdaec875aa	futDQhOOtJfAYOrm_02hO_XWpDS3IrUqwUw-50NIGtk	2026-02-14 17:25:09.292309+00:00	\N	2026-02-07 17:25:09.292181+00:00
427c0891-39ee-4602-a08a-c5f034216d1d	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a1c1442770b1099e0a674fd8c777e86d79b5f0837f3d03958bb2623e16d1522c	bmD1YKacI2zu_GyBjJAUZlE4gk1U3RpQg1sgQYuVFT0	2026-02-14 17:25:23.661291+00:00	\N	2026-02-07 17:25:23.661358+00:00
5824fe5c-dc2f-48d0-bed9-5033133dac2f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7a19b7a0d0e3270498b6761e40f451b9994eb08ebfb9ff18f1e5b26052fb0cf6	LQ6Tot-5HDRtakuppIKyBgE4pv03eo--ykb1JJTDvpQ	2026-02-13 14:29:17.974996+00:00	2026-02-07 15:30:56.914135+00:00	2026-02-06 14:29:17.972552+00:00
9ad1ac9f-dbe6-4578-8dbc-9c75e606c3b3	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	29a843e3537b1aef975f49282ce7c2a6510348709fc8f468f93947a1d2a0d193	ZhWuc_wFQ0kVta51kLZcV0SrG1Vvt4Cpg4TWUM_7AzA	2026-02-14 17:32:25.549451+00:00	\N	2026-02-07 17:32:25.549833+00:00
82b99aea-84f9-4e9b-aff3-92c5f1e6cac9	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1863f9b779e8bc881f9bd2c0fc0f7ef91fa3fe80c2788b8dc86eea01e1aa2668	JHWm0dOyicXyAMCND4-NpbJb6Zr8zDyO_Qv7lvipezI	2026-02-14 17:32:41.733285+00:00	\N	2026-02-07 17:32:41.733029+00:00
bc7a137b-a6e1-4b67-bc62-23a7f427ac73	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	9eca8bf19fd8dad23da4fdc646a55f94b7a28b1419440bf34bd4e7b2be33c22d	sqSnwBWhHPt9Xnlu5yiCJOEWRotJ_P6kimeqic9uF0c	2026-02-14 17:26:07.300236+00:00	\N	2026-02-07 17:26:07.300372+00:00
c2a33760-3748-4799-a187-e3f7fc824ad8	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1c3cd7a1f85c1bb56b6e6647d1b13df51100300af47dfa6a5c8f3517d559f732	EJMudvArFYfTJVFZDMwFXFtM6zReeiT_AeIMaVEItZA	2026-02-14 17:26:23.781904+00:00	\N	2026-02-07 17:26:23.782271+00:00
fff3e1c9-048d-42ef-afc4-6c444a75f494	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c2532059b287beb44a73ee04e46f323ef3795760d821a5a670f6388ee2ed5e99	RQyvKJFBN4lNBYLoyoIj9dTBhVpuCxRd0Qm_mIr8tOA	2026-02-14 17:26:37.390275+00:00	\N	2026-02-07 17:26:37.390007+00:00
4fea3a43-ea31-4115-8bd7-ebf49904925a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a83b8d19181e6a7f49c9e047dfeb4050e50f2e4c17ac1323b936cfc0b071b852	5xVfeGLTQjxE-RDDTIbWIdK7nMiJ7VrxBMQOYFZoiZQ	2026-02-14 17:26:51.162171+00:00	\N	2026-02-07 17:26:51.162114+00:00
4b1ad5ab-dd87-4ae5-9fa0-cc7a2107a85b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4074c5cfe31c5555f643ca23afffec43eb31e64636715d00318478b4838976fd	EWkv5JmP_iLYX7TNFJlbuLSq5HJllldoi1prqyFYF0c	2026-02-14 17:27:04.581920+00:00	\N	2026-02-07 17:27:04.581669+00:00
1dc32e0c-98a6-4545-8b48-11096d6e17c4	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1d707ace87e787e2c5b94e26579315d1b48ebd340b213137bf656bb74a4815dd	k12PbIZfVZmyLznHim7ouIDq_CRZCJAhMVjlaVmlAAc	2026-02-14 17:27:17.918653+00:00	\N	2026-02-07 17:27:17.918617+00:00
ef7b7e0e-b526-4ec4-b25f-a0da180c0b12	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	57a621af04c9da290d21f74e2b98c6122c1fc49c2c35c6575738fe740907bc8c	ghCNeuMr8lEWSAYqJNtvIYo7qy8HX1059qra7OE5BQM	2026-02-14 17:27:31.244499+00:00	\N	2026-02-07 17:27:31.244305+00:00
88742499-fdb6-4cd4-9c4a-96ec415aded8	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	f2155d3e1dc9d8973f7d404bb7ac1efe421fd44449722e30ff33cd06c08e4b5f	IiTerVw5xaaQc5i4lRr13XVJ9oaMZ5C7eKsbY7neNcM	2026-02-14 17:27:45.825284+00:00	\N	2026-02-07 17:27:45.825570+00:00
c8ac3e9e-e1d2-4053-b243-f3d6a3a7928c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	fb9edda91dcb40ee753540bdcae9de1a30306d59fab4d46d6ea2df5dc1e1caa1	GRArkzl3ceBVrpSNKl_Jnau_1MUok9aCJMDeuupUCSM	2026-02-14 17:29:18.753756+00:00	\N	2026-02-07 17:29:18.753895+00:00
f4cfb917-f69a-4f3f-b679-4d90bdcd4cea	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	acb18c7b4a947f0052d7c598e7c7ebb380b344931af586ba6c0a3c54efcc77b2	tWf_nGra_JMGXhNuB3kr2I9bot0ZGxhHaq66n0U7muk	2026-02-14 17:29:35.317619+00:00	\N	2026-02-07 17:29:35.317577+00:00
d790aa73-826b-4d23-8dda-f963726d4b4c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b4e9492e859e4ee792d4fa33a5c1116acd0a01b27bcf8bb57144977693a9abeb	1QKohLAgeQHQlLVB2wUVtnLpnszzUbQb9D0JWgrDQmA	2026-02-14 17:29:48.736900+00:00	\N	2026-02-07 17:29:48.737150+00:00
fc13099c-7408-4a1b-8b91-bc6b049d867d	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	180e5da7068b76f12cdd7e4db342b6e14e471e65e0b5379fb953a88a5e2c8009	skwi_DOskCHXCL7_jBOJiIXVzb1FpAg72-s5tSvjLXE	2026-02-14 17:30:02.144175+00:00	\N	2026-02-07 17:30:02.143786+00:00
d50028ac-df18-4840-a297-b3b041958193	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	bb6174f34e997d5f30d4d60f9adb5ef8a9150f1c5e98500d1c0b44f607d726a2	eulO53lXKAPgkUoFxC-8xnf58XIOhOwK5GkuUO0w_v8	2026-02-14 17:30:15.458477+00:00	\N	2026-02-07 17:30:15.458515+00:00
e9a4f894-bb39-4aad-9fcc-fcff2a5b86c2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b09899b838a9c156398ca37dc3a8729ff3eb1af8185d8d9ee722524c2ae86243	731T5KUvL8F7yMUMcUfb31UMBk0lbN7MwX2XytMfaaA	2026-02-14 17:30:28.834154+00:00	\N	2026-02-07 17:30:28.834074+00:00
b1e13229-ae18-42aa-b33c-d74090e4afb2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4ab17eafe3859f81bfe458c0c327286658a17b3cea34f67c18aa92a5de99fe2d	odeg8wQU1tChqyepqmwvcvo5Nv5GtGdzSSm_hpFSPnc	2026-02-14 17:30:42.354963+00:00	\N	2026-02-07 17:30:42.355185+00:00
bc6b8b97-6b28-43d5-99ec-2817a3339b86	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	9d4f2e330ed27ab4685cc86679504f1479b8e7c62f8ceece892ac824789bd974	JGddFulAagYSP5hie9I6evc1kqUc2JYXZl2BS7poLlE	2026-02-14 17:30:56.704683+00:00	\N	2026-02-07 17:30:56.704591+00:00
aca7c52a-1bfb-4b35-8d63-e640d1de89c4	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	ab0b2113ee0538768acd7296c2489283ba74bdc47e3c68152ffd998b90bfb761	9Ug4CbLDgTkTQPMdrbh3fQ2QmdhSHXlO5dDjzafSt_Q	2026-02-14 17:30:57.063616+00:00	\N	2026-02-07 17:30:57.058315+00:00
f3bca7c8-24e8-4f83-b676-5bd7a3fb65a7	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	6e531a63aad9c879e010481092c19cfbd5b5f5d165bb578edce843100a8b66b7	aaEiurI-KiZw1j7NL02msFPEI8TzAmVryyh1UP2mLLw	2026-02-14 17:30:56.914231+00:00	2026-02-07 15:30:57.062595+00:00	2026-02-07 17:30:56.906140+00:00
e68c1a58-11df-4172-b964-28e101353afc	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c28323e1fbf7892c5fc8c913af50d22066c126e9708adb5e48eab2cc07a0f91e	hNrkBfsNQuDSSgZiqMa1H9nrrCZo0yZT7WQPp1Ns7So	2026-02-14 17:32:55.303171+00:00	\N	2026-02-07 17:32:55.304039+00:00
7c54a5f4-d269-4f99-9d20-84ac651c809b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d90cd266b4a6438d79e892dbd6a5847a989cab245a97539b8a9e395ecb13ce98	_gKAD5EY3eKHzWsIV8QS_s_PLsf9PWmkE0c_KaVkmb4	2026-02-14 17:33:08.770961+00:00	\N	2026-02-07 17:33:08.770818+00:00
a14a940e-bc64-4cca-b961-d48883b03d9b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	80ddbaa183290e2adca769d9fc2e7262ef1a6a982df76b46565a7ecd6fa299a2	8U3VvbLup5u7xYqLYrFEmTFWErDZFUmlV6f_0eAqeD8	2026-02-14 17:33:21.685736+00:00	\N	2026-02-07 17:33:21.686221+00:00
93bc4819-82df-49c4-b76d-7103a0edd1ac	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	6a40a47aac56bd8b8518c85a47f8c9170444debe0e6fc2ba7c6978da5f3687dd	OU3l0nfpk63J8H8p39nef8IyQejYp9JBnVP4tVI94iI	2026-02-14 17:33:35.066422+00:00	\N	2026-02-07 17:33:35.066021+00:00
2d934892-f56a-4d7b-b5e5-e90a3c5a04ec	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	6ce75dc2133c103bda8aa3f963ca81a643b6d7f3b23291b6db516d8bce6344a4	gCo_8t-jVufFsET2a-YWDG-qmM9RNTcdit-pq-CxX10	2026-02-14 17:33:48.510784+00:00	\N	2026-02-07 17:33:48.510748+00:00
4bbeef21-4329-4f5d-9f2e-09f81b679868	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	28f4f2f3245eb5c8d627c5215dc1e4bf77db3b222a364111d1a448634f38d037	Ftcv0TSHH8PB8tyizz0Mwel6qhh4kpyq5e_MBgcs6BY	2026-02-14 17:38:50.249412+00:00	\N	2026-02-07 17:38:50.249358+00:00
16045b8e-e477-4a1c-b48d-89d848cc5d12	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0ef6dd3226d35d51a9b02396262dfd10c117368d8b450c94bba3472fcc9cf838	2W1wMn-aqGvD52zLH00mfJV8BNELrwWjV9zQL6q34ns	2026-02-14 17:38:56.216315+00:00	\N	2026-02-07 17:38:56.216316+00:00
d076f600-e02a-40f0-bf8f-90740cae612c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4c549987812e8b80bd4e7e44d82cf189e8b8bc63bb8d299ab066686835d3d7a4	n4i06y_5_NivPxv-MLJLl9FWF-95CKfLOfSpyJU9fuQ	2026-02-14 17:39:12.965961+00:00	\N	2026-02-07 17:39:12.965986+00:00
cd2fae85-3741-43f9-a09d-89812bfeb03f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d576950fa6e939938857d9ed2005771498b42d5cb3ee7fb6bc71055db9612d02	cai29-dpk1BtPplbfTcQtczvDf-E7pfmKKfAEN_qx8E	2026-02-14 17:39:26.635373+00:00	\N	2026-02-07 17:39:26.635311+00:00
984528a6-682a-45eb-bd34-f9222b19a30a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4c367c3d03ddb892301ca1d061343a3b0f101ef5b909a143dc18ecf741012ec9	hPz0fDEig00JJySvBfCcebGReAokCV1uTdmwA3Sf1WU	2026-02-14 17:39:40.345382+00:00	\N	2026-02-07 17:39:40.345695+00:00
a7622198-57a7-4612-ae3c-1d69d24fff86	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	02b56a789ef9215e24703745b17b2a42bf880d90fa4d955cfe1958b3706a6a47	0JWtZ058cd3edkrUdJUysE58S5EnAyPFFnAYW0Nfe-k	2026-02-14 17:39:53.745215+00:00	\N	2026-02-07 17:39:53.745457+00:00
a34bc0d2-b1a2-4596-9eb1-2a1fe295bc57	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	8554828fadc6621c53d381555cf461e9298e572d1e758d87595384c0fa240a44	2Dv-L4fAM2vgXUAtIaZfOoRToUHj2s8uv_pOScLGVFA	2026-02-14 17:40:07.097787+00:00	\N	2026-02-07 17:40:07.097688+00:00
d77e6e59-3b9c-4378-b942-da613a589908	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	5adcad6f5d6d664aaac6d14ccd5d999a97d687bd1b38507ad0f2b666ed04c05c	lYw7o_4-TMh7RPWKE3a13oQKVbP5WJ-sMTJegUp0pDw	2026-02-14 17:40:21.265165+00:00	\N	2026-02-07 17:40:21.265258+00:00
5452696d-9f9e-4c15-b357-03b96b62f14d	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	690c7269ecf8e9942ae35070f93a8b0235609bbce331870c3599cf63b32cae55	-x7-l2RS04BH2cKWofaByk0PK1QXIXsK4mz6cmhFZ5U	2026-02-14 17:40:36.551039+00:00	\N	2026-02-07 17:40:36.550562+00:00
2bf7f021-fba3-4679-8783-86f2d1c8a91f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	271eccde83c12e050a03cebd28b586761a206850668f37bc164534a3f62229bd	c7Q0Tvymaqpvj38VJT3vg4UxF7Gey4Y28hzThZmFsLU	2026-02-14 17:41:39.605853+00:00	\N	2026-02-07 17:41:39.606578+00:00
db2e236b-e551-4bba-8bd5-949f9a008529	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	71b19ecc1d7f2241055b86ef2d4b7cfa633e0042845412f8cd3ee1e022dec97d	haCbyAjXXXnlwCDDfdjyyMDFJJBm_mrw5MIRGZfMVQ0	2026-02-14 17:41:55.996235+00:00	\N	2026-02-07 17:41:55.996731+00:00
9a531b18-a45a-4732-872c-fb525f053859	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7f129cc7fbbd5fa2726f1e4863be67acf8bc40a3c767092d250764b86a3fde5e	vavGbehISXmiP0V6ArfHgWaCLNoBJC-MTNk8RdvWweE	2026-02-14 17:42:09.619026+00:00	\N	2026-02-07 17:42:09.618328+00:00
2871696a-b880-4bd4-a841-f2c8cfa8cbce	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	52b697c554327aa3eda6ee8268cf89e103f0f6ced2d995052a41753133980a18	gksbkXc-hEJaueTl6VDzThA889VAczQXfVM17SayJaw	2026-02-14 17:51:37.787913+00:00	\N	2026-02-07 17:51:37.787572+00:00
b4981d52-c534-4e61-bc45-e53c8f093de7	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	10a5685339447e904aa7396ebee6687018c1561bcb70d23450a5e7af5c65b331	jQ2XBe-vvki7-2DwQZLnD3Y1c73Sd8Nr6H88QDqg5V8	2026-02-14 17:51:46.354770+00:00	\N	2026-02-07 17:51:46.354517+00:00
601803e6-42e8-4ca0-a2da-4187f61b6ad0	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a7c14c41c78c212e344df8e4b6b76687a1725381e88a9e536ce178aa0aa5279e	gQ36CHdR1Mj_ff2D_ukzMsZp9DMP4dSvZ9AYGOv600w	2026-02-14 17:51:57.991090+00:00	\N	2026-02-07 17:51:57.991110+00:00
178cb564-aca1-403b-91fc-2bc63cb73dc4	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	eb8f32a8b39b368d0661b77feb266c4385446dadaa0fcbfd176c6bb623246a97	AyWM84oImWax4_j9MgppXZr4pe6qfmyCtT_ypWkRHKw	2026-02-14 17:52:09.487086+00:00	\N	2026-02-07 17:52:09.487216+00:00
b0b58935-555c-4bf3-90fb-8b183bbd4d08	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	48527129ba4548ccd41055b404e410524c092631f8b66a7d1548e12462522d1a	ypf1hjV-DPKC7c_kAZTnvFuwfL59S07THgfMMFymWgA	2026-02-14 17:52:21.150550+00:00	\N	2026-02-07 17:52:21.150857+00:00
3c47dfec-8ca8-49ba-bcc0-a994d239ca6c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1b0c91afc86a2e82c8fb16d9a98658656b54f7d72b1860e564da95d465b57fd1	5byDs26BGLcAjmerqEeaT5gSumI5ehMTt7xc7KZ4hJw	2026-02-14 17:52:35.483266+00:00	\N	2026-02-07 17:52:35.483428+00:00
610627e8-62a8-434e-8b53-ef796c9d5dbb	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4e9ab0a9d6c195e5acbc877b6579ef32634ee1f618682c449edf514d82e946de	khxDh_bgrIjMWZA2et8_FzTLC_cD2R3xwpvye2N5Sxs	2026-02-14 17:52:46.768151+00:00	\N	2026-02-07 17:52:46.762306+00:00
7089b4fe-b823-4cc9-9b71-f3eda3547dca	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b1234494ec665c1e38e8310ef85400d6ec82d1f7c2d53e492e49c4d35a044ba4	GZbmXyETqR4_x_dmDaQtt6IRamxgp9zOZk0jN7kGGFw	2026-02-14 17:52:57.779357+00:00	\N	2026-02-07 17:52:57.778717+00:00
1af56c84-d493-4626-aa41-5a94796f205a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b1d0ce134428c869d9c6d1adef5268919b375119d146d5548f5c0b3cbd381bf2	2aTBDpSvBQZHg3vdG_ICYbowdtilFoqHj7G5yUpBTyw	2026-02-14 17:53:12.920213+00:00	\N	2026-02-07 17:53:12.916528+00:00
4d6fbc90-80df-4286-8876-27ab1a051ef4	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	816d0442c687fdc5f57bc3f4fc6f1577504fe5424f213f4b560c8e8b0ab0b67f	7ViOrahx08dRWRzuPHUXE-tpGlZvTsJ24Lc9hiZVYSk	2026-02-14 18:00:20.541505+00:00	\N	2026-02-07 18:00:20.542175+00:00
ffd3ef63-1585-4a7b-b8f1-297cd037843c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4f94739f3aa680d3c7041a24e53dc9ea7d47597617825db47fb277641f5fa64a	cEc53Y5kIkPI1DCY-yfNzeIIlOrbRovO8RWpvY-2ZRo	2026-02-14 18:00:24.168438+00:00	\N	2026-02-07 18:00:24.168208+00:00
17df8a15-5a09-4d44-8912-2c252c234faf	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	da2cdc06c4c485205bbfe0a2bb6d7fb35e5ecb05a9aeca1bdbc08d6befb98e53	RVsCjuIObTr7kP4ic4oWPfmZVFSJ0sDTSeMiAL4KUz0	2026-02-14 18:00:35.803393+00:00	\N	2026-02-07 18:00:35.803088+00:00
03bb2519-c993-49b9-a50b-73aca96f35d4	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b1e137a03d24178688f048ed866afcf69c301efbc0d904b3127100aa419339bb	NYr2XxldbtqNdCprZf9Egk44y_2yNaWDhjbTPs8gDHY	2026-02-14 18:00:47.174547+00:00	\N	2026-02-07 18:00:47.174366+00:00
2dcb1e4c-38ba-4e8a-8fb3-d7410de6fe54	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	5bda1c7eb4cd70e4c6b3caaff1b5e30e6ccdb2b622804db6e00a8bff275e5ce0	zu3gi5WsJDWucR4k1oXnftVJfqGkNA1K6am0f4MXkVk	2026-02-14 18:00:58.408006+00:00	\N	2026-02-07 18:00:58.407821+00:00
f8bceccd-01e8-43f7-ab5b-d22299f9babd	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	424d311124d372457ebef884ed52bdcfd4a5067ae03fb35cddd23ee7717c5ab6	6fQWIq_aUt6ybYDqmqlCL973SsnN1s-P2FhZFm_-hMc	2026-02-14 18:01:12.587244+00:00	\N	2026-02-07 18:01:12.587182+00:00
d571e15c-dbfb-4d98-ba93-a21c74ac35b1	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a7832de85c99ccb81d29517d8ba537b3d4ce296601272d7b0afd875329e4f78e	igcnZlFgqGrjzj-m4NQqHwVsPTiRrHZwg-CgjWPzv7k	2026-02-14 18:01:23.649470+00:00	\N	2026-02-07 18:01:23.649628+00:00
6397c0c5-c0c3-4e84-91cf-a3f4d6417a5b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	dcedb48472a544c0c0e7b6e20887d553483cd571e8611e59f7402009241501a9	llVIuWZRvF82Y5JiK3_TPyHTZ0L717FuZh5HwqMEGP8	2026-02-14 18:01:34.853110+00:00	\N	2026-02-07 18:01:34.853526+00:00
5a142cf9-bfd7-4c64-bfa3-021580cd823b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	2a9fe62b170b490b7543285ce95a95f4fbd9a7c2ed2bbfbbf3ee9d03ff03dd74	MpAT6P7YYLVefdP6cfQEmFDqGpruD1kh4W4iNZeQMIs	2026-02-14 18:01:49.790001+00:00	\N	2026-02-07 18:01:49.789731+00:00
af398db7-892a-4030-900b-ce6464b9ad49	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7d66e2b820528e88dc422d13e5dacb8911d1db424aa8feace2386a89955431d3	AjPVMPjlVOZVIHAhRoW4wS2U4tk3Lj7WM7TuIH1ndd4	2026-02-14 18:28:47.486716+00:00	\N	2026-02-07 18:28:47.487106+00:00
a243deb7-9fd6-4035-83bb-2acdc5c91b82	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c14f5f264f31b38da5edf57ea8244119e0a8ae4e406038cecb968c423bffe957	jpaQilXT0UyYamow3HE3FlWAOJq7fYXawm-oKYRAvU8	2026-02-14 18:28:51.469279+00:00	\N	2026-02-07 18:28:51.469062+00:00
377b4856-6210-4d7e-95de-32987f3384ba	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	37170b6d219503a60bf6f66ddb5a30b6bad050491c8ec375306e1cf750c9523b	keBP3hZLF62Dg6AM8ygWbDtHz78O_h_GpsR1NH-pztE	2026-02-14 18:29:03.066041+00:00	\N	2026-02-07 18:29:03.065444+00:00
7a260f9e-5802-498c-b309-f82db30c3b22	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	22b9abd83c5268a066e03f664b651a03d0de82e773dc102afa3efdc0304f3c18	qOolSY0gDZ_oW1eMDEuutbbfmqiOmZVI9lkkunL0KUk	2026-02-14 18:29:14.643429+00:00	\N	2026-02-07 18:29:14.642828+00:00
7552f6d6-7ec1-40af-9b0c-0796e54508cb	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	77569acd74cf199c0a032d613285d67b2bc833a9fd48ef1bcfa08da5b36a6813	RbNjIYLhGLbnjcTkrItvlSBh_Je7dkkOKRf86F8PF7w	2026-02-14 18:29:26.060720+00:00	\N	2026-02-07 18:29:26.060076+00:00
b0bfd960-8834-47ea-86c3-af84efa847b8	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	63089df3db901d7db5bff7e478e2a37dacbded17e01b9e8a79048727fa462146	HqPTR3DKbnMoMnAqbA38ViD8-fe2QhkrejtwTX1rU8o	2026-02-14 18:29:40.345612+00:00	\N	2026-02-07 18:29:40.345425+00:00
986ef11e-3760-4279-b743-938e8e8dfbb2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7cc6330ff87e623dd1968be8909419e7dc27ccee17e99f374339325e59b0506e	KQMlZDEhcDfMuo-l19mniI59BKv0AdgnCuOQ0rTxnR0	2026-02-14 18:29:51.616593+00:00	\N	2026-02-07 18:29:51.616154+00:00
adad060e-2ede-4003-a372-13aeb7b578d2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7ca3d0d7f42231465825d39cccb44d00ccaf78e42c8afa98e3f03255cd86e540	O96g5nvoH59055D9Ona5ybX0lDS-i53aXtQpNZF2PTg	2026-02-14 18:30:03.263731+00:00	\N	2026-02-07 18:30:03.262987+00:00
3f464abe-3f65-4822-b37f-dae56392ba3f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	de42e19d2e19bc77e389f1859618b33566f408c2e862fa00e8c8adec7b8a5960	4rDW1VmA3ZqzM-6LnjHkzbO8uHxseJ4EshZM0jj5u7Q	2026-02-14 18:30:18.464688+00:00	\N	2026-02-07 18:30:18.463930+00:00
6dbdab35-e437-40b6-830f-2e60403f396f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	9e310faf5ba636154047e60160990a2a506e4683d3bb60d9d99f598c6a6f492d	njeOS1R6-qOpHAFV1Gew-CDxPx3gskISlYKJJysSxTY	2026-02-14 19:06:40.559925+00:00	\N	2026-02-07 19:06:40.559764+00:00
ecf28a21-99d5-46b4-b47e-cbee8d3c5d49	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	92374f0e74b68455695eaaaca0c1bc837cfcb9c23b0fc3fa6c6758ef0502381a	IBvkmERMT_0ETgKA74BtDf_rD4H6V3fJptW-lOfsZuY	2026-02-14 19:07:31.760505+00:00	\N	2026-02-07 19:07:31.759820+00:00
8bacbddd-e111-4410-88f8-c72185f74fff	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	22df02f101ce86bc50c53124c4b35259d93e055a6f023e2708d76bc34966e140	jPxgIR1yL7Svvju0WByQ72GNnKI0SunRNIMdzJj_V3w	2026-02-14 19:07:43.369417+00:00	\N	2026-02-07 19:07:43.368760+00:00
5dbe50c1-750c-4876-a9f8-4b0d009ac935	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d844d29de5c35214974ce34062de625614cf7ea08e0c54a11b1cd4bf3f36f22e	T5J9CGJ68UutVS44QgeavED8XhjRijtUGMhulwfL6QQ	2026-02-14 19:07:54.481368+00:00	\N	2026-02-07 19:07:54.481377+00:00
a95e1e0c-a5a7-43c7-bfcd-437739a77e4f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	20b3a46cc89358e6dabfb422bfea342c30a1c058fcf07a4e7c3833162e0cee6e	_bhjxSRaVblKMcApzcF2wAtLMqXjg2VKjeenK-M4LR0	2026-02-14 19:08:05.537170+00:00	\N	2026-02-07 19:08:05.536531+00:00
38cea6cb-252a-4e14-ba5a-458d95672c27	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4cb005f327f15d64fb55db9045daa9f87eb3a50b26df450ba45dd54075e1b351	muY0fx4PZoV-FyhGVM7K_6H7RvX-Lt4Z-HM3SyuZBM0	2026-02-14 19:08:19.484845+00:00	\N	2026-02-07 19:08:19.483876+00:00
f1d351eb-b7f1-4cf4-a7e9-9d8f126e1f05	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	cdd81d4a51998d09d3b92de53bfac12bb55efaffc274ccf8a444582a20b17cc0	JAZtg934Apph1d_o9qnB1VAn7W0u0xGhJy9O-Xs_A30	2026-02-14 19:08:30.850850+00:00	\N	2026-02-07 19:08:30.850043+00:00
ef8fb13b-eabb-45d9-8315-375043ac221c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	422eb65c97ccf1da5d1d540decdfb359834169178d2f3d181663ccbe3000000f	qN7gUhZC9OtJi_If_QQh4VPlJe0L4YijcV5H33AJs4U	2026-02-14 19:26:38.131733+00:00	\N	2026-02-07 19:26:38.131961+00:00
e7141f8f-b08e-47e8-8800-2844442830c1	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b069f6d10c204dd04810873816d98cbbe8e4b5dc172010b0bd69ed845e0076ea	_U0bZZvOU7FfLfB_eCZSCdfMfUkU_jyK0gwcdz-XX3I	2026-02-14 19:26:49.609410+00:00	\N	2026-02-07 19:26:49.608869+00:00
ef38ebfd-ab2a-4746-9735-29dbfff9554a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	41fa7ff40571d66607d68a50ed30d4c55a0029bc94b9c00971d3557bb847bf82	89yXQq_jE7IyUKE1QaKw3D8wc5HE9DehKTRUF4e87OA	2026-02-14 19:27:00.867335+00:00	\N	2026-02-07 19:27:00.866414+00:00
e60c0be7-f36a-407a-a54d-e4f670ebc8c5	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a5da57e3daa73803656dab97aebe02d8fac7cac63a219763d6708a0142cd7ec1	yoj4Rc4g_x_w4br8jJDzD8AQtsfb_jyuksxz8DosqEI	2026-02-14 19:27:12.650943+00:00	\N	2026-02-07 19:27:12.649881+00:00
25078b92-1c86-44cc-bc8e-ca4585c5ea1c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	dbd4755f2a0d610d298f11ca199e6caad4918ac15ad93b3c6dcf0027710ea2e2	-1kolshXfuC7-cKrr4Ov7KA6NwcKXPiJ-CaoaM8ysGI	2026-02-14 19:50:28.100588+00:00	\N	2026-02-07 19:50:28.100227+00:00
69dd840d-6b24-4422-bbae-2efda34edeb6	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	65ad4f39eabe76d9dfdfd8364f2be6c666a2667f15fb140456f1edc4766fdea8	hl3il0_nY3uCFf3-0_YLICgwlPaIBHcYbww6fmB9Rl8	2026-02-14 19:50:39.475454+00:00	\N	2026-02-07 19:50:39.475058+00:00
0824f168-fec0-43d8-8ea2-a109d856f629	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	76d2c01c33c671da2060e1cee35007a5a19a366839ab5b0260c1d083fc368380	oJc-haMb-77q6v2x8qwl2MGPe2q-wcRLR8rIlB6B92I	2026-02-14 19:50:50.676829+00:00	\N	2026-02-07 19:50:50.676289+00:00
26ff2a5f-eb86-4075-9101-01201c83b4d5	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a00ade164b17e953197ebbf9fba0e8d873ebd1501e8e385a9fc2e14f31e24c57	JWMYbtUZY0AZgUcRbegChj5EddHU-Oxsw6D9biRKqsU	2026-02-14 19:51:01.668716+00:00	\N	2026-02-07 19:51:01.668356+00:00
7d799fee-864d-4b57-ae05-d25c03f1449a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	29b803a6031fdf3234bacbf251b5a8745380d30699d835ad0b879119b1467f81	FP3Bb66nGAtG-zUZ9ML50DHZyMXr7YO7i7gd9O2MnAc	2026-02-15 09:15:55.859046+00:00	\N	2026-02-08 09:15:55.858920+00:00
fd4d316d-d6c8-4fb1-bd88-b9843d83c2a8	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	3f519385a027c7de24927e6dd7b94438c34e2e9fc03cdc1ffc18c06b2f93eb11	Ew7Tu3ybvNo06WF8Su8MxybjAgvYC7hZAOMkoP1GK74	2026-02-15 09:16:06.849740+00:00	\N	2026-02-08 09:16:06.849144+00:00
6d945f07-8159-46a4-a25c-fc729ceaeb4e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4513ba5f6ec8505494887448fe3bb4699de91d2ec6b7e8f72e5768b032449d0a	hg_M7BoRXFK1CkGsHPew4WQdPo6JhtyF_ducxd6KW1c	2026-02-15 09:16:18.269263+00:00	\N	2026-02-08 09:16:18.268912+00:00
107034d8-a996-4eba-aba9-869cc1f0c8f7	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e72760a2e06b543487e56f820b91b0fd7ed747d821905d940dcaaceacb5b013e	vvmpRbPEhM05nn4zwbQrvwSwbW0_nIpOHJJk6XksA_s	2026-02-15 09:16:29.836364+00:00	\N	2026-02-08 09:16:29.836119+00:00
750adc3e-8edb-4cc0-a568-007d4a9ea327	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	5374945e1f55da6d6f38159d8bbac4fc84c6cac2226f7ffa9bafb66a51cc4c5e	0Zd5J8r9SnSi8qnm66V6ZuNOjoIbd9f2oIzl6xpeRqE	2026-02-15 09:19:49.767670+00:00	\N	2026-02-08 09:19:49.767884+00:00
46feaed5-b01c-44e0-84f0-5c46e03df290	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	63f3fb72e55fa218b5f0a745ae05c119ec1107adbe6356dde652306f475f1fa2	43ZAlB9hA9i4CJ4wZYSwLdtWC8zpsCFNSd67cRf5YwY	2026-02-15 09:20:00.770513+00:00	\N	2026-02-08 09:20:00.770090+00:00
fa3efd0c-992b-42f0-80f1-5a4392cc4920	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	f01fbcdcd40b39e11ab57142dfbf4cfd1b078d3034774b560c70bf3521bdbafd	zASQLKEVn6dk57O1d1UPhChhqdL0mrCDC--wsjC9TQQ	2026-02-15 09:20:11.880404+00:00	\N	2026-02-08 09:20:11.880175+00:00
9cad0f9e-9906-4dbd-9c95-cac1f31e4a8a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	519a1bb94fadad2cd5ce687555b758c48d36b97fa3d31280839cb4cb8d5f0e49	i_JPs6hbJOgg7tmuIhcltAM23LKmydUI_M907rhraos	2026-02-15 09:20:22.944396+00:00	\N	2026-02-08 09:20:22.944732+00:00
1713bd03-2dac-4aa3-819f-5bbe7a680fe2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	16fa406397e863a45de022a470adfcb9b5c1b0cfc30fdf012400f643e7394ef4	JyfeIpPWDsmmQ2dcrO2yGpjlVSlSxrQUSS-RxsYGPIU	2026-02-15 21:55:59.025973+00:00	\N	2026-02-08 21:55:59.024622+00:00
1fc8e9ac-3a33-4a1b-a0aa-7c568aff7d91	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c22df4f6f5efd096360eab398365955f26928fef152ce240eedd59314fcf7185	1uzSiMajej9Q67NnwTNvrQq56h36fosWzZQJm2694Qw	2026-02-15 21:56:10.217723+00:00	\N	2026-02-08 21:56:10.215891+00:00
d281bf84-1e86-4541-81fb-e3447b4e4286	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4ee33bd2ef792873182dd20088af7ce53a0b5247b1781c03d9c882c8c121fb04	_A08JIwaenx22UgZib0vi4yEfqDfhb2XKKeSSrUdsDs	2026-02-15 21:56:21.579655+00:00	\N	2026-02-08 21:56:21.579169+00:00
a5737f91-8fe4-4151-a5ac-7dd71cf84f39	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	2bc33ff05d1fefff528d07676cb797d3c656fae03b4a36c15fceca76a6a95521	RdzcCgem9hQeqA13RMEbPOLmBbTTofJglhSyD2VDLnw	2026-02-15 21:56:32.691705+00:00	\N	2026-02-08 21:56:32.691132+00:00
650f8593-73cc-4c29-8d80-843cdef5f505	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e35100a54395cb75d4d65a540456281b8793159680ebc5b38a0792de9091403f	TLPAat5ZOWp5mv6pWhidpUuJHomvMAkzVk3EhWyrXn0	2026-02-15 21:56:49.787523+00:00	\N	2026-02-08 21:56:49.787425+00:00
7af92eb8-6d77-473d-99ab-bdd3c311947e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	506d34cd8acb27fdc6fd48d0ec6c745c8f95f39e5f95d072a98fb9c784608298	nPsfZVhYWwskaVP3QWTJ99NyOYCTtikWNRXow1Cc-DU	2026-02-15 21:58:57.720634+00:00	\N	2026-02-08 21:58:57.720737+00:00
a3d09340-747c-4d68-a048-04dc5e21010e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	6eff4a30879341c9fb93d55eae8376cdabc91015cd0148e1ed226dbe2cc10a63	JyJV028g9IoYa42uUqHYXh8gjywpIDZL6NHd7Hxi5p4	2026-02-15 21:59:00.769702+00:00	\N	2026-02-08 21:59:00.768957+00:00
2d2b5dbd-d04b-4e7c-a7d1-041535f9ec52	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	df4a9c29790f1172f01097e8008d125e33675d2191f88bcdf48d0353b85b9a36	4MSG3vVDly4uo1f6HrScOTQxVIWpUgr8mZEaihWCav4	2026-02-15 21:59:12.155536+00:00	\N	2026-02-08 21:59:12.155017+00:00
297bf59a-b7e7-48ab-8f47-6c7ba1fd685d	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	ed3de385522cf2b6a4e3214b070bcd5b0c5f0e9755d5ac3fd61e05bcea787373	sByIDcPfN1ejDSccqEq0dVrGlvTbML5LEzMAHgh8dzo	2026-02-15 21:59:23.412002+00:00	\N	2026-02-08 21:59:23.411561+00:00
45acd358-7141-4896-b92f-289c9ff7b884	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0134974f6b1d7fa81c7a402e5cd77ec12d569d59a44d2b26c69472eeb594b4f4	b5YBdXSbInWUm-W4wOSOlumxSBpiEXYwcslZbDjHW7U	2026-02-15 21:59:34.471858+00:00	\N	2026-02-08 21:59:34.471171+00:00
e9f43943-813e-4893-9fc7-308402467d06	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	844f4205d1e2e99dd4f5b5503c117ea466ec14bd4f02a5f4132b85be86237c38	nN0YP4-KNFj0t6GoS2RTJ8P8iI3-FlVpGw0ivt0ZNxU	2026-02-15 22:00:06.387951+00:00	\N	2026-02-08 22:00:06.387316+00:00
41bd919b-2c86-4828-85a2-137da7093746	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	22b69d18af1076fcee213d86a8695892a2b276ea841a6226d8415e938aed49d4	hijH5CturIqO2wfvnt-z4i1ENQStF5o3aTUdB-o-xu8	2026-02-15 22:03:40.625195+00:00	\N	2026-02-08 22:03:40.625627+00:00
9b61ab82-ad75-41e8-95a0-f6eec331cf93	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	60a5f6df9d93b5b7e153e9fad760108e26ea60b57ef6ea264c16030530b34f87	DFlwQdml0ZpD2w0iBq4xxUz2VORV0m-qiEPky0-WQe4	2026-02-15 22:03:44.375110+00:00	\N	2026-02-08 22:03:44.375000+00:00
90083d53-579c-408a-9509-7d554798d629	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7821c08a6295e8be37cb4866d4136dcfa438f49f3082a703bfee07195e7825ea	BX0mx-bS7PfP3D_F-Au2Bd4h0A50EqhJ19kafsHLZKw	2026-02-15 22:03:56.373281+00:00	\N	2026-02-08 22:03:56.373480+00:00
41bd1d03-2a14-4b4a-9d7d-04d4151014a3	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	dd08ce1f717f506df4f0f7d9f8f6a27789a04ad4fc329ff0dabed813e7888dee	lFhqhxR3rQFPFloVO7LI9HMi8YgtitQN5aVL_DgHChM	2026-02-15 22:04:08.466321+00:00	\N	2026-02-08 22:04:08.466678+00:00
77a0762a-63e5-49ef-9ac4-41f194e04019	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	53979c91a484e0af13df4370a9b283d49b46b101764fe366ad25091c57db2e7c	qYokzigNLhtjzaz4lB4oj43Uy2tLZJy2V_xeKvMG3P0	2026-02-15 22:04:20.686691+00:00	\N	2026-02-08 22:04:20.686430+00:00
72c7e762-881c-4cc4-86b1-72ce6abd0383	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	73a4084e642e7844b0f91f71a5b92f98282bdb30da4ec23d0e2ebd5b93dd0534	2t7ECoVDPLYJOf4kj0RubIYwm1r0_GHG68jP8I7BujE	2026-02-15 22:15:17.447207+00:00	\N	2026-02-08 22:15:17.447456+00:00
48d9b390-9806-4144-aa0c-dfe7b0e1afb6	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	892d86ed539ee5d2b907a9990c2579dba4a88abfdb0bef6521ead6c778906f18	KKCHpzFxBUMGMQ1t3ukad-_JlamTPFWwF1mx_w8-8Uk	2026-02-15 22:15:31.011924+00:00	\N	2026-02-08 22:15:31.011482+00:00
e3a0c813-7a76-4df0-a281-79c74d2c0668	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	97766c68016a3d882ae2d7043fb52a6e54c5225cb8a0cd6df6c8fc48f2b1eb90	OpfXi9v08D4DaqUeuuwD0rwXxxBEbXyaJdjOfDpAQZs	2026-02-15 22:15:41.982399+00:00	\N	2026-02-08 22:15:41.982139+00:00
78b16168-6b11-46d0-a12f-42350d8c0620	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	55d4b57be78449e9798a860f0b761ae2ae717dc337dbb440008d917fb94dfb58	WO5kS--EeHomQiCYAJYfIH6Uo94UyZeJP2fCcttiaQE	2026-02-15 22:15:53.112752+00:00	\N	2026-02-08 22:15:53.112526+00:00
50dde257-3db6-41dd-9c4e-7258ecd5fd08	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c4b619beafb9871d817b7822a50c61ce9eacb0b8c0170c3d72c184a631f59ecb	WOVosLNbehD7U_EBaFd5D_h87cOpog-_1S6bfasHAwk	2026-02-15 22:16:04.252079+00:00	\N	2026-02-08 22:16:04.251709+00:00
ea2a864a-6ad2-4720-806d-7128eb36a5a4	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b729c12fd4c3809a7f9adb3e6bc0f14286f9e7466c8daf02ada7efd48cdd84dc	kb9OW7hfU9c-i2yiWv8X9ZG56JALjN6_9SEpgAFJ4kU	2026-02-15 22:16:18.407307+00:00	\N	2026-02-08 22:16:18.406802+00:00
920d670c-52dc-44dd-bf0a-13cb0de600df	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7e3a3324dd3b1963c4cea9f9dc44ea53cecae8448afe1e03c22b5fbf51883e05	KkNjyq_0a186oOLiCevzDX1dzYD3Y4g93jjncwAlm9s	2026-02-15 22:16:29.480096+00:00	\N	2026-02-08 22:16:29.479614+00:00
c801376b-4e4b-4437-85f9-28c28fed1435	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b44b5f724e94788cd05f88a372f0d54d724ac4c966597076ecdf555771c39bc3	MQoksEnZnMmC5a23tKWgZAVdkHcUApIMm-HVPmCnImM	2026-02-15 22:16:40.639450+00:00	\N	2026-02-08 22:16:40.639115+00:00
cbb0685a-5ab7-4a44-9b94-7bbb46235acb	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	8ec96e141cf885e036bd604d8860a38ebf169a3318a1211748221975f0337261	MTDqNLkhrMR7T1JbloflK3SVfaz2xxMCGmD5GxhFC2g	2026-02-15 22:16:55.976287+00:00	\N	2026-02-08 22:16:55.976264+00:00
f750c59f-d892-4626-b481-ff145e334561	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	258f1cb11b940bc6ca44a55b056c055078e6c7356ac074b95a2fe7cd71826ca5	hoFZbSeCUIjAs2EnTblexBCkrH6f9YYyg0sdIGCgG7w	2026-02-15 22:21:03.751022+00:00	\N	2026-02-08 22:21:03.750839+00:00
440627cb-8117-4d04-9da5-bb666fd5c633	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	fa2111e684bf36ab07b6df8a5aba9d338fcc8064111601d82e259905f0dc88f1	t9D9VT5j1kfAm93LMFAl5sBXIbRj3ER6E-5_HPlSc2o	2026-02-15 22:21:15.006963+00:00	\N	2026-02-08 22:21:15.006669+00:00
10f1b933-cd3a-483e-b315-8cca0389b265	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	6f4a22ff5cf301ee72524820159da09df9b949271d9b414a321726254b604ef3	5vklv7EgAU6aStve1VDNFZPBJE-IILvmPt_dL2t9BD0	2026-02-15 22:21:26.084881+00:00	\N	2026-02-08 22:21:26.084672+00:00
4c63f9c7-7ee9-4137-8441-5678e4137a9e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	19865865f70fb1f056b8b39ba1b5c3c265fcf412c49c8bdf77f93cb7064b7270	R4h7uclPaZAabw6uyB2VXvpjNCpmwC1woE1BxSzjFlY	2026-02-15 22:21:37.241057+00:00	\N	2026-02-08 22:21:37.240769+00:00
b1da3ee9-d019-41dd-b812-e4c958c932a0	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	97a8072410efa916cbffff811a77042a16bdf9c54c786523a91e0c0f0fe1da62	QDNipq8i5tbfDoVm0wG2xhErcy9JTvZleIybLqiZbz4	2026-02-15 22:22:02.282155+00:00	\N	2026-02-08 22:22:02.282048+00:00
38e2486c-b86d-4abf-bea9-15265bb32d2f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	6d06786de96a888b31b8c3a263c7b7d2dcb765f506e40a0f7ade9d90672c2057	rD-JWhe1W8vT9qTAbbyhcE5H8sf2yuTU89FD8dxwX_0	2026-02-15 22:21:51.224622+00:00	\N	2026-02-08 22:21:51.224538+00:00
17ae4e48-7291-4933-abc8-797b7821a8c1	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	39f363ae2f0c6323ce33fbd30ab26b6adae66ab3d77011665bbfa2a6eef34ef8	Ld1s__r5YpdllljsiuFLT86OhKFYq0uhAmZk0ILl5LA	2026-02-15 22:22:13.347108+00:00	\N	2026-02-08 22:22:13.346766+00:00
49c159d1-24d3-4358-9803-698161d876ad	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d8293f7c1b4bad3436a703e56d9f626d251ee8ffa9b02cfc22c7f1fdaef32228	nOGIoAjkSuFOCvoP8vMbUdUB64tfEyB5RqDi4P2wU28	2026-02-16 08:31:33.806435+00:00	\N	2026-02-09 08:31:33.807006+00:00
adbd72c3-3dbc-4581-9570-656046e0d3ff	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a26d08f79ea87e2e9aa24ac4c921ac9a317472e9f47e35f4e79fa5eab5f15265	miECvFpMQ5f-YPhE8PXFprnau2WH7GHGcrGN6W2FjbE	2026-02-16 08:33:19.291901+00:00	\N	2026-02-09 08:33:19.292195+00:00
38315375-3762-458c-911a-ac52cd6bb204	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	dcb7f34a949ced23208e28636262fea228271b790044b3b866a06be19be3501b	rucc8XaEGekwKQtfX04yBJKpYzEoNif3cUpP3Xm0ef0	2026-02-16 08:46:08.442173+00:00	\N	2026-02-09 08:46:08.442381+00:00
712ba829-6edd-410a-8fe6-23e526801bd4	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0fa1c31502df5cc02d5f6d4f8669393ad9e14046b8fa0bb87d2c567c77e5b01c	2tWC9m7AhTPa0MqzKTZLrKgkGp4MpFhCSUvr-MuxGJE	2026-02-16 08:46:23.565821+00:00	\N	2026-02-09 08:46:23.566233+00:00
23038795-0266-4c0c-9027-93a3cf27441a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1551f6649cd45d6d16116c4ee70783529e4b78dfbccba4c6340e65fe6237230c	QeVYsDLMR7JsZo0WAZlRsH1zzMrpMgg924G9Fa3NM0Q	2026-02-16 08:46:40.844821+00:00	\N	2026-02-09 08:46:40.844807+00:00
4097dbe0-b436-492b-b44c-7836269db151	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	95d8443d65039181506358a39ff10ee35cc105d5394deb36e74cc51d44c0cc53	npTeCQUcaLkua_oFSoh97NkD2sK-TfwUf5iX56AN1qA	2026-02-16 08:46:54.355092+00:00	\N	2026-02-09 08:46:54.355162+00:00
bda54250-7f08-4a9a-8239-c2496a76731f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d7594a7b95d1a6ffc3d5a4c20ff185a19fa74ca200e97773a07352d08383799e	L2a1Qt2MpecHlDNCdLMYpinVOFRuWKJqQHFpUnxVQxU	2026-02-16 08:52:05.251966+00:00	\N	2026-02-09 08:52:05.247636+00:00
a17cb989-7366-4913-b90c-f6ab0a7e848d	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	175d45a11d6efeb5188b81387ba499a02e33cb7bfab96f7b5182bdc3f064b6ee	mka3r8KwJvdggXDeafRCAIbyeA8F01GIA_j-WJHIoAw	2026-02-16 09:01:42.601581+00:00	\N	2026-02-09 09:01:42.601749+00:00
63e20e85-e5d5-4e00-a36c-863379e1c286	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	f82e938688b6ecf56fdd443ba7b0161cd55de085605e07aa457a7615b68cd8c8	cJJRYpuYXPnEE5JFFxDesighJH8Z0sMVI_lk1CVPw-g	2026-02-16 09:01:43.486718+00:00	\N	2026-02-09 09:01:43.486236+00:00
2ce502c2-b792-49a5-8ee4-c191b8f051f1	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c7b94eafae16faeefb64fed2b36f1c256658cb5aa55e846a38a9e04700dec51b	dpiEyXGtRp1dlaiTLJlh036SjqO1cA1AqKmGPHLU3gw	2026-02-16 09:18:03.520163+00:00	\N	2026-02-09 09:18:03.520017+00:00
287ffd49-ec3e-4320-a7e3-46da12de952a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	30ff0c4bb307e5938af44e26f9896a7a1b04e73c6e35f3c0330ac16ef5ba3788	KMRK_UHDJV9Q7xoh2jDbbC9yOmtlSPA_-ak9zwz2UKI	2026-02-16 09:18:17.774379+00:00	\N	2026-02-09 09:18:17.774127+00:00
750cac14-8313-4855-ab11-27e7654c93ed	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	091e95399b4ba5033d902b895a61ea3b9693df945a69f1d5ecf6b32e99fd11c0	fL0JBQZHx2NOBie69PJx2jyPoO5pKvWX92KG8fFffbE	2026-02-16 09:20:23.228660+00:00	\N	2026-02-09 09:20:23.228454+00:00
000fc212-66e9-4421-81a1-7edf49966924	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	143304a67eb6f58a2c531cc392e2c8a2d6f82ac6e21474a0d5720e89b6e871aa	XmS5t-f-fufR2KJXtQb8lRa55tA6qb-A6VgZBallKi0	2026-02-16 09:33:01.305042+00:00	\N	2026-02-09 09:33:01.306289+00:00
87c6c500-6fc9-4e9f-b64b-c52602123ba5	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	fd00a727b8a59377636f88eca624c5b8c13b2099497cc1febf4826a6aae3f40c	BpwBnzXO5rFXsadATtUY2hPpGI5fSzv2HP5jKCea7qo	2026-02-16 09:33:12.816256+00:00	\N	2026-02-09 09:33:12.815533+00:00
41700f0a-26e7-4e4f-a391-1ee0e168a0da	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	49075a82290167d0eeaf622aff14e0cd6b81ac0136aeef62d8b1d0419d15f1ae	9JqFYCueBgXszmJwg4ePh-ia1_s-94vQRHe85FGLRCQ	2026-02-16 09:33:24.102730+00:00	\N	2026-02-09 09:33:24.102043+00:00
9c04058e-226a-457d-83ef-35adc8eaa61d	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a3bc2e977d10f01e11a598ceb4f3e9304d8a96142826a792176725b4b7330bf1	f8gtP85-vqCYjp1iKMbWzU-OEkCVbLOrpBbEiUfbeHE	2026-02-16 09:33:35.421813+00:00	\N	2026-02-09 09:33:35.421225+00:00
685475cb-a729-4cc9-8bc1-133e3e19b09b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	ff7b741b74b825af54e6a09aa629682cd4959fff4c49534a451305b2c95f4b0d	brjxUJVzUa-Bbcso5GgbC7S6UDFfB-yQBIIycR8LaV8	2026-02-16 09:33:46.759266+00:00	\N	2026-02-09 09:33:46.758784+00:00
31b413e4-ed7e-44c3-812c-c7b5a17d8af7	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	784b69cefefbb48a21eada91bdada0ba8b6a5843b1ed30fc2088af4fd288e519	NAxCPcXh5QtHsxGPlG5wVE7PENajiCwD4CzY10a_l7o	2026-02-16 09:34:01.035823+00:00	\N	2026-02-09 09:34:01.035464+00:00
324297a4-4366-4794-ac64-0f1fc3fdbd4e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	aa8cee63b5320c2ee509943528f736b6baa7a225e9cee99493e68932e8f3c082	9eXWwswcjiiE-q0MLgJl4pEIr_osFeTOuEGt6splw9w	2026-02-16 09:34:12.171577+00:00	\N	2026-02-09 09:34:12.171169+00:00
edef2391-4686-4c29-873c-60e5fc65b53a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	a76231d6f71b72880f919effd485d6419384f910f49a48859fb7795b069583d6	-hmQsSWI7GwudbFaPLt515yXc7fuVheQBED2SMA_uLw	2026-02-16 09:34:23.398910+00:00	\N	2026-02-09 09:34:23.398588+00:00
3d97a70e-127b-4db7-b909-3799368cf7cd	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c8dc011e60e338ab08d3fe5cfec9a8f18c2585952d860baea83adcfb09d3a766	MFn_nPYYUQ40pfck_FrkJBTjL0vB3MBZy3OvgCRx178	2026-02-16 09:34:38.835780+00:00	\N	2026-02-09 09:34:38.835401+00:00
e406dc64-3991-4000-972d-8e011f6d830e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	424bde58c04a6c4cdb31d07d3089bcea2dc004c18541de77b19ec6ba5af3476e	ra9lZQbSmjXXv-QMuqzrwBz7Bby1nK49PxDKFBTnEcI	2026-02-16 16:35:26.343344+00:00	\N	2026-02-09 16:35:26.343764+00:00
d90a721f-8f35-4882-97c9-5abb7a33bb10	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0efff616ae6939c3382fada810bf9e720b292b25893815b0395cd518ebda0206	7JtE2sYv-ssu6rsBOg9lY2bEkzariomQ4mlN8dbfCHI	2026-02-16 16:35:29.579085+00:00	\N	2026-02-09 16:35:29.578520+00:00
2c91e7e6-5cfe-4964-9e10-9e35f548ffd7	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1aa377b9856142781f1e96832909335d46f47c7a3394b1814f98db87b3e6c714	iNKqllKznQF0dZc306QrX7JqCLjNUvGUD1X3EPc6eW4	2026-02-16 16:35:43.914452+00:00	\N	2026-02-09 16:35:43.914870+00:00
c7d3c36d-512a-4d50-ac9c-4ecc3cbd9b77	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e4d261356b4034e0d2a22d3a2078805cc64ea00a5741c9274ad0040c7230131e	L9fpGNfGPgxJGvwJRU70sXhOWoT9Uk5yYcFKtS5tj0Y	2026-02-16 16:35:54.723817+00:00	\N	2026-02-09 16:35:54.722507+00:00
efb4f56b-e012-41bc-830a-9e8ad8d025ab	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	ce07a6cdf35a03b59c086af88a71c11c2dad6f39a9410398769668fbbf828c1a	DY21eh7wbXLYl6MDZhl8QNFSlW49NWC8SFn6kSgFTfw	2026-02-16 16:36:06.030966+00:00	\N	2026-02-09 16:36:06.029518+00:00
87e90abc-3f70-4737-b124-8f78442aa3d1	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e144b6943bba2e4450a5544ccadf87ca7a46e67a59645e5f6bed2b2874fcf9e5	RGwhVCceWJ8Y5hh6yV7pHy9i4csnFvu-Gs5fzsRNalY	2026-02-16 16:36:17.627672+00:00	\N	2026-02-09 16:36:17.627335+00:00
33a5c37d-c90e-4ce0-8ae1-39b2ad1f6a80	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7761b500965cf8ce3831b30e5c253114287d94eb71bee803a7c4bae95f1497cb	BOYaGraNxb8a2slIoIfEBItQaT9CEHCPO_7YJR49uC4	2026-02-16 16:36:32.562663+00:00	\N	2026-02-09 16:36:32.564801+00:00
27b93c98-c8e7-4ac8-81c4-fad2c0d7e2de	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	f447f09563e77939236a62bd48192a17ab0e73b959d609acbeec019e6d2d6ccf	awvfWeJ0U9-8aw3CRTMdH4FHyOY_bxx_r96UxRxA84o	2026-02-16 16:36:43.775648+00:00	\N	2026-02-09 16:36:43.775319+00:00
ff732738-dad9-4a9b-b9e4-09a97a4177ff	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	458586bb0d108449cbed47ffaeac6a64ac75255dcbb96029f3e3708a5d5da2ed	VoE3CXTfRzE_Qf0aZytt3DibhGpe7G8r9Q02KFyUE_Q	2026-02-16 16:36:55.273319+00:00	\N	2026-02-09 16:36:55.272408+00:00
2cf40836-dcfb-4017-8741-885b8b84fe65	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e59caa1a4c7a0aa76357216b240cbf7a50fab2422ecd9fa8140f4118814fec0d	2v7uvLn-m6pbzaOLG5wIuW21fFBApJhz8rpHeoCVpio	2026-02-16 16:37:10.331118+00:00	\N	2026-02-09 16:37:10.335224+00:00
7d5705b0-57dc-4f06-9645-6973b872070f	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	9dfc512ac2916adcffcfbebd4736c9c150a9cc2c59d5e6f292edd3d182dd61d6	gPPpriMKU9LdRYOoyjLa-ACQLn353FjxDAB5WnC3Ku4	2026-02-16 16:38:42.455061+00:00	\N	2026-02-09 16:38:42.455945+00:00
18c0cfe9-7e70-4158-b9ce-f2a0a5124710	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	9f740d43c138b553dafbb2a9a3b816f57f02c0dcf031c6c31b18bdf35e590759	548x7DDkmMuO-L6toER1g8p8C10yCPXVMJ60cBAsV5Y	2026-02-16 16:38:54.012083+00:00	\N	2026-02-09 16:38:54.011464+00:00
c901087f-182d-439c-92c2-0dff5e2f7fae	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	fe85d58437bde22858e69165690b9611ea5859be7b4ae3fd3477f59ab5733760	Zjjh88PJg8Ortz2PBiRgyTYWLZysa_SMK5fMHq5R6xg	2026-02-16 16:39:04.368662+00:00	\N	2026-02-09 16:39:04.367980+00:00
8c799cf4-86c5-4598-8323-c60390effd44	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	11ab6dd244c7b10d4a60a91b8e66b0ae8a285809c538fd986a5d9540191b3f15	GAWRBY07cPSerq3fJNM6VsU06NrCW7RiDFfsIfPM30c	2026-02-16 16:39:15.956769+00:00	\N	2026-02-09 16:39:15.955752+00:00
795c73e1-2072-4865-bceb-19b2572390ea	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	e2566f4727df41e29bb677557acc5619a98bf74c5322cb3c80d3d2f391bd860a	jqb81ziHs0dDNeNqS0mM6cvVfxOCPS7m6PI5j-aTDc0	2026-02-16 16:39:30.453708+00:00	\N	2026-02-09 16:39:30.453023+00:00
6c27bbc7-2257-4217-b2a2-0545433d1e32	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	f9eca0f94aff9f93b60f6367c8a1e5a94ae57ec8845e6f118cf860c4d286c7f7	2FhCvUY3o7hecaIsjBacCIMcAVeOYR8yxYu3wCJlgQ4	2026-02-16 16:39:42.066637+00:00	\N	2026-02-09 16:39:42.065875+00:00
b6e4df7f-5ede-482a-b147-fc931aa62ce1	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	44b182b947b8e635d2e4e3e099998e6c058aa023f45f57f653ef4bdf66ebd9cf	qCZkSAaWo_qQ-kfwvu6LHK84rLeEMRDoS2_V34tXqxM	2026-02-16 16:39:52.654521+00:00	\N	2026-02-09 16:39:52.654062+00:00
3a938ff7-618b-49bf-8a0d-561a95d01d53	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	120933e3b1bc93a29c11656ea1a5715c507ac5bc42832dcfb0854e02ff75e069	Aj4T9Bb7fzRQZxzeIOzBLdBf8CnEKnv1YJciuxTA-M4	2026-02-16 16:40:08.298312+00:00	\N	2026-02-09 16:40:08.297544+00:00
b8bb98e7-ff3a-49e8-969d-8de5549a3aea	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	c1957faee21f7f3cb69dd1c6a7a7cca4465c34bec65ccd93ac164a2777ce39fd	-PV4KHDIytLC40juRYb1TQ28dx8ivV3Y7es0f2zhY8w	2026-02-16 16:41:30.105189+00:00	\N	2026-02-09 16:41:30.130071+00:00
1d307766-5e0a-4404-891e-932c5a45ad8c	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4ae0c0c095988de577b6a2edd805d6b3fc52a9565a740f827166e6df7857471b	O3TaJWXkMGg_7iggINnagJZHU-nsS0U8PQg6apK9d5w	2026-02-16 16:41:41.962994+00:00	\N	2026-02-09 16:41:41.998700+00:00
9e9d8281-90b9-41cb-9fca-127ea19903b2	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	8a7965deaea6404e7fe6d838a2fe97abe3ca3d8db0caecd5c835d3b4e187378b	7yaJ6dmrc1Gu_AB4KPK4VFBtTQh1UnZ4ls_Rl5Vniqg	2026-02-16 16:41:52.625354+00:00	\N	2026-02-09 16:41:52.627690+00:00
bef17451-fd98-47f0-86a9-27ed4b023d3a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	dc66a532aeadc9f258b9d4b1bb6d8630ab95ff5b02d5ce9391697b8138d6e56a	yjcajmElLBL8RS4NG7Jn9XFmfQLNfouAfXrOh3uEC08	2026-02-16 16:42:55.484548+00:00	\N	2026-02-09 16:42:55.484159+00:00
8f2b86b4-e05f-424f-8876-d584919c496a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	d7db22bd2b878e4bd37eedd7c578ab7fd98a18fad52410c3dff16090e541cdfc	rWFxw38F5Dojv63Q-UOBCBb6u5Cjce84tTt45BANLsI	2026-02-16 19:33:09.559918+00:00	\N	2026-02-09 19:33:09.559478+00:00
8a566f5d-5bcd-4bb5-a775-8ceab51df871	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	b44b764e635550d3a2d783a7f9a1d38f9f84e123c6bc27e701c67114251c4347	UIQIE8dB_BqGyNCg0giI0uT2idt3e_AxgJZJ19s2Xew	2026-02-16 16:42:03.878768+00:00	\N	2026-02-09 16:42:03.884246+00:00
f396d137-c2e5-4849-8a4b-a87f7b12ce51	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1ffc999602da3b910567bbc48da43a0130bf98a9d76800c0e20e79d7018e8842	L5r2VheBh6HtC2j_QFC2inKA-MGOOqOCEUiS-0xZjp8	2026-02-16 16:42:28.789422+00:00	\N	2026-02-09 16:42:28.789816+00:00
0a8661f0-c053-423c-a25d-c0d782856d6a	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	54ad62726eb61d957df7aa5145041415c907faa7a0530b190063e3fb8feadb41	zlFxOrjFGfQ5RqqGejtkxPy58lNqcuyOTQ0XB57GCDg	2026-02-16 19:32:24.180133+00:00	\N	2026-02-09 19:32:24.180668+00:00
f42951ef-f198-4da0-96c4-b09dabbdb58b	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	074f95b3b772b97e28d4110fcf2ac7420f8f713b449ae09fb0c456930405fd9c	gIckJmBA5FbeATptbPfeiTAjJkOJWn57eClBMMTgJxs	2026-02-16 19:32:57.794927+00:00	\N	2026-02-09 19:32:57.794073+00:00
79ae7333-e7c8-47b8-8b88-e3774fd4c6fe	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1d47f7f26e92f60f92fd279c654125022b19e091a5d22db729133bdd0c704274	jw8DY5THbAIdpWKOZH_wgzXUig-tua2p28U739hYeVA	2026-02-16 19:33:21.216639+00:00	\N	2026-02-09 19:33:21.216508+00:00
44c8b601-fc18-45d1-8071-66490dc3afaa	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	6267a87088a1c620e7035ae05e9f3b52f668602c7d8a19681a8589144b01612e	QIww7zO9PxV2-UtQSXqus7vnVmoWekoyBW7L9BTDKUI	2026-02-16 16:42:18.336058+00:00	\N	2026-02-09 16:42:18.335842+00:00
74bb9d06-7391-496e-995d-e76a50edf9ad	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	bf27e38ae8ed53c84fda504cc88d3ca6ae3f80aa879ca51e25dc5aa6986db02b	4ZoDYVE4KqUfH0-ue14LppEoDDIixXbLlzoLC8QEWag	2026-02-16 16:42:40.144338+00:00	\N	2026-02-09 16:42:40.144868+00:00
b8cdbf70-6e8d-4d8f-b574-542395707a64	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	fc99b10ca6291cf3cb2b806e3afa99613603bd2b1d58dc8783a62827a2055f12	SJZZK7tBrmr3JFghILcjnGcJw5YRM2WrSKfdfsLJJ-Y	2026-02-16 19:32:36.649668+00:00	\N	2026-02-09 19:32:36.648368+00:00
e3073077-fca7-4c7c-8581-ca73fb097c6e	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7828937e5546e0687ed292de396a58e13fabf382804c636054982046bd0833d7	8uAqEQapmFqKZ-YC1rxjENt1fcLhF5xMQFH-ISN5lP4	2026-02-16 19:32:46.295465+00:00	\N	2026-02-09 19:32:46.294345+00:00
e0506857-2605-4150-893a-6601e508ccb0	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7f526052e5e71f1c04de3ca13076a27afceb76a83326550ade0fd2191b9360e4	M2mt2Pl1Dc55kNYIeTBRxUyosCTEbV460bpWW8sW2iQ	2026-02-16 19:33:35.817794+00:00	\N	2026-02-09 19:33:35.817767+00:00
a33ffd8b-f3f6-4a3c-88a8-dca2587d6977	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	cc6336273c152c6f2f7866451461aa456938a7c19d13f3b93f213dea6c6de497	JwFOLpZn3m7uCi8kJmkeOscY72LV1yag7-GN9ElnPeE	2026-02-16 19:33:47.235461+00:00	\N	2026-02-09 19:33:47.235335+00:00
caff5c94-586b-4c1e-a922-19fbea6186b7	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	ed46a369d98d8eedb44c4afb1bec5f44bce2514fbe3646f46fe4f070a30755bb	neEkHIbWRhFF00mAthWrAzm9avfYACznBYym_pnReak	2026-02-16 19:33:58.952726+00:00	\N	2026-02-09 19:33:58.952988+00:00
d0d04724-b69d-47f4-b530-d68925446238	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	0c221bb62f22911c7c8518d6f513b2e6f8ff81a0ec22ecfe2443193619a0f33e	eL-hAhFumRTGYYul0DxVam8I83CE5igyaJWqH_pmS-k	2026-02-16 19:34:14.769463+00:00	\N	2026-02-09 19:34:14.768888+00:00
c8c6797c-51ad-457f-9a42-1ab7a09d6abd	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	4af258950126dc744ddff83644be80578b5e6d9e84d4d17bd217e7e74396aee2	e3t-JYH2pJuEFqobO62mvWy4JUmG4d_gRFQXszAFbQk	2026-02-16 20:06:15.618486+00:00	\N	2026-02-09 20:06:15.597662+00:00
2350b0a9-81a9-43b5-883c-f308b0677780	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	141c668d391c1376625c58ab529a3e225c633331a5940b0b893fb0ede2638726	2YwYt5LF2_ue7AMlocZO6-aTVEhVX-AvL8PUUaFirpo	2026-02-16 20:06:22.379027+00:00	\N	2026-02-09 20:06:22.357209+00:00
7de4a640-50e5-4625-a8f9-5e119efc9ffa	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	287f4351fa154ab919863c9556c8499a4f395e96845dc40c45034b83d76c28d4	BVyziNJfkTMSnjnvoaJq37ls1RFWXQd4hkqYQptuA3I	2026-02-16 20:06:37.135729+00:00	\N	2026-02-09 20:06:37.135745+00:00
06b3c5ff-d650-436a-affc-96ddb97de2d6	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	1e487416658c493c63f2bfdc97e3a99c4b20d3f9da25bc3c29fd6cbfc6e64acd	abRPzQQU-UIskxWiOHvDPwVC4rIPFS3fedDBKQ3fuoo	2026-02-16 20:06:51.692593+00:00	\N	2026-02-09 20:06:51.692484+00:00
0b2e7201-dbc2-4ea8-a20e-56dbac3d1194	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	2c12eedea959ba0a613af6953919e7910764ef81547ceed282b1e61304e96ad9	GfUKA0Z0alTY6JZk1NM8sSLMcj0fTTbyiyo1etg9BPg	2026-02-16 20:07:06.025005+00:00	\N	2026-02-09 20:07:06.024978+00:00
001d04d1-c3cf-49ff-b394-6c149ef5c726	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7d8fb4eb80a72c4850b226e16487142855357493c68909ae9ca7380c829cfa16	3UFk2vz8awWX_72AehEIxVAjJ3j6PoSBssv7Mp7LptI	2026-02-16 20:07:21.087640+00:00	\N	2026-02-09 20:07:21.087681+00:00
33a0488e-c967-4b47-831e-0701892d5d39	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	7bbdc67991189547b3035157c4eae6609cc0e894ac4ce1c6cf083d884672abd6	BblnWm4CwBTal_YV2_ecLKtgzdPP3kJsQ1l0wKdrLDI	2026-02-16 20:07:32.956538+00:00	\N	2026-02-09 20:07:32.956688+00:00
5dec5dd2-c665-46e6-a502-1c9f26fa67ee	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	88f5188e8ffd5241fc08886341eb8fde8694e6a84017890e7023c7471de3757c	RxvofjzOeD3h4i7iXFzt-iOGNv6vtO41PJ2mmiL--7I	2026-02-16 20:07:44.427067+00:00	\N	2026-02-09 20:07:44.427197+00:00
95be9525-5bf1-47ab-8d71-fc09738c9a67	83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	810bc63be128c231c2cbc77318b5e48acaf5f97a04947322629ccb963b9737f5	yNLiPfq-RAgQsiZxSmApCDPrlfLedio2x_GK72AEIjU	2026-02-16 20:07:59.869669+00:00	\N	2026-02-09 20:07:59.869804+00:00
\.


-- Data for user_data.users
-- Rows: 4
COPY user_data.users (id, username, email, password_hash, phone_number, phone_verified, phone_verified_at, first_name, last_name, display_name, role, timezone, language, is_active, is_email_verified, email_verified_at, last_login_at, last_login_ip, failed_login_attempts, locked_until, created_at, updated_at, deleted_at, metadata) FROM stdin;
4d00332f-3b1c-43df-a2eb-7261b03cdd46	admin	admin@example.com	$2b$12$A8RJN2KD5vKXLwIsbnOpHeQpVX7Xvk0lMiYZikLZodpVD8pF9TWpS	\N	False	\N	\N	\N	\N	ADMIN	UTC	en	True	False	\N	2026-02-01 10:41:25.874895+00:00	\N	0	\N	2026-02-01 08:57:53.500053+00:00	2026-02-01 10:46:15.281584+00:00	2026-02-01 10:46:15.283743+00:00	{}
83f8ae69-6f7e-4eab-ac9f-fb2e4bc3ed29	TikTrackAdmin	nimrod@mezoo.co	$2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqcAP8an.qQtG	972547776770	False	\N	Nimrod	Mezoo	Test Update	SUPERADMIN	Asia/Jerusalem	he	True	True	2026-02-01 07:12:19.477839+00:00	2026-02-09 20:07:59.866541+00:00	\N	0	\N	2026-02-01 07:12:19.477839+00:00	2026-02-09 20:07:59.656316+00:00	\N	{}
783587a7-5a20-4ab5-85eb-857b57ab9511	nimrod_wald	waldnimrod@gmail.com	$2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqcAP8an.qQtG	\N	True	2026-02-01 10:46:14.997568+00:00	Nimrod	Wald	Nimrod Wald	ADMIN	UTC	en	True	True	2026-02-01 07:12:28.538741+00:00	2026-02-01 06:53:08.922881+00:00	\N	0	\N	2026-02-01 07:12:28.538741+00:00	2026-02-01 10:46:14.995504+00:00	\N	{}
a1ae2cec-e781-48f1-8d71-eb82571efaff	test_user	test_qa_1769933177@example.com	$2b$12$ZozrvQMmIgbOorYniUa7FeOHd81th9bbX6ZnM9ttRQg3pnmAnbW/6	+972501234567	False	\N	\N	\N	Test User	USER	UTC	en	True	False	\N	2026-02-01 18:43:13.935899+00:00	\N	0	\N	2026-02-01 08:06:17.982304+00:00	2026-02-01 18:43:13.681189+00:00	\N	{}
\.

