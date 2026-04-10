'use client'
import { useState } from 'react'
import Link from 'next/link'
import InterviewForm from '@/components/InterviewForm'
import QuestionCard from '@/components/QuestionCard'
import AnswerInput from '@/components/AnswerInput'
import SummaryCard, { type HistoryItem } from '@/components/SummaryCard'
import StepBar from '@/components/StepBar'
import LoadingDots from '@/components/LoadingDots'
import UpgradePrompt from '@/components/UpgradePrompt'
import type { Lang } from '@/lib/prompts'
import { CATEGORY_TO_CHARACTER, type QuestionCategory } from '@/components/manga/manga-design-system'
import LogoutButton from '@/components/LogoutButton'
import Logo from '@/components/Logo'

type Step = 'form' | 'loading-q' | 'question' | 'answer' | 'evaluating' | 'result' | 'summary' | 'upgrade'

const stepIndex: Record<Step, number> = {
  'form': 0, 'loading-q': 0,
  'question': 1,
  'answer': 2,
  'evaluating': 2, 'result': 2,
  'summary': 3, 'upgrade': 3,
}

const MAX_QUESTIONS = 30

type PendingItem = { question: string; answer: string }
type ResultItem = { question: string; answer: string; result: any }

export default function InterviewPage() {
  const [step,          setStep]          = useState<Step>('form')
  const [jobRole,       setJobRole]       = useState('')
  const [experience,    setExperience]    = useState('')
  const [lang,          setLang]          = useState<Lang>('zh')
  const [intervieweeEid, setIntervieweeEid] = useState('')
  const [question,      setQuestion]      = useState('')
  const [history,       setHistory]       = useState<HistoryItem[]>([])
  const [pending,       setPending]       = useState<PendingItem[]>([])
  const [characterId,   setCharacterId]   = useState<string>('tanaka')
  const [quotaInfo,     setQuotaInfo]     = useState<{ used: number; limit: number }>({ used: 0, limit: 5 })
  const [currentResult, setCurrentResult] = useState<ResultItem | null>(null)

  function pickCharacter(index: number): string {
    const rotation: QuestionCategory[] = [
      'technical', 'culture', 'process', 'governance', 'vision',
      'algorithm', 'motivation', 'agile', 'risk', 'leadership',
    ]
    const cat = rotation[index % rotation.length]
    return CATEGORY_TO_CHARACTER[cat]
  }

  const fetchQuestion = async (role: string, exp: string, l: Lang, isFirst = false, questionIndex = 0) => {
    const nextChar = pickCharacter(questionIndex)
    setCharacterId(nextChar)
    setStep('loading-q')
    try {
      const res = await fetch('/api/generate-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobRole: role, experience: exp, lang: l, isFirst, characterId: nextChar })
      })
      const data = await res.json()
      if (res.status === 402) {
        setQuotaInfo({ used: data.used, limit: data.limit })
        setStep('upgrade')
        return
      }
      if (!res.ok || !data.question) throw new Error(data.error ?? 'Failed to generate question')
      setQuestion(data.question)
      setStep('answer')
    } catch {
      setStep('form')
      alert('質問の生成に失敗しました。もう一度お試しください。')
    }
  }

  const handleStart = async (role: string, exp: string, l: Lang, iveeEid: string) => {
    setJobRole(role); setExperience(exp); setLang(l)
    setIntervieweeEid(iveeEid)
    setHistory([]); setPending([])
    await fetchQuestion(role, exp, l, true, 0)
  }

  // 1問評点
  const evaluateOne = async (q: string, a: string) => {
    setStep('evaluating')
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobRole, question: q, answer: a, lang, characterId, intervieweeEid })
      })
      const data = await res.json()
      setCurrentResult({ question: q, answer: a, result: data })
      setStep('result')
    } catch {
      setCurrentResult({ question: q, answer: a, result: { score: 0, level: 'P1', feedback: '採点に失敗しました' } })
      setStep('result')
    }
  }

  // 回答保存 → 評点 → 次の問題へ
  const handleNext = async (answer: string) => {
    const newPending = [...pending, { question, answer }]
    setPending(newPending)
    await evaluateOne(question, answer)
  }

  // 回答保存 → 評点 → 完了
  const handleFinish = async (answer: string) => {
    const allPending = [...pending, { question, answer }]
    setPending(allPending)
    await evaluateOne(question, answer)
  }

  // 評点済み結果から次の問題へ
  const handleResultNext = async () => {
    const newHistory = [...history]
    if (currentResult) {
      newHistory.push({
        question: currentResult.question,
        answer: currentResult.answer,
        result: currentResult.result
      })
    }
    setHistory(newHistory)
    setCurrentResult(null)
    setStep('question')
    await fetchQuestion(jobRole, experience, lang, false, pending.length + 1)
  }

  // 評点済み結果から完了へ
  const handleResultFinish = () => {
    const newHistory = [...history]
    if (currentResult) {
      newHistory.push({
        question: currentResult.question,
        answer: currentResult.answer,
        result: currentResult.result
      })
    }
    setHistory(newHistory)
    setCurrentResult(null)
    setStep('summary')
  }

  const handleRestart = () => {
    setStep('form'); setHistory([]); setPending([])
    setQuestion(''); setCurrentResult(null)
  }

  const questionCount = pending.length + 1

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <div className="flex items-center gap-4">
            {step !== 'form' && step !== 'summary' && step !== 'evaluating' && step !== 'result' && (
              <span className="text-sm text-gray-400">第 {questionCount} 題 / {MAX_QUESTIONS}</span>
            )}
            <LogoutButton />
          </div>
        </div>

        {step !== 'summary' && step !== 'upgrade' && step !== 'evaluating' && step !== 'result' && (
          <StepBar current={stepIndex[step]} />
        )}

        {step === 'form' && <InterviewForm onSubmit={handleStart} />}

        {step === 'loading-q' && <LoadingDots label="AIが質問を考えています..." />}

        {step === 'question' && (
          <QuestionCard
            question={question}
            jobRole={jobRole}
            lang={lang}
            characterId={characterId}
            onReady={() => setStep('answer')}
          />
        )}

        {step === 'answer' && (
          <AnswerInput
            question={question}
            lang={lang}
            onNext={handleNext}
            onFinish={handleFinish}
          />
        )}

        {step === 'evaluating' && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">採点中...</h2>
            <p className="text-sm text-gray-400 mb-6">AIが回答を評価しています</p>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div className="bg-[#2D5BE3] h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        {step === 'result' && currentResult && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
            <div>
              <h2 className="text-sm font-medium text-gray-500 mb-2">質問</h2>
              <p className="text-gray-800 text-sm leading-relaxed">{currentResult.question}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">あなたの回答</h3>
              <div className="bg-blue-50 rounded-2xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
                {currentResult.answer || '（スキップ）'}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-2xl">
              {[
                { label: '正確性', value: currentResult.result.accuracy },
                { label: '網羅性', value: currentResult.result.completeness },
                { label: '明瞭性', value: currentResult.result.clarity },
                { label: '専門用語', value: currentResult.result.terminology },
              ].map(k => k.value !== undefined && (
                <div key={k.label} className="text-center">
                  <div className="text-lg font-bold text-gray-900">{k.value}</div>
                  <div className="text-xs text-gray-500">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-blue-700">総合評価</p>
                <span className="text-2xl font-bold text-[#2D5BE3]">{currentResult.result.score}</span>
              </div>
              {currentResult.result.feedback && (
                <p className="text-sm text-blue-800 leading-relaxed">{currentResult.result.feedback}</p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {pending.length < MAX_QUESTIONS ? (
                <button
                  onClick={handleResultNext}
                  className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all text-sm"
                >
                  次の問題へ →
                </button>
              ) : (
                <>
                  <button
                    onClick={handleResultNext}
                    className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 rounded-2xl transition-all text-sm"
                  >
                    戻る
                  </button>
                  <button
                    onClick={handleResultFinish}
                    className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 text-white font-medium py-3 rounded-2xl transition-all text-sm"
                  >
                    完了 →
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 'summary' && (
          <SummaryCard
            history={history}
            jobRole={jobRole}
            lang={lang}
            intervieweeEid={intervieweeEid}
            onRestart={handleRestart}
          />
        )}

        {step === 'upgrade' && (
          <UpgradePrompt used={quotaInfo.used} limit={quotaInfo.limit} onBack={handleRestart} />
        )}
      </div>
    </main>
  )
}
