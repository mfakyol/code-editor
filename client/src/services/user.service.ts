import { api } from '@/utils/api'
import type { PublicPen } from '@/services/pen.service'

function profile(username: string) {
  return api.get<{ user: { username: string }; pens: PublicPen[] }>(`/users/${encodeURIComponent(username)}`)
}

const userService = {
  profile,
}

export default userService
