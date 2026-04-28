'use client'

import { useCallback, useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { spotsApi, recommendationsApi, authApi } from '@/lib/api'
import { Spot, SpotCategory, SpotStatus, AuthUser } from '@/lib/types'
import SpotGrid from '@/components/SpotGrid'
import FilterBar from '@/components/FilterBar'
import SpotCard from '@/components/SpotCard'

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false })

type ViewMode = 'grid' | 'map'

const CATEGORY_EMOJI: Record<string, string> = {
  RESTAURANT: '🍽', CAFE: '☕', BAR: '🍸', MUSEUM: '🖼',
  PARK: '🌿', HOTEL: '🏨', SHOP: '🛍', ATTRACTION: '🏛', DESSERT: '🍰', OTHER: '📍',
}

function RecommendationCard({ spot }: { spot: Spot }) {
  const emoji = CATEGORY_EMOJI[spot.category] ?? '📍'
  return (
    <Link
      href={`/spots/${spot.id}`}
      className="group shrink-0 w-36 rounded-2xl overflow-hidden bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] transition-all duration-300 hover:-translate-y-0.5"
    >
      <div className="relative overflow-hidden h-24">
        {spot.coverImageUrl ? (
          <>
            <Image src={spot.coverImageUrl} alt={spot.name} fill className="object-cover img-hover" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <span className="text-3xl opacity-40">{emoji}</span>
          </div>
        )}
        <div className="absolute top-1.5 left-1.5 text-sm">{emoji}</div>
      </div>
      <div className="px-2.5 pt-2 pb-2.5">
        <p className="font-headline font-bold text-[12px] text-on-surface line-clamp-2 leading-snug">{spot.name}</p>
        {spot.city && (
          <p className="text-[10px] text-on-surface-variant mt-0.5 line-clamp-1">📍 {spot.city}</p>
        )}
      </div>
    </Link>
  )
}

export default function FeedPage() {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState<SpotCategory | undefined>()
  const [status, setStatus] = useState<SpotStatus | undefined>()
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [recommendations, setRecommendations] = useState<Spot[]>([])
  const [user, setUser] = useState<AuthUser | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)

  const fetchSpots = useCallback(async (
    cat: SpotCategory | undefined, st: SpotStatus | undefined, pg: number, q?: string
  ) => {
    setLoading(true)
    try {
      const data = await spotsApi.list({ category: cat, status: st, page: pg, size: 20, q: q || undefined })
      if (pg === 0) setSpots(data.content)
      else setSpots(prev => [...prev, ...data.content])
      setHasMore(pg + 1 < data.totalPages)
    } catch { /* silent */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    setPage(0)
    fetchSpots(category, status, 0)
  }, [category, status, fetchSpots])

  useEffect(() => {
    recommendationsApi.get(8).then(setRecommendations).catch(() => {})
    authApi.me().then(setUser).catch(() => {})
  }, [])

  function handleSearch(q: string) {
    setSearchQuery(q)
    setPage(0)
    fetchSpots(category, status, 0, q)
  }

  const totalCount = spots.length
  const visitedCount = spots.filter(s => s.status === 'VISITED').length

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-4 pt-3 pb-2 gap-3">
          {/* Brand */}
          <span className="text-xl font-headline font-black gradient-text tracking-tight shrink-0">
            Curator
          </span>

          {/* Search bar — expands on focus */}
          {searchActive ? (
            <div className="flex-1 flex items-center gap-2 bg-surface-container rounded-full px-3 py-1.5 ring-2 ring-primary">
              <span className="text-sm text-on-surface-variant">🔍</span>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="Search spots…"
                className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
                onBlur={() => { if (!searchQuery) setSearchActive(false) }}
              />
              {searchQuery && (
                <button onClick={() => { setSearchQuery(''); handleSearch(''); setSearchActive(false) }}
                  className="text-on-surface-variant text-lg leading-none">×</button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchActive(true)}
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-base hover:bg-surface-container-high transition-colors"
                title="Search"
              >
                🔍
              </button>
              {/* View toggle */}
              <div className="flex bg-surface-container rounded-full p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant'}`}
                >
                  🗺
                </button>
              </div>
              <Link href="/graph"
                className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-base hover:bg-surface-container-high transition-colors"
                title="Knowledge Graph">
                🕸️
              </Link>
              <Link href="/spots/new"
                className="h-9 px-4 rounded-full btn-primary-gradient text-white text-sm font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 active:scale-95">
                <span className="text-lg leading-none">+</span>
                <span>Add</span>
              </Link>
            </div>
          )}
        </div>

        {/* Stats bar */}
        {!searchActive && viewMode === 'grid' && totalCount > 0 && (
          <div className="flex items-center gap-4 px-5 pb-2 text-[11px] text-on-surface-variant">
            <span><span className="font-bold text-on-surface">{totalCount}</span> spots</span>
            <span className="text-outline-variant">·</span>
            <span><span className="font-bold text-emerald-600">{visitedCount}</span> visited</span>
            <span className="text-outline-variant">·</span>
            <span><span className="font-bold text-amber-600">{totalCount - visitedCount}</span> want to go</span>
          </div>
        )}

        {viewMode === 'grid' && !searchActive && (
          <FilterBar category={category} status={status} onCategoryChange={setCategory} onStatusChange={setStatus} />
        )}
      </header>

      {/* Map view */}
      {viewMode === 'map' && (
        <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
          <MapView spots={spots} />
        </Suspense>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <>
          {/* Recommendations strip */}
          {recommendations.length > 0 && !searchQuery && !category && !status && (
            <div className="px-3 pt-4 pb-2">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">✨ Discover</h2>
                <Link href="/graph" className="text-xs text-primary font-semibold">
                  See graph →
                </Link>
              </div>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {recommendations.map((spot, i) => (
                  <div key={spot.id} className="fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <RecommendationCard spot={spot} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Graph CTA banner — shown when user has enough spots */}
          {spots.length >= 5 && !searchQuery && !category && !status && (
            <div className="mx-3 mb-2">
              <Link
                href="/graph"
                className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl px-4 py-3 hover:from-primary/15 hover:to-secondary/15 transition-colors group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                  🕸️
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface">Explore your Knowledge Graph</p>
                  <p className="text-xs text-on-surface-variant">See how your {totalCount} spots connect</p>
                </div>
                <span className="text-primary text-lg">→</span>
              </Link>
            </div>
          )}

          {/* My Collection section title */}
          {spots.length > 0 && (
            <div className="flex items-center justify-between px-4 pt-3 pb-1">
              <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {searchQuery ? `Results for "${searchQuery}"` : category ? `${category.toLowerCase()}s` : 'My Collection'}
              </h2>
              <Link href="/collections" className="text-xs text-primary font-semibold">
                Collections →
              </Link>
            </div>
          )}

          {loading && spots.length === 0 ? (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-on-surface-variant">Loading spots…</p>
              </div>
            </div>
          ) : (
            <>
              <SpotGrid spots={spots} />
              {hasMore && (
                <div className="flex justify-center pb-10">
                  <button
                    onClick={() => { const next = page + 1; setPage(next); fetchSpots(category, status, next, searchQuery) }}
                    disabled={loading}
                    className="px-8 py-3 rounded-full text-sm font-bold bg-white text-on-surface shadow-md hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
                  >
                    {loading
                      ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />Loading…</span>
                      : 'Load more'
                    }
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
