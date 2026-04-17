'use client'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

export default function CourseSelectPage() {
  const router = useRouter()

  const courses = [
    {
      id: 'interview',
      title: '面接練習',
      subtitle: '一般的AI面試',
      description: '通用的技術面試トレーニング\n様々な業界・職種の質問に対応',
      icon: '🎤',
      questions: '10問',
      time: '約30分',
      color: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'design',
      title: '設計コース',
      subtitle: 'システム設計評価',
      description: 'システム設計スキルの総合評価\n背景評価 + 技術問題による采点',
      icon: '📐',
      questions: '10問',
      time: '約40分',
      color: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200',
      buttonColor: 'bg-purple-500 hover:bg-purple-600',
    },
  ]

  const handleSelectCourse = (courseId: string) => {
    if (courseId === 'interview') {
      router.push('/interview')
    } else if (courseId === 'design') {
      router.push('/design')
    }
  }

  return (
    <main className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Logo size="lg" href="/" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">コースを選択</h1>
          <p className="text-gray-500">あなたのキャリアに合わせたコースを選んでください</p>
        </div>

        {/* Course Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`bg-gradient-to-br ${course.color} rounded-3xl p-8 border-2 ${course.borderColor} shadow-sm hover:shadow-lg transition-all cursor-pointer`}
              onClick={() => handleSelectCourse(course.id)}
            >
              {/* Icon */}
              <div className="text-5xl mb-4">{course.icon}</div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{course.subtitle}</p>

              {/* Description */}
              <p className="text-sm text-gray-700 mb-6 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>

              {/* Info */}
              <div className="flex gap-4 mb-6 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <span>📝</span>
                  <span>{course.questions}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-600">
                  <span>⏱️</span>
                  <span>{course.time}</span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => handleSelectCourse(course.id)}
                className={`w-full ${course.buttonColor} text-white font-medium py-3 rounded-xl transition-colors`}
              >
                {course.title}を開始 →
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <button
            onClick={() => window.location.href = '/'}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← ホームに戻る
          </button>
        </div>
      </div>
    </main>
  )
}
