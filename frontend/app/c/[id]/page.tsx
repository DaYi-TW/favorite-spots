'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { collectionsApi } from '@/lib/api'
import { Collection } from '@/lib/types'
import SpotCard from '@/components/SpotCard'

export default function PublicCollectionPage() {
  const { id } = useParams<{ id: string }>()
  const [col, setCol] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    collectionsApi.getPublic(id).then(setCol).catch(() => setError(true)).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="min-h-screen bg-[#f0f0f0] flex justify-center items-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (error || !col) return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">Collection not found</div>

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-12">
      {/* Header */}
      <div className="bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)] px-4 py-5">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-headline font-black bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Curator</span>
            <span className="text-on-surface-variant text-sm">·</span>
            <span className="text-sm text-on-surface-variant">Collection</span>
          </div>
          <h1 className="font-headline text-2xl font-black text-on-surface">{col.name}</h1>
          {col.description && <p className="text-sm text-on-surface-variant mt-1">{col.description}</p>}
          <p className="text-xs text-on-surface-variant mt-2">{col.spotCount} spots</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-3 pt-4">
        <div className="masonry">
          {col.spots.map(spot => (
            <div key={spot.id} className="masonry-item">
              <SpotCard spot={spot} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
