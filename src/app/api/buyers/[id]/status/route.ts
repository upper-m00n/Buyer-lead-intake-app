import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { STATUSES } from '@/lib/types';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const { status } = await req.json();
  if (!STATUSES.includes(status)) {
    return Response.json({ error: 'Invalid status' }, { status: 400 });
  }
  const cookieObj = await cookies();
  const cookieStore = {
    get: (name: string) => cookieObj.get(name),
    set: () => {},
  };
  const session = await getIronSession(cookieStore, sessionOptions);
  const userId = (session as { userId?: string }).userId || null;
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const buyer = await prisma.buyer.findUnique({ where: { id } });
  if (!buyer) {
    return Response.json({ error: 'Buyer not found' }, { status: 404 });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(user.isAdmin || buyer.ownerId === userId)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  await prisma.buyer.update({ where: { id }, data: { status } });
  return Response.json({ success: true });
}
