import { prisma } from '@/lib/prisma';
import { BuyerSchema } from '@/lib/validators';
import { z } from 'zod';
import { notFound } from 'next/navigation';
import EditBuyerForm from './EditBuyerForm';

export default async function BuyerViewEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const buyer = await prisma.buyer.findUnique({
    where: { id },
  });
  if (!buyer) return notFound();

  const history = await prisma.buyerHistory.findMany({
    where: { buyerId: id },
    orderBy: { changedAt: 'desc' },
    take: 5,
    include: { buyer: false },
  });

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">View / Edit Buyer Lead</h1>
      <EditBuyerForm buyer={{ ...buyer, updatedAt: buyer.updatedAt.toISOString() }} history={history} />
    </div>
)};