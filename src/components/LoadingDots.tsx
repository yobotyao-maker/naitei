export default function LoadingDots({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 bg-[#2D5BE3] rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
          />
        ))}
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  )
}
