-- Esquema Postgres para el panel /admin de wow-landing.
-- Correr una sola vez contra la base de datos Vercel Postgres del proyecto
-- (dashboard de Vercel -> Storage -> tu base -> Query, o via psql $POSTGRES_URL).

CREATE TABLE IF NOT EXISTS projects (
  slug                TEXT PRIMARY KEY,
  title               TEXT NOT NULL,
  category            TEXT NOT NULL DEFAULT '',
  capabilities        TEXT NOT NULL DEFAULT '',
  description         TEXT NOT NULL DEFAULT '',
  tagline             TEXT,
  work                TEXT NOT NULL DEFAULT '',
  variant             TEXT NOT NULL DEFAULT 'gallery' CHECK (variant IN ('gallery', 'logo')),
  cover_image         TEXT NOT NULL DEFAULT '',
  show_on_index       BOOLEAN NOT NULL DEFAULT true,
  show_on_portafolio  BOOLEAN NOT NULL DEFAULT true,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at        TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS project_images (
  id           SERIAL PRIMARY KEY,
  project_slug TEXT NOT NULL REFERENCES projects(slug) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_slug, position)
);

CREATE TABLE IF NOT EXISTS leads (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  company     TEXT,
  need        TEXT,
  budget      TEXT,
  details     TEXT,
  page        TEXT,
  lang        TEXT,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'won', 'lost')),
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

CREATE TABLE IF NOT EXISTS login_attempts (
  id          SERIAL PRIMARY KEY,
  ip          TEXT NOT NULL,
  success     BOOLEAN NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip, created_at DESC);

-- Textos editables del sitio (hero, encabezados de sección, intros) — ver
-- api/admin/content/*.js y scripts/seed-site-content.mjs. El ancla en el
-- HTML es el atributo data-ck="<key>" en el elemento correspondiente.
CREATE TABLE IF NOT EXISTS site_content (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  label       TEXT NOT NULL,
  page        TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tokens de color de marca editables (styles.css :root) — ver
-- api/admin/tokens/*.js y scripts/seed-site-tokens.mjs.
CREATE TABLE IF NOT EXISTS site_tokens (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  label       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
