import axios, { type AxiosError, type AxiosResponse } from 'axios'
import { useAuthStore } from '@/stores/auth.store'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export type ApiError = {
  status: number
  code?: string
  message: string
  errors: string[]
}

export type ApiResult<T> = { success: true; data: T } | { success: false; error: ApiError }

const client = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.response.use(
  (response) => ({ success: true, data: response.data }) as unknown as AxiosResponse,
  (error: AxiosError) => {
    const res = error.response

    if (!res) {
      const result: ApiResult<never> = {
        success: false,
        error: { status: 0, code: 'NETWORK', message: 'Network error', errors: [] },
      }
      return result
    }

    const body = res.data as { title?: string; message?: string; code?: string; errors?: string[] } | null

    if (res.status === 401 && body?.code === 'UNAUTHENTICATED') {
      useAuthStore.setState({ user: null, loading: false })
      if (window.location.pathname !== '/login') {
        const from = encodeURIComponent(window.location.pathname + window.location.search)
        window.location.href = `/login?session=expired&from=${from}`
        // Navigating away — never resolve so callers don't act on a stale page.
        return new Promise<never>(() => {})
      }
      // Already on /login: fall through to a normal error result instead of
      // leaving the caller hanging on an unresolved promise.
    }

    const result: ApiResult<never> = {
      success: false,
      error: {
        status: res.status,
        code: body?.code,
        message: body?.title ?? body?.message ?? `Request failed (${res.status})`,
        errors: body?.errors ?? [],
      },
    }
    return result
  },
)

function run<T>(config: Parameters<typeof client.request>[0]): Promise<ApiResult<T>> {
  return client.request(config) as unknown as Promise<ApiResult<T>>
}

export const api = {
  get: <T>(path: string) => run<T>({ method: 'get', url: path }),
  post: <T>(path: string, data?: unknown) => run<T>({ method: 'post', url: path, data }),
  put: <T>(path: string, data?: unknown) => run<T>({ method: 'put', url: path, data }),
  patch: <T>(path: string, data?: unknown) => run<T>({ method: 'patch', url: path, data }),
  delete: <T>(path: string) => run<T>({ method: 'delete', url: path }),
}
