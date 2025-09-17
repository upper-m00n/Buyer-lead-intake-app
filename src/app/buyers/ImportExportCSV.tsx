"use client";
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';

export default function ImportExportCSV({ params }: { params: string }) {
  const fileRef = useRef<HTMLInputElement>(null);

  type ImportError = { row: number; message: string };
  type ImportResult = { errors: ImportError[]; inserted: number } | null;
  const [importResult, setImportResult] = React.useState<ImportResult>(null);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('csv', file);
    const res = await fetch('/api/buyers/import', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    setImportResult(result);
  };

  const handleExport = () => {
    window.location.href = `/api/buyers/export?${params}`;
  };

  return (
    <div className="flex flex-col gap-4 mb-4">
      <div className="flex gap-4">
        <form onSubmit={handleImport}>
          <input type="file" name="csv" accept=".csv" ref={fileRef} className="mr-2" />
          <Button type="submit">Import CSV</Button>
        </form>
        <Button type="button" onClick={handleExport}>Export CSV</Button>
      </div>
      {importResult && (
        <div className="mt-4">
          <div>Inserted: {importResult.inserted}</div>
          {importResult.errors && importResult.errors.length > 0 && (
            <table className="border mt-2">
              <thead>
                <tr><th>Row</th><th>Error</th></tr>
              </thead>
              <tbody>
                {importResult.errors.map((err, i) => (
                  <tr key={i}><td>{err.row}</td><td>{err.message}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}