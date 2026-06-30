import passport from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { User, verifyPassword } from '../models/User'

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email.toLowerCase().trim() })
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' })
        }

        const ok = await verifyPassword(password, user.passwordHash)
        if (!ok) {
          return done(null, false, { message: 'Invalid email or password' })
        }

        return done(null, user)
      } catch (error) {
        return done(error)
      }
    },
  ),
)

passport.serializeUser((user, done) => {
  done(null, (user as { id: string }).id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id)
    done(null, user ?? false)
  } catch (error) {
    done(error)
  }
})

export default passport
