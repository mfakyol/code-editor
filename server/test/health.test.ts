import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { getApp } from './helpers'

describe('infrastructure', () => {
  it('responds on the health endpoint', async () => {
    const app = await getApp()
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ status: 'ok' })
  })
})
