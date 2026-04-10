-- ────────────────────────────────────────────────────────────
-- design_feedback テーブル更新
-- question_number と question_content カラムを追加
-- ────────────────────────────────────────────────────────────

ALTER TABLE design_feedback
  ADD COLUMN IF NOT EXISTS question_number INTEGER;

ALTER TABLE design_feedback
  ADD COLUMN IF NOT EXISTS question_content TEXT;

-- session_id を NOT NULL から NULL 許可に変更
ALTER TABLE design_feedback
  ALTER COLUMN session_id DROP NOT NULL;
