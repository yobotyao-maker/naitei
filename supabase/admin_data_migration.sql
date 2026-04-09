-- ============================================================
-- naitei.ai — Admin & Score Data Migration
-- Supabase SQL Editor で実行してください
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. interviews に採点分項目カラムを追加
--    ※ migrations.sql 側に同じ ALTER が追加された場合は重複実行不要
--      (IF NOT EXISTS のため安全に再実行可能)
-- ────────────────────────────────────────────────────────────
ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS lang             TEXT    DEFAULT 'zh',
  ADD COLUMN IF NOT EXISTS technical_score  INTEGER,
  ADD COLUMN IF NOT EXISTS expression_score INTEGER,
  ADD COLUMN IF NOT EXISTS logic_score      INTEGER,
  ADD COLUMN IF NOT EXISTS japanese_score   INTEGER;


-- ────────────────────────────────────────────────────────────
-- 2. design_sessions に interviewee_eid を追加（未追加の場合）
-- ────────────────────────────────────────────────────────────
ALTER TABLE design_sessions
  ADD COLUMN IF NOT EXISTS interviewee_eid TEXT;


-- ────────────────────────────────────────────────────────────
-- 3. get_admin_subscriptions() — 全ユーザーのプラン一覧（管理用）
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_subscriptions()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_agg(r)
  FROM (
    SELECT user_id, plan, interviews_used, interviews_limit, created_at
    FROM subscriptions
    ORDER BY created_at DESC
    LIMIT 200
  ) r;
$$;

REVOKE EXECUTE ON FUNCTION get_admin_subscriptions FROM anon;
GRANT  EXECUTE ON FUNCTION get_admin_subscriptions TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 4. get_admin_design_sessions() — 全設計セッション一覧（管理用）
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_design_sessions(
  p_limit  INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total', (SELECT count(*) FROM design_sessions WHERE status = 'completed'),
    'rows', (
      SELECT json_agg(r) FROM (
        SELECT
          s.id,
          s.user_id,
          s.interview_date,
          s.interviewer_eid,
          s.interviewee_eid,
          s.department,
          s.selected_domains,
          s.background_score,
          s.technical_score,
          s.total_score,
          s.p_level,
          s.overall_feedback,
          s.completed_at,
          s.created_at
        FROM design_sessions s
        WHERE s.status = 'completed'
        ORDER BY s.completed_at DESC
        LIMIT p_limit
        OFFSET p_offset
      ) r
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION get_admin_design_sessions FROM anon;
GRANT  EXECUTE ON FUNCTION get_admin_design_sessions TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 5. get_admin_user_detail() — 特定ユーザーの全採点履歴（管理用）
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_user_detail(p_user_id UUID)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'interviews', (
      SELECT COALESCE(json_agg(r ORDER BY r.created_at DESC), '[]'::json)
      FROM (
        SELECT id, job_role, score, level, feedback, lang,
               technical_score, expression_score, logic_score, japanese_score,
               question, answer, created_at
        FROM interviews
        WHERE user_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 50
      ) r
    ),
    'design_sessions', (
      SELECT COALESCE(json_agg(r ORDER BY r.completed_at DESC), '[]'::json)
      FROM (
        SELECT
          s.id, s.interview_date, s.interviewer_eid, s.interviewee_eid,
          s.department, s.selected_domains, s.background_score,
          s.technical_score, s.total_score, s.p_level,
          s.overall_feedback, s.completed_at,
          (
            SELECT COALESCE(json_agg(a ORDER BY a.question_number), '[]'::json)
            FROM (
              SELECT a.question_number, a.user_answer, a.ai_score,
                     a.ai_feedback, a.scoring_detail
              FROM design_answers a
              WHERE a.session_id = s.id
            ) a
          ) AS answers
        FROM design_sessions s
        WHERE s.user_id = p_user_id AND s.status = 'completed'
        ORDER BY s.completed_at DESC
        LIMIT 20
      ) r
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION get_admin_user_detail FROM anon;
GRANT  EXECUTE ON FUNCTION get_admin_user_detail TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 6. interviews に eid / interviewer_eid カラム追加
-- ────────────────────────────────────────────────────────────
ALTER TABLE interviews
  ADD COLUMN IF NOT EXISTS eid             TEXT,   -- Interviewee EID（任意）
  ADD COLUMN IF NOT EXISTS interviewer_eid TEXT;   -- Interviewer EID（必須入力）


-- ────────────────────────────────────────────────────────────
-- 7. search_interviews() を更新して eid フィルタ・カラムを追加
--    旧シグネチャを先に DROP してオーバーロード衝突を解消
-- ────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS search_interviews(text, text, date, date, int, int);

CREATE OR REPLACE FUNCTION search_interviews(
  p_keyword text  default null,
  p_eid     text  default null,
  p_level   text  default null,
  p_from    date  default null,
  p_to      date  default null,
  p_limit   int   default 20,
  p_offset  int   default 0
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total', (
      SELECT count(*) FROM interviews
      WHERE (p_keyword IS NULL OR job_role ILIKE '%' || p_keyword || '%')
        AND (p_eid     IS NULL OR eid = p_eid)
        AND (p_level   IS NULL OR level = p_level)
        AND (p_from    IS NULL OR created_at::date >= p_from)
        AND (p_to      IS NULL OR created_at::date <= p_to)
    ),
    'rows', (
      SELECT json_agg(r) FROM (
        SELECT id, user_id, eid, interviewer_eid, job_role, experience, score, level, feedback,
               lang, technical_score, expression_score, logic_score, japanese_score,
               question, answer, created_at
        FROM interviews
        WHERE (p_keyword IS NULL OR job_role ILIKE '%' || p_keyword || '%')
          AND (p_eid     IS NULL OR eid = p_eid)
          AND (p_level   IS NULL OR level = p_level)
          AND (p_from    IS NULL OR created_at::date >= p_from)
          AND (p_to      IS NULL OR created_at::date <= p_to)
        ORDER BY created_at DESC
        LIMIT p_limit OFFSET p_offset
      ) r
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION search_interviews FROM anon;
GRANT  EXECUTE ON FUNCTION search_interviews TO authenticated;
