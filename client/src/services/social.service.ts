import { api } from '@/utils/api'

export type PenComment = {
  _id: string
  body: string
  user: { _id: string; username: string }
  createdAt: string
  updatedAt: string
}

function like(id: string) {
  return api.post<{ liked: boolean; likeCount: number }>(`/pens/${id}/like`)
}

function comments(id: string) {
  return api.get<{ comments: PenComment[] }>(`/pens/${id}/comments`)
}

function addComment(id: string, body: string) {
  return api.post<{ comment: PenComment }>(`/pens/${id}/comments`, { body })
}

function deleteComment(id: string, commentId: string) {
  return api.delete<{ ok: true }>(`/pens/${id}/comments/${commentId}`)
}

const socialService = {
  like,
  comments,
  addComment,
  deleteComment,
}

export default socialService
