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
                     a.ai_feedback, a.scoring_detail,
                     dq.content AS question_content,
                     dq.category AS question_category
              FROM design_answers a
              LEFT JOIN design_questions dq ON a.question_id = dq.id
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
--    p_eid は interviewee_eid / interviewer_eid 両方を OR 検索
-- ────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS search_interviews(text, text, date, date, int, int);
DROP FUNCTION IF EXISTS search_interviews(text, text, text, date, date, int, int);

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
        AND (p_eid     IS NULL OR eid = p_eid OR interviewer_eid = p_eid)
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
          AND (p_eid     IS NULL OR eid = p_eid OR interviewer_eid = p_eid)
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


-- ────────────────────────────────────────────────────────────
-- 8. design_answers に eid カラム追加（セッション EID を回答単位で保持）
-- ────────────────────────────────────────────────────────────
ALTER TABLE design_answers
  ADD COLUMN IF NOT EXISTS interviewee_eid TEXT,
  ADD COLUMN IF NOT EXISTS interviewer_eid TEXT;


-- ────────────────────────────────────────────────────────────
-- 9. design_questions に hints カラム追加（回答テンプレート・ヒント）
-- ────────────────────────────────────────────────────────────
ALTER TABLE design_questions
  ADD COLUMN IF NOT EXISTS hints JSONB DEFAULT '{"template": [], "tips": [], "keywords": []}';


-- ────────────────────────────────────────────────────────────
-- 10. get_admin_interviewees() — 面試者一覧（管理用）
--    全採点記録から面試者を集約し、統計情報を付与
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_interviewees(
  p_eid             text    default null,
  p_department      text    default null,
  p_rating_min      numeric default null,
  p_rating_max      numeric default null,
  p_interview_min   int     default null,
  p_interview_max   int     default null,
  p_limit           int     default 20,
  p_offset          int     default 0
)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH unique_eids AS (
    SELECT DISTINCT i.eid as eid
    FROM interviews i
    WHERE i.eid IS NOT NULL
    UNION
    SELECT DISTINCT ds.interviewee_eid as eid
    FROM design_sessions ds
    WHERE ds.interviewee_eid IS NOT NULL
  ),
  interviewee_data AS (
    SELECT
      e.eid,
      (SELECT ds.department FROM design_sessions ds
       WHERE ds.interviewee_eid = e.eid
       ORDER BY ds.completed_at DESC NULLS LAST
       LIMIT 1) as department,
      COALESCE(ROUND(AVG(i.score)::numeric, 1), 0) as comprehensive_rating,
      COUNT(DISTINCT COALESCE(i.id, ds.id)) as total_interviews,
      GREATEST(MAX(i.created_at), MAX(ds.completed_at)) as latest_interview_date,
      COUNT(*) FILTER (WHERE ds.p_level = 'P1') as p1_count,
      COUNT(*) FILTER (WHERE ds.p_level = 'P2') as p2_count,
      COUNT(*) FILTER (WHERE ds.p_level = 'P3') as p3_count,
      COUNT(*) FILTER (WHERE ds.p_level = 'P4') as p4_count,
      COALESCE(ROUND(AVG(i.technical_score)::numeric, 1), 0) as avg_technical_score,
      COALESCE(ROUND(AVG(i.expression_score)::numeric, 1), 0) as avg_expression_score,
      COALESCE(ROUND(AVG(i.logic_score)::numeric, 1), 0) as avg_logic_score,
      COALESCE(ROUND(AVG(i.japanese_score)::numeric, 1), 0) as avg_japanese_score
    FROM unique_eids e
    LEFT JOIN interviews i ON i.eid = e.eid
    LEFT JOIN design_sessions ds ON ds.interviewee_eid = e.eid
    GROUP BY e.eid
  ),
  filtered_data AS (
    SELECT * FROM interviewee_data
    WHERE (p_eid IS NULL OR eid ILIKE '%' || p_eid || '%')
      AND (p_department IS NULL OR department = p_department)
      AND (p_rating_min IS NULL OR comprehensive_rating >= p_rating_min)
      AND (p_rating_max IS NULL OR comprehensive_rating <= p_rating_max)
      AND (p_interview_min IS NULL OR total_interviews >= p_interview_min)
      AND (p_interview_max IS NULL OR total_interviews <= p_interview_max)
    ORDER BY eid
  )
  SELECT json_build_object(
    'total', (SELECT count(*) FROM filtered_data),
    'rows', (
      SELECT json_agg(r) FROM (
        SELECT * FROM filtered_data
        LIMIT p_limit
        OFFSET p_offset
      ) r
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION get_admin_interviewees FROM anon;
GRANT  EXECUTE ON FUNCTION get_admin_interviewees TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 10. get_admin_interviewee_detail() — 面試者詳細情報（管理用）
--     特定の面試者の採点履歴と設計セッション履歴
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_interviewee_detail(p_eid text)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'interviewee',
      (SELECT json_build_object(
        'eid', p_eid,
        'department', (
          SELECT ds.department FROM design_sessions ds
          WHERE ds.interviewee_eid = p_eid
          ORDER BY ds.completed_at DESC NULLS LAST
          LIMIT 1
        ),
        'comprehensive_rating', COALESCE(ROUND(AVG(i.score)::numeric, 1), 0),
        'total_interviews', COUNT(DISTINCT i.id),
        'latest_interview_date', MAX(i.created_at),
        's1_count', COUNT(*) FILTER (WHERE i.level = 'S1'),
        's2_count', COUNT(*) FILTER (WHERE i.level = 'S2'),
        's3_count', COUNT(*) FILTER (WHERE i.level = 'S3'),
        's4_count', COUNT(*) FILTER (WHERE i.level = 'S4'),
        'avg_technical_score', COALESCE(ROUND(AVG(i.technical_score)::numeric, 1), 0),
        'avg_expression_score', COALESCE(ROUND(AVG(i.expression_score)::numeric, 1), 0),
        'avg_logic_score', COALESCE(ROUND(AVG(i.logic_score)::numeric, 1), 0),
        'avg_japanese_score', COALESCE(ROUND(AVG(i.japanese_score)::numeric, 1), 0)
      )
      FROM interviews i
      WHERE i.eid = p_eid),
    'interviews', (
      SELECT COALESCE(json_agg(r ORDER BY r.created_at DESC), '[]'::json)
      FROM (
        SELECT id, job_role, score, level, feedback, lang,
               technical_score, expression_score, logic_score, japanese_score,
               question, answer, created_at
        FROM interviews
        WHERE eid = p_eid
        ORDER BY created_at DESC
        LIMIT 50
      ) r
    ),
    'design_sessions', (
      SELECT COALESCE(json_agg(r ORDER BY r.completed_at DESC), '[]'::json)
      FROM (
        SELECT
          s.id, s.interview_date, s.interviewer_eid, s.department,
          s.selected_domains, s.background_score, s.technical_score, s.total_score, s.p_level,
          s.overall_feedback, s.completed_at
        FROM design_sessions s
        WHERE s.interviewee_eid = p_eid AND s.status = 'completed'
        ORDER BY s.completed_at DESC
        LIMIT 20
      ) r
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION get_admin_interviewee_detail FROM anon;
GRANT  EXECUTE ON FUNCTION get_admin_interviewee_detail TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 11. get_admin_interviewees_stats() — 面試者統計ダッシュボード（管理用）
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_admin_interviewees_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH unique_eids AS (
    SELECT DISTINCT i.eid as eid
    FROM interviews i
    WHERE i.eid IS NOT NULL
    UNION
    SELECT DISTINCT ds.interviewee_eid as eid
    FROM design_sessions ds
    WHERE ds.interviewee_eid IS NOT NULL
  ),
  interviewee_data AS (
    SELECT
      e.eid,
      (SELECT ds.department FROM design_sessions ds
       WHERE ds.interviewee_eid = e.eid
       ORDER BY ds.completed_at DESC NULLS LAST
       LIMIT 1) as department,
      COALESCE(ROUND(AVG(i.score)::numeric, 1), 0) as comprehensive_rating,
      COUNT(DISTINCT COALESCE(i.id, ds.id)) as total_interviews,
      COUNT(*) FILTER (WHERE ds.p_level = 'P1') as p1_count,
      COUNT(*) FILTER (WHERE ds.p_level = 'P2') as p2_count,
      COUNT(*) FILTER (WHERE ds.p_level = 'P3') as p3_count,
      COUNT(*) FILTER (WHERE ds.p_level = 'P4') as p4_count
    FROM unique_eids e
    LEFT JOIN interviews i ON i.eid = e.eid
    LEFT JOIN design_sessions ds ON ds.interviewee_eid = e.eid
    GROUP BY e.eid
  ),
  dept_stats AS (
    SELECT
      COALESCE(department, 'Others') as department,
      COUNT(*) as count,
      COALESCE(ROUND(AVG(comprehensive_rating)::numeric, 1), 0) as avg_rating
    FROM interviewee_data
    GROUP BY COALESCE(department, 'Others')
    ORDER BY count DESC
    LIMIT 10
  )
  SELECT json_build_object(
    'total_interviewees', (SELECT count(*) FROM interviewee_data),
    'avg_rating', (SELECT COALESCE(ROUND(AVG(comprehensive_rating)::numeric, 1), 0) FROM interviewee_data),
    'p_level_distribution', (
      SELECT json_build_object(
        'P1', COALESCE(SUM(p1_count), 0),
        'P2', COALESCE(SUM(p2_count), 0),
        'P3', COALESCE(SUM(p3_count), 0),
        'P4', COALESCE(SUM(p4_count), 0)
      ) FROM interviewee_data
    ),
    'department_distribution', (
      SELECT json_object_agg(department, count)
      FROM dept_stats
    ),
    'department_ratings', (
      SELECT json_object_agg(department, json_build_object('count', count, 'avg_rating', avg_rating))
      FROM dept_stats
    ),
    'interview_frequency', (
      SELECT json_agg(json_build_object('day', day, 'count', cnt))
      FROM (
        SELECT
          to_char(date_trunc('day', created_at), 'MM/DD') as day,
          count(*) as cnt
        FROM interviews
        WHERE created_at >= now() - interval '7 days'
        GROUP BY date_trunc('day', created_at)
        ORDER BY date_trunc('day', created_at)
      ) r
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION get_admin_interviewees_stats FROM anon;
GRANT  EXECUTE ON FUNCTION get_admin_interviewees_stats TO authenticated;
