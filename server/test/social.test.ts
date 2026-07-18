import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { Like } from '../src/models/Like'
import { Comment } from '../src/models/Comment'
import { getApp, registerAgent } from './helpers'

let app: Express
beforeAll(async () => {
  app = await getApp()
})

// Creates a public pen and returns its id plus the owner's agent.
async function publicPen() {
  const { agent } = await registerAgent(app)
  const { body } = await agent.post('/api/pens').send({
    title: 'Social Pen',
    isPublic: true,
    html: '<p>x</p>',
    css: '',
    js: '',
  })
  return { ownerAgent: agent, id: body.pen._id as string }
}

describe('likes', () => {
  it('toggles a like on and off', async () => {
    const { id } = await publicPen()
    const { agent } = await registerAgent(app)

    const on = await agent.post(`/api/pens/${id}/like`)
    expect(on.body).toEqual({ liked: true, likeCount: 1 })

    const off = await agent.post(`/api/pens/${id}/like`)
    expect(off.body).toEqual({ liked: false, likeCount: 0 })
  })

  it('requires auth to like', async () => {
    const { id } = await publicPen()
    expect((await request(app).post(`/api/pens/${id}/like`)).status).toBe(401)
  })

  it('forbids liking your own pen', async () => {
    const { ownerAgent, id } = await publicPen()
    const res = await ownerAgent.post(`/api/pens/${id}/like`)
    expect(res.status).toBe(400)
  })

  it('reflects likeCount/likedByMe in GET pen', async () => {
    const { id } = await publicPen()
    const { agent } = await registerAgent(app)
    await agent.post(`/api/pens/${id}/like`)

    const res = await agent.get(`/api/pens/${id}`)
    expect(res.body.likeCount).toBe(1)
    expect(res.body.likedByMe).toBe(true)
  })
})

describe('comments', () => {
  it('adds a comment and lists it (with author username)', async () => {
    const { id } = await publicPen()
    const { agent } = await registerAgent(app, { username: 'commenter' })

    const add = await agent
      .post(`/api/pens/${id}/comments`)
      .send({ body: 'Nice!' })
    expect(add.status).toBe(201)
    expect(add.body.comment.user.username).toBe('commenter')

    const list = await request(app).get(`/api/pens/${id}/comments`)
    expect(list.body.comments).toHaveLength(1)
    expect(list.body.comments[0].body).toBe('Nice!')
  })

  it('rejects an empty comment', async () => {
    const { id } = await publicPen()
    const { agent } = await registerAgent(app)
    const res = await agent
      .post(`/api/pens/${id}/comments`)
      .send({ body: '   ' })
    expect(res.status).toBe(400)
  })

  it('lets the pen owner delete any comment', async () => {
    const { ownerAgent, id } = await publicPen()
    const { agent: commenter } = await registerAgent(app)
    const { body } = await commenter
      .post(`/api/pens/${id}/comments`)
      .send({ body: 'to be removed' })

    const res = await ownerAgent.delete(
      `/api/pens/${id}/comments/${body.comment._id}`,
    )
    expect(res.status).toBe(200)
    const list = await request(app).get(`/api/pens/${id}/comments`)
    expect(list.body.comments).toHaveLength(0)
  })

  it('forbids an unrelated user from deleting a comment', async () => {
    const { id } = await publicPen()
    const { agent: commenter } = await registerAgent(app)
    const { body } = await commenter
      .post(`/api/pens/${id}/comments`)
      .send({ body: 'mine' })

    const { agent: stranger } = await registerAgent(app)
    const res = await stranger.delete(
      `/api/pens/${id}/comments/${body.comment._id}`,
    )
    expect(res.status).toBe(403)
  })

  it('blocks commenting on a private pen you don’t own', async () => {
    const { agent: owner } = await registerAgent(app)
    const { body } = await owner.post('/api/pens').send({
      title: 'Private',
      isPublic: false,
      html: '',
      css: '',
      js: '',
    })
    const { agent: other } = await registerAgent(app)
    const res = await other
      .post(`/api/pens/${body.pen._id}/comments`)
      .send({ body: 'sneaky' })
    expect(res.status).toBe(403)
  })
})

describe('cascade delete', () => {
  it('removes a pen’s likes and comments when the pen is deleted', async () => {
    const { ownerAgent, id } = await publicPen()

    const { agent: fan } = await registerAgent(app)
    await fan.post(`/api/pens/${id}/like`)
    await fan.post(`/api/pens/${id}/comments`).send({ body: 'great work' })

    expect(await Like.countDocuments({ pen: id })).toBe(1)
    expect(await Comment.countDocuments({ pen: id })).toBe(1)

    const del = await ownerAgent.delete(`/api/pens/${id}`)
    expect(del.status).toBe(200)

    expect(await Like.countDocuments({ pen: id })).toBe(0)
    expect(await Comment.countDocuments({ pen: id })).toBe(0)
  })
})
