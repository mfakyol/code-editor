import { api } from '@/utils/api'
import { useAuthStore } from '@/stores/auth.store'

export type AuthUser = {
  id: string
  email: string
  username: string
}

async function loadUser() {
  const res = await api.get<{ user: AuthUser | null }>('/auth/me')
  useAuthStore.setState({ user: res.success ? res.data.user : null, loading: false })
}

async function login(email: string, password: string) {
  const res = await api.post<{ user: AuthUser }>('/auth/login', { email, password })
  if (res.success) useAuthStore.setState({ user: res.data.user })
  return res
}

async function register(email: string, username: string, password: string) {
  const res = await api.post<{ user: AuthUser }>('/auth/register', { email, username, password })
  if (res.success) useAuthStore.setState({ user: res.data.user })
  return res
}

async function logout() {
  const res = await api.post<{ ok: true }>('/auth/logout')
  if (res.success) useAuthStore.setState({ user: null })
  return res
}

function changePassword(currentPassword: string, newPassword: string) {
  return api.post<{ ok: true }>('/auth/change-password', { currentPassword, newPassword })
}

const authService = {
  loadUser,
  login,
  register,
  logout,
  changePassword,
}

export default authService
