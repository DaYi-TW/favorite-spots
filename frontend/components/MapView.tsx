'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Spot } from '@/lib/types'

interface MapViewProps {
  spots: Spot[]
}

const CATEGORY_COLOR: Record<string, string> = {
  RESTAURANT: '#ef4444', CAFE: '#f59e0b', BAR: '#8b5cf6',
  MUSEUM: '#3b82f6', PARK: '#22c55e', HOTEL: '#06b6d4',
  SHOP: '#ec4899', ATTRACTION: '#f97316', DESSERT: '#f43f5e', OTHER: '#6b7280',
}

export default function MapView({ spots }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const router = useRouter()

  const spotsWithCoords = spots.filter(s => s.latitude != null && s.longitude != null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamically import Leaflet (ssr: false handled by parent)
    import('leaflet').then(L => {
      // Fix default icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const center: [number, number] = spotsWithCoords.length > 0
        ? [
            spotsWithCoords.reduce((s, p) => s + p.latitude!, 0) / spotsWithCoords.length,
            spotsWithCoords.reduce((s, p) => s + p.longitude!, 0) / spotsWithCoords.length,
          ]
        : [25.0478, 121.5318] // Default: Taipei

      const map = L.map(mapRef.current!).setView(center, spotsWithCoords.length > 0 ? 12 : 11)
      mapInstanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      spotsWithCoords.forEach(spot => {
        const color = CATEGORY_COLOR[spot.category] ?? '#4b3fe2'
        const icon = L.divIcon({
          html: `<div style="
            width:36px;height:36px;border-radius:50% 50% 50% 0;
            background:${color};border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.3);
            transform:rotate(-45deg);
            display:flex;align-items:center;justify-content:center;
          "></div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        })

        const popup = L.popup({ maxWidth: 220, className: 'curator-popup' }).setContent(`
          <div style="font-family:system-ui;padding:4px">
            ${spot.coverImageUrl ? `<img src="${spot.coverImageUrl}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin-bottom:8px" onerror="this.style.display='none'" />` : ''}
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">${spot.name}</div>
            ${spot.address ? `<div style="font-size:12px;color:#666;margin-bottom:6px">📍 ${spot.address}</div>` : ''}
            <button
              onclick="window.__navigateToSpot && window.__navigateToSpot('${spot.id}')"
              style="background:#4b3fe2;color:white;border:none;padding:6px 12px;border-radius:20px;font-size:12px;cursor:pointer;width:100%"
            >View details →</button>
          </div>
        `)

        L.marker([spot.latitude!, spot.longitude!], { icon }).addTo(map).bindPopup(popup)
      })

      ;(window as any).__navigateToSpot = (id: string) => router.push(`/spots/${id}`)
    })

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [spotsWithCoords.length, router])

  if (spotsWithCoords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-white shadow-md flex items-center justify-center text-4xl mb-5">🗺️</div>
        <h2 className="font-headline text-xl font-bold text-on-surface mb-2">No spots on the map yet</h2>
        <p className="text-sm text-on-surface-variant max-w-xs leading-relaxed">
          Add spots with an address and they'll appear here automatically.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <div ref={mapRef} style={{ height: 'calc(100vh - 140px)', width: '100%' }} />
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-md text-xs font-medium text-on-surface-variant">
        {spotsWithCoords.length} spots on map
      </div>
    </div>
  )
}
