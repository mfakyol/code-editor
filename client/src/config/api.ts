import type { PenSettings } from '@/types/preprocessors'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export const COMPILE_URL = `${API_BASE}/api/compile`

export type AuthUser = {
  id: string
  email: string
  username: string
}

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

// A public pen as shown in the explore gallery (includes source for thumbnails).
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

export type PenComment = {
  _id: string
  body: string
  user: { _id: string; username: string }
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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    const body = data as { message?: string; errors?: string[] } | null
    const message =
      body?.errors?.join(', ') ?? body?.message ?? `Request failed (${res.status})`
    throw new Error(message)
  }

  return data as T
}

export const authApi = {
  me: () => request<{ user: AuthUser | null }>('/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, username: string, password: string) =>
    request<{ user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: true }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

export const userApi = {
  profile: (username: string) =>
    request<{ user: { username: string }; pens: PublicPen[] }>(
      `/users/${encodeURIComponent(username)}`,
    ),
}

export const penApi = {
  list: () => request<{ pens: PenSummary[] }>('/pens'),
  publicList: (sort: 'recent' | 'popular' = 'recent') =>
    request<{ pens: PublicPen[] }>(`/pens/public?sort=${sort}`),
  get: (id: string) =>
    request<{
      pen: SavedPen
      isOwner: boolean
      likeCount: number
      commentCount: number
      likedByMe: boolean
    }>(`/pens/${id}`),
  fork: (id: string) =>
    request<{ pen: SavedPen }>(`/pens/${id}/fork`, { method: 'POST' }),
  like: (id: string) =>
    request<{ liked: boolean; likeCount: number }>(`/pens/${id}/like`, {
      method: 'POST',
    }),
  comments: (id: string) =>
    request<{ comments: PenComment[] }>(`/pens/${id}/comments`),
  addComment: (id: string, body: string) =>
    request<{ comment: PenComment }>(`/pens/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),
  deleteComment: (id: string, commentId: string) =>
    request<{ ok: true }>(`/pens/${id}/comments/${commentId}`, {
      method: 'DELETE',
    }),
  create: (data: PenInput) =>
    request<{ pen: SavedPen }>('/pens', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: PenInput) =>
    request<{ pen: SavedPen }>(`/pens/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  setVisibility: (id: string, isPublic: boolean) =>
    request<{ isPublic: boolean }>(`/pens/${id}/visibility`, {
      method: 'PATCH',
      body: JSON.stringify({ isPublic }),
    }),
  remove: (id: string) =>
    request<{ ok: true }>(`/pens/${id}`, { method: 'DELETE' }),
}
