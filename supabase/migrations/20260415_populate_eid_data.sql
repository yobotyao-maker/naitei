-- Migration: Populate EID fields for interviews and design_sessions
-- This migration populates the eid and interviewee_eid fields to enable
-- the Interviewee Management dashboard to display aggregated statistics

-- Update interviews table with auto-generated EID
UPDATE interviews
SET eid = 'EID_' || LPAD(
  (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
  6,
  '0'
)
WHERE eid IS NULL;

-- Update design_sessions table with auto-generated interviewee_eid
UPDATE design_sessions
SET interviewee_eid = 'EID_' || LPAD(
  (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
  6,
  '0'
)
WHERE interviewee_eid IS NULL;
