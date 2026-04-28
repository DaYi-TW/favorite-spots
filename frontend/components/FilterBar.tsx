'use client'

import { SpotCategory, SpotStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const CATEGORY_OPTIONS: { value: SpotCategory | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'RESTAURANT', label: '🍽 Food' },
  { value: 'CAFE', label: '☕ Café' },
  { value: 'BAR', label: '🍸 Bar' },
  { value: 'ATTRACTION', label: '🏛 Attraction' },
  { value: 'MUSEUM', label: '🖼 Museum' },
  { value: 'PARK', label: '🌿 Park' },
  { value: 'HOTEL', label: '🏨 Hotel' },
  { value: 'SHOP', label: '🛍 Shop' },
]

const STATUS_OPTIONS: { value: SpotStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'WANT_TO_GO', label: '🔖 Want to go' },
  { value: 'VISITED', label: '✅ Visited' },
]

interface FilterBarProps {
  category?: SpotCategory
  status?: SpotStatus
  onCategoryChange: (cat: SpotCategory | undefined) => void
  onStatusChange: (status: SpotStatus | undefined) => void
}

export default function FilterBar({ category, status, onCategoryChange, onStatusChange }: FilterBarProps) {
  return (
    <div className="px-3 pb-3 space-y-2">
      {/* Category chips */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {CATEGORY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onCategoryChange(opt.value ? opt.value : undefined)}
            className={cn(
              'shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200',
              (category ?? '') === opt.value
                ? 'bg-on-surface text-white shadow-sm scale-[1.02]'
                : 'bg-white text-on-surface-variant hover:bg-surface-container-high shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Status chips */}
      <div className="flex gap-1.5">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onStatusChange(opt.value ? opt.value : undefined)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200',
              (status ?? '') === opt.value
                ? 'bg-primary text-white shadow-sm'
                : 'bg-white text-on-surface-variant hover:bg-surface-container-high shadow-[0_1px_3px_rgba(0,0,0,0.08)]'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
