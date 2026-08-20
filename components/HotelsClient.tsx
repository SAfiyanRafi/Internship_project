'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Hotel, CheckCircle2, AlertCircle } from 'lucide-react';

export default function HotelsClient({ initialHotels }: { initialHotels: any[] }) {
  const router = useRouter();
  const [hotels, setHotels] = useState(initialHotels);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      city: (form.elements.namedItem('city') as HTMLInputElement).value,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      distance: (form.elements.namedItem('distance') as HTMLInputElement).value || null,
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value || null,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
      isPublic: (form.elements.namedItem('is_public') as HTMLInputElement).checked,
    };

    try {
      const res = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save hotel');

      setMsg({ type: 'success', text: 'Hotel added successfully!' });
      form.reset();
      router.refresh();

      const updatedRes = await fetch('/api/hotels');
      if (updatedRes.ok) setHotels(await updatedRes.json());
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving hotel' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {msg && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* Hotel Entry Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <Hotel className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Add New Hotel</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">City *</label>
            <input
              type="text"
              name="city"
              required
              placeholder="e.g. Makkah / Madinah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Hotel Name *</label>
            <input
              type="text"
              name="name"
              required
              placeholder="e.g. Swissotel Makkah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Distance to Haram</label>
            <input
              type="text"
              name="distance"
              placeholder="e.g. 500m / Clock Tower"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              placeholder="+966 12 000 0000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer pt-6">
              <input type="checkbox" name="is_public" className="w-4 h-4 rounded border-slate-800 accent-amber-500" />
              <span>Publish publicly on landing page</span>
            </label>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Hotel'}
            </button>
          </div>
        </form>
      </div>

      {/* Hotels Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Hotels Directory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">City</th>
                <th className="p-4 font-semibold">Hotel Name</th>
                <th className="p-4 font-semibold">Distance</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Public</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {hotels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                    No hotels added yet.
                  </td>
                </tr>
              ) : (
                hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-amber-400">{h.city}</td>
                    <td className="p-4 font-medium text-white">{h.name}</td>
                    <td className="p-4 text-slate-300">{h.distance || '-'}</td>
                    <td className="p-4 font-mono text-slate-300">{h.phone || '-'}</td>
                    <td className="p-4">
                      {h.isPublic ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Yes</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">No</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
