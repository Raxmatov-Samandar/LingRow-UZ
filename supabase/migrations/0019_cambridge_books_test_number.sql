-- =============================================================================
-- Cambridge books can bundle multiple tests in one physical publication
-- (e.g. "Cambridge IELTS 10" has Test 1-4). Each PDF upload in the Dev Panel
-- still represents one test's worth of content, but until now there was no
-- way to say WHICH test a given upload (and its 4 Listening audio sections)
-- belongs to -- just a free-text title. This adds an explicit, optional
-- 1-4 test number the dev picks at upload time.
-- =============================================================================

alter table cambridge_books add column test_number smallint check (test_number between 1 and 4);
