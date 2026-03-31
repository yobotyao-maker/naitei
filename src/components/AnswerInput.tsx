'use client'
import { useState, useRef, useEffect } from 'react'
import type { Lang } from '@/lib/prompts'

// 浏览器 SpeechRecognition 类型声明
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export default function AnswerInput({ question, lang, onSubmit }: { question: string; lang: Lang; onSubmit: (a: string) => void }) {
  const [answer, setAnswer] = useState('')
  const [recording, setRecording] = useState(false)
  const [showText, setShowText] = useState(false)
  const [unsupported, setUnsupported] = useState(false)
  const recognitionRef = useRef<any>(null)

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

  const toggleRecording = () => {
    const r = recognitionRef.current
    if (!r) return
    if (recording) {
      r.stop()
      setRecording(false)
    } else {
      setAnswer('')
      r.start()
      setRecording(true)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-400 mb-2">質問</p>
      <p className="text-sm text-gray-700 mb-6 leading-relaxed">{question}</p>

      {/* 语音录入区 */}
      {!unsupported && (
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={toggleRecording}
            disabled={false}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all shadow-md
              ${recording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-[#2D5BE3] hover:bg-blue-700'
              } disabled:bg-gray-200`}
          >
            {recording ? '⏹' : '🎙️'}
          </button>
          <p className="text-xs text-gray-400 mt-3">
            {recording
              ? (lang === 'ja' ? '録音中… もう一度押すと停止' : '录音中… 再按停止')
              : (lang === 'ja' ? 'ボタンを押して日本語で回答' : '按下按钮用中文回答')}
          </p>
          {answer && !recording && (
            <div className="mt-4 w-full bg-blue-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed">
              {answer}
            </div>
          )}
        </div>
      )}

      {/* 文字输入（测试用，默认折叠） */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => setShowText(v => !v)}
          className="text-xs text-gray-300 hover:text-gray-400 transition-colors w-full text-center"
        >
          {unsupported ? '⚠️ 此浏览器不支持语音，请使用文字输入' : (showText ? '▲ 收起文字输入' : '▼ 文字输入（测试用）')}
        </button>
        {showText && (
          <div className="mt-3">
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 transition resize-none"
              rows={5}
              maxLength={500}
              placeholder="文字で回答を入力（テスト用）"
              value={answer}
              onChange={e => setAnswer(e.target.value)}
            />
            <span className="text-xs text-gray-300">{answer.length}/500</span>
          </div>
        )}
      </div>

      <button
        onClick={() => answer.trim() && onSubmit(answer)}
        disabled={!answer.trim() || recording}
        className="mt-5 w-full bg-[#2D5BE3] hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-medium py-3.5 rounded-xl transition-colors"
      >
        採点してもらう →
      </button>
    </div>
  )
}
