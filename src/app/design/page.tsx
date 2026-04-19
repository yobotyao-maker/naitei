'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Logo from '@/components/Logo'
import LogoutButton from '@/components/LogoutButton'
import LoadingDots from '@/components/LoadingDots'
import BackgroundForm, { type BackgroundData } from '@/components/design/BackgroundForm'
import DomainSelector from '@/components/design/DomainSelector'
import DesignQuestionCard from '@/components/design/DesignQuestionCard'
import DesignAnswerInput from '@/components/design/DesignAnswerInput'
import DesignResultCard from '@/components/design/DesignResultCard'
import DesignSummary from '@/components/design/DesignSummary'
import FeedbackModal from '@/components/design/FeedbackModal'
import { calcPLevel } from '@/lib/design-scoring'
import type { QuestionRow } from '@/lib/design-scoring'

type Step =
  | 'background'
  | 'domain'
  | 'loading-session'
  | 'question'
  | 'answer'
  | 'loading-eval'
  | 'result'
  | 'loading-summary'
  | 'summary'

type EvalResult = {
  score: number
  accuracy: number
  completeness: number
  clarity: number
  terminology: number
  feedback: string
}

type AnswerItem = {
  question: QuestionRow
  answer: string
  result: EvalResult
}

export default function DesignPage() {
  const [step, setStep] = useState<Step>('background')
  const [backgroundData, setBackgroundData] = useState<BackgroundData | null>(null)
  const [selectedDomains, setSelectedDomains] = useState<string[]>([])
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [backgroundScore, setBackgroundScore] = useState(0)
  const [questions, setQuestions] = useState<QuestionRow[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [currentResult, setCurrentResult] = useState<EvalResult | null>(null)
  const [answers, setAnswers] = useState<AnswerItem[]>([])
  const [overallFeedback, setOverallFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [pendingFeedback, setPendingFeedback] = useState<string>('')
  const [showTimeoutAlert, setShowTimeoutAlert] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        const res = await fetch('/api/me')
        const data = await res.json()
        if (data.user?.email) {
          setUserEmail(data.user.email)
        }
      } catch (e) {
        console.error('Failed to fetch user email:', e)
      }
    }
    fetchUserEmail()
  }, [])

  // ── Step 1 → 2: 背景評価完了 ──────────────────────────────
  const handleBackgroundSubmit = (data: BackgroundData) => {
    setBackgroundData(data)
    setStep('domain')
  }

  // ── Step 2 → 3: 設計領域確定・セッション作成 ────────────────
  const handleDomainSubmit = async (domains: string[]) => {
    if (!backgroundData) return
    setSelectedDomains(domains)
    setStep('loading-session')

    try {
      // セッション作成
      const sessionRes = await fetch('/api/design/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...backgroundData, selected_domains: domains }),
      })

      const session = await sessionRes.json()
      if (!sessionRes.ok) throw new Error(session.error ?? 'セッション作成失敗')
      setSessionId(session.id)
      setBackgroundScore(session.background_score)

      const selected: QuestionRow[] = session.questions ?? []
      if (selected.length === 0) {
        throw new Error('問題が見つかりませんでした。設計領域を再選択してください。')
      }
      setQuestions(selected)
      setCurrentIdx(0)
      setAnswers([])
      setStep('question')
    } catch (e) {
      console.error(e)
      alert(`セッションの作成に失敗しました: ${e instanceof Error ? e.message : '不明なエラー'}`)
      setStep('domain')
    }
  }

  const currentQuestion = questions[currentIdx]

  // ── 問題表示 → 回答入力 ─────────────────────────────────────
  const handleQuestionReady = () => setStep('answer')

  // ── 回答送信・AI反馈取得 ─────────────────────────────────────────
  const handleAnswer = async (answer: string) => {
    setCurrentAnswer(answer)
    setStep('loading-eval')

    try {
      const res = await fetch('/api/design/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion.id,
          question_number: currentQuestion.number,
          category: currentQuestion.category,
          question_content: currentQuestion.content,
          complexity: currentQuestion.complexity,
          user_answer: answer,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      // 保存完整の評価結果（採点）
      setCurrentResult(result)
      // フィードバックのみを表示
      setPendingFeedback(result.feedback || '')
      setStep('result')
    } catch (e) {
      console.error(e)
      alert('採点に失敗しました。もう一度お試しください。')
      setStep('answer')
    }
  }

  // ── 回答送信・AI反馈取得（フィードバック非表示で次へ） ────────
  const handleAnswerWithoutFeedback = async (answer: string) => {
    setCurrentAnswer(answer)
    setStep('loading-eval')

    try {
      const res = await fetch('/api/design/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: currentQuestion.id,
          question_number: currentQuestion.number,
          category: currentQuestion.category,
          question_content: currentQuestion.content,
          complexity: currentQuestion.complexity,
          user_answer: answer,
        }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)

      // 評価結果を保存（フィードバックは表示しない）
      setCurrentResult(result)
      setCurrentAnswer(answer)

      // 最後の問題かどうかで判定
      if (currentIdx + 1 >= questions.length) {
        // 最後の問題 → 完了処理へ
        const finalAnswers = [...answers, { question: currentQuestion, answer, result }]
        finishEvaluation(finalAnswers)
      } else {
        // 次の問題へ（結果ページをスキップ）
        setAnswers(prev => [...prev, { question: currentQuestion, answer, result }])
        setCurrentIdx(i => i + 1)
        setCurrentResult(null)
        setCurrentAnswer('')
        setPendingFeedback('')
        setStep('question')
      }
    } catch (e) {
      console.error(e)
      alert('採点に失敗しました。もう一度お試しください。')
      setStep('answer')
    }
  }

  // スキップ（スコア 0）→ 直接進入下一題 or 完了
  const handleSkip = () => {
    if (!sessionId) return
    const skipped: EvalResult = { score: 0, accuracy: 0, completeness: 0, clarity: 0, terminology: 0, feedback: 'スキップしました' }
    const newAnswers = [...answers, { question: currentQuestion, answer: '', result: skipped }]

    // 最後の問題をスキップした場合は、完了処理へ
    if (currentIdx + 1 >= questions.length) {
      finishEvaluation(newAnswers)
      return
    }

    // 通常は次の問題へ
    setAnswers(newAnswers)
    setCurrentIdx(i => i + 1)
    setCurrentResult(null)
    setCurrentAnswer('')
    setPendingFeedback('')
    setStep('question')
  }

  // ── 次の問題へ ────────────────────────────────────────────────
  const handleNext = () => {
    if (!currentResult) return
    setAnswers(prev => [...prev, { question: currentQuestion, answer: currentAnswer, result: currentResult }])
    setCurrentIdx(i => i + 1)
    setCurrentResult(null)
    setCurrentAnswer('')
    setPendingFeedback('')
    setStep('question')
  }

  // ── 完了処理（finalAnswersを受け取って実行） ─────────────────────────
  const finishEvaluation = async (finalAnswers: AnswerItem[]) => {
    setAnswers(finalAnswers)
    setStep('loading-summary')

    try {
      // 問題スコア集計
      const question_scores: Record<string, number> = {}
      finalAnswers.forEach(a => { question_scores[a.question.id] = a.result.score })
      const technicalScore = Object.values(question_scores).reduce((s, v) => s + v, 0)
      const totalScore = backgroundScore + technicalScore
      const pLevel = calcPLevel(totalScore)

      // 総合フィードバック生成（タイムアウト保護: 25秒）
      let overallFeedbackText = ''
      let hasTimeout = false
      try {
        const fbController = new AbortController()
        const fbTimeout = setTimeout(() => fbController.abort(), 25000)

        const fbRes = await fetch('/api/design/evaluate', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selected_domains: selectedDomains,
            total_score: totalScore,
            p_level: pLevel,
            answers_with_scores: finalAnswers.map(a => ({
              questionNumber: a.question.number,
              category: a.question.category,
              content: a.question.content,
              answer: a.answer,
              score: a.result.score,
              feedback: a.result.feedback,
            })),
          }),
          signal: fbController.signal,
        })
        clearTimeout(fbTimeout)

        if (fbRes.ok) {
          const fbData = await fbRes.json()
          overallFeedbackText = fbData.overall_feedback ?? ''
        } else {
          console.warn('[Feedback API Error]', fbRes.status)
        }
      } catch (fbErr) {
        if (fbErr instanceof Error && fbErr.name === 'AbortError') {
          console.warn('[Feedback Generation Timeout] API response took too long')
          hasTimeout = true
        } else {
          console.warn('[Feedback Generation Error]', fbErr)
        }
      }
      setOverallFeedback(overallFeedbackText)
      if (hasTimeout) {
        setShowTimeoutAlert(true)
      }

      // セッション完了 — ステータスを completed に設定（タイムアウト保護: 15秒）
      try {
        const patchController = new AbortController()
        const patchTimeout = setTimeout(() => patchController.abort(), 15000)

        const patchRes = await fetch('/api/design/sessions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            question_scores,
            overall_feedback: overallFeedbackText,
            status: 'completed'
          }),
          signal: patchController.signal,
        })
        clearTimeout(patchTimeout)

        if (!patchRes.ok) {
          const patchErr = await patchRes.json()
          console.error('[PATCH Error]', patchErr)
          console.warn('Failed to update session status, but continuing to summary')
        } else {
          console.log('[Session Completed]', await patchRes.json())
        }
      } catch (patchErr) {
        if (patchErr instanceof Error && patchErr.name === 'AbortError') {
          console.warn('[Session Status Update Timeout]')
        } else {
          console.warn('[Session Status Update Error]', patchErr)
        }
      }

      // サマリーページへ移動 — ここで complete と判定
      setStep('summary')
    } catch (e) {
      console.error('[finishEvaluation Error]', e)
      // エラーが発生しても summary ページは表示
      setStep('summary')
    }
  }

  // ── 全問完了 → 総合フィードバック生成・採点 ─────────────────────────
  const handleFinish = async () => {
    if (!currentResult || !sessionId) return
    const finalAnswers = [...answers, { question: currentQuestion, answer: currentAnswer, result: currentResult }]
    finishEvaluation(finalAnswers)
  }

  const handleRestart = () => {
    setStep('background')
    setBackgroundData(null)
    setSelectedDomains([])
    setSessionId(null)
    setQuestions([])
    setCurrentIdx(0)
    setAnswers([])
    setCurrentResult(null)
    setOverallFeedback('')
    setPendingFeedback('')
  }

  // サマリー用スコア計算
  const summaryScores = (() => {
    const qs: Record<string, number> = {}
    answers.forEach(a => { qs[a.question.id] = a.result.score })
    const technical = Object.values(qs).reduce((s, v) => s + v, 0)
    return { technical, total: backgroundScore + technical, pLevel: calcPLevel(backgroundScore + technical) }
  })()

  const stepLabel: Record<Step, number> = {
    background: 0, domain: 1,
    'loading-session': 1,
    question: 2, answer: 2, 'loading-eval': 2, result: 2,
    'loading-summary': 3, summary: 3,
  }
  const STEPS = ['背景評価', '設計領域', '面談', '結果']

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-lg mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo href="/" />
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">設計コース</span>
          </div>
          <div className="flex items-center gap-4">
            {questions.length > 0 && step !== 'summary' && step !== 'result' && (
              <span className="text-sm text-gray-400">
                {Math.min(currentIdx + 1, questions.length)} / {questions.length} 問
              </span>
            )}
            {currentQuestion && step !== 'background' && step !== 'domain' && (
              <button
                onClick={() => setShowFeedback(true)}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-50"
                title="フィードバック"
              >
                💬
              </button>
            )}
            {userEmail && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                {userEmail}
              </span>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* ステップバー */}
        {step !== 'summary' && (
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className={`flex-1 flex flex-col items-center gap-1`}>
                  <div className={`w-2 h-2 rounded-full ${stepLabel[step] >= i ? 'bg-[#2D5BE3]' : 'bg-gray-200'}`} />
                  <span className={`text-xs ${stepLabel[step] >= i ? 'text-[#2D5BE3]' : 'text-gray-300'}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px ${stepLabel[step] > i ? 'bg-[#2D5BE3]' : 'bg-gray-200'} mb-4`} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ステップ表示 */}
        {step === 'background' && (
          <BackgroundForm onSubmit={handleBackgroundSubmit} />
        )}

        {step === 'domain' && (
          <DomainSelector
            onSubmit={handleDomainSubmit}
            onBack={() => setStep('background')}
          />
        )}

        {step === 'loading-session' && (
          <LoadingDots label="セッションを準備しています..." />
        )}

        {step === 'question' && currentQuestion && (
          <DesignQuestionCard
            question={currentQuestion}
            current={currentIdx + 1}
            total={questions.length}
            onReady={handleQuestionReady}
          />
        )}

        {step === 'answer' && currentQuestion && (
          <DesignAnswerInput
            question={currentQuestion}
            onSubmit={handleAnswer}
            onSkip={handleSkip}
            onSubmitWithoutFeedback={handleAnswerWithoutFeedback}
          />
        )}

        {step === 'loading-eval' && (
          <LoadingDots label="AIが採点しています..." />
        )}

        {step === 'result' && currentQuestion && (
          <DesignResultCard
            question={currentQuestion}
            answer={currentAnswer}
            feedback={pendingFeedback}
            current={currentIdx + 1}
            total={questions.length}
            onNext={handleNext}
            onFinish={handleFinish}
          />
        )}

        {step === 'loading-summary' && (
          <LoadingDots label="総合フィードバックを生成しています..." />
        )}

        {step === 'summary' && (
          <DesignSummary
            backgroundScore={backgroundScore}
            technicalScore={summaryScores.technical}
            totalScore={summaryScores.total}
            pLevel={summaryScores.pLevel}
            selectedDomains={selectedDomains}
            answers={answers}
            overallFeedback={overallFeedback}
            onRestart={handleRestart}
          />
        )}
      </div>

      {/* フィードバックモーダル */}
      {showFeedback && currentQuestion && (
        <FeedbackModal
          questionNumber={currentQuestion.number}
          questionContent={currentQuestion.content}
          onSubmit={() => {
            // 送信完了
          }}
          onClose={() => setShowFeedback(false)}
        />
      )}

      {/* タイムアウトアラート */}
      {showTimeoutAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 shadow-lg">
            <div className="text-center space-y-4">
              <div className="text-3xl">⚠️</div>
              <h3 className="text-lg font-bold text-gray-900">通信タイムアウト</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                フィードバック生成に時間がかかっています。数分待ってからページを更新してください。
              </p>
              <button
                onClick={() => setShowTimeoutAlert(false)}
                className="w-full bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all text-sm"
              >
                了解
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
