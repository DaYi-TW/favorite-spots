import { Spot } from '@/lib/types'
import SpotCard from './SpotCard'
import Link from 'next/link'

const ONBOARDING_TIPS = [
  { emoji: '📸', text: 'Paste an Instagram link' },
  { emoji: '🗺', text: 'Drop a Google Maps URL' },
  { emoji: '🎵', text: 'Share from TikTok' },
  { emoji: '🌐', text: 'Any website link works' },
]

function EmptyState() {
  return (
    <div className="flex flex-col items-center px-6 pt-8 pb-16 text-center">
      {/* Hero illustration */}
      <div className="relative mb-8 fade-in-up">
        <div className="w-28 h-28 rounded-full btn-primary-gradient flex items-center justify-center shadow-2xl pulse-glow">
          <span className="text-5xl">🗺️</span>
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-xl">
          ✨
        </div>
      </div>

      <h2 className="font-headline text-2xl font-black text-on-surface mb-2 fade-in-up fade-in-up-delay-1">
        Your collection is empty
      </h2>
      <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed mb-8 fade-in-up fade-in-up-delay-2">
        Start building your personal atlas. Add any place you love — Curator's AI will handle the rest.
      </p>

      {/* Supported sources */}
      <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs mb-8 fade-in-up fade-in-up-delay-3">
        {ONBOARDING_TIPS.map(tip => (
          <div key={tip.text} className="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 shadow-sm text-left">
            <span className="text-xl shrink-0">{tip.emoji}</span>
            <span className="text-xs font-medium text-on-surface">{tip.text}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="fade-in-up fade-in-up-delay-4">
        <Link
          href="/spots/new"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full btn-primary-gradient text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all active:scale-95"
        >
          <span>✨</span>
          <span>Add your first spot</span>
        </Link>
        <p className="text-xs text-on-surface-variant mt-3">
          Takes less than 10 seconds
        </p>
      </div>
    </div>
  )
}

export default function SpotGrid({ spots }: { spots: Spot[] }) {
  if (spots.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="masonry px-3 pt-3 pb-6">
      {spots.map((spot, i) => (
        <div key={spot.id} className="masonry-item" style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
          <SpotCard spot={spot} />
        </div>
      ))}
    </div>
  )
}
