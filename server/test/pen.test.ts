import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { getApp, registerAgent } from './helpers'

let app: Express
beforeAll(async () => {
  app = await getApp()
})

const penPayload = (overrides = {}) => ({
  title: 'My Pen',
  isPublic: false,
  html: '<h1>hi</h1>',
  css: 'h1 { color: red }',
  js: 'console.log(1)',
  ...overrides,
})

describe('pen creation & ownership', () => {
  it('requires authentication to create', async () => {
    const res = await request(app).post('/api/pens').send(penPayload())
    expect(res.status).toBe(401)
  })

  it('creates a pen owned by the current user', async () => {
    const { agent } = await registerAgent(app)
    const res = await agent.post('/api/pens').send(penPayload({ title: 'X' }))
    expect(res.status).toBe(201)
    expect(res.body.pen.title).toBe('X')
    expect(res.body.pen.isPublic).toBe(false)
  })

  it('lists only the current user’s pens', async () => {
    const { agent: a } = await registerAgent(app)
    await a.post('/api/pens').send(penPayload({ title: 'A1' }))
    await a.post('/api/pens').send(penPayload({ title: 'A2' }))
    const { agent: b } = await registerAgent(app)
    await b.post('/api/pens').send(penPayload({ title: 'B1' }))

    const res = await a.get('/api/pens')
    expect(res.body.pens).toHaveLength(2)
    expect(res.body.pens.map((p: { title: string }) => p.title)).toEqual(
      expect.arrayContaining(['A1', 'A2']),
    )
  })
})

describe('pen visibility', () => {
  it('lets a non-owner open a public pen (isOwner=false)', async () => {
    const { agent: owner } = await registerAgent(app)
    const { body } = await owner
      .post('/api/pens')
      .send(penPayload({ isPublic: true }))
    const id = body.pen._id

    const { agent: viewer } = await registerAgent(app)
    const res = await viewer.get(`/api/pens/${id}`)
    expect(res.status).toBe(200)
    expect(res.body.isOwner).toBe(false)
    expect(res.body).toMatchObject({ likeCount: 0, commentCount: 0 })
  })

  it('blocks a non-owner from a private pen with 403', async () => {
    const { agent: owner } = await registerAgent(app)
    const { body } = await owner
      .post('/api/pens')
      .send(penPayload({ isPublic: false }))
    const id = body.pen._id

    const { agent: viewer } = await registerAgent(app)
    const res = await viewer.get(`/api/pens/${id}`)
    expect(res.status).toBe(403)
  })

  it('returns 404 for a malformed id', async () => {
    const res = await request(app).get('/api/pens/not-a-real-id')
    expect(res.status).toBe(404)
  })
})

describe('pen update & delete', () => {
  it('lets the owner update their pen', async () => {
    const { agent } = await registerAgent(app)
    const { body } = await agent.post('/api/pens').send(penPayload())
    const res = await agent
      .put(`/api/pens/${body.pen._id}`)
      .send(penPayload({ title: 'Renamed', isPublic: true }))
    expect(res.status).toBe(200)
    expect(res.body.pen.title).toBe('Renamed')
    expect(res.body.pen.isPublic).toBe(true)
  })

  it('forbids a non-owner from updating', async () => {
    const { agent: owner } = await registerAgent(app)
    const { body } = await owner
      .post('/api/pens')
      .send(penPayload({ isPublic: true }))
    const { agent: other } = await registerAgent(app)
    const res = await other
      .put(`/api/pens/${body.pen._id}`)
      .send(penPayload({ title: 'hax' }))
    expect(res.status).toBe(403)
  })

  it('toggles visibility via PATCH without a full save', async () => {
    const { agent } = await registerAgent(app)
    const { body } = await agent
      .post('/api/pens')
      .send(penPayload({ isPublic: false }))
    const id = body.pen._id

    const res = await agent
      .patch(`/api/pens/${id}/visibility`)
      .send({ isPublic: true })
    expect(res.status).toBe(200)
    expect(res.body.isPublic).toBe(true)

    // Now visible to others.
    const { agent: viewer } = await registerAgent(app)
    expect((await viewer.get(`/api/pens/${id}`)).status).toBe(200)
  })

  it('forbids a non-owner from changing visibility', async () => {
    const { agent: owner } = await registerAgent(app)
    const { body } = await owner
      .post('/api/pens')
      .send(penPayload({ isPublic: true }))
    const { agent: other } = await registerAgent(app)
    const res = await other
      .patch(`/api/pens/${body.pen._id}/visibility`)
      .send({ isPublic: false })
    expect(res.status).toBe(403)
  })

  it('forbids a non-owner from deleting', async () => {
    const { agent: owner } = await registerAgent(app)
    const { body } = await owner
      .post('/api/pens')
      .send(penPayload({ isPublic: true }))
    const { agent: other } = await registerAgent(app)
    expect((await other.delete(`/api/pens/${body.pen._id}`)).status).toBe(403)
    expect((await owner.delete(`/api/pens/${body.pen._id}`)).status).toBe(200)
  })
})

describe('fork', () => {
  it('forks a public pen into a private copy owned by the forker', async () => {
    const { agent: owner } = await registerAgent(app)
    const { body } = await owner
      .post('/api/pens')
      .send(penPayload({ title: 'Original', isPublic: true }))

    const { agent: forker } = await registerAgent(app)
    const res = await forker.post(`/api/pens/${body.pen._id}/fork`)
    expect(res.status).toBe(201)
    expect(res.body.pen.title).toBe('Original (fork)')
    expect(res.body.pen.isPublic).toBe(false)
    expect(res.body.pen.html).toBe('<h1>hi</h1>')

    // The fork shows up in the forker's list, not the owner's.
    const forkerList = await forker.get('/api/pens')
    expect(forkerList.body.pens).toHaveLength(1)
  })

  it('refuses to fork a private pen you don’t own', async () => {
    const { agent: owner } = await registerAgent(app)
    const { body } = await owner
      .post('/api/pens')
      .send(penPayload({ isPublic: false }))
    const { agent: forker } = await registerAgent(app)
    const res = await forker.post(`/api/pens/${body.pen._id}/fork`)
    expect(res.status).toBe(403)
  })
})

describe('GET /api/pens/public', () => {
  it('returns public pens with owner name and like count', async () => {
    const { agent } = await registerAgent(app, { username: 'galleryuser' })
    await agent.post('/api/pens').send(penPayload({ isPublic: true }))
    await agent.post('/api/pens').send(penPayload({ isPublic: false }))

    const res = await request(app).get('/api/pens/public')
    expect(res.status).toBe(200)
    expect(res.body.pens).toHaveLength(1)
    expect(res.body.pens[0]).toMatchObject({
      ownerName: 'galleryuser',
      likeCount: 0,
    })
  })
})
