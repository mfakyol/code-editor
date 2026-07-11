export const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    const body = data as { message?: string; errors?: string[] } | null
    const message = body?.errors?.join(', ') ?? body?.message ?? `Request failed (${res.status})`
    throw new Error(message)
  }

  return data as T
}
