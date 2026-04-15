-- ============================================================
-- 面試者 EID データ投入スクリプト
-- interviews.eid と design_sessions.interviewee_eid を自動生成
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. interviews テーブルに eid を投入
--    user_id に基づいて一意の EID を生成
--    フォーマット: EID_XXXXXX（6桁のランダム数値）
-- ────────────────────────────────────────────────────────────
UPDATE interviews
SET eid = 'EID_' || LPAD(
  (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
  6,
  '0'
)
WHERE eid IS NULL;

-- ────────────────────────────────────────────────────────────
-- 2. design_sessions テーブルに interviewee_eid を投入
--    user_id に基づいて interviews と同じ方式で生成
-- ────────────────────────────────────────────────────────────
UPDATE design_sessions
SET interviewee_eid = 'EID_' || LPAD(
  (EXTRACT(EPOCH FROM (user_id::text || created_at::text)::bytea)::bigint % 900000 + 100000)::text,
  6,
  '0'
)
WHERE interviewee_eid IS NULL;

-- ────────────────────────────────────────────────────────────
-- 3. 検証：投入されたデータを確認
-- ────────────────────────────────────────────────────────────
SELECT
  'interviews' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN eid IS NOT NULL THEN 1 END) as eid_populated,
  COUNT(DISTINCT eid) as unique_eids
FROM interviews
UNION ALL
SELECT
  'design_sessions' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN interviewee_eid IS NOT NULL THEN 1 END) as eid_populated,
  COUNT(DISTINCT interviewee_eid) as unique_eids
FROM design_sessions;

-- ────────────────────────────────────────────────────────────
-- 4. サンプル：投入されたデータの一覧
-- ────────────────────────────────────────────────────────────
SELECT 'Interviews' as source, eid, COUNT(*) as count
FROM interviews
WHERE eid IS NOT NULL
GROUP BY eid
ORDER BY eid
LIMIT 10;

SELECT 'Design Sessions' as source, interviewee_eid as eid, COUNT(*) as count
FROM design_sessions
WHERE interviewee_eid IS NOT NULL
GROUP BY interviewee_eid
ORDER BY interviewee_eid
LIMIT 10;
