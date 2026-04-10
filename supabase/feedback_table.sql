-- feedback テーブル（ユーザーからの一般的なフィードバック）
CREATE TABLE IF NOT EXISTS feedback (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT        NOT NULL,
  name            TEXT,
  eid             TEXT,
  message         TEXT        NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all feedback" ON feedback;
CREATE POLICY "Admins can view all feedback"
  ON feedback FOR SELECT
  USING (auth.uid() IN (SELECT DISTINCT user_id FROM admins));

DROP POLICY IF EXISTS "Anyone can insert feedback" ON feedback;
CREATE POLICY "Anyone can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (true);
