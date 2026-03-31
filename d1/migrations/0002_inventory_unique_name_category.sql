-- Enforce one row per (name, category). Run after 0001.
-- If this fails, you have duplicate name+category rows — merge or delete duplicates first.
CREATE UNIQUE INDEX IF NOT EXISTS inventory_name_category_unique ON inventory(name, category);
