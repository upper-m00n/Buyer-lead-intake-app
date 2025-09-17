import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import EditBuyerForm from './EditBuyerForm';

export default async function BuyerViewEditPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const buyerRaw = await prisma.buyer.findUnique({
    where: { id },
  });
  if (!buyerRaw) return notFound();
  
  const buyer: import('@/lib/types').Buyer = {
    ...buyerRaw,
    updatedAt: buyerRaw.updatedAt.toISOString(),
    email: buyerRaw.email ?? '',
    notes: buyerRaw.notes ?? '',
    createdAt: buyerRaw.createdAt instanceof Date ? buyerRaw.createdAt.toISOString() : String(buyerRaw.createdAt),
  };

  // Get session user
  const { getIronSession } = await import('iron-session');
  const { sessionOptions } = await import('@/lib/session');
  const { cookies } = await import('next/headers');
  const cookieObj = await cookies();
  const cookieStore = {
    get: (name: string) => cookieObj.get(name),
    set: () => {},
  };
  const session = await getIronSession(cookieStore, sessionOptions);
  const userId = (session as { userId?: string }).userId || null;
  const userObj = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
  const user: import('@/lib/types').User | undefined = userObj ? { id: userObj.id, isAdmin: !!userObj.isAdmin } : undefined;

  const historyRaw = await prisma.buyerHistory.findMany({
    where: { buyerId: id },
    orderBy: { changedAt: 'desc' },
    take: 5,
    include: { buyer: false },
  });
  const history: import('@/lib/types').BuyerHistory[] = historyRaw.map(h => ({
    ...h,
    changedAt: typeof h.changedAt === 'string' ? h.changedAt : h.changedAt.toISOString(),
    diff: typeof h.diff === 'object' && h.diff !== null ? h.diff as Record<string, unknown> : {},
  }));

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">View / Edit Buyer Lead</h1>
      <EditBuyerForm buyer={buyer} history={history} user={user} />
    </div>
  );
}