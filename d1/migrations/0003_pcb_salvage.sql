-- Salvage PCB inventory (separate from `inventory`). Run after 0002.
CREATE TABLE IF NOT EXISTS pcb_salvage_boards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  board_qty INTEGER NOT NULL DEFAULT 1,
  bom_filename TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pcb_salvage_bom_lines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  board_id INTEGER NOT NULL,
  match_key TEXT NOT NULL,
  designator TEXT,
  comment TEXT,
  footprint TEXT,
  lcsc TEXT,
  mpn TEXT,
  manufacturer TEXT,
  description TEXT,
  qty_per_board REAL NOT NULL DEFAULT 1,
  FOREIGN KEY (board_id) REFERENCES pcb_salvage_boards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS pcb_salvage_bom_lines_board_id ON pcb_salvage_bom_lines(board_id);
CREATE INDEX IF NOT EXISTS pcb_salvage_bom_lines_match_key ON pcb_salvage_bom_lines(match_key);
