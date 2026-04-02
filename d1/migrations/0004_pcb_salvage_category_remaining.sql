-- Categories + per-line availability (run after 0003).
ALTER TABLE pcb_salvage_bom_lines ADD COLUMN category TEXT DEFAULT 'Other';
ALTER TABLE pcb_salvage_bom_lines ADD COLUMN initial_qty REAL;
ALTER TABLE pcb_salvage_bom_lines ADD COLUMN remaining_qty REAL;

UPDATE pcb_salvage_bom_lines
SET initial_qty = qty_per_board * (
  SELECT board_qty FROM pcb_salvage_boards b WHERE b.id = pcb_salvage_bom_lines.board_id
),
remaining_qty = qty_per_board * (
  SELECT board_qty FROM pcb_salvage_boards b WHERE b.id = pcb_salvage_bom_lines.board_id
)
WHERE initial_qty IS NULL OR remaining_qty IS NULL;

CREATE INDEX IF NOT EXISTS pcb_salvage_bom_lines_category ON pcb_salvage_bom_lines(category);
