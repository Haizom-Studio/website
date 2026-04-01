-- Newsletter: store client IP and resolved location (Cloudflare geo / headers).
-- Contact bookings: same, plus workflow status for the admin dashboard.
-- Apply: wrangler d1 execute <DB_NAME> --remote --file=./d1/migrations/0003_leads_geo.sql
-- (or your usual D1 migration workflow)
--
-- If only `contacts` is missing columns (e.g. duplicate column on newsletter), run
-- d1/migrations/0004_contacts_geo.sql instead or as well.

ALTER TABLE newsletter_subscribers ADD COLUMN ip_address TEXT;
ALTER TABLE newsletter_subscribers ADD COLUMN location TEXT;

ALTER TABLE contacts ADD COLUMN ip_address TEXT;
ALTER TABLE contacts ADD COLUMN location TEXT;
ALTER TABLE contacts ADD COLUMN status TEXT NOT NULL DEFAULT 'open';
