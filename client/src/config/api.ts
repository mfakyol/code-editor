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
  createdAt: string
  updatedAt: string
}

export type PenInput = {
  title: string
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
}

export const penApi = {
  list: () => request<{ pens: PenSummary[] }>('/pens'),
  get: (id: string) => request<{ pen: SavedPen }>(`/pens/${id}`),
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
  remove: (id: string) =>
    request<{ ok: true }>(`/pens/${id}`, { method: 'DELETE' }),
}
