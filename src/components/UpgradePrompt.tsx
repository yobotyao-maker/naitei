'use client'

export default function UpgradePrompt({ used, limit, onBack }: {
  used: number
  limit: number
  onBack: () => void
}) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
      <div className="text-4xl mb-4">🎉</div>
      <h2 className="text-xl font-medium text-gray-900 mb-2">全機能が無料で利用可能です</h2>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">
        Naitei はすべてのユーザーに<br/>完全無料でご提供しています。<br/>
        引き続き練習をお楽しみください！
      </p>

      <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-6">
        <p className="text-sm font-medium text-green-700">
          ✓ 面接練習 無制限
        </p>
        <p className="text-sm font-medium text-green-700">
          ✓ 設計コース 無制限
        </p>
        <p className="text-sm font-medium text-green-700">
          ✓ 全機能 利用可能
        </p>
      </div>

      <button
        onClick={onBack}
        className="w-full bg-[#2D5BE3] hover:bg-blue-700 text-white text-sm font-medium py-3 rounded-xl transition-colors"
      >
        練習を続ける →
      </button>
    </div>
  )
}
