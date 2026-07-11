import { request } from '@/utils/api'
import type { PublicPen } from './pen.service'

function profile(username: string) {
  return request<{ user: { username: string }; pens: PublicPen[] }>(`/users/${encodeURIComponent(username)}`)
}

const userService = {
  profile,
}

export default userService
