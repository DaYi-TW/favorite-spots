'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { photosApi } from '@/lib/api'
import { SpotPhoto } from '@/lib/types'

interface PhotoGalleryProps {
  spotId: string
  photos: SpotPhoto[]
  onPhotosChange: (photos: SpotPhoto[]) => void
}

export default function PhotoGallery({ spotId, photos, onPhotosChange }: PhotoGalleryProps) {
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState<SpotPhoto | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const photo = await photosApi.upload(spotId, file)
      onPhotosChange([...photos, photo])
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(photo: SpotPhoto) {
    if (!confirm('Delete this photo?')) return
    await photosApi.delete(spotId, photo.id)
    onPhotosChange(photos.filter(p => p.id !== photo.id))
  }

  return (
    <div>
      {/* Gallery grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {photos.map(photo => (
            <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden bg-surface-container">
              <Image
                src={photo.url}
                alt="photo"
                fill
                className="object-cover cursor-pointer"
                onClick={() => setLightbox(photo)}
                unoptimized
              />
              <button
                onClick={() => handleDelete(photo)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {photos.length < 10 && (
        <div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 text-sm text-primary font-semibold hover:text-primary-dim disabled:opacity-50 transition-colors"
          >
            {uploading ? (
              <><span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> Uploading…</>
            ) : (
              <><span className="text-lg">📷</span> Add photo {photos.length > 0 ? `(${photos.length}/10)` : ''}</>
            )}
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-lg w-full max-h-[80vh]">
            <Image
              src={lightbox.url}
              alt="photo"
              width={800}
              height={600}
              className="object-contain w-full h-full rounded-xl"
              unoptimized
            />
          </div>
          <button className="absolute top-4 right-4 text-white text-2xl">×</button>
        </div>
      )}
    </div>
  )
}
