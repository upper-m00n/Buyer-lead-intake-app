import { NextResponse, type NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import { SessionData, sessionOptions } from '@/lib/session'

export async function middleware(request: NextRequest) {

  const session = await getIronSession<SessionData>(
    {
      get: (name: string) => request.cookies.get(name),
      set: () => {},
    },
    sessionOptions
  )

  const { userId } = session

  if (!userId && request.nextUrl.pathname.startsWith('/buyers/new')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/buyers/:path*'],
}