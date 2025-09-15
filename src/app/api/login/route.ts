import { Magic } from '@magic-sdk/admin'
import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import prisma from '@/lib/prisma'
import { SessionData, sessionOptions } from '@/lib/session'

const magic = new Magic(process.env.MAGIC_SECRET_KEY)

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const didToken = authHeader.substring(7)

  try {
    const metadata = await magic.users.getMetadataByToken(didToken)
    if (!metadata.email) {
      throw new Error('Email not found in token metadata')
    }

    let user = await prisma.user.findUnique({
      where: { email: metadata.email },
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: metadata.email,
          id: metadata.issuer!, 
        },
      })
    }

    // Apply the fix here
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions)
    session.userId = user.id
    session.email = user.email
    await session.save()

    return new NextResponse('Login successful', { status: 200 })
  } catch (error) {
    console.error('Session creation failed:', error)
    return new NextResponse('Authentication failed', { status: 500 })
  }
}