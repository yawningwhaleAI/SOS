-- S.O.S. Competitive Intelligence Pipeline — database schema
-- Implements section 8 of the build spec. SQLite dialect (pilot store).
-- Cleaning NEVER overwrites raw_data/ files; this DB is derived, re-buildable.
--
-- Design notes:
--   * Every NOT-on-listing field is stored NULL, never guessed (spec §2).
--   * Material is only set when the listing states it (spec §2, §9.5).
--   * evidence_log records where every extracted value came from (spec §8.6).

PRAGMA foreign_keys = ON;

-- ---------------------------------------------------------------------------
-- Run log (spec §4: logs/run_log.csv is the human-facing mirror of this).
-- One row per Apify run so cost, coverage and errors are auditable.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS runs (
    run_id          TEXT PRIMARY KEY,           -- e.g. blinkit_20260929_1100
    platform        TEXT NOT NULL,              -- blinkit/zepto/instamart/amazon/flipkart
    actor_name      TEXT,                       -- Apify actor id used
    started_at      TEXT,                       -- ISO8601 IST
    finished_at     TEXT,
    locations_json  TEXT,                       -- JSON array of locations covered
    queries_json    TEXT,                       -- JSON array of queries used
    rows_returned   INTEGER DEFAULT 0,
    cost_usd        REAL,                        -- Apify cost for this run
    status          TEXT DEFAULT 'started',      -- started/success/partial/failed
    error           TEXT,
    notes           TEXT
);

-- ---------------------------------------------------------------------------
-- 8.1 raw_observations — one row per listing seen, per run. Untouched text.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS raw_observations (
    obs_id              INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id              TEXT NOT NULL REFERENCES runs(run_id),
    platform            TEXT NOT NULL,
    actor_name          TEXT,
    scraped_at          TEXT NOT NULL,          -- timestamp (IST)
    city                TEXT,
    locality            TEXT,
    affluence_tier      TEXT,                   -- premium/upper_mid/mid/new_suburb
    store_id            TEXT,                   -- as returned (Blinkit dark store)
    pincode_resolved    TEXT,                   -- as resolved by actor
    query               TEXT,                   -- search keyword that surfaced it
    search_rank         INTEGER,                -- 1 = top
    is_sponsored        INTEGER,                -- bool 0/1, NULL if not exposed
    product_name_raw    TEXT,
    brand_raw           TEXT,
    pack_size_raw       TEXT,
    description_raw     TEXT,
    mrp_raw             TEXT,
    price_raw           TEXT,
    rating_raw          TEXT,
    review_count_raw    TEXT,
    badge_raw           TEXT,                   -- e.g. bestseller
    stock_status_raw    TEXT,
    seller_raw          TEXT,
    url                 TEXT,
    image_url           TEXT,
    raw_json_path       TEXT,                   -- pointer into raw_data/
    is_relevant         INTEGER,                -- bool 0/1 — non-paper filtered out
    is_substitute       INTEGER DEFAULT 0       -- reusable/non-woven kept flagged (§9.7)
);
CREATE INDEX IF NOT EXISTS idx_raw_obs_run       ON raw_observations(run_id);
CREATE INDEX IF NOT EXISTS idx_raw_obs_platform  ON raw_observations(platform);
CREATE INDEX IF NOT EXISTS idx_raw_obs_query     ON raw_observations(query);

