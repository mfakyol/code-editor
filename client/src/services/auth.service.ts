import { request } from '@/utils/api'
import { useAuthStore } from '@/stores/auth.store'

export type AuthUser = {
  id: string
  email: string
  username: string
}

async function loadUser() {
  try {
    const res = await request<{ user: AuthUser | null }>('/auth/me')
    useAuthStore.setState({ user: res.user })
  } catch {
    useAuthStore.setState({ user: null })
  } finally {
    useAuthStore.setState({ loading: false })
  }
}

async function login(email: string, password: string) {
  const res = await request<{ user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  useAuthStore.setState({ user: res.user })
}

async function register(email: string, username: string, password: string) {
  const res = await request<{ user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, username, password }),
  })
  useAuthStore.setState({ user: res.user })
}

async function logout() {
  await request<{ ok: true }>('/auth/logout', { method: 'POST' })
  useAuthStore.setState({ user: null })
}

function changePassword(currentPassword: string, newPassword: string) {
  return request<{ ok: true }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

const authService = {
  loadUser,
  login,
  register,
  logout,
  changePassword,
}

export default authService
