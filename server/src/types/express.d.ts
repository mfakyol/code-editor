// Shape of the authenticated user attached to req.user by Passport.
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
