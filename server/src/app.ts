import express from 'express'
import cors from 'cors'
import apiRouter from './routes/index'
import { errorHandler } from './middleware/errorHandler'
import { env } from './config/env'

const app = express()

app.use(cors({ origin: env.corsOrigin }))
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api', apiRouter)

app.use(errorHandler)

export default app
