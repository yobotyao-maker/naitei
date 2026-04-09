'use client'
import { useState } from 'react'

interface IntroductionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function IntroductionModal({ isOpen, onClose }: IntroductionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#2D5BE3] to-blue-600 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Naitei について</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Introduction */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Naitei とは</h3>
            <p className="text-gray-600 leading-relaxed">
              Naitei は、AI を使った次世代の面接練習プラットフォームです。在日 IT人材のための、本番同様のシミュレーション面接を提供します。
            </p>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">主な機能</h3>
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="text-2xl">🤖</div>
                <div>
                  <p className="font-semibold text-gray-900">AI による本番同様の質問</p>
                  <p className="text-sm text-gray-600">Claude AI が職種や経歴に基づいて、実際の面接に近い質問を生成します。</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">📊</div>
                <div>
                  <p className="font-semibold text-gray-900">設計力評価（P1～P4）</p>
                  <p className="text-sm text-gray-600">技術力、表現力、論理力の 3 つの観点から総合的に評価します。</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <p className="font-semibold text-gray-900">即座のフィードバック</p>
                  <p className="text-sm text-gray-600">回答直後に詳細なフィードバックと改善提案を受け取ります。</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="text-2xl">🏗️</div>
                <div>
                  <p className="font-semibold text-gray-900">設計コース</p>
                  <p className="text-sm text-gray-600">システム設計面接に特化した実践的なコースも用意しています。</p>
                </div>
              </div>
            </div>
          </div>

          {/* Rating System */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">設計力レベル（P-Level）</h3>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">P1 - 設計初心者</p>
                <p className="text-sm text-gray-600">設計基本概念把握、SV指導により Simple 設計担当可</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">P2 - 設計中級者</p>
                <p className="text-sm text-gray-600">Medium 機能を担当可、Backend/Front 設計経験あり</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">P3 - 設計高級者</p>
                <p className="text-sm text-gray-600">Complex 機能を担当可、Front + Backend 設計経験あり、Review 担当可</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900">P4 - 要件担当</p>
                <p className="text-sm text-gray-600">システム要件定義に参画可、ユーザ視点で業務ロジック理解</p>
              </div>
            </div>
          </div>

          {/* How to Use */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">使い方</h3>
            <ol className="space-y-2 text-gray-600">
              <li className="flex gap-3">
                <span className="font-bold text-[#2D5BE3] flex-shrink-0">1.</span>
                <span>職種と経歴を入力して、面接の準備をします</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#2D5BE3] flex-shrink-0">2.</span>
                <span>AI が生成した質問に対して、マイクで回答を録音します</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#2D5BE3] flex-shrink-0">3.</span>
                <span>AI が回答を評価し、スコアとフィードバックを表示します</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-[#2D5BE3] flex-shrink-0">4.</span>
                <span>結果を保存して、次の練習に活かします</span>
              </li>
            </ol>
          </div>

          {/* CTA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-gray-700 mb-3">さあ、面接練習を始めましょう！</p>
            <button
              onClick={onClose}
              className="bg-[#2D5BE3] hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition"
            >
              始める
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
