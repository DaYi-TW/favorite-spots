export type SpotCategory = 'RESTAURANT' | 'CAFE' | 'DESSERT' | 'ATTRACTION' | 'HOTEL' | 'BAR' | 'MUSEUM' | 'PARK' | 'SHOP' | 'OTHER'
export type SpotStatus = 'WANT_TO_GO' | 'VISITED'
export type SourceType = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'GOOGLE_MAP' | 'BLOG' | 'WEB' | 'AI_PARSED' | 'MANUAL'
export type TagType = 'STYLE' | 'CUSTOM'

export interface Tag {
  id: string
  name: string
  type: TagType
}

export interface SpotSource {
  id: string
  sourceType: SourceType
  url: string
  parsedAt: string
}

export interface Spot {
  id: string
  name: string
  address?: string
  city?: string
  latitude?: number
  longitude?: number
  category: SpotCategory
  status: SpotStatus
  coverImageUrl?: string
  personalRating?: number
  personalNote?: string
  description?: string
  isPublic: boolean
  tags: string[]
  sources: SpotSource[]
  createdAt: string
  updatedAt: string
}

export interface SpotParseItem {
  name: string
  address?: string
  city?: string
  category: SpotCategory
  coverImageUrl?: string
  description?: string
  suggestedTags: string[]
}

export interface ParseResult {
  name?: string
  address?: string
  city?: string
  category?: SpotCategory
  coverImageUrl?: string
  description?: string
  suggestedTags: string[]
  sourceType: SourceType
  originalUrl: string
  fromCache: boolean
  /** Present when the page mentions multiple spots (listicle / blog). */
  spots: SpotParseItem[]
}

export interface AuthUser {
  id: string
  email: string
  username: string
}

export interface CreateSpotRequest {
  name: string
  address?: string
  city?: string
  category: SpotCategory
  status?: SpotStatus
  coverImageUrl?: string
  description?: string
  personalRating?: number
  personalNote?: string
  isPublic?: boolean
  tags?: string[]
  originalUrl?: string
  sourceType?: SourceType
}

export interface SpotListResponse {
  content: Spot[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface UpdateSpotRequest {
  name?: string
  address?: string
  city?: string
  category?: SpotCategory
  coverImageUrl?: string
  description?: string
  personalNote?: string
  personalRating?: number
  isPublic?: boolean
  tags?: string[]
}

export interface SpotFilter {
  category?: SpotCategory
  status?: SpotStatus
  city?: string
  q?: string
  page?: number
  size?: number
}

export interface SpotPhoto {
  id: string
  url: string
  filename: string
  sizeBytes?: number
  createdAt: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  isPublic: boolean
  coverImageUrl?: string
  spotCount: number
  spots: Spot[]
  createdAt: string
  updatedAt: string
}

export interface CreateCollectionRequest {
  name: string
  description?: string
  isPublic?: boolean
}

export interface GraphNode {
  id: string
  label: string
  category: string
  city?: string
  coverImageUrl?: string
}

export interface GraphEdge {
  from: string
  to: string
  type: 'SAME_CATEGORY' | 'SIMILAR_STYLE' | 'FROM_SAME_SOURCE' | 'HAS_TAG' | 'LOCATED_IN'
  label: string
  properties?: Record<string, unknown>
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}
