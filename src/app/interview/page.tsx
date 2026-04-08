'use client'
import { useState } from 'react'
import Link from 'next/link'
import InterviewForm from '@/components/InterviewForm'
import QuestionCard from '@/components/QuestionCard'
import AnswerInput from '@/components/AnswerInput'
import ResultCard from '@/components/ResultCard'
import SummaryCard, { type HistoryItem } from '@/components/SummaryCard'
import StepBar from '@/components/StepBar'
import LoadingDots from '@/components/LoadingDots'
import UpgradePrompt from '@/components/UpgradePrompt'
import type { Lang } from '@/lib/prompts'
import { CATEGORY_TO_CHARACTER, type QuestionCategory } from '@/components/manga/manga-design-system'
import LogoutButton from '@/components/LogoutButton'
import Logo from '@/components/Logo'

type Step = 'form' | 'loading-q' | 'question' | 'answer' | 'loading-r' | 'result' | 'summary' | 'upgrade'

const stepIndex: Record<Step, number> = {
  'form': 0, 'loading-q': 0,
  'question': 1,
  'answer': 2, 'loading-r': 2,
  'result': 3, 'summary': 3, 'upgrade': 3,
}

const MAX_QUESTIONS = 30

export default function InterviewPage() {
  const [step, setStep] = useState<Step>('form')
  const [jobRole, setJobRole] = useState('')
  const [experience, setExperience] = useState('')
  const [lang, setLang] = useState<Lang>('zh')
  const [question, setQuestion] = useState('')
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [quotaInfo, setQuotaInfo] = useState<{ used: number; limit: number }>({ used: 0, limit: 5 })
  const [characterId, setCharacterId] = useState<string>('tanaka')

  // 根据问题在会话中的位置轮换角色
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
      setQuestion(data.question); setStep('question')
    } catch {
      setStep('form')
      alert('質問の生成に失敗しました。もう一度お試しください。')
    }
  }

  const handleStart = async (role: string, exp: string, l: Lang) => {
    setJobRole(role); setExperience(exp); setLang(l); setHistory([])
    await fetchQuestion(role, exp, l, true, 0)
  }

  const handleAnswer = async (answer: string) => {
    setCurrentAnswer(answer); setStep('loading-r')
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobRole, question, answer, lang, characterId })
      })
      const data = await res.json()
      if (res.status === 402) {
        setQuotaInfo({ used: data.used, limit: data.limit })
        setStep('upgrade')
        return
      }
      if (!res.ok) throw new Error(data.error ?? 'Failed to evaluate')
      setResult(data); setStep('result')
    } catch {
      setStep('answer')
      alert('採点に失敗しました。もう一度お試しください。')
    }
  }

  const handleContinue = async () => {
    const nextIndex = history.length + 1
    setHistory(prev => [...prev, { question, answer: currentAnswer, result }])
    await fetchQuestion(jobRole, experience, lang, false, nextIndex)
  }

  const handleFinish = () => {
    setHistory(prev => [...prev, { question, answer: currentAnswer, result }])
    setStep('summary')
  }

  const handleRestart = () => {
    setStep('form'); setResult(null); setQuestion(''); setHistory([]); setCurrentAnswer('')
  }

  const questionCount = history.length + 1

  return (
    <main className="min-h-screen bg-[#F5F6FA] px-4 py-10">
      <div className="w-full max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Logo />
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">第 {questionCount} 題 / {MAX_QUESTIONS}</span>
            <LogoutButton />
          </div>
        </div>

        {step !== 'summary' && step !== 'upgrade' && <StepBar current={stepIndex[step]} />}

        {step === 'form'      && <InterviewForm onSubmit={handleStart} />}
        {step === 'loading-q' && <LoadingDots label="AIが質問を考えています..." />}
        {step === 'question'  && <QuestionCard question={question} jobRole={jobRole} lang={lang} characterId={characterId} onReady={() => setStep('answer')} />}
        {step === 'answer'    && <AnswerInput question={question} lang={lang} onSubmit={handleAnswer} />}
        {step === 'loading-r' && <LoadingDots label="AIが採点しています..." />}
        {step === 'result'    && (
          <ResultCard
            result={result}
            jobRole={jobRole}
            lang={lang}
            questionCount={questionCount}
            characterId={characterId}
            onContinue={questionCount < MAX_QUESTIONS ? handleContinue : handleFinish}
            onFinish={handleFinish}
          />
        )}
        {step === 'summary'   && (
          <SummaryCard history={history} jobRole={jobRole} lang={lang} onRestart={handleRestart} />
        )}
        {step === 'upgrade'   && (
          <UpgradePrompt used={quotaInfo.used} limit={quotaInfo.limit} onBack={handleRestart} />
        )}
      </div>
    </main>
  )
}
