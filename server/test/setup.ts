import { afterAll, afterEach, beforeAll } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// Spins up an isolated in-memory MongoDB for the test suite and wires the
// environment so that app.ts (which builds its session store at import time)
// picks it up. Tests must import the app *dynamically*, after this runs.
let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  const uri = mongod.getUri()

  process.env.MONGODB_URI = uri
  process.env.SESSION_SECRET = 'test-secret'
  // Keep NODE_ENV as development so session cookies aren't marked `secure`
  // (supertest talks plain HTTP and would otherwise drop them).
  process.env.NODE_ENV = 'development'

  await mongoose.connect(uri)
})

// Wipe all collections between tests for full isolation.
afterEach(async () => {
  const { collections } = mongoose.connection
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({})
  }
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod?.stop()
})
