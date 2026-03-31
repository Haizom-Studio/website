-- Run in D1 console or: wrangler d1 execute <DB_NAME> --file=./d1/migrations/0001_inventory.sql
CREATE TABLE IF NOT EXISTS inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  category TEXT,
  quantity INTEGER,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
