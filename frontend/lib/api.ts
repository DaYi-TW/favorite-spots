import axios from 'axios'
import type {
  AuthUser,
  Collection,
  CreateCollectionRequest,
  CreateSpotRequest,
  GraphData,
  ParseResult,
  Spot,
  SpotFilter,
  SpotListResponse,
  SpotPhoto,
  UpdateSpotRequest,
} from './types'

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send HttpOnly JWT cookie on every request
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth
export const authApi = {
  register: (data: { email: string; password: string; username: string }) =>
    api.post<AuthUser>('/api/auth/register', data).then(r => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthUser>('/api/auth/login', data).then(r => r.data),

  logout: () => api.post('/api/auth/logout'),

  me: () => api.get<AuthUser>('/api/auth/me').then(r => r.data),
}

// Parse
export const parseApi = {
  parseUrl: (url: string) =>
    api.post<ParseResult>('/api/parse', { url }).then(r => r.data),
}

// Spots
export const spotsApi = {
  list: (filters?: SpotFilter) =>
    api.get<SpotListResponse>('/api/spots', { params: filters }).then(r => r.data),

  create: (data: CreateSpotRequest) =>
    api.post<Spot>('/api/spots', data).then(r => r.data),

  getById: (id: string) =>
    api.get<Spot>(`/api/spots/${id}`).then(r => r.data),

  update: (id: string, data: UpdateSpotRequest) =>
    api.put<Spot>(`/api/spots/${id}`, data).then(r => r.data),

  updateStatus: (id: string, status: 'WANT_TO_GO' | 'VISITED') =>
    api.patch<Spot>(`/api/spots/${id}/status`, { status }).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/spots/${id}`),

  generateDescription: (id: string) =>
    api.post<Spot>(`/api/spots/${id}/description/generate`).then(r => r.data),
}

export default api

export const graphApi = {
  getSpotGraph: (spotId: string) =>
    api.get<GraphData>(`/api/graph/spot/${spotId}`).then(r => r.data),

  getUserGraph: () =>
    api.get<GraphData>('/api/graph/user').then(r => r.data),

  getRelatedSpots: (spotId: string) =>
    api.get<Spot[]>(`/api/graph/related/${spotId}`).then(r => r.data),
}

export const photosApi = {
  list: (spotId: string) =>
    api.get<SpotPhoto[]>(`/api/spots/${spotId}/photos`).then(r => r.data),

  upload: (spotId: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<SpotPhoto>(`/api/spots/${spotId}/photos`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },

  delete: (spotId: string, photoId: string) =>
    api.delete(`/api/spots/${spotId}/photos/${photoId}`),
}

export const collectionsApi = {
  list: () =>
    api.get<Collection[]>('/api/collections').then(r => r.data),

  create: (data: CreateCollectionRequest) =>
    api.post<Collection>('/api/collections', data).then(r => r.data),

  get: (id: string) =>
    api.get<Collection>(`/api/collections/${id}`).then(r => r.data),

  update: (id: string, data: CreateCollectionRequest) =>
    api.put<Collection>(`/api/collections/${id}`, data).then(r => r.data),

  delete: (id: string) =>
    api.delete(`/api/collections/${id}`),

  addSpot: (id: string, spotId: string) =>
    api.post<Collection>(`/api/collections/${id}/spots/${spotId}`).then(r => r.data),

  removeSpot: (id: string, spotId: string) =>
    api.delete(`/api/collections/${id}/spots/${spotId}`),

  getPublic: (id: string) =>
    api.get<Collection>(`/api/collections/public/${id}`).then(r => r.data),
}

export const recommendationsApi = {
  get: (limit = 6) =>
    api.get<Spot[]>('/api/recommendations', { params: { limit } }).then(r => r.data),
}