-- ---------------------------------------------------------------------------
-- 8.3 canonical_skus — product intelligence. One row per real-world product.
-- (Defined before listings/price/market so their FKs resolve.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS canonical_skus (
    canonical_sku_id    TEXT PRIMARY KEY,        -- e.g. origami_kitchentowel_2ply_2x60
    brand               TEXT,
    parent_company      TEXT,
    product_line        TEXT,                    -- So Soft / Klassic / Luxuria
    category            TEXT,                    -- Facial/Pocket/Car/Kitchen towel/Toilet/Napkin/Wipes/Kitchen paper
    sub_category        TEXT,                    -- box/soft pack/roll/interfold/canister
    ply                 INTEGER,
    pulls_per_unit      INTEGER,
    sheets_per_unit     INTEGER,                 -- = pulls unless listing states otherwise
    units_per_pack      INTEGER,                 -- rolls/boxes/packs
    total_pulls         INTEGER,                 -- units * pulls
    sheet_length_cm     REAL,
    sheet_width_cm      REAL,
    gsm                 REAL,
    gsm_basis           TEXT,                    -- per_ply/total/unknown — never assumed
    material            TEXT,                    -- virgin/recycled/bamboo/bagasse/blend/not_stated
    fragrance           TEXT,                    -- yes/no/not_stated
    lotion_additives    TEXT,                    -- yes/no/not_stated
    claims              TEXT,                    -- JSON list: soft/strong/absorbent/food-safe/eco/...
    pack_format         TEXT,                    -- box/carton/polybag/tin/canister/carrier
    attr_confidence     TEXT,                    -- high/medium/low
    created_at          TEXT DEFAULT (datetime('now')),
    updated_at          TEXT
);

-- ---------------------------------------------------------------------------
-- 8.2 listings — one row per unique platform listing.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listings (
    listing_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    platform            TEXT NOT NULL,
    platform_product_id TEXT,
    url                 TEXT,
    first_seen          TEXT,
    last_seen           TEXT,
    canonical_sku_id    TEXT REFERENCES canonical_skus(canonical_sku_id),  -- nullable until matched
    match_method        TEXT,                    -- deterministic/fuzzy/llm/manual
    match_confidence    REAL,
    UNIQUE(platform, platform_product_id)
);
CREATE INDEX IF NOT EXISTS idx_listings_sku ON listings(canonical_sku_id);

-- ---------------------------------------------------------------------------
-- 8.4 price_observations — price intelligence (+ computed metrics).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS price_observations (
    price_obs_id            INTEGER PRIMARY KEY AUTOINCREMENT,
    obs_id                  INTEGER REFERENCES raw_observations(obs_id),
    canonical_sku_id        TEXT REFERENCES canonical_skus(canonical_sku_id),
    platform                TEXT,
    city                    TEXT,
    locality                TEXT,
    affluence_tier          TEXT,
    scraped_at              TEXT,
    mrp                     REAL,
    selling_price           REAL,
    discount_pct            REAL,                -- 1 - SP/MRP
    in_stock                INTEGER,             -- bool 0/1
    price_per_unit          REAL,                -- SP / units_per_pack
    price_per_100_pulls     REAL,                -- SP / total_pulls * 100
    price_per_100_ply_sheets REAL,              -- SP / (total_pulls*ply) * 100
    price_per_1000_cm2      REAL,                -- only if dimensions known
    price_per_gram          REAL,                -- only if dims + GSM + basis known
    mrp_inflation_flag      INTEGER              -- bool: discount_pct > 0.50
);
CREATE INDEX IF NOT EXISTS idx_price_sku      ON price_observations(canonical_sku_id);
CREATE INDEX IF NOT EXISTS idx_price_platform ON price_observations(platform);

-- ---------------------------------------------------------------------------
-- 8.5 market_observations — market intelligence.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_observations (
    market_obs_id       INTEGER PRIMARY KEY AUTOINCREMENT,
    obs_id              INTEGER REFERENCES raw_observations(obs_id),
    canonical_sku_id    TEXT REFERENCES canonical_skus(canonical_sku_id),
    platform            TEXT,
    locality            TEXT,
    scraped_at          TEXT,
    search_query        TEXT,
    search_rank         INTEGER,
    is_sponsored        INTEGER,
    rating              REAL,
    review_count        INTEGER,
    badge               TEXT,
    in_stock            INTEGER,
    seller              TEXT
);
CREATE INDEX IF NOT EXISTS idx_market_sku ON market_observations(canonical_sku_id);

-- ---------------------------------------------------------------------------
-- 8.6 evidence_log — one row per extracted field value. Full traceability.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_log (
    evidence_id         INTEGER PRIMARY KEY AUTOINCREMENT,
    obs_id              INTEGER REFERENCES raw_observations(obs_id),
    field_name          TEXT NOT NULL,
    raw_value           TEXT,
    extracted_value     TEXT,
    extraction_method   TEXT,                    -- structured_field/regex_title/regex_description/llm_parse/manual/not_available
    confidence          REAL,                    -- 0..1
    notes               TEXT
);
CREATE INDEX IF NOT EXISTS idx_evidence_obs   ON evidence_log(obs_id);
CREATE INDEX IF NOT EXISTS idx_evidence_field ON evidence_log(field_name);

-- ---------------------------------------------------------------------------
-- 8.7 review_texts — optional, later. NO reviewer names (spec §2).
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS review_texts (
    review_id           INTEGER PRIMARY KEY AUTOINCREMENT,
    canonical_sku_id    TEXT REFERENCES canonical_skus(canonical_sku_id),
    platform            TEXT,
    rating              REAL,
    review_date         TEXT,
    review_text         TEXT,
    theme_tags          TEXT                     -- JSON list
);

-- ---------------------------------------------------------------------------
-- Brand universe (spec §12) — tier tags for analysis.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS brand_tiers (
    brand_normalized    TEXT PRIMARY KEY,
    display_name        TEXT,
    tier                TEXT                     -- mass/new_age_premium/imported_premium/value/reference/substitute
);
