import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { getApp, registerAgent } from './helpers'

let app: Express
beforeAll(async () => {
  app = await getApp()
})

const penPayload = (overrides = {}) => ({
  title: 'P',
  isPublic: true,
  html: '<h1>hi</h1>',
  css: '',
  js: '',
  ...overrides,
})

describe('GET /api/users/:username', () => {
  it('returns the profile with only the user’s public pens', async () => {
    const { agent } = await registerAgent(app, { username: 'profileuser' })
    await agent.post('/api/pens').send(penPayload({ title: 'Pub1' }))
    await agent.post('/api/pens').send(penPayload({ title: 'Pub2' }))
    await agent.post('/api/pens').send(penPayload({ title: 'Secret', isPublic: false }))

    const res = await request(app).get('/api/users/profileuser')
    expect(res.status).toBe(200)
    expect(res.body.user.username).toBe('profileuser')
    expect(res.body.pens).toHaveLength(2)
    const titles = res.body.pens.map((p: { title: string }) => p.title)
    expect(titles).toEqual(expect.arrayContaining(['Pub1', 'Pub2']))
    expect(titles).not.toContain('Secret')
    expect(res.body.pens[0]).toMatchObject({ ownerName: 'profileuser', likeCount: 0 })
  })

  it('returns 404 for an unknown username', async () => {
    const res = await request(app).get('/api/users/nobody')
    expect(res.status).toBe(404)
  })
})
