import { create } from 'zustand'
import type { AuthUser } from '@/services/auth.service'

type AuthState = {
  user: AuthUser | null
  loading: boolean
}

export const useAuthStore = create<AuthState>(() => ({
  user: null,
  loading: true,
}))
