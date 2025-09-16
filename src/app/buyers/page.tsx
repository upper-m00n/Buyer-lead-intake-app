import { prisma } from '@/lib/prisma';
import { CITIES, PROPERTY_TYPES, STATUSES, TIMELINES } from '@/lib/types';
import Link from 'next/link';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';


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

export default async function BuyersPage({ searchParams }: { searchParams?: Record<string, string> }) {
  const params = new URLSearchParams(searchParams ? Object.entries(searchParams) : []);
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
      { phone: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

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

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Buyer Leads</h1>
      {/* Filters and search bar */}
      <form className="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4" action="" method="get">
        <select name="city" defaultValue={city} className="border p-2">
          <option value="">All Cities</option>
          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select name="propertyType" defaultValue={propertyType} className="border p-2">
          <option value="">All Property Types</option>
          {PROPERTY_TYPES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select name="status" defaultValue={status} className="border p-2">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select name="timeline" defaultValue={timeline} className="border p-2">
          <option value="">All Timelines</option>
          {TIMELINES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search name, phone, email"
          className="border p-2"
        />
        <Button type="submit">Filter</Button>
      </form>
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
          {buyers.map((buyer) => (
            <tr key={buyer.id}>
              <td>{buyer.fullName}</td>
              <td>{buyer.phone}</td>
              <td>{buyer.city}</td>
              <td>{buyer.propertyType}</td>
              <td>{buyer.budgetMin || '-'} – {buyer.budgetMax || '-'}</td>
              <td>{buyer.timeline}</td>
              <td>{buyer.status}</td>
              <td>{new Date(buyer.updatedAt).toLocaleString()}</td>
              <td>
                <Link href={`/buyers/${buyer.id}`}><Button size="sm">View / Edit</Button></Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <Link key={i} href={`?${params.toString().replace(/page=\d+/, '')}&page=${i + 1}`}>
            <Button size="sm" variant={page === i + 1 ? 'default' : 'outline'}>{i + 1}</Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
