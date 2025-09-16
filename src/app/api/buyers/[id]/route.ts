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

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    let body = await request.json();

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
    const data = parsed.data;
   
    const existing = await prisma.buyer.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (existing.ownerId !== session.userId && !(user as any)?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden: You do not own this buyer.' }, { status: 403 });
    }
    if (new Date(body.updatedAt).getTime() !== new Date(existing.updatedAt).getTime()) {
      return NextResponse.json({ error: 'Record changed, please refresh.' }, { status: 409 });
    }
  
    const updateData: Record<string, any> = {
      ...data,
      bhk: data.bhk ? data.bhk as any : null,
      timeline: data.timeline ? data.timeline as any : null,
      source: data.source ? data.source as any : null,
      budgetMin: typeof data.budgetMin === 'number' && !isNaN(data.budgetMin) ? data.budgetMin : null,
      budgetMax: typeof data.budgetMax === 'number' && !isNaN(data.budgetMax) ? data.budgetMax : null,
      tags: Array.isArray(data.tags)
        ? data.tags
        : typeof data.tags === 'string' && (data.tags as string).length > 0
        ? (data.tags as string).split(',').map((t: string) => t.trim())
        : [],
    };

    const diff: Record<string, { old: any, new: any }> = {};
    Object.keys(updateData).forEach((key) => {
      if ((updateData as Record<string, any>)[key] !== (existing as Record<string, any>)[key]) {
        diff[key] = { old: (existing as Record<string, any>)[key], new: (updateData as Record<string, any>)[key] };
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
        diff,
      },
    });
    return NextResponse.json({ success: true, buyer: updated });
  } catch (error: any) {
    console.log("Error while updating..",error);
    return NextResponse.json({ error: error.message || 'Server error', details: error }, { status: 500 });
  }
}
