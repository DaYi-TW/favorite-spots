'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { graphApi, spotsApi, photosApi, collectionsApi } from '@/lib/api'
import { Spot, SpotStatus, SpotPhoto, Collection } from '@/lib/types'
import Button from '@/components/ui/Button'
import PhotoGallery from '@/components/PhotoGallery'
import { cn } from '@/lib/utils'

const STATUS_CYCLE: SpotStatus[] = ['WANT_TO_GO', 'VISITED']
const STATUS_CONFIG: Record<SpotStatus, { label: string; bg: string; dot: string; nextLabel: string }> = {
  WANT_TO_GO: { label: 'Want to go', bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400', nextLabel: 'Mark visited' },
  VISITED:    { label: 'Visited',    bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400', nextLabel: 'Move to wishlist' },
}

const CATEGORY_EMOJI: Record<string, string> = {
  RESTAURANT: '🍽', CAFE: '☕', BAR: '🍸', MUSEUM: '🖼',
  PARK: '🌿', HOTEL: '🏨', SHOP: '🛍', ATTRACTION: '🏛', DESSERT: '🍰', OTHER: '📍',
}

const CATEGORY_GRADIENT: Record<string, string> = {
  RESTAURANT: 'from-orange-400/20 to-red-400/20',
  CAFE: 'from-amber-400/20 to-yellow-300/20',
  BAR: 'from-purple-400/20 to-indigo-400/20',
  MUSEUM: 'from-slate-400/20 to-zinc-300/20',
  PARK: 'from-green-400/20 to-emerald-300/20',
  HOTEL: 'from-blue-400/20 to-cyan-300/20',
  SHOP: 'from-pink-400/20 to-rose-300/20',
  ATTRACTION: 'from-indigo-400/20 to-blue-300/20',
  DESSERT: 'from-pink-300/20 to-orange-200/20',
  OTHER: 'from-primary/10 to-secondary/10',
}

function StarRating({ value, onChange }: { value?: number; onChange: (n: number | undefined) => void }) {
  const [hover, setHover] = useState<number | undefined>()
  const display = hover ?? value ?? 0
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(value === n ? undefined : n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(undefined)}
          className={cn(
            'w-11 h-11 rounded-full text-xl font-bold transition-all duration-150 active:scale-90',
            display >= n
              ? 'bg-amber-400 text-white shadow-md scale-[1.05]'
              : 'bg-surface-container text-on-surface-variant hover:bg-amber-50 hover:text-amber-400'
          )}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function SpotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [spot, setSpot] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(true)
  const [editNote, setEditNote] = useState(false)
  const [note, setNote] = useState('')
  const [rating, setRating] = useState<number | undefined>()
  const [ratingDirty, setRatingDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [description, setDescription] = useState('')
  const [editDescription, setEditDescription] = useState(false)
  const [generatingDesc, setGeneratingDesc] = useState(false)
  const [relatedSpots, setRelatedSpots] = useState<Spot[]>([])
  const [photos, setPhotos] = useState<SpotPhoto[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [showAddToCollection, setShowAddToCollection] = useState(false)
  const [addedToCollection, setAddedToCollection] = useState<string | null>(null)

  useEffect(() => {
    spotsApi.getById(id).then(data => {
      setSpot(data)
      setNote(data.personalNote ?? '')
      setRating(data.personalRating)
      setDescription(data.description ?? '')
      setLoading(false)
    }).catch(() => router.push('/feed'))
  }, [id, router])

  useEffect(() => {
    graphApi.getRelatedSpots(id).then(setRelatedSpots).catch(() => {})
    photosApi.list(id).then(setPhotos).catch(() => {})
    collectionsApi.list().then(setCollections).catch(() => {})
  }, [id])

  async function handleStatusToggle() {
    if (!spot) return
    const idx = STATUS_CYCLE.indexOf(spot.status)
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
    setSpot(await spotsApi.updateStatus(id, next))
  }

  async function handleSaveNote() {
    if (!spot) return
    setSaving(true)
    try {
      setSpot(await spotsApi.update(id, { personalNote: note, personalRating: rating as number | undefined }))
      setEditNote(false)
      setRatingDirty(false)
    } finally { setSaving(false) }
  }

  async function handleRatingChange(n: number | undefined) {
    setRating(n)
    setRatingDirty(true)
  }

  async function handleDelete() {
    setDeleting(true)
    try { await spotsApi.delete(id); router.push('/feed') }
    finally { setDeleting(false) }
  }

  async function handleSaveDescription() {
    if (!spot) return
    setSaving(true)
    try {
      const updated = await spotsApi.update(id, { description: description || undefined })
      setSpot(updated)
      setEditDescription(false)
    } finally { setSaving(false) }
  }

  async function handleGenerateDescription() {
    setGeneratingDesc(true)
    try {
      const updated = await spotsApi.generateDescription(id)
      setSpot(updated)
      setDescription(updated.description ?? '')
    } finally { setGeneratingDesc(false) }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant">Loading…</p>
        </div>
      </div>
    )
  }

  if (!spot) return null

  const statusCfg = STATUS_CONFIG[spot.status]
  const emoji = CATEGORY_EMOJI[spot.category] ?? '📍'
  const gradient = CATEGORY_GRADIENT[spot.category] ?? CATEGORY_GRADIENT.OTHER

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-16">
      {/* Sticky nav */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-white/90 backdrop-blur-md px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <button
          onClick={() => router.back()}
          className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 font-medium"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          <Link
            href={`/spots/${spot.id}/graph`}
            className="text-xs text-primary font-semibold flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/8 hover:bg-primary/15 transition-colors"
          >
            🕸️ Graph
          </Link>
        </div>
      </div>

      {/* Hero cover */}
      <div className="relative w-full" style={{ height: spot.coverImageUrl ? 300 : 160 }}>
        {spot.coverImageUrl ? (
          <>
            <Image src={spot.coverImageUrl} alt={spot.name} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            {/* Title overlay on image */}
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{emoji}</span>
                <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">{spot.category.toLowerCase()}</span>
              </div>
              <h1 className="font-headline text-2xl font-black text-white leading-tight drop-shadow-md">
                {spot.name}
              </h1>
              {spot.address && (
                <p className="text-sm text-white/70 mt-0.5">📍 {spot.address}</p>
              )}
            </div>
          </>
        ) : (
          <div className={cn('w-full h-full bg-gradient-to-br flex flex-col items-center justify-center', gradient)}>
            <span className="text-7xl opacity-30 mb-2">{emoji}</span>
          </div>
        )}
      </div>

      <div className="max-w-lg mx-auto px-3 space-y-3 -mt-4 relative z-10">

        {/* Title card — shown only when no cover image (title is in the overlay otherwise) */}
        {!spot.coverImageUrl && (
          <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] p-5 fade-in-up">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{emoji}</span>
              <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{spot.category.toLowerCase()}</span>
            </div>
            <h1 className="font-headline text-2xl font-black text-on-surface leading-tight mb-2">
              {spot.name}
            </h1>
            {spot.address && (
              <p className="text-sm text-on-surface-variant">📍 {spot.address}</p>
            )}
          </div>
        )}

        {/* Status + Tags action card */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.10)] p-4 fade-in-up fade-in-up-delay-1">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Status toggle */}
            <button
              onClick={handleStatusToggle}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all hover:opacity-80 active:scale-95',
                statusCfg.bg
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', statusCfg.dot)} />
              {statusCfg.label}
              <span className="text-xs opacity-60 font-normal">tap to change</span>
            </button>

            {/* City */}
            {spot.city && (
              <span className="text-sm text-on-surface-variant font-medium">
                🏙 {spot.city}
              </span>
            )}
          </div>

          {/* Tags */}
          {spot.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {spot.tags.map(tag => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Description card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 fade-in-up fade-in-up-delay-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">About this place</p>
            <div className="flex items-center gap-3">
              {!editDescription && (
                <button
                  onClick={handleGenerateDescription}
                  disabled={generatingDesc}
                  className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {generatingDesc ? (
                    <><span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> Generating…</>
                  ) : (
                    <>✨ {spot.description ? 'Regenerate' : 'Generate with AI'}</>
                  )}
                </button>
              )}
              {!editDescription && (
                <button
                  type="button"
                  className="text-xs text-primary font-semibold hover:underline"
                  onClick={() => setEditDescription(true)}
                >
                  {spot.description ? 'Edit' : '+ Add'}
                </button>
              )}
            </div>
          </div>

          {editDescription ? (
            <>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={5}
                className="w-full rounded-xl bg-surface-container-low border border-transparent px-3.5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Describe this place — what makes it special, what to expect, what to try…"
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={() => { setEditDescription(false); setDescription(spot.description ?? '') }}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveDescription} loading={saving}>
                  Save
                </Button>
              </div>
            </>
          ) : spot.description ? (
            <p className="text-sm text-on-surface leading-relaxed">{spot.description}</p>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-sm text-on-surface-variant/60 text-center">
                No description yet.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleGenerateDescription}
                  disabled={generatingDesc}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full btn-primary-gradient text-white text-xs font-bold shadow-sm hover:shadow-md disabled:opacity-50 transition-all active:scale-95"
                >
                  {generatingDesc ? (
                    <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Generating…</>
                  ) : (
                    <>✨ Generate with AI</>
                  )}
                </button>
                <button
                  onClick={() => setEditDescription(true)}
                  className="px-4 py-2 rounded-full bg-surface-container text-xs font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
                >
                  Write manually
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Rating card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 fade-in-up fade-in-up-delay-2">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Your Rating</p>
          <StarRating value={rating} onChange={handleRatingChange} />
          {ratingDirty && (
            <button
              onClick={handleSaveNote}
              className="mt-3 text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              {saving
                ? <><span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> Saving…</>
                : '✓ Save rating'}
            </button>
          )}
          {rating && !ratingDirty && (
            <p className="mt-2 text-xs text-on-surface-variant">
              {'★'.repeat(rating)}{'☆'.repeat(5 - rating)} — {['', 'Terrible', 'Okay', 'Good', 'Great', 'Must-visit'][rating]}
            </p>
          )}
        </div>

        {/* Note card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 fade-in-up fade-in-up-delay-3">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Personal Note</p>
            {!editNote && (
              <button type="button" className="text-xs text-primary font-semibold hover:underline" onClick={() => setEditNote(true)}>
                {spot.personalNote ? 'Edit' : '+ Add note'}
              </button>
            )}
          </div>
          {editNote ? (
            <>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                rows={4}
                className="w-full rounded-xl bg-surface-container-low border border-transparent px-3.5 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Your thoughts, what to order, who to bring…"
                autoFocus
              />
              <div className="flex gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={() => { setEditNote(false); setNote(spot.personalNote ?? '') }}>Cancel</Button>
                <Button variant="primary" size="sm" onClick={handleSaveNote} loading={saving}>Save</Button>
              </div>
            </>
          ) : spot.personalNote ? (
            <p className="text-sm text-on-surface leading-relaxed bg-surface-container-low rounded-xl px-3.5 py-3 italic">
              "{spot.personalNote}"
            </p>
          ) : (
            <button
              onClick={() => setEditNote(true)}
              className="w-full text-sm text-on-surface-variant/60 italic text-left px-3.5 py-3 rounded-xl bg-surface-container-low border-2 border-dashed border-outline-variant hover:border-primary hover:text-on-surface-variant transition-colors"
            >
              Tap to add a personal note…
            </button>
          )}
        </div>

        {/* Related spots */}
        {relatedSpots.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 fade-in-up fade-in-up-delay-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">You might also like</p>
              <Link href={`/spots/${spot.id}/graph`} className="text-xs text-primary font-semibold">
                See in graph →
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {relatedSpots.map(related => (
                <button
                  key={related.id}
                  onClick={() => router.push(`/spots/${related.id}`)}
                  className="shrink-0 w-28 rounded-xl bg-surface-container overflow-hidden text-left hover:shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  {related.coverImageUrl ? (
                    <div className="relative w-full h-20">
                      <Image src={related.coverImageUrl} alt={related.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-full h-20 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center text-2xl">
                      {CATEGORY_EMOJI[related.category] ?? '📍'}
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-on-surface line-clamp-2 leading-snug">{related.name}</p>
                    {related.city && <p className="text-[10px] text-on-surface-variant mt-0.5">{related.city}</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Photos card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 fade-in-up">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Photos</p>
          <PhotoGallery spotId={id} photos={photos} onPhotosChange={setPhotos} />
        </div>

        {/* Add to Collection */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Collections</p>
            <button onClick={() => setShowAddToCollection(v => !v)} className="text-xs text-primary font-semibold hover:underline">
              {showAddToCollection ? 'Close' : '+ Add to collection'}
            </button>
          </div>
          {addedToCollection && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-2 rounded-xl mb-3">
              <span>✓</span> Added to collection
            </div>
          )}
          {showAddToCollection && (
            <div className="space-y-2">
              {collections.length === 0 ? (
                <p className="text-xs text-on-surface-variant">
                  No collections yet.{' '}
                  <Link href="/collections" className="text-primary underline">Create one</Link>
                </p>
              ) : (
                collections.map(col => (
                  <button
                    key={col.id}
                    onClick={async () => {
                      await collectionsApi.addSpot(col.id, id)
                      setShowAddToCollection(false)
                      setAddedToCollection(col.name)
                      setTimeout(() => setAddedToCollection(null), 3000)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-sm text-left transition-colors active:scale-[0.98]"
                  >
                    <span className="font-medium">📁 {col.name}</span>
                    <span className="text-xs text-on-surface-variant">{col.spotCount} spots</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Sources */}
        {spot.sources?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 fade-in-up">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-3">Sources</p>
            <div className="space-y-1.5">
              {spot.sources.map(src => (
                <a key={src.id} href={src.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:underline group">
                  <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">↗</span>
                  <span className="truncate group-hover:text-primary-dim">{src.url}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 fade-in-up">
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-on-surface font-medium">Delete "{spot.name}"? This cannot be undone.</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button variant="danger" size="sm" onClick={handleDelete} loading={deleting}>Delete</Button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-error/80 hover:text-error font-medium transition-colors">
              🗑 Remove this spot
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
