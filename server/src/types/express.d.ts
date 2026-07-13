declare global {
  namespace Express {
    interface User {
      id: string
      _id: unknown
      email: string
      username: string
    }
  }
}

export {}
