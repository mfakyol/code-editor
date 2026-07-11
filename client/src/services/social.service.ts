import { request } from '@/utils/api'

export type PenComment = {
  _id: string
  body: string
  user: { _id: string; username: string }
  createdAt: string
  updatedAt: string
}

function like(id: string) {
  return request<{ liked: boolean; likeCount: number }>(`/pens/${id}/like`, {
    method: 'POST',
  })
}

function comments(id: string) {
  return request<{ comments: PenComment[] }>(`/pens/${id}/comments`)
}

function addComment(id: string, body: string) {
  return request<{ comment: PenComment }>(`/pens/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body }),
  })
}

function deleteComment(id: string, commentId: string) {
  return request<{ ok: true }>(`/pens/${id}/comments/${commentId}`, {
    method: 'DELETE',
  })
}

const socialService = {
  like,
  comments,
  addComment,
  deleteComment,
}

export default socialService
