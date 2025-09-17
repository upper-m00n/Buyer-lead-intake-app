import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BuyerSchema } from '@/lib/validators';
import { Prisma } from '@prisma/client';
import { parse } from 'csv-parse/sync';

// CSV_HEADERS is unused, removing to fix lint warning

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('csv');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  const text = buffer.toString('utf-8');
  let records: Record<string, unknown>[];
  try {
    records = parse(text, { columns: true, skip_empty_lines: true }) as Record<string, unknown>[];
  } catch {
    return NextResponse.json({ error: 'CSV parse error' }, { status: 400 });
  }
  if (records.length > 200) {
    return NextResponse.json({ error: 'Max 200 rows allowed' }, { status: 400 });
  }
  const errors: { row: number; message: string }[] = [];
  const validRows: Prisma.BuyerCreateInput[] = [];
  // Get session for userId
  let userId = null;
  try {
    const { getIronSession } = await import('iron-session');
    const { sessionOptions } = await import('@/lib/session');
    const { cookies } = await import('next/headers');
    const cookieObj = await cookies();
    const cookieStore = {
      get: (name: string) => cookieObj.get(name),
      set: () => {},
    };
  const session = await getIronSession(cookieStore, sessionOptions);
  userId = (session as { userId?: string }).userId || null;
  } catch {}

  for (let i = 0; i < records.length; i++) {
    const row = records[i] as Record<string, unknown>;
    if (typeof row.tags === 'string') {
      row.tags = (row.tags as string).split(',').map((t) => t.trim()).filter(Boolean);
    } else if (!Array.isArray(row.tags)) {
      row.tags = [];
    }

    if (row.budgetMin) row.budgetMin = Number(row.budgetMin);
    if (row.budgetMax) row.budgetMax = Number(row.budgetMax);
    const parsed = BuyerSchema.safeParse(row);
    if (!parsed.success) {
      errors.push({ row: i + 2, message: parsed.error.issues.map((e) => e.message).join('; ') });
    } else {
      if (!userId) {
        errors.push({ row: i + 2, message: 'Missing ownerId (user not authenticated)' });
        continue;
      }
      validRows.push({
        ...(parsed.data as Prisma.BuyerCreateInput),
        owner: { connect: { id: userId } }
      });
    }
  }
  let inserted = 0;
  if (validRows.length > 0) {
    try {
      await prisma.$transaction(
        validRows.map((data) => prisma.buyer.create({ data }))
      );
      inserted = validRows.length;
    } catch (err) {
      console.log("importing error", err);
      return NextResponse.json({ error: 'Database error', details: String(err) }, { status: 500 });
    }
  }
  return NextResponse.json({ success: true, errors, inserted });
}
