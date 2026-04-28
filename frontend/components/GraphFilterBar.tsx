'use client'

import { cn } from '@/lib/utils'

const EDGE_TYPES = [
  { type: 'SAME_CATEGORY', label: 'Same Category', color: '#4b3fe2' },
  { type: 'SIMILAR_STYLE', label: 'Similar Style', color: '#9895ff' },
  { type: 'FROM_SAME_SOURCE', label: 'Same Source', color: '#10b981' },
]

interface Props {
  activeTypes: string[]
  onToggle: (type: string) => void
}

export default function GraphFilterBar({ activeTypes, onToggle }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {EDGE_TYPES.map(({ type, label, color }) => {
        const active = activeTypes.includes(type)
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-label transition-all',
              active
                ? 'text-white shadow-sm'
                : 'bg-surface-container text-on-surface-variant'
            )}
            style={active ? { backgroundColor: color } : undefined}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: active ? 'white' : color }}
            />
            {label}
          </button>
        )
      })}
    </div>
  )
}
