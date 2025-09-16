import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const CSV_HEADERS = [
  'fullName','email','phone','city','propertyType','bhk','purpose','budgetMin','budgetMax','timeline','source','notes','tags','status'
];

function escapeCSV(val: any) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const where: any = {};
  if (params.get('city')) where.city = params.get('city');
  if (params.get('propertyType')) where.propertyType = params.get('propertyType');
  if (params.get('status')) where.status = params.get('status');
  if (params.get('timeline')) where.timeline = params.get('timeline');
  if (params.get('search')) {
    where.OR = [
      { fullName: { contains: params.get('search'), mode: 'insensitive' } },
      { phone: { contains: params.get('search'), mode: 'insensitive' } },
      { email: { contains: params.get('search'), mode: 'insensitive' } },
    ];
  }

  const buyers = await prisma.buyer.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  });
  let csv = CSV_HEADERS.join(',') + '\n';
  for (const b of buyers) {
    csv += [
      escapeCSV(b.fullName),
      escapeCSV(b.email),
      escapeCSV(b.phone),
      escapeCSV(b.city),
      escapeCSV(b.propertyType),
      escapeCSV(b.bhk),
      escapeCSV(b.purpose),
      escapeCSV(b.budgetMin),
      escapeCSV(b.budgetMax),
      escapeCSV(b.timeline),
      escapeCSV(b.source),
      escapeCSV(b.notes),
      escapeCSV((b.tags || []).join(', ')),
      escapeCSV(b.status)
    ].join(',') + '\n';
  }
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=buyers.csv',
    },
  });
}
