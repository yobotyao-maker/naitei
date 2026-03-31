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
import type { Lang } from '@/lib/prompts'

type Step = 'form' | 'loading-q' | 'question' | 'answer' | 'loading-r' | 'result' | 'summary'

const stepIndex: Record<Step, number> = {
  'form': 0, 'loading-q': 0,
  'question': 1,
  'answer': 2, 'loading-r': 2,
  'result': 3, 'summary': 3,
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

  const fetchQuestion = async (role: string, exp: string, l: Lang) => {
    setStep('loading-q')
    const res = await fetch('/api/generate-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobRole: role, experience: exp, lang: l })
    })
    const data = await res.json()
    setQuestion(data.question); setStep('question')
  }

  const handleStart = async (role: string, exp: string, l: Lang) => {
    setJobRole(role); setExperience(exp); setLang(l); setHistory([])
    await fetchQuestion(role, exp, l)
  }

  const handleAnswer = async (answer: string) => {
    setCurrentAnswer(answer); setStep('loading-r')
    const res = await fetch('/api/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobRole, question, answer, lang })
    })
    const data = await res.json()
    setResult(data); setStep('result')
  }

  const handleContinue = async () => {
    setHistory(prev => [...prev, { question, answer: currentAnswer, result }])
    await fetchQuestion(jobRole, experience, lang)
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
          <Link href="/" className="text-gray-900 font-medium text-lg">
            naitei<span className="text-[#2D5BE3]">.ai</span>
          </Link>
          <span className="text-sm text-gray-400">第 {questionCount} 題 / {MAX_QUESTIONS}</span>
        </div>

        {step !== 'summary' && <StepBar current={stepIndex[step]} />}

        {step === 'form'      && <InterviewForm onSubmit={handleStart} />}
        {step === 'loading-q' && <LoadingDots label="AIが質問を考えています..." />}
        {step === 'question'  && <QuestionCard question={question} jobRole={jobRole} lang={lang} onReady={() => setStep('answer')} />}
        {step === 'answer'    && <AnswerInput question={question} lang={lang} onSubmit={handleAnswer} />}
        {step === 'loading-r' && <LoadingDots label="AIが採点しています..." />}
        {step === 'result'    && (
          <ResultCard
            result={result}
            jobRole={jobRole}
            lang={lang}
            questionCount={questionCount}
            onContinue={questionCount < MAX_QUESTIONS ? handleContinue : handleFinish}
            onFinish={handleFinish}
          />
        )}
        {step === 'summary'   && (
          <SummaryCard history={history} jobRole={jobRole} lang={lang} onRestart={handleRestart} />
        )}
      </div>
    </main>
  )
}
