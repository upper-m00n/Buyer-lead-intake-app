"use client";
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function DeleteBuyerButton({ buyerId }: { buyerId: string }) {
  const [loading, setLoading] = useState(false);
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this buyer?')) return;
    setLoading(true);
    const res = await fetch(`/api/buyers/${buyerId}`, { method: 'DELETE' });
    setLoading(false);
    if (res.ok) {
      window.location.reload();
    } else {
      alert('Delete failed');
    }
  };
  return (
    <Button size="sm" className="ml-2" variant="destructive" onClick={handleDelete} disabled={loading}>
      {loading ? 'Deleting...' : 'Delete'}
    </Button>
  );
}