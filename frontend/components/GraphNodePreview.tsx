'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { spotsApi } from '@/lib/api'
import { Spot } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  spotId: string | null
  onClose: () => void
}

export default function GraphNodePreview({ spotId, onClose }: Props) {
  const router = useRouter()
  const [spot, setSpot] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!spotId) { setSpot(null); return }
    setLoading(true)
    spotsApi.getById(spotId)
      .then(setSpot)
      .catch(() => setSpot(null))
      .finally(() => setLoading(false))
  }, [spotId])

  if (!spotId) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
      />
      {/* Card */}
      <div className={cn(
        'fixed bottom-0 left-0 right-0 z-50 bg-surface rounded-t-3xl shadow-2xl transition-transform duration-300',
        spotId ? 'translate-y-0' : 'translate-y-full'
      )}>
        <div className="w-10 h-1 bg-on-surface/20 rounded-full mx-auto mt-3 mb-4" />

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : spot ? (
          <div className="px-4 pb-8">
            {spot.coverImageUrl && (
              <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-3">
                <Image src={spot.coverImageUrl} alt={spot.name} fill className="object-cover" />
              </div>
            )}
            <h3 className="font-headline text-lg font-bold text-on-surface">{spot.name}</h3>
            {spot.city && (
              <p className="text-sm text-on-surface-variant mt-0.5">{spot.city}</p>
            )}
            <div className="flex gap-2 mt-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {spot.category}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant">
                {spot.status === 'VISITED' ? '✓ Visited' : '→ Want to go'}
              </span>
            </div>
            <button
              onClick={() => router.push(`/spots/${spot.id}`)}
              className="mt-4 w-full py-3 rounded-full bg-primary text-on-primary text-sm font-label font-semibold"
            >
              View Detail
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-on-surface-variant text-sm">
            Spot not found
          </div>
        )}
      </div>
    </>
  )
}
