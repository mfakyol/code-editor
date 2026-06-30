import request from 'supertest'
import type { Express } from 'express'

// Imports the app lazily so the in-memory Mongo env (set in setup.ts) is
// already in place when app.ts builds its session store.
export async function getApp(): Promise<Express> {
  const mod = await import('../src/app')
  return mod.default
}

// A supertest agent persists the session cookie across requests, which lets a
// test "log in" once and stay authenticated for subsequent calls.
export async function registerAgent(
  app: Express,
  overrides: Partial<{ email: string; username: string; password: string }> = {},
) {
  const agent = request.agent(app)
  const unique = `${Date.now()}${Math.floor(Math.random() * 1e6)}`
  const creds = {
    email: overrides.email ?? `user${unique}@test.com`,
    username: overrides.username ?? `tester${unique}`,
    password: overrides.password ?? 'secret123',
  }
  const res = await agent.post('/api/auth/register').send(creds)
  return { agent, creds, res }
}
