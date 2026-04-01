-- Destructive: drops newsletter + contacts and recreates them with the current app schema.
-- All existing subscriber emails and booking rows are permanently deleted.
--
-- D1 Console: paste and run the whole file.
-- CLI: wrangler d1 execute <DB_NAME> --remote --file=./d1/migrations/0005_recreate_newsletter_contacts.sql

DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS contacts;

CREATE TABLE newsletter_subscribers (
  email TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address TEXT,
  location TEXT
);

CREATE TABLE contacts (
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT NOT NULL,
  service TEXT NOT NULL,
  specialist TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  ip_address TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  UNIQUE (email, date, time)
);
