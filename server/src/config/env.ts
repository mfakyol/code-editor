export const env = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isDev: (process.env.NODE_ENV ?? 'development') === 'development',
  mongoUri:
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/code-editor',
  sessionSecret: process.env.SESSION_SECRET ?? 'dev-insecure-session-secret',
}
