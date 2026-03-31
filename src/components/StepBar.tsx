const steps = ['岗位', '题目', '回答', '报告']

export default function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              i < current  ? 'bg-[#2D5BE3] text-white' :
              i === current ? 'bg-[#2D5BE3] text-white ring-4 ring-blue-100' :
              'bg-gray-100 text-gray-400'
            }`}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className={`text-xs ${i === current ? 'text-[#2D5BE3] font-medium' : 'text-gray-400'}`}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mb-4 rounded-full transition-all ${i < current ? 'bg-[#2D5BE3]' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
