'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { SpotParseItem, SpotCategory } from '@/lib/types'

const CATEGORY_LABELS: Record<SpotCategory, string> = {
  RESTAURANT: '🍽 Restaurant', CAFE: '☕ Café', DESSERT: '🍰 Dessert',
  BAR: '🍸 Bar', HOTEL: '🏨 Hotel', ATTRACTION: '🏛 Attraction',
  MUSEUM: '🖼 Museum', PARK: '🌿 Park', SHOP: '🛍 Shop', OTHER: '📍 Other',
}

interface MultiSpotPreviewProps {
  spots: SpotParseItem[]
  originalUrl: string
  onSave: (selected: SpotParseItem[]) => Promise<void>
  onCancel: () => void
}

export default function MultiSpotPreview({ spots, originalUrl, onSave, onCancel }: MultiSpotPreviewProps) {
  const [checked, setChecked] = useState<Set<number>>(() => new Set(spots.map((_, i) => i)))
  const [saving, setSaving] = useState(false)

  function toggle(i: number) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  function toggleAll() {
    setChecked(checked.size === spots.length ? new Set() : new Set(spots.map((_, i) => i)))
  }

  async function handleSave() {
    const selected = spots.filter((_, i) => checked.has(i))
    if (selected.length === 0) return
    setSaving(true)
    try {
      await onSave(selected)
    } finally {
      setSaving(false)
    }
  }

  const selectedCount = checked.size

  return (
    <div className="space-y-4">
      {/* Header summary */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] px-5 py-4 fade-in-up">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h2 className="font-headline text-lg font-black text-on-surface">
              {spots.length} spots found
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5 truncate max-w-[220px]">
              from {new URL(originalUrl).hostname}
            </p>
          </div>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs font-semibold text-primary hover:underline shrink-0"
          >
            {checked.size === spots.length ? 'Deselect all' : 'Select all'}
          </button>
        </div>
        <p className="text-xs text-on-surface-variant mt-2">
          <span className="font-bold text-on-surface">{selectedCount}</span> selected — tap a card to toggle
        </p>
      </div>

      {/* Spot cards */}
      <div className="space-y-3">
        {spots.map((spot, i) => {
          const isSelected = checked.has(i)
          const emoji = CATEGORY_LABELS[spot.category]?.split(' ')[0] ?? '📍'
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className={cn(
                'w-full text-left rounded-2xl overflow-hidden transition-all duration-200 fade-in-up',
                isSelected
                  ? 'shadow-[0_0_0_2px_#4b3fe2,0_4px_16px_rgba(75,63,226,0.15)]'
                  : 'shadow-[0_2px_8px_rgba(0,0,0,0.07)] opacity-60'
              )}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="bg-white flex items-stretch gap-0">
                {/* Image or placeholder */}
                <div className="relative w-24 shrink-0">
                  {spot.coverImageUrl ? (
                    <Image
                      src={spot.coverImageUrl}
                      alt={spot.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center min-h-[88px]">
                      <span className="text-3xl opacity-50">{emoji}</span>
                    </div>
                  )}
                  {/* Overlay dimmer when deselected */}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-white/40" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 px-3.5 py-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-headline font-bold text-sm text-on-surface leading-snug line-clamp-2">
                        {spot.name}
                      </p>
                      {spot.city && (
                        <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">
                          📍 {spot.city}
                        </p>
                      )}
                    </div>
                    {/* Checkbox */}
                    <div className={cn(
                      'mt-0.5 shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                      isSelected
                        ? 'bg-primary border-primary'
                        : 'border-outline-variant bg-white'
                    )}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-medium">
                      {CATEGORY_LABELS[spot.category]}
                    </span>
                    {spot.suggestedTags.slice(0, 2).map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-8 fade-in-up">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-12 rounded-xl bg-surface-container text-on-surface-variant text-sm font-bold hover:bg-surface-container-high transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={selectedCount === 0 || saving}
          className="flex-1 h-12 rounded-xl btn-primary-gradient text-white text-sm font-bold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <span>📍</span>
              <span>Save {selectedCount} spot{selectedCount !== 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
