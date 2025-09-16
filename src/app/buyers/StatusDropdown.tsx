"use client";
import { STATUSES } from '@/lib/types';
import { useState } from 'react';

export default function StatusDropdown({ buyerId, status, disabled }: { buyerId: string, status: string, disabled?: boolean }) {
  const [current, setCurrent] = useState(status);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    if (!newStatus || newStatus === current) return;
    setLoading(true);
    await fetch(`/api/buyers/${buyerId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setCurrent(newStatus);
    setLoading(false);
    window.location.reload();
  }

  return (
    <select value={current} onChange={handleChange} disabled={disabled || loading} className="border p-1 rounded">
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
