'use client'
import { useState, useRef, useEffect } from 'react'
import HintsTooltip from './HintsTooltip'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

type Hints = {
  template?: string[]
  tips?: string[]
  keywords?: string[]
}

type Props = {
  question: { content: string; hints?: Hints }
  onSubmit: (answer: string) => void
  onSkip: () => void
}

export default function DesignAnswerInput({ question, onSubmit, onSkip }: Props) {
  const [answer, setAnswer] = useState('')
  const [recording, setRecording] = useState(false)
  const [showText, setShowText] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const recognitionRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setUnsupported(true); setShowText(true); return }

    const r = new SR()
    r.lang = 'ja-JP'
    r.continuous = true
    r.interimResults = true

    r.onresult = (e: any) => {
      const transcript = Array.from(e.results as SpeechRecognitionResultList)
        .map((res: SpeechRecognitionResult) => res[0].transcript)
        .join('')
      setAnswer(transcript)
    }
    r.onend = () => setRecording(false)
    recognitionRef.current = r

    return () => { r.abort() }
  }, [])

  useEffect(() => {
    if (showText) setTimeout(() => textareaRef.current?.focus(), 100)
  }, [showText])

  const toggleRecording = () => {
    const r = recognitionRef.current
    if (!r) return
    if (recording) { r.stop(); setRecording(false) }
    else { setAnswer(''); r.start(); setRecording(true) }
  }

  const canSubmit = answer.trim().length >= 10 && !recording

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-5">
      <div>
        <div className="flex items-start justify-between mb-2">
          <h2 className="text-sm font-medium text-gray-500">質問</h2>
          <HintsTooltip hints={question.hints} />
        </div>
        <p className="text-gray-800 text-sm leading-relaxed">{question.content}</p>
      </div>

      {/* 語音録入 */}
      {!unsupported && (
        <div className="flex flex-col items-center bg-gray-50 rounded-2xl py-6 mb-4">
          <button
            onClick={toggleRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all shadow-md
              ${recording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#2D5BE3] hover:bg-blue-700'}`}
          >
            {recording ? '⏹' : '🎙️'}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            {recording
              ? '録音中… もう一度押すと停止'
              : 'ボタンを押して回答を録音'}
          </p>
          {answer && !recording && (
            <div className="mt-4 w-full bg-blue-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed max-w-md">
              {answer}
            </div>
          )}
        </div>
      )}

      {/* 文字入力 */}
      <div>
        <button
          onClick={() => setShowText(v => !v)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          {unsupported
            ? '⚠️ このブラウザは音声に対応していません。文字入力をご利用ください。'
            : (showText ? '▲ 文字入力を隠す' : '▼ または文字で入力')}
        </button>
        {showText && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">あなたの回答</label>
            <textarea
              ref={textareaRef}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="具体的な経験・プロジェクト例を交えて回答してください..."
              rows={6}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none"
            />
            <div className="text-right text-xs text-gray-300 mt-1">{answer.length} 文字</div>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm font-medium py-3 rounded-2xl transition-all"
        >
          スキップ
        </button>
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => onSubmit(answer.trim())}
          className="flex-[3] bg-[#2D5BE3] hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white font-medium py-3 rounded-2xl transition-all"
        >
          採点する →
        </button>
      </div>

      {!canSubmit && answer.length > 0 && !recording && (
        <p className="text-xs text-orange-400">
          もう少し詳しく回答してください（10字以上）
        </p>
      )}
    </div>
  )
}
