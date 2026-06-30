import app from './app'
import { env } from './config/env'
import { connectDb } from './config/db'

async function start(): Promise<void> {
  await connectDb()
  app.listen(env.port, () => {
    console.log(`Server running on :${env.port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
