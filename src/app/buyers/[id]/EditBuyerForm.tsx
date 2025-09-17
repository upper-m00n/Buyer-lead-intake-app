"use client";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Buyer, BuyerHistory, User } from '@/lib/types';


export default function EditBuyerForm(props: { buyer: Buyer; history: BuyerHistory[]; user?: User }) {
  const { buyer, history, user } = props;
  const router = useRouter();
  return (
    <div>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const payload: Record<string, unknown> = {};
        formData.forEach((value, key) => {
          payload[key] = value;
        });
        if (payload.budgetMin) payload.budgetMin = Number(payload.budgetMin);
        if (payload.budgetMax) payload.budgetMax = Number(payload.budgetMax);
        if (payload.tags) payload.tags = String(payload.tags).split(',').map((t) => t.trim());
        const res = await fetch(`/api/buyers/${buyer.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const result: { success?: boolean; error?: string } = await res.json();
        if (result.success) {
          toast.success('Buyer updated sucessfully!');
          router.push(`/buyers`)
          window.location.reload();
        } else if (res.status === 409) {
          toast.error('Record changed, please refresh and try again.');
        } else if (res.status === 403) {
          toast.error('You are not the owner')
        } else {
          toast.error(result.error ? `Error while updating: ${result.error}` : "Error while updating");
          console.log("error", result.error);
        }
      }}>
        <input type="hidden" name="updatedAt" defaultValue={buyer.updatedAt} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>Full Name<input name="fullName" defaultValue={buyer.fullName} required className="border p-2 w-full" /></label>
          <label>Email<input name="email" defaultValue={buyer.email || ''} className="border p-2 w-full" /></label>
          <label>Phone<input name="phone" defaultValue={buyer.phone} required className="border p-2 w-full" /></label>
          <label>City<input name="city" defaultValue={buyer.city} required className="border p-2 w-full" /></label>
          <label>Property Type<input name="propertyType" defaultValue={buyer.propertyType} required className="border p-2 w-full" /></label>
          <label>BHK<input name="bhk" defaultValue={buyer.bhk || ''} className="border p-2 w-full" /></label>
          <label>Purpose<input name="purpose" defaultValue={buyer.purpose} required className="border p-2 w-full" /></label>
          <label>Min Budget<input name="budgetMin" type="number" defaultValue={buyer.budgetMin || ''} className="border p-2 w-full" /></label>
          <label>Max Budget<input name="budgetMax" type="number" defaultValue={buyer.budgetMax || ''} className="border p-2 w-full" /></label>
          <label>Timeline<input name="timeline" defaultValue={buyer.timeline} required className="border p-2 w-full" /></label>
          <label>Source<input name="source" defaultValue={buyer.source} required className="border p-2 w-full" /></label>
          <label>Status<input name="status" defaultValue={buyer.status} required className="border p-2 w-full" /></label>
          <label>Notes<textarea name="notes" defaultValue={buyer.notes || ''} className="border p-2 w-full" /></label>
          <label>Tags<input name="tags" defaultValue={buyer.tags.join(', ')} className="border p-2 w-full" /></label>
        </div>
        {(user && (user.id === buyer.ownerId || user.isAdmin)) && (
          <Button type="submit">Save Changes</Button>
        )}
        <div className="mt-0">
          <Link href="/buyers"><Button variant="outline">Back to List</Button></Link>
        </div>
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Last 5 Changes</h2>
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="border p-2 rounded">
                <div><b>Changed At:</b> {new Date(h.changedAt).toLocaleString()}</div>
                <div><b>Changed By:</b> {h.changedById}</div>
                <div><b>Diff:</b> {JSON.stringify(h.diff)}</div>
              </li>
            ))}
          </ul>
        </div>
      </form>
    </div>
  );
}
