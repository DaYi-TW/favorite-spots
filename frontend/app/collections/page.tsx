'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { collectionsApi } from '@/lib/api'
import { Collection } from '@/lib/types'
import Image from 'next/image'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const router = useRouter()

  useEffect(() => {
    collectionsApi.list().then(data => { setCollections(data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    const col = await collectionsApi.create({ name: newName.trim() })
    setCollections(prev => [col, ...prev])
    setNewName('')
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0]">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="text-sm text-on-surface-variant hover:text-on-surface font-medium">← Back</button>
          <h1 className="font-headline font-bold text-on-surface">Collections</h1>
          <button onClick={() => setCreating(v => !v)} className="text-sm text-primary font-bold">+ New</button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-3 py-4 space-y-3">
        {/* Create form */}
        {creating && (
          <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5">
            <form onSubmit={handleCreate} className="flex gap-2">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Collection name…"
                autoFocus
                className="flex-1 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="submit" className="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">Create</button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="text-5xl mb-4">📁</div>
            <h2 className="font-headline text-lg font-bold mb-2">No collections yet</h2>
            <p className="text-sm text-on-surface-variant">Group your spots into themed collections.</p>
          </div>
        ) : (
          collections.map(col => (
            <Link key={col.id} href={`/collections/${col.id}`}
              className="block bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-md transition-shadow">
              {col.coverImageUrl && (
                <div className="relative w-full h-32">
                  <Image src={col.coverImageUrl} alt={col.name} fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-headline font-bold text-on-surface">{col.name}</h3>
                  {col.description && <p className="text-xs text-on-surface-variant mt-0.5">{col.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-on-surface-variant">{col.spotCount} spots</span>
                  {col.isPublic && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Public</span>}
                  <span className="text-on-surface-variant">→</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
