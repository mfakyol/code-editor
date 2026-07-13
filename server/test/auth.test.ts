import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import type { Express } from 'express'
import { getApp, registerAgent } from './helpers'

let app: Express
beforeAll(async () => {
  app = await getApp()
})

describe('POST /api/auth/register', () => {
  it('creates a user and logs them in', async () => {
    const { res } = await registerAgent(app, {
      email: 'new@test.com',
      username: 'newbie',
    })
    expect(res.status).toBe(201)
    expect(res.body.user).toMatchObject({
      email: 'new@test.com',
      username: 'newbie',
    })
    expect(res.body.user).not.toHaveProperty('passwordHash')
  })

  it('rejects invalid input with field errors', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      username: 'a',
      password: '123',
    })
    expect(res.status).toBe(400)
    expect(res.body.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('email'),
        expect.stringContaining('Username'),
        expect.stringContaining('Password'),
      ]),
    )
  })

  it('rejects a duplicate email', async () => {
    await registerAgent(app, { email: 'dupe@test.com', username: 'dupe1' })
    const res = await request(app).post('/api/auth/register').send({
      email: 'dupe@test.com',
      username: 'other',
      password: 'Secret123',
    })
    expect(res.status).toBe(409)
  })

  it('rejects a duplicate username', async () => {
    await registerAgent(app, { email: 'u1@test.com', username: 'samename' })
    const res = await request(app).post('/api/auth/register').send({
      email: 'u2@test.com',
      username: 'samename',
      password: 'Secret123',
    })
    expect(res.status).toBe(409)
  })
})

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await registerAgent(app, { email: 'log@test.com', password: 'Secret123' })
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'log@test.com', password: 'Secret123' })
    expect(res.status).toBe(200)
    expect(res.body.user.email).toBe('log@test.com')
  })

  it('rejects a wrong password with 401', async () => {
    await registerAgent(app, { email: 'wrong@test.com', password: 'Secret123' })
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'nope' })
    expect(res.status).toBe(401)
  })
})

describe('GET /api/auth/me', () => {
  it('returns null when not logged in', async () => {
    const res = await request(app).get('/api/auth/me')
    expect(res.status).toBe(200)
    expect(res.body.user).toBeNull()
  })

  it('returns the user for an active session', async () => {
    const { agent } = await registerAgent(app, { email: 'me@test.com' })
    const res = await agent.get('/api/auth/me')
    expect(res.body.user.email).toBe('me@test.com')
  })
})

describe('POST /api/auth/logout', () => {
  it('ends the session', async () => {
    const { agent } = await registerAgent(app)
    await agent.post('/api/auth/logout').expect(200)
    const res = await agent.get('/api/auth/me')
    expect(res.body.user).toBeNull()
  })
})

describe('POST /api/auth/change-password', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/auth/change-password')
      .send({ currentPassword: 'Secret123', newPassword: 'newpass123' })
    expect(res.status).toBe(401)
  })

  it('changes the password with the correct current password', async () => {
    const { agent, creds } = await registerAgent(app, {
      email: 'pw@test.com',
      password: 'Secret123',
    })
    const res = await agent
      .post('/api/auth/change-password')
      .send({ currentPassword: 'Secret123', newPassword: 'Brandnew123' })
    expect(res.status).toBe(200)

    // Old password no longer works, new one does.
    await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: 'Secret123' })
      .expect(401)
    await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: 'Brandnew123' })
      .expect(200)
  })

  it('rejects a wrong current password', async () => {
    const { agent } = await registerAgent(app, { password: 'Secret123' })
    const res = await agent
      .post('/api/auth/change-password')
      .send({ currentPassword: 'wrong', newPassword: 'Brandnew123' })
    expect(res.status).toBe(401)
  })

  it('rejects a too-short new password', async () => {
    const { agent } = await registerAgent(app, { password: 'Secret123' })
    const res = await agent
      .post('/api/auth/change-password')
      .send({ currentPassword: 'Secret123', newPassword: '123' })
    expect(res.status).toBe(400)
  })
})
