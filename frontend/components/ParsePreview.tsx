'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ParseResult, SpotCategory, SourceType } from '@/lib/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const CATEGORY_LABELS: Record<SpotCategory, string> = {
  RESTAURANT: '🍽 Restaurant', CAFE: '☕ Café', DESSERT: '🍰 Dessert',
  BAR: '🍸 Bar', HOTEL: '🏨 Hotel', ATTRACTION: '🏛 Attraction',
  MUSEUM: '🖼 Museum', PARK: '🌿 Park', SHOP: '🛍 Shop', OTHER: '📍 Other',
}

const ALL_CATEGORIES: SpotCategory[] = [
  'RESTAURANT', 'CAFE', 'DESSERT', 'BAR', 'HOTEL', 'ATTRACTION', 'MUSEUM', 'PARK', 'SHOP', 'OTHER'
]

interface ParsePreviewProps {
  result: ParseResult
  onSave: (data: {
    name: string; address?: string; city?: string; category: SpotCategory
    coverImageUrl?: string; description?: string; tags: string[]
    originalUrl: string; sourceType: SourceType
  }) => Promise<void>
  onCancel: () => void
}

export default function ParsePreview({ result, onSave, onCancel }: ParsePreviewProps) {
  const [name, setName] = useState(result.name ?? '')
  const [address, setAddress] = useState(result.address ?? '')
  const [city, setCity] = useState(result.city ?? '')
  const [category, setCategory] = useState<SpotCategory>(result.category ?? 'OTHER')
  const [description, setDescription] = useState(result.description ?? '')
  const [tags, setTags] = useState<string[]>(result.suggestedTags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  const isAI = result.sourceType === 'AI_PARSED'

  function addTag(tag: string) {
    const t = tag.trim()
    if (t && !tags.includes(t)) setTags(p => [...p, t])
    setTagInput('')
  }

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({
        name: name.trim(), address: address.trim() || undefined,
        city: city.trim() || undefined, category,
        coverImageUrl: result.coverImageUrl || undefined,
        description: description.trim() || undefined,
        tags, originalUrl: result.originalUrl, sourceType: result.sourceType,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Cover image */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.08)] fade-in-up">
        {result.coverImageUrl ? (
          <div className="relative w-full h-56">
            <Image src={result.coverImageUrl} alt={name} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              {isAI && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary text-white px-2.5 py-1 rounded-full font-semibold shadow-md pulse-glow">
                  ✨ AI filled
                </span>
              )}
              {result.fromCache && (
                <span className="text-xs bg-black/50 text-white px-2.5 py-1 rounded-full backdrop-blur-sm">
                  cached
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <span className="text-5xl opacity-50">{CATEGORY_LABELS[category]?.split(' ')[0]}</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] px-5 py-4 fade-in-up fade-in-up-delay-1">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Place name"
          className="w-full font-headline text-xl font-bold text-on-surface bg-transparent outline-none placeholder:text-on-surface-variant/40 border-b-2 border-transparent focus:border-primary pb-0.5 transition-colors"
        />
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5 fade-in-up fade-in-up-delay-1">
        <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block">
          Description
          {isAI && description && (
            <span className="ml-2 normal-case text-primary font-medium">✨ AI generated</span>
          )}
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="A compelling description of this place…"
          className="w-full bg-surface-container-low rounded-xl px-3.5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none border border-transparent"
        />
      </div>

      {/* Address + City */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5 space-y-4 fade-in-up fade-in-up-delay-2">
        <Input label="Address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street address" />
        <Input label="City" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
      </div>

      {/* Category */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5 fade-in-up fade-in-up-delay-3">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Category</p>
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200',
                category === cat
                  ? 'bg-primary text-white shadow-sm scale-[1.04]'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5 fade-in-up fade-in-up-delay-4">
        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">
          Tags
          {isAI && tags.length > 0 && (
            <span className="ml-2 normal-case text-primary font-medium">✨ AI suggested</span>
          )}
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {tag}
              <button
                type="button"
                onClick={() => setTags(t => t.filter(x => x !== tag))}
                className="hover:text-primary-dim ml-0.5 font-bold leading-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-primary transition-all">
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
              }}
              placeholder="Add tag, press Enter"
              className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
            />
          </div>
          <Button variant="secondary" size="sm" type="button" onClick={() => addTag(tagInput)} disabled={!tagInput.trim()}>
            Add
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-8 fade-in-up fade-in-up-delay-5">
        <Button variant="ghost" size="md" type="button" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!name.trim() || saving}
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
              <span>Save Spot</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
