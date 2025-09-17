export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cookieObj = await cookies();
    const cookieStore = {
      get: (name: string) => cookieObj.get(name),
      set: () => {},
    };
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const buyer = await prisma.buyer.findUnique({ where: { id: params.id } });
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (buyer.ownerId !== session.userId && !(user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not own this buyer.' }, { status: 403 });
    }
    await prisma.buyer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error', details: error }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BuyerSchema } from '@/lib/validators';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';
const RATE_LIMIT = 5;
const WINDOW_MS = 60 * 1000;
const rateLimitMap = new Map<string, { count: number; start: number }>();

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    let body = await request.json();

    // Robustly map bhk value to enum
    const bhkEnum = ["One", "Two", "Three", "Four", "Studio"];
    const bhkMap: Record<string, string> = {
      "1 BHK": "One",
      "2 BHK": "Two",
      "3 BHK": "Three",
      "4 BHK": "Four",
      "Studio": "Studio",
      "One": "One",
      "Two": "Two",
      "Three": "Three",
      "Four": "Four"
    };
    if (typeof body.bhk === "string") {
      const mapped = bhkMap[body.bhk.trim()];
      body.bhk = mapped && bhkEnum.includes(mapped) ? mapped : undefined;
    } else {
      body.bhk = undefined;
    }

    if (typeof body.tags === 'string') {
      body.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }
    const parsed = BuyerSchema.safeParse(body);
    if (!parsed.success) {
      console.log("Error while updating",parsed.error);
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const cookieObj = await cookies();
    const cookieStore = {
      get: (name: string) => cookieObj.get(name),
      set: () => {},
    };
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    if (!session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
   
    const existing = await prisma.buyer.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (existing.ownerId !== session.userId && !(user as { isAdmin?: boolean })?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not own this buyer.' }, { status: 403 });
    }
    if (new Date(body.updatedAt).getTime() !== new Date(existing.updatedAt).getTime()) {
      return NextResponse.json({ error: 'Record changed, please refresh.' }, { status: 409 });
    }
  
    const updateData: Record<string, unknown> = {
      ...data,
      bhk: data.bhk ? data.bhk : null,
      timeline: data.timeline ? data.timeline : null,
      source: data.source ? data.source : null,
      budgetMin: typeof data.budgetMin === 'number' && !isNaN(data.budgetMin) ? data.budgetMin : null,
      budgetMax: typeof data.budgetMax === 'number' && !isNaN(data.budgetMax) ? data.budgetMax : null,
      tags: Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === 'string' && (data.tags as string).length > 0
        ? (data.tags as string).split(',').map((t: string) => t.trim())
        : [],
    };

    const diff: Record<string, { old: unknown, new: unknown }> = {};
    Object.keys(updateData).forEach((key) => {
      if ((updateData as Record<string, unknown>)[key] !== (existing as Record<string, unknown>)[key]) {
        diff[key] = { old: (existing as Record<string, unknown>)[key], new: (updateData as Record<string, unknown>)[key] };
      }
    });
  
    const updated = await prisma.buyer.update({
      where: { id: params.id },
      data: updateData,
    });
    
    await prisma.buyerHistory.create({
      data: {
        buyerId: updated.id,
        changedById: session.userId,
        diff: JSON.parse(JSON.stringify(diff)),
      },
    });
    return NextResponse.json({ success: true, buyer: updated });
  } catch (error) {
    console.log("Error while updating..", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message || 'Server error', details: error }, { status: 500 });
    }
    return NextResponse.json({ error: 'Server error', details: error }, { status: 500 });
  }
}
