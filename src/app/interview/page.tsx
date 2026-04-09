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

type Step = 'form' | 'loading-q' | 'question' | 'answer' | 'scoring' | 'summary' | 'upgrade'

const stepIndex: Record<Step, number> = {
  'form': 0, 'loading-q': 0,
  'question': 1,
  'answer': 2,
  'scoring': 3, 'summary': 3, 'upgrade': 3,
}

const MAX_QUESTIONS = 30

type PendingItem = { question: string; answer: string }

export default function InterviewPage() {
  const [step,          setStep]          = useState<Step>('form')
  const [jobRole,       setJobRole]       = useState('')
  const [experience,    setExperience]    = useState('')
  const [lang,          setLang]          = useState<Lang>('zh')
  const [interviewerEid, setInterviewerEid] = useState('')
  const [intervieweeEid, setIntervieweeEid] = useState('')
  const [question,      setQuestion]      = useState('')
  const [history,       setHistory]       = useState<HistoryItem[]>([])
  const [pending,       setPending]       = useState<PendingItem[]>([])
  const [characterId,   setCharacterId]   = useState<string>('tanaka')
  const [quotaInfo,     setQuotaInfo]     = useState<{ used: number; limit: number }>({ used: 0, limit: 5 })
  const [scoringProgress, setScoringProgress] = useState(0)

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

  const handleStart = async (role: string, exp: string, l: Lang, ivrEid: string, iveeEid: string) => {
    setJobRole(role); setExperience(exp); setLang(l)
    setInterviewerEid(ivrEid); setIntervieweeEid(iveeEid)
    setHistory([]); setPending([])
    await fetchQuestion(role, exp, l, true, 0)
  }

  // 回答保存 → 次の問題へ
  const handleNext = async (answer: string) => {
    const newPending = [...pending, { question, answer }]
    setPending(newPending)
    setStep('question')
    await fetchQuestion(jobRole, experience, lang, false, newPending.length)
  }

  // 回答保存 → 一括採点
  const handleFinish = async (answer: string) => {
    const allPending = [...pending, { question, answer }]
    setPending(allPending)
    await evaluateAll(allPending)
  }

  const evaluateAll = async (items: PendingItem[]) => {
    setStep('scoring')
    setScoringProgress(0)
    const results: HistoryItem[] = []

    for (let i = 0; i < items.length; i++) {
      setScoringProgress(i + 1)
      const { question: q, answer: a } = items[i]
      try {
        const res = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobRole, question: q, answer: a, lang, characterId, interviewerEid, intervieweeEid })
        })
        const data = await res.json()
        results.push({ question: q, answer: a, result: data })
      } catch {
        results.push({ question: q, answer: a, result: { score: 0, level: 'P1', feedback: '採点に失敗しました' } })
      }
    }

    setHistory(results)
    setStep('summary')
  }

  const handleRestart = () => {
    setStep('form'); setHistory([]); setPending([])
    setQuestion(''); setScoringProgress(0)
  }

  const questionCount = pending.length + 1

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <div className="flex items-center gap-4">
            {step !== 'form' && step !== 'summary' && step !== 'scoring' && (
              <span className="text-sm text-gray-400">第 {questionCount} 題 / {MAX_QUESTIONS}</span>
            )}
            <LogoutButton />
          </div>
        </div>

        {step !== 'summary' && step !== 'upgrade' && step !== 'scoring' && (
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

        {step === 'scoring' && (
          <div className="bg-white rounded-3xl p-10 shadow-sm border border-gray-100 text-center">
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">採点中...</h2>
            <p className="text-sm text-gray-400 mb-6">
              {scoringProgress} / {pending.length} 問を採点しました
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#2D5BE3] h-2 rounded-full transition-all duration-500"
                style={{ width: `${pending.length > 0 ? (scoringProgress / pending.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {step === 'summary' && (
          <SummaryCard
            history={history}
            jobRole={jobRole}
            lang={lang}
            interviewerEid={interviewerEid}
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
