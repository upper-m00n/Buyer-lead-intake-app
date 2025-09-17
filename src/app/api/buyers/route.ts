import { NextResponse } from 'next/server'
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;
const rateLimitMap = new Map<string, { count: number; start: number }>();
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
    // Simple rate limit per user/IP
  let ipCookie = cookieObj.get('ip');
  const ip = typeof ipCookie === 'string' ? ipCookie : ipCookie?.value || '';
  const userKey = session.userId || ip || 'anon';
    const now = Date.now();
    const entry = rateLimitMap.get(userKey) || { count: 0, start: now };
    if (now - entry.start > WINDOW_MS) {
      entry.count = 0;
      entry.start = now;
    }
    entry.count++;
    rateLimitMap.set(userKey, entry);
    if (entry.count > RATE_LIMIT) {
      return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
    }
    const data = parsed.data;

    const fixEnum = (val: string, map: Record<string, string>) => map[val] || val;
    const sourceMap = { 'Walk-in': 'WalkIn', 'WalkIn': 'WalkIn', 'Website': 'Website', 'Referral': 'Referral', 'Call': 'Call', 'Other': 'Other' };
    const timelineMap = { 'ZeroToThreeMonths': 'ZeroToThreeMonths', 'ThreeToSixMonths': 'ThreeToSixMonths', 'OverSixMonths': 'OverSixMonths', 'Exploring': 'Exploring' };
    const propertyTypeMap = { 'Apartment': 'Apartment', 'Villa': 'Villa', 'Plot': 'Plot', 'Office': 'Office', 'Retail': 'Retail' };
    const cityMap = { 'Chandigarh': 'Chandigarh', 'Mohali': 'Mohali', 'Zirakpur': 'Zirakpur', 'Panchkula': 'Panchkula', 'Other': 'Other' };
    const purposeMap = { 'Buy': 'Buy', 'Rent': 'Rent' };
    const statusMap = { 'New': 'New', 'Qualified': 'Qualified', 'Contacted': 'Contacted', 'Visited': 'Visited', 'Negotiation': 'Negotiation', 'Converted': 'Converted', 'Dropped': 'Dropped' };
    const bhkMap = { 'One': 'One', 'Two': 'Two', 'Three': 'Three', 'Four': 'Four', 'Studio': 'Studio' };

    const { City, PropertyType, Bhk, Purpose, Timeline, Source, Status } = (await import('@prisma/client'));
    const fixedSource = Source[fixEnum(data.source || 'Other', sourceMap) as keyof typeof Source];
    const prismaData = {
      ...data,
      city: City[fixEnum(data.city, cityMap) as keyof typeof City],
      propertyType: PropertyType[fixEnum(data.propertyType, propertyTypeMap) as keyof typeof PropertyType],
      bhk: data.bhk ? Bhk[fixEnum(data.bhk, bhkMap) as keyof typeof Bhk] : null,
      purpose: Purpose[fixEnum(data.purpose, purposeMap) as keyof typeof Purpose],
      timeline: Timeline[fixEnum(data.timeline, timelineMap) as keyof typeof Timeline],
      source: fixedSource,
      status: data.status ? Status[fixEnum(data.status, statusMap) as keyof typeof Status] : undefined,
      budgetMin: typeof data.budgetMin === 'number' && !isNaN(data.budgetMin) ? data.budgetMin : null,
      budgetMax: typeof data.budgetMax === 'number' && !isNaN(data.budgetMax) ? data.budgetMax : null,
      ownerId: session.userId,
    };
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
