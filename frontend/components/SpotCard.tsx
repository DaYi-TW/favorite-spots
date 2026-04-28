'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Spot, SpotStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS_CONFIG: Record<SpotStatus, { label: string; dot: string; bg: string }> = {
  WANT_TO_GO: { label: 'Want to go', dot: 'bg-amber-400', bg: 'bg-amber-50 text-amber-600' },
  VISITED:    { label: 'Visited',    dot: 'bg-emerald-400', bg: 'bg-emerald-50 text-emerald-600' },
}

const CATEGORY_EMOJI: Record<string, string> = {
  RESTAURANT: '🍽', CAFE: '☕', BAR: '🍸', MUSEUM: '🖼',
  PARK: '🌿', HOTEL: '🏨', SHOP: '🛍', ATTRACTION: '🏛', DESSERT: '🍰', OTHER: '📍',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  if (days < 365) return `${Math.floor(days / 30)}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function SpotCard({ spot }: { spot: Spot }) {
  const status = STATUS_CONFIG[spot.status]
  const emoji = CATEGORY_EMOJI[spot.category] ?? '📍'
  const ago = timeAgo(spot.createdAt)

  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group block rounded-2xl overflow-hidden bg-white shadow-[0_2px_10px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.13)] transition-all duration-300 hover:-translate-y-0.5"
    >
      {/* Image area */}
      <div className="relative overflow-hidden">
        {spot.coverImageUrl ? (
          <>
            <Image
              src={spot.coverImageUrl}
              alt={spot.name}
              width={400}
              height={300}
              className="img-hover w-full h-auto block"
              style={{ minHeight: 120 }}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
            />
            {/* Gradient overlay — always subtle, stronger on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Tags float on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-2.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <div className="flex flex-wrap gap-1">
                {spot.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Rating badge top-right */}
            {spot.personalRating && (
              <div className="absolute top-2 right-2">
                <span className="text-[11px] font-bold bg-black/50 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  {'★'.repeat(spot.personalRating)}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full bg-gradient-to-br from-primary/8 to-secondary/8 flex items-center justify-center" style={{ minHeight: 120 }}>
            <span className="text-4xl opacity-40">{emoji}</span>
          </div>
        )}

        {/* Category emoji — top-left */}
        <div className="absolute top-2 left-2">
          <span className="text-base drop-shadow-md">{emoji}</span>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 pt-2.5 pb-3">
        <h3 className="font-headline font-bold text-[13px] text-on-surface leading-snug line-clamp-2 mb-1">
          {spot.name}
        </h3>

        {spot.city && (
          <p className="text-[11px] text-on-surface-variant line-clamp-1 mb-2">
            📍 {spot.city}
          </p>
        )}

        {/* Note preview */}
        {spot.personalNote && (
          <p className="text-[11px] text-on-surface-variant/80 italic line-clamp-1 mb-2 leading-relaxed">
            "{spot.personalNote}"
          </p>
        )}

        <div className="flex items-center justify-between gap-1">
          {/* Status pill */}
          <span className={cn(
            'inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full',
            status.bg
          )}>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', status.dot)} />
            {status.label}
          </span>

          {/* Time */}
          <span className="text-[10px] text-on-surface-variant/60 shrink-0">{ago}</span>
        </div>
      </div>
    </Link>
  )
}
