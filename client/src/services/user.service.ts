import { api } from '@/utils/api'
import type { PublicPen } from './pen.service'

function profile(username: string) {
  return api.get<{ user: { username: string }; pens: PublicPen[] }>(`/users/${encodeURIComponent(username)}`)
}

const userService = {
  profile,
}

export default userService
