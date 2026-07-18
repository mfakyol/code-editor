import type { PenSettings } from '@/types/preprocessors'
import { api } from '@/utils/api'

export type SavedPen = {
  _id: string
  title: string
  isPublic: boolean
  html: string
  css: string
  js: string
  settings: PenSettings
  createdAt: string
  updatedAt: string
}

export type PenSummary = {
  _id: string
  title: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

export type PublicPen = {
  _id: string
  title: string
  html: string
  css: string
  js: string
  settings: PenSettings
  likeCount: number
  ownerName: string
  createdAt: string
  updatedAt: string
}

export type PenInput = {
  title: string
  isPublic: boolean
  html: string
  css: string
  js: string
  settings: PenSettings
}

export const PAGE_SIZE = 12

type PageParams = { limit?: number; offset?: number }

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') search.set(key, String(value))
  }
  const str = search.toString()
  return str ? `?${str}` : ''
}

function list(params: PageParams = {}) {
  return api.get<{ pens: PenSummary[] }>(`/pens${query({ ...params })}`)
}

function publicList(sort: 'recent' | 'popular' = 'recent', params: PageParams = {}) {
  return api.get<{ pens: PublicPen[] }>(`/pens/public${query({ sort, ...params })}`)
}

function get(id: string) {
  return api.get<{
    pen: SavedPen
    isOwner: boolean
    likeCount: number
    commentCount: number
    likedByMe: boolean
  }>(`/pens/${id}`)
}

function fork(id: string) {
  return api.post<{ pen: SavedPen }>(`/pens/${id}/fork`)
}

function create(data: PenInput) {
  return api.post<{ pen: SavedPen }>('/pens', data)
}

function update(id: string, data: PenInput) {
  return api.put<{ pen: SavedPen }>(`/pens/${id}`, data)
}

function setVisibility(id: string, isPublic: boolean) {
  return api.patch<{ isPublic: boolean }>(`/pens/${id}/visibility`, { isPublic })
}

function remove(id: string) {
  return api.delete<{ ok: true }>(`/pens/${id}`)
}

const penService = {
  list,
  publicList,
  get,
  fork,
  create,
  update,
  setVisibility,
  remove,
}

export default penService
