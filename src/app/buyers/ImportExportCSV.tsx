"use client";
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

export default function ImportExportCSV({ params }: { params: string }) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('csv', file);
  };

  const handleExport = () => {
    window.location.href = `/api/buyers/export?${params}`;
  };

  return (
    <div className="flex gap-4 mb-4">
      <form onSubmit={handleImport}>
        <input type="file" name="csv" accept=".csv" ref={fileRef} className="mr-2" />
        <Button type="submit">Import CSV</Button>
      </form>
      <Button type="button" onClick={handleExport}>Export CSV</Button>
    </div>
  );
}