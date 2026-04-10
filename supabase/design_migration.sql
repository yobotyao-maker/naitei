-- ============================================================
-- naitei.ai — 設計エンジニアコース SQL Migration
-- Supabase SQL Editor で実行してください
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. design_questions テーブル
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS design_questions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  number         INTEGER     NOT NULL,
  category       TEXT        NOT NULL,
  content        TEXT        NOT NULL,
  complexity     TEXT,       -- '必須問題'|'通常問題'|'加点減点問題'|'補足事項'|'-'
  is_required    BOOLEAN     DEFAULT false,
  display_order  TEXT,       -- '進め'|'任意'|'必須'
  design_domains TEXT[]      DEFAULT '{}',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE design_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "design_questions readable by authenticated" ON design_questions;
CREATE POLICY "design_questions readable by authenticated"
  ON design_questions FOR SELECT
  TO authenticated
  USING (true);


-- ────────────────────────────────────────────────────────────
-- 2. design_sessions テーブル
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS design_sessions (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        REFERENCES auth.users(id),

  -- 背景評価（事前入力）
  japanese_level       TEXT,       -- 'B' | 'C'
  soft_skill_level     TEXT,       -- 'S1' | 'S2' | 'S3'
  basic_design_years   TEXT,       -- '<1' | '1-3' | '3+'
  requirement_years    TEXT,       -- '<1' | '1+'
  reviewer_years       TEXT,       -- '<1' | '1+'

  -- 選択設計領域
  selected_domains     TEXT[]      DEFAULT '{}',

  -- 採点
  background_score     INTEGER     DEFAULT 0,
  question_scores      JSONB       DEFAULT '{}',  -- {question_id: score(0-5)}
  technical_score      INTEGER     DEFAULT 0,
  total_score          INTEGER     DEFAULT 0,
  p_level              TEXT,       -- 'P1'|'P2'|'P3'|'P4'

  -- AI評価
  ai_feedback          JSONB       DEFAULT '{}',
  overall_feedback     TEXT,

  status               TEXT        DEFAULT 'in_progress',  -- 'in_progress'|'completed'
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  completed_at         TIMESTAMPTZ
);

ALTER TABLE design_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own design sessions" ON design_sessions;
CREATE POLICY "Users can view own design sessions"
  ON design_sessions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own design sessions" ON design_sessions;
CREATE POLICY "Users can insert own design sessions"
  ON design_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own design sessions" ON design_sessions;
CREATE POLICY "Users can update own design sessions"
  ON design_sessions FOR UPDATE
  USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 3. design_answers テーブル
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS design_answers (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID        REFERENCES design_sessions(id) ON DELETE CASCADE,
  question_id     UUID        REFERENCES design_questions(id),
  question_number INTEGER,
  user_answer     TEXT,
  ai_score        INTEGER     CHECK (ai_score >= 0 AND ai_score <= 5),
  ai_feedback     TEXT,
  scoring_detail  JSONB,      -- {accuracy, completeness, clarity, terminology}
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE design_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own design answers" ON design_answers;
CREATE POLICY "Users can view own design answers"
  ON design_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM design_sessions
      WHERE design_sessions.id = design_answers.session_id
        AND design_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own design answers" ON design_answers;
CREATE POLICY "Users can insert own design answers"
  ON design_answers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM design_sessions
      WHERE design_sessions.id = design_answers.session_id
        AND design_sessions.user_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- 4. design_questions データ INSERT（28問）
-- ────────────────────────────────────────────────────────────

-- 既存データをクリア（べき等実行のため）
TRUNCATE design_questions RESTART IDENTITY CASCADE;

INSERT INTO design_questions
  (number, category, content, complexity, is_required, display_order, design_domains)
VALUES

-- ── 基本設計の範囲（1〜6） ──────────────────────────────────
(1, '基本設計の範囲', '基本設計と詳細設計の違いを説明してください。また、基本設計フェーズで完成させるべき成果物（ドキュメント）を具体的に挙げてください。',
 '-', false, '進め', ARRAY['全般']),

(2, '基本設計の範囲', '要件定義書を受け取った後、基本設計を開始する前に確認・整理すべき事項は何ですか？未確定要件や矛盾箇所の扱いも含めて説明してください。',
 '-', false, '進め', ARRAY['全般']),

(3, '基本設計の範囲', '基本設計の品質を担保するために、どのようなレビュープロセスや確認観点を設けていますか？',
 '-', false, '進め', ARRAY['全般']),

(4, '基本設計の範囲', '既存システムの改修案件と新規開発案件では、基本設計のアプローチはどのように異なりますか？',
 '-', false, '任意', ARRAY['全般']),

(5, '基本設計の範囲', '基本設計フェーズで発生した要件の曖昧さや顧客との認識齟齬を、どのように解消・調整してきましたか？',
 '-', false, '任意', ARRAY['全般']),

(6, '基本設計の範囲', '非機能要件（性能・可用性・セキュリティ・保守性）を基本設計にどのように組み込み、各設計成果物へ反映しますか？',
 '-', false, '任意', ARRAY['全般', 'セキュリティ設計', '非機能設計']),

-- ── 必須問題（7〜10）：少なくとも2カテゴリ以上対象 ──────────
(7, '画面設計', '画面設計において、業務フローとの整合性を確認しながら画面遷移図を作成する際の重要なポイントを説明してください。権限・ロール別の遷移制御も含めて述べてください。',
 '必須問題', true, '必須', ARRAY['画面設計']),

(8, 'テーブル設計', 'テーブル設計において第1〜第3正規化の手順と、実務で正規化を崩す（非正規化する）判断をどのような基準で行いますか？',
 '必須問題', true, '必須', ARRAY['テーブル設計']),

(9, 'バッチ設計', 'バッチ処理の設計において、ジョブの実行順序・依存関係の整理・エラー制御・リラン設計の考え方を説明してください。',
 '必須問題', true, '必須', ARRAY['バッチ設計']),

(10, 'インターフェース設計', '外部システムとのインターフェース設計において、データ形式・通信方式・エラーハンドリング・タイムアウト設計をどのように決定・設計しますか？',
 '必須問題', true, '必須', ARRAY['インターフェース設計']),

-- ── 通常問題（11〜21） ───────────────────────────────────────
(11, '画面設計', '画面設計における入力バリデーション（項目チェック・相関チェック・業務チェック）の設計方法と、それらをどのドキュメントに落とし込むかを説明してください。',
 '通常問題', false, '進め', ARRAY['画面設計']),

(12, '帳票設計', '帳票（レポート・帳票PDF等）の設計において、レイアウト設計・出力タイミング・データ取得方法・印刷要件をどのように定義しますか？',
 '通常問題', false, '任意', ARRAY['画面設計', '帳票設計']),

(13, 'テーブル設計', 'テーブル設計においてインデックスの設計方針（複合インデックス・カバリングインデックス等）と、パフォーマンスへの影響をどのように考慮しますか？',
 '通常問題', false, '進め', ARRAY['テーブル設計']),

(14, 'テーブル設計', 'マスターデータとトランザクションデータの設計上の違い（更新頻度・履歴管理・削除フラグ等）と、それぞれの管理方針を説明してください。',
 '通常問題', false, '進め', ARRAY['テーブル設計']),

(15, 'バッチ設計', '大量データを扱うバッチ処理において、パフォーマンス設計（チャンク処理・並列化・コミット単位等）とリソース管理をどのように設計しますか？',
 '通常問題', false, '進め', ARRAY['バッチ設計']),

(16, 'プログラム設計', 'プログラム構造設計において、共通モジュール・共通ライブラリの切り出し方針と、再利用性・保守性を高めるための設計上の工夫を説明してください。',
 '通常問題', false, '任意', ARRAY['プログラム設計']),

(17, 'インターフェース設計', 'CSV・XML・JSONなどのファイル連携設計におけるポイント（ファイルレイアウト・文字コード・改行コード・エラーファイル設計等）を説明してください。',
 '通常問題', false, '進め', ARRAY['インターフェース設計']),

(18, 'インターフェース設計', 'Web APIのインターフェース設計において、RESTful設計の原則・バージョン管理・認証認可（OAuth2/JWT等）・レートリミットをどのように設計しますか？',
 '通常問題', false, '任意', ARRAY['インターフェース設計']),

(19, 'データ移行設計', 'データ移行設計において、既存データのクレンジング・変換ルール・照合・リハーサル・本番移行の手順をどのように設計・管理しますか？',
 '通常問題', false, '任意', ARRAY['データ移行設計']),

(20, '画面設計', '画面設計においてアクセシビリティ（WCAG基準・スクリーンリーダー対応・キーボード操作等）とレスポンシブ対応をどのように考慮しますか？',
 '通常問題', false, '任意', ARRAY['画面設計']),

(21, 'インターフェース設計', 'システム間連携において非同期メッセージング（MQ・イベント駆動等）を選択する判断基準と、メッセージスキーマ・デッドレター設計を説明してください。',
 '通常問題', false, '任意', ARRAY['インターフェース設計']),

-- ── 加点減点問題（22〜26） ──────────────────────────────────
(22, 'アーキテクチャ', 'マイクロサービスアーキテクチャを採用した場合、基本設計（特にAPI設計・データ分散・サービス間通信）はモノリスとどのように変わりますか？',
 '加点減点問題', false, '任意', ARRAY['インターフェース設計', '全般']),

(23, 'クラウド設計', 'クラウド環境（AWS/Azure/GCP）でのシステム基本設計において、オンプレミスとの違いと特有の考慮事項（マネージドサービス活用・IaC・スケーリング等）を説明してください。',
 '加点減点問題', false, '任意', ARRAY['非機能設計', '全般']),

(24, 'アジャイル設計', 'アジャイル開発プロジェクトにおける基本設計の進め方（スプリントごとの設計・ドキュメント管理・変更への対応）とウォーターフォールとの違いを説明してください。',
 '加点減点問題', false, '任意', ARRAY['全般']),

(25, 'AI・データ活用', 'AIやML機能・データ分析基盤を含むシステムの基本設計において、通常のトランザクションシステムと異なる設計上の考慮点を説明してください。',
 '加点減点問題', false, '任意', ARRAY['全般', 'テーブル設計']),

(26, '移行設計', 'レガシーシステムを段階的に刷新する際（ストラングラーフィグパターン等）の基本設計の戦略と、並行稼働期間中のデータ整合性の担保方法を説明してください。',
 '加点減点問題', false, '任意', ARRAY['全般', 'データ移行設計']),

-- ── 補足事項（27〜28） ──────────────────────────────────────
(27, '補足事項', 'これまでの基本設計業務で最も困難だった課題（技術的・対人的いずれでも可）と、それをどのように解決したかを具体的に説明してください。',
 '補足事項', false, '任意', ARRAY['全般']),

(28, '補足事項', '今後のキャリアにおいて設計スキルをどのように発展させていきたいですか？習得したい技術領域や目指すロールについて述べてください。',
 '補足事項', false, '任意', ARRAY['全般']);


-- ────────────────────────────────────────────────────────────
-- 5. get_design_stats() — 設計コース管理統計
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_design_stats()
RETURNS json
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_sessions',   (SELECT count(*) FROM design_sessions WHERE status = 'completed'),
    'avg_score',        (SELECT round(avg(total_score)::numeric, 1) FROM design_sessions WHERE status = 'completed'),
    'p_level_dist', (
      SELECT json_build_object(
        'P1', count(*) FILTER (WHERE p_level = 'P1'),
        'P2', count(*) FILTER (WHERE p_level = 'P2'),
        'P3', count(*) FILTER (WHERE p_level = 'P3'),
        'P4', count(*) FILTER (WHERE p_level = 'P4')
      ) FROM design_sessions WHERE status = 'completed'
    ),
    'top_domains', (
      SELECT json_agg(r) FROM (
        SELECT domain, count(*) AS cnt
        FROM design_sessions, unnest(selected_domains) AS domain
        WHERE status = 'completed'
        GROUP BY domain
        ORDER BY cnt DESC
        LIMIT 5
      ) r
    ),
    'daily_7d', (
      SELECT json_agg(d) FROM (
        SELECT
          to_char(date_trunc('day', created_at), 'MM/DD') AS day,
          count(*) AS cnt
        FROM design_sessions
        WHERE status = 'completed'
          AND created_at >= now() - interval '7 days'
        GROUP BY date_trunc('day', created_at)
        ORDER BY date_trunc('day', created_at)
      ) d
    )
  );
$$;

REVOKE EXECUTE ON FUNCTION get_design_stats FROM anon;
GRANT  EXECUTE ON FUNCTION get_design_stats TO authenticated;


-- ────────────────────────────────────────────────────────────
-- 6. design_sessions に interviewer_eid カラム追加
--    ※ テーブル作成後に追加する場合はこちらを実行
-- ────────────────────────────────────────────────────────────
ALTER TABLE design_sessions
  ADD COLUMN IF NOT EXISTS interviewer_eid TEXT;

ALTER TABLE design_sessions
  ADD COLUMN IF NOT EXISTS department TEXT;

ALTER TABLE design_sessions
  ADD COLUMN IF NOT EXISTS interview_date DATE;

-- ────────────────────────────────────────────────────────────
-- 7. design_feedback テーブル（顧客からのフィードバック）
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS design_feedback (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID        REFERENCES design_sessions(id) ON DELETE CASCADE,
  user_id         UUID        REFERENCES auth.users(id),
  feedback_text   TEXT,                   -- 自由なコメント
  rating          INTEGER     CHECK (rating >= 1 AND rating <= 5),  -- 1-5 星評価
  feedback_type   TEXT,                   -- '建議'|'問題'|'表賛'|'その他'
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE design_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own design feedback" ON design_feedback;
CREATE POLICY "Users can view own design feedback"
  ON design_feedback FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM design_sessions
      WHERE design_sessions.id = design_feedback.session_id
        AND design_sessions.user_id = auth.uid()
    )
    OR auth.uid() IN (SELECT DISTINCT admin_id FROM admin_users)
  );

DROP POLICY IF EXISTS "Users can insert own design feedback" ON design_feedback;
CREATE POLICY "Users can insert own design feedback"
  ON design_feedback FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM design_sessions
      WHERE design_sessions.id = design_feedback.session_id
        AND design_sessions.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own design feedback" ON design_feedback;
CREATE POLICY "Users can update own design feedback"
  ON design_feedback FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all feedback" ON design_feedback;
CREATE POLICY "Admins can view all feedback"
  ON design_feedback FOR SELECT
  USING (auth.uid() IN (SELECT DISTINCT admin_id FROM admin_users));

DROP POLICY IF EXISTS "Admins can delete feedback" ON design_feedback;
CREATE POLICY "Admins can delete feedback"
  ON design_feedback FOR DELETE
  USING (auth.uid() IN (SELECT DISTINCT admin_id FROM admin_users));
