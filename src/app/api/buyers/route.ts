import { NextResponse } from 'next/server'
import { BuyerSchema } from '@/lib/validators'
import { prisma } from '@/lib/prisma'
import { getIronSession } from 'iron-session'
import { sessionOptions, SessionData } from '@/lib/session'
import { cookies } from 'next/headers'

//create lead
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = BuyerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
    }
    const cookieObj = await cookies();
    const cookieStore = {
      get: (name: string) => cookieObj.get(name),
      set: () => {},
    }
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions)
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const data = parsed.data
    const prismaData = {
  ...data,
  bhk: data.bhk ? data.bhk as any : null,
  timeline: data.timeline ? data.timeline as any : null,
  source: data.source ? data.source as any : null,
  budgetMin: typeof data.budgetMin === 'number' && !isNaN(data.budgetMin) ? data.budgetMin : null,
  budgetMax: typeof data.budgetMax === 'number' && !isNaN(data.budgetMax) ? data.budgetMax : null,
  ownerId: session.userId,
    }
    try {
      const buyer = await prisma.buyer.create({
        data: prismaData,
      })
      await prisma.buyerHistory.create({
        data: {
          buyerId: buyer.id,
          changedById: session.userId,
          diff: { action: 'Created', details: prismaData },
        },
      })
      return NextResponse.json({ success: true, buyer })
    } catch (prismaError: any) {
  console.error('Prisma error:', prismaError)
  console.error('Prisma data:', prismaData)
  return NextResponse.json({ error: prismaError.message || 'Prisma error', details: JSON.stringify(prismaError, Object.getOwnPropertyNames(prismaError)) }, { status: 500 })
    }
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message || 'Server error', details: error }, { status: 500 })
  }
}
