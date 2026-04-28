'use client'

import { useEffect, useRef } from 'react'
import { GraphData } from '@/lib/types'

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  RESTAURANT: '#f97316',
  CAFE: '#4b3fe2',
  DESSERT: '#ec4899',
  ATTRACTION: '#10b981',
  HOTEL: '#8b5cf6',
  BAR: '#f59e0b',
  MUSEUM: '#6366f1',
  PARK: '#22c55e',
  SHOP: '#14b8a6',
  OTHER: '#9ca3af',
}

const EDGE_COLORS: Record<string, string> = {
  SAME_CATEGORY: '#4b3fe2',
  SIMILAR_STYLE: '#9895ff',
  FROM_SAME_SOURCE: '#10b981',
  HAS_TAG: '#d1d5db',
  LOCATED_IN: '#f59e0b',
}

interface Props {
  data: GraphData
  visibleEdgeTypes?: string[]
  onNodeClick?: (nodeId: string) => void
}

export default function GraphCanvas({ data, visibleEdgeTypes, onNodeClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const networkRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || data.nodes.length === 0) return

    let cancelled = false

    import('vis-network').then(({ Network }) => {
      if (cancelled || !containerRef.current) return

      const nodes = data.nodes.map(n => ({
        id: n.id,
        label: n.label,
        color: {
          background: CATEGORY_COLORS[n.category] ?? '#9ca3af',
          border: CATEGORY_COLORS[n.category] ?? '#9ca3af',
          highlight: { background: '#4b3fe2', border: '#4b3fe2' },
        },
        font: { color: '#ffffff', size: 12, face: 'Manrope' },
        borderWidth: 2,
        shadow: {
          enabled: true,
          color: `${CATEGORY_COLORS[n.category] ?? '#9ca3af'}33`,
          size: 20,
          x: 0,
          y: 0,
        },
        size: 20,
        shape: 'dot' as const,
        title: `${n.label}${n.city ? ` · ${n.city}` : ''}`,
      }))

      const filteredEdges = visibleEdgeTypes
        ? data.edges.filter(e => visibleEdgeTypes.includes(e.type))
        : data.edges

      const edges = filteredEdges.map((e, i) => ({
        id: i,
        from: e.from,
        to: e.to,
        label: e.label,
        color: { color: EDGE_COLORS[e.type] ?? '#d1d5db', opacity: 0.7 },
        font: { size: 9, color: '#6b7280', align: 'middle' as const },
        smooth: { enabled: true, type: 'continuous' as const, roundness: 0.2 },
        width: 1.5,
      }))

      const options = {
        physics: {
          enabled: true,
          stabilization: { iterations: 150 },
          barnesHut: { gravitationalConstant: -3000, springLength: 120 },
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          zoomView: true,
          dragView: true,
        },
        layout: { improvedLayout: true },
      }

      const network = new Network(containerRef.current, { nodes, edges }, options)
      networkRef.current = network

      if (onNodeClick) {
        network.on('click', (params: any) => {
          if (params.nodes.length > 0) {
            onNodeClick(params.nodes[0])
          }
        })
      }
    })

    return () => {
      cancelled = true
      if (networkRef.current) {
        networkRef.current.destroy()
        networkRef.current = null
      }
    }
  }, [data, visibleEdgeTypes, onNodeClick])

  if (data.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
        <span className="text-5xl mb-3">🕸️</span>
        <p className="font-body text-sm">No connections yet</p>
        <p className="font-body text-xs mt-1 opacity-60">Save more spots to see the graph grow</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-2xl overflow-hidden bg-surface-container-low"
      style={{ height: '420px' }}
    />
  )
}
