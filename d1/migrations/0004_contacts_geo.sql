-- Run this if `contacts` is missing ip_address / location / status (e.g. 0003 was not applied to this DB).
-- Cloudflare dashboard: D1 → your database → Console, paste and execute.
-- CLI: wrangler d1 execute <DB_NAME> --remote --file=./d1/migrations/0004_contacts_geo.sql
--
-- If you see "duplicate column name", that column already exists — run the remaining lines only, or ignore.

ALTER TABLE contacts ADD COLUMN ip_address TEXT;
ALTER TABLE contacts ADD COLUMN location TEXT;
ALTER TABLE contacts ADD COLUMN status TEXT NOT NULL DEFAULT 'open';
