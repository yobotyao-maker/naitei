// ─────────────────────────────────────────────────────────
// 設計コース AI評価プロンプト
// ─────────────────────────────────────────────────────────

export function buildDesignEvalPrompt(params: {
  questionNumber: number
  category: string
  questionContent: string
  userAnswer: string
  complexity: string | null
}): string {
  const { questionNumber, category, questionContent, userAnswer, complexity } = params

  return `あなたは日本のIT企業でシステム設計を15年以上担当してきたベテラン設計レビュアーです。
以下の設計面談質問に対する回答を採点してください。

【問題番号】${questionNumber}
【カテゴリ】${category}
【問題種別】${complexity ?? '一般'}
【質問内容】
${questionContent}

【受験者の回答】
${userAnswer || '（未回答）'}

## 採点基準（各項目0〜5点、合計0〜5点に換算）

### 正確性（accuracy）: 0〜5点
- 5点：設計概念・手法が完全に正確。実務に即した内容
- 4点：概ね正確。細部に若干の不足あり
- 3点：方向性は正しいが、誤りや重要な欠落がある
- 2点：部分的に正確。誤解や混乱が見られる
- 1点：基本的な理解に欠陥がある
- 0点：全く正確でない、または無回答

### 網羅性（completeness）: 0〜5点
- 5点：主要な観点・考慮点を全て網羅している
- 4点：主要事項は押さえているが、一部漏れがある
- 3点：重要な観点の半分以上はカバーしている
- 2点：いくつかの観点に触れているが大きな漏れがある
- 1点：ほとんどの観点が欠けている
- 0点：実質的な内容がない

### 明瞭性（clarity）: 0〜5点
- 5点：論理的で構造化された説明。具体例も豊富
- 4点：概ね明瞭。構造は整っている
- 3点：伝わるが論理の飛躍や冗長な部分がある
- 2点：説明が断片的または不明瞭
- 1点：意図が伝わりにくい
- 0点：意味をなさない

### 専門用語（terminology）: 0〜5点
- 5点：設計用語・業界標準用語を適切かつ豊富に使用
- 4点：主要な専門用語を正確に使用
- 3点：いくつかの専門用語を使用しているが不足
- 2点：専門用語の使用が限定的または誤用あり
- 1点：ほとんど専門用語がない
- 0点：専門用語なし

## 総合スコア算出
総合スコア = round((accuracy + completeness + clarity + terminology) / 4)
※0〜5の整数に丸める

## 出力形式
以下のJSONのみ出力。説明・前置き・コードブロック記号は一切不要：
{"score":3,"accuracy":3,"completeness":3,"clarity":4,"terminology":3,"feedback":"改善点を日本語で具体的に100文字以内で記述"}`
}

export function buildDesignOverallFeedbackPrompt(params: {
  selectedDomains: string[]
  totalScore: number
  pLevel: string
  answersWithScores: Array<{
    questionNumber: number
    category: string
    content: string
    answer: string
    score: number
    feedback: string
  }>
}): string {
  const { selectedDomains, totalScore, pLevel, answersWithScores } = params
  const summaryLines = answersWithScores
    .map(a => `Q${a.questionNumber}[${a.category}] スコア${a.score}/5: ${a.feedback}`)
    .join('\n')

  return `あなたは日本のIT企業のシニア設計アーキテクトです。
以下の設計面談結果を総合的に評価し、候補者へのフィードバックを作成してください。

【選択設計領域】${selectedDomains.join('、')}
【総合スコア】${totalScore}/80点
【Pレベル判定】${pLevel}

【各問採点サマリー】
${summaryLines}

## フィードバック要件
1. 候補者の強みを具体的に1〜2点挙げる
2. 重点的に改善すべき領域を2〜3点、具体的な学習方法も添えて記述
3. 次のステップへのアドバイスを1〜2文

日本語で400文字以内。敬語は不要。端的に述べること。`
}
