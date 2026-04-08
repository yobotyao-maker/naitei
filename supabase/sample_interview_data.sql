-- ============================================================
-- サンプル面接データ INSERT
-- admins テーブルに登録済みのユーザーを user_id として使用
-- Supabase SQL Editor で実行してください
-- ============================================================

INSERT INTO interviews
  (user_id, job_role, experience, question, answer, score, level, feedback,
   lang, technical_score, expression_score, logic_score, japanese_score)
SELECT
  (SELECT user_id FROM admins LIMIT 1),  -- 最初の管理者ユーザーのID
  'バックエンドエンジニア',
  '3年',
  'チームでの開発中に技術的な負債が蓄積している状況で、あなたはどのようにリファクタリングを推進しましたか？',
  '前職のECサイト開発プロジェクトで、リリース優先で進めた結果、モジュール間の依存関係が複雑になっていました。私はまず影響範囲を可視化するため依存グラフを作成し、チームリーダーにリスクを数値で説明しました。スプリントごとに20%の時間をリファクタリングに充てる提案が通り、3ヶ月で主要モジュールのテストカバレッジを40%から80%に引き上げることができました。結果として、新機能の開発速度が1.5倍に改善されました。',
  7.8,
  'S3',
  '技術負債の対処法は的確で、数値での説明・段階的なアプローチが評価できます。ただ、チームへの巻き込み方やコードレビュー基準の整備についても触れると、より説得力が増します。',
  'zh',
  28,
  22,
  20,
  NULL
WHERE EXISTS (SELECT 1 FROM admins LIMIT 1);

-- 日本語面接のサンプル
INSERT INTO interviews
  (user_id, job_role, experience, question, answer, score, level, feedback,
   lang, technical_score, expression_score, logic_score, japanese_score)
SELECT
  (SELECT user_id FROM admins LIMIT 1),
  'フロントエンドエンジニア',
  '2年',
  'チームの意見が割れた時、あなたはどのように調整し、合意を形成しましたか？',
  '半年前のデザインリニューアルプロジェクトで、AとBの2案に意見が分かれました。私はそれぞれのメリット・デメリットを整理した比較表を作成し、ユーザーテストのデータを根拠に提示しました。感情的な議論を避けるため、判断基準を「ユーザー体験の向上」に統一するよう提案しました。最終的にA案に決定し、リリース後のコンバージョン率が12%改善されました。',
  8.2,
  'S3',
  '論理的な調整スキルとデータ活用が光ります。合意形成のプロセスが明確で、結果も具体的。次のステップとして、反対意見の当事者への個別フォローアップについても触れるとさらに良いでしょう。',
  'ja',
  24,
  21,
  20,
  17
WHERE EXISTS (SELECT 1 FROM admins LIMIT 1);

-- 確認
SELECT id, job_role, score, level, lang, technical_score, created_at
FROM interviews
ORDER BY created_at DESC
LIMIT 5;
