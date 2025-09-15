import type { SessionOptions } from 'iron-session'

export interface SessionData {
  userId: string
  email: string
}

export const sessionOptions: SessionOptions = {

  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'buyer-lead-app-session',
  cookieOptions: {
    
    secure: process.env.NODE_ENV === 'production',
  },
}