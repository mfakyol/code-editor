import express from 'express'
import cors from 'cors'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from './config/passport'
import apiRouter from './routes/index'
import { errorHandler } from './middleware/errorHandler'
import { env } from './config/env'

const app = express()

app.use(cors({ origin: env.corsOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))

app.set('trust proxy', 1)
app.use(
  session({
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: env.mongoUri }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: !env.isDev,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api', apiRouter)

app.use(errorHandler)

export default app
