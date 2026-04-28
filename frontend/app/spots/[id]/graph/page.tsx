'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { graphApi } from '@/lib/api'
import { GraphData } from '@/lib/types'
import GraphFilterBar from '@/components/GraphFilterBar'
import GraphNodePreview from '@/components/GraphNodePreview'

const GraphCanvas = dynamic(() => import('@/components/GraphCanvas'), { ssr: false })

const ALL_TYPES = ['SAME_CATEGORY', 'SIMILAR_STYLE', 'FROM_SAME_SOURCE']

export default function SpotGraphPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)
  const [activeTypes, setActiveTypes] = useState<string[]>(ALL_TYPES)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  useEffect(() => {
    graphApi.getSpotGraph(id)
      .then(setGraphData)
      .catch(() => router.push(`/spots/${id}`))
      .finally(() => setLoading(false))
  }, [id, router])

  function toggleType(type: string) {
    setActiveTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="text-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1"
        >
          ← Back
        </button>
        <h1 className="font-headline text-base font-bold text-on-surface">Graph View</h1>
        <div className="w-12" />
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <GraphFilterBar activeTypes={activeTypes} onToggle={toggleType} />
            <GraphCanvas
              data={graphData}
              visibleEdgeTypes={activeTypes}
              onNodeClick={nodeId => setSelectedNode(nodeId)}
            />
            {graphData.nodes.length > 0 && (
              <p className="text-xs text-on-surface-variant text-center">
                {graphData.nodes.length} spots · {graphData.edges.length} connections
              </p>
            )}
          </>
        )}
      </div>

      <GraphNodePreview
        spotId={selectedNode}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
}
