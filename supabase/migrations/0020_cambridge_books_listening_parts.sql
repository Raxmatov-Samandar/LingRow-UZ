-- =============================================================================
-- Listening question text, parsed/OCR'd from a Cambridge book PDF the same
-- way Reading passages are (see parseCambridgeListening in pdfParser.ts) --
-- stored separately from `parts` (Reading) so re-parsing one skill never
-- clobbers the other. There's no printed answer key for Listening either
-- way, so this is question text only, not auto-gradable content.
-- =============================================================================

alter table cambridge_books add column listening_parts jsonb not null default '[]'::jsonb;
alter table cambridge_books add column listening_warnings jsonb not null default '[]'::jsonb;
