-- =============================================================================
-- Add the missing 'dtm' value to user_role.
-- Frontend (src/types/index.ts UserRole) has shipped 'student'|'adult'|'dtm'|'parent'
-- since the DTM track launched, but the enum created in 0001_initial_schema.sql
-- never got the 'dtm' value — any dtm sign-up against a real (non-mock) backend
-- fails inside handle_new_user() with an invalid input value error.
-- =============================================================================

alter type user_role add value if not exists 'dtm';
