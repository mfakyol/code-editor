const nodeEnv = process.env.NODE_ENV ?? 'development'
const isProd = nodeEnv === 'production'

function requireInProd(name: string, fallback: string): string {
  const value = process.env[name]
  if (value) return value
  if (isProd) {
    throw new Error(`${name} must be set in production`)
  }
  return fallback
}

export const env = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  nodeEnv,
  isDev: nodeEnv === 'development',
  mongoUri: requireInProd('MONGODB_URI', 'mongodb://127.0.0.1:27017/code-editor'),
  sessionSecret: requireInProd('SESSION_SECRET', 'dev-insecure-session-secret'),
}
