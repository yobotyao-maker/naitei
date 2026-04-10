'use client'
import { useState, useRef, useEffect } from 'react'
import type { Lang } from '@/lib/prompts'

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function AnswerInput({ question, lang, onNext, onFinish }: {
  question: string
  lang: Lang
  onNext: (a: string) => void
  onFinish: (a: string) => void
}) {
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
    r.lang = lang === 'ja' ? 'ja-JP' : 'zh-CN'
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
  }, [lang])

  useEffect(() => {
    if (showText) setTimeout(() => textareaRef.current?.focus(), 100)
  }, [showText])

  const toggleRecording = () => {
    const r = recognitionRef.current
    if (!r) return
    if (recording) { r.stop(); setRecording(false) }
    else { setAnswer(''); r.start(); setRecording(true) }
  }

  const remaining = 500 - answer.length
  const canSubmit = answer.trim().length >= 20 && !recording

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
      <div className="bg-gray-50 rounded-2xl p-4 mb-5">
        <div className="text-xs text-gray-400 mb-1">
          {lang === 'ja' ? '面接質問' : '面试题'}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{question}</p>
      </div>

      {/* 語音録入 */}
      {!unsupported && (
        <div className="flex flex-col items-center mb-5">
          <button
            onClick={toggleRecording}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all shadow-md
              ${recording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-[#2D5BE3] hover:bg-blue-700'}`}
          >
            {recording ? '⏹' : '🎙️'}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            {recording
              ? (lang === 'ja' ? '録音中… もう一度押すと停止' : '录音中… 再按停止')
              : (lang === 'ja' ? 'ボタンを押して回答を録音' : '按下按钮用中文回答')}
          </p>
          {answer && !recording && (
            <div className="mt-4 w-full bg-blue-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
              {answer}
            </div>
          )}
        </div>
      )}

      {/* 文字入力 */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => setShowText(v => !v)}
          className="text-xs text-gray-300 hover:text-gray-400 transition-colors w-full text-center"
        >
          {unsupported
            ? (lang === 'ja'
              ? '⚠️ このブラウザは音声に対応していません。文字入力をご利用ください。'
              : '⚠️ 此浏览器不支持语音，请使用文字输入')
            : (showText
              ? (lang === 'ja' ? '▲ 文字入力を隠す' : '▲ 收起文字输入')
              : (lang === 'ja' ? '▼ または文字で入力' : '▼ 文字输入（测试用）'))}
        </button>
        {showText && (
          <div className="mt-3 relative">
            <textarea
              ref={textareaRef}
              className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-base focus:outline-none focus:border-blue-400 transition resize-none leading-relaxed"
              rows={6}
              maxLength={500}
              placeholder={lang === 'ja'
                ? 'STAR形式（状況・課題・行動・結果）で回答すると高評価になります'
                : 'STAR 格式（情景·任务·行动·结果）回答可获得更高分数'}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <span className={`absolute bottom-3 right-3 text-xs ${remaining < 50 ? 'text-orange-400' : 'text-gray-300'}`}>
              {remaining}
            </span>
          </div>
        )}
      </div>

      {!canSubmit && answer.length > 0 && !recording && (
        <p className="text-xs text-orange-400 mt-2">
          {lang === 'ja' ? 'もう少し詳しく書いてください（20字以上）' : '请至少输入 20 个字符'}
        </p>
      )}

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => canSubmit && onNext(answer)}
          disabled={!canSubmit}
          className="flex-1 bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-4 rounded-2xl transition-colors text-base active:scale-95"
        >
          次の問題 →
        </button>
        <button
          onClick={() => canSubmit && onFinish(answer)}
          disabled={!canSubmit}
          className="flex-1 border border-gray-200 hover:bg-gray-50 disabled:opacity-40 text-gray-600 font-medium py-4 rounded-2xl transition-colors text-base active:scale-95"
        >
          採点して終了
        </button>
      </div>
    </div>
  )
}
