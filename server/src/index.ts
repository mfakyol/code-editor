import type { Server } from 'node:http'
import mongoose from 'mongoose'
import app from './app'
import { env } from './config/env'
import { connectDb } from './config/db'

const SHUTDOWN_TIMEOUT_MS = 10_000

function registerShutdown(server: Server): void {
  let shuttingDown = false

  async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`Received ${signal}, shutting down gracefully`)

    const timer = setTimeout(() => {
      console.error('Graceful shutdown timed out, forcing exit')
      process.exit(1)
    }, SHUTDOWN_TIMEOUT_MS)
    timer.unref()

    server.close(async () => {
      try {
        await mongoose.disconnect()
      } catch (error) {
        console.error('Error during Mongo disconnect', error)
      }
      clearTimeout(timer)
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

async function start(): Promise<void> {
  await connectDb()
  const server = app.listen(env.port, () => {
    console.log(`Server running on :${env.port}`)
  })
  registerShutdown(server)
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
