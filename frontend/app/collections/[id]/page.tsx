'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { collectionsApi } from '@/lib/api'
import { Collection } from '@/lib/types'
import SpotCard from '@/components/SpotCard'
import Button from '@/components/ui/Button'

export default function CollectionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [col, setCol] = useState<Collection | null>(null)
  const [loading, setLoading] = useState(true)
  const [editName, setEditName] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    collectionsApi.get(id).then(data => {
      setCol(data); setName(data.name); setLoading(false)
    }).catch(() => router.push('/collections'))
  }, [id, router])

  async function handleSaveName() {
    if (!col || !name.trim()) return
    setSaving(true)
    try {
      const updated = await collectionsApi.update(id, { name: name.trim(), description: col.description, isPublic: col.isPublic })
      setCol(updated); setEditName(false)
    } finally { setSaving(false) }
  }

  async function handleTogglePublic() {
    if (!col) return
    const updated = await collectionsApi.update(id, { name: col.name, description: col.description, isPublic: !col.isPublic })
    setCol(updated)
  }

  async function handleRemoveSpot(spotId: string) {
    await collectionsApi.removeSpot(id, spotId)
    setCol(prev => prev ? { ...prev, spots: prev.spots.filter(s => s.id !== spotId), spotCount: prev.spotCount - 1 } : prev)
  }

  async function handleDelete() {
    if (!confirm('Delete this collection?')) return
    await collectionsApi.delete(id)
    router.push('/collections')
  }

  if (loading) return <div className="min-h-screen bg-[#f0f0f0] flex justify-center items-center"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
  if (!col) return null

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-10">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between">
        <button onClick={() => router.back()} className="text-sm text-on-surface-variant hover:text-on-surface font-medium">← Back</button>
        <button onClick={handleDelete} className="text-xs text-error font-medium">Delete</button>
      </header>

      <div className="max-w-lg mx-auto px-3 py-4 space-y-3">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5">
          {editName ? (
            <div className="flex gap-2">
              <input value={name} onChange={e => setName(e.target.value)} className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
              <Button size="sm" onClick={handleSaveName} loading={saving}>Save</Button>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div>
                <h1 className="font-headline text-2xl font-black text-on-surface">{col.name}</h1>
                {col.description && <p className="text-sm text-on-surface-variant mt-1">{col.description}</p>}
                <p className="text-xs text-on-surface-variant mt-2">{col.spotCount} spots</p>
              </div>
              <button onClick={() => setEditName(true)} className="text-xs text-primary font-semibold">Edit</button>
            </div>
          )}

          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleTogglePublic}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${col.isPublic ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}
            >
              {col.isPublic ? '🌐 Public' : '🔒 Private'}
            </button>
            {col.isPublic && (
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/c/${col.id}`)}
                className="text-xs text-primary font-semibold"
              >
                Copy share link 🔗
              </button>
            )}
          </div>
        </div>

        {/* Spots */}
        {col.spots.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center">
            <p className="text-on-surface-variant text-sm">No spots yet. Go to a spot and tap "+ Add to collection".</p>
          </div>
        ) : (
          <div className="masonry">
            {col.spots.map(spot => (
              <div key={spot.id} className="masonry-item relative">
                <SpotCard spot={spot} />
                <button
                  onClick={() => handleRemoveSpot(spot.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
