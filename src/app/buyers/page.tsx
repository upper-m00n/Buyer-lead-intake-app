import StatusDropdownClient from './StatusDropdownClient';
import { prisma } from '@/lib/prisma';
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DeleteBuyerButton from './DeleteBuyerButton';
import ImportExportCSV from './ImportExportCSV';



function getFilters(searchParams: URLSearchParams) {
  return {
    city: searchParams.get('city') || '',
    propertyType: searchParams.get('propertyType') || '',
    status: searchParams.get('status') || '',
    timeline: searchParams.get('timeline') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1', 10),
  };
}

function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="p-8 text-red-600">
      <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

export default async function BuyersPage({ searchParams }: { searchParams?: Record<string, string> }) {
  let paramsObj: Record<string, string> = {};
  if (searchParams && typeof (searchParams as any).forEach === 'function') {
    // URLSearchParams: convert to object
    paramsObj = {};
    (searchParams as any).forEach((value: string, key: string) => {
      paramsObj[key] = value;
    });
  } else if (searchParams) {
    paramsObj = searchParams;
  }
  const params = new URLSearchParams(Object.entries(paramsObj));
  const { city, propertyType, status, timeline, search, page } = getFilters(params);
  const take = 10;
  const skip = (page - 1) * take;

  const where: any = {};
  if (city) where.city = city;
  if (propertyType) where.propertyType = propertyType;
  if (status) where.status = status;
  if (timeline) where.timeline = timeline;
  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ];
  }

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
  const user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;

  const [buyers, total] = await Promise.all([
    prisma.buyer.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take,
      skip,
    }),
    prisma.buyer.count({ where }),
  ]);

  const totalPages = Math.ceil(total / take);

  try {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Buyer Leads</h1>
        <Link href='/buyers/new'><Button>Create new lead</Button></Link>
        <ImportExportCSV params={params.toString()} />
        <form className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-4" action="" method="get">
          <select name="city" defaultValue={city} className="border p-2 rounded">
            <option value="">City</option>
            {['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select name="propertyType" defaultValue={propertyType} className="border p-2 rounded">
            <option value="">Property Type</option>
            {['Apartment', 'Villa', 'Plot', 'Office', 'Retail'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select name="status" defaultValue={status} className="border p-2 rounded">
            <option value="">Status</option>
            {['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select name="timeline" defaultValue={timeline} className="border p-2 rounded">
            <option value="">Timeline</option>
            {['ZeroToThreeMonths', 'ThreeToSixMonths', 'OverSixMonths', 'Exploring'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input name="search" defaultValue={search} className="border p-2 rounded" placeholder="Search name, phone, email..." />
          <Button type="submit">Filter</Button>
        </form>
        {buyers.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No buyer leads found.</div>
        ) : (
          <>
            <table className="w-full border">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Property Type</th>
                  <th>Budget</th>
                  <th>Timeline</th>
                  <th>Status</th>
                  <th>Updated At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {buyers.map((buyer) => {
                  const canEdit = user && (user.isAdmin || buyer.ownerId === user.id);
                  return (
                    <tr key={buyer.id}>
                      <td>{buyer.fullName}</td>
                      <td>{buyer.phone}</td>
                      <td>{buyer.city}</td>
                      <td>{buyer.propertyType}</td>
                      <td>{buyer.budgetMin || '-'} – {buyer.budgetMax || '-'}</td>
                      <td>{buyer.timeline}</td>
                      <td>
                        {canEdit ? (
                          <StatusDropdownClient buyerId={buyer.id} status={buyer.status} />
                        ) : (
                          buyer.status
                        )}
                      </td>
                      <td>{new Date(buyer.updatedAt).toLocaleString()}</td>
                      <td>
                        <Link href={`/buyers/${buyer.id}`}><Button size="sm">View</Button></Link>
                        {canEdit && <Link href={`/buyers/${buyer.id}`}><Button size="sm" className="ml-2">Edit</Button></Link>}
                        {canEdit && <DeleteBuyerButton buyerId={buyer.id} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4 flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <Link key={i} href={`?${params.toString().replace(/page=\d+/, '')}&page=${i + 1}`}>
                  <Button size="sm" variant={page === i + 1 ? 'default' : 'outline'}>{i + 1}</Button>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    );
  } catch (error: any) {
    return <ErrorBoundary error={error} />;
  }
}
