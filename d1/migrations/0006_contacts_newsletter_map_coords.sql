-- Approximate map coordinates from IP / Cloudflare (see resolveVisitorGeo in src/lib/ip-geo.ts).
-- Apply: wrangler d1 execute <DB_NAME> --remote --file=./d1/migrations/0006_contacts_newsletter_map_coords.sql

ALTER TABLE contacts ADD COLUMN map_lat REAL;
ALTER TABLE contacts ADD COLUMN map_lng REAL;

ALTER TABLE newsletter_subscribers ADD COLUMN map_lat REAL;
ALTER TABLE newsletter_subscribers ADD COLUMN map_lng REAL;
