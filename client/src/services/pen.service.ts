import type { PenSettings } from '@/types/preprocessors'
import { request } from '@/utils/api'

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

function list() {
  return request<{ pens: PenSummary[] }>('/pens')
}

function publicList(sort: 'recent' | 'popular' = 'recent') {
  return request<{ pens: PublicPen[] }>(`/pens/public?sort=${sort}`)
}

function get(id: string) {
  return request<{
    pen: SavedPen
    isOwner: boolean
    likeCount: number
    commentCount: number
    likedByMe: boolean
  }>(`/pens/${id}`)
}

function fork(id: string) {
  return request<{ pen: SavedPen }>(`/pens/${id}/fork`, { method: 'POST' })
}

function create(data: PenInput) {
  return request<{ pen: SavedPen }>('/pens', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

function update(id: string, data: PenInput) {
  return request<{ pen: SavedPen }>(`/pens/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

function setVisibility(id: string, isPublic: boolean) {
  return request<{ isPublic: boolean }>(`/pens/${id}/visibility`, {
    method: 'PATCH',
    body: JSON.stringify({ isPublic }),
  })
}

function remove(id: string) {
  return request<{ ok: true }>(`/pens/${id}`, { method: 'DELETE' })
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
