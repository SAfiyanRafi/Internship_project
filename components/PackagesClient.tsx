'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/utils';
import { Package, Download, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function PackagesClient({ initialPackages, currency }: { initialPackages: any[]; currency: string }) {
  const router = useRouter();
  const [packages, setPackages] = useState(initialPackages);
  const [editingPkg, setEditingPkg] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshList = async () => {
    const updatedRes = await fetch('/api/packages');
    if (updatedRes.ok) setPackages(await updatedRes.json());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      id: editingPkg ? editingPkg.id : undefined,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      packageType: (form.elements.namedItem('package_type') as HTMLSelectElement).value,
      days: Number((form.elements.namedItem('days') as HTMLInputElement).value),
      price: Number((form.elements.namedItem('price') as HTMLInputElement).value),
      airline: (form.elements.namedItem('airline') as HTMLInputElement).value,
      roomType: (form.elements.namedItem('room_type') as HTMLInputElement).value,
      makkahHotel: (form.elements.namedItem('makkah_hotel') as HTMLInputElement).value,
      madinahHotel: (form.elements.namedItem('madinah_hotel') as HTMLInputElement).value,
      inclusions: (form.elements.namedItem('inclusions') as HTMLTextAreaElement).value,
      exclusions: (form.elements.namedItem('exclusions') as HTMLTextAreaElement).value,
      publicDescription: (form.elements.namedItem('public_description') as HTMLTextAreaElement).value,
      isPublic: (form.elements.namedItem('is_public') as HTMLInputElement).checked,
      isActive: (form.elements.namedItem('is_active') as HTMLInputElement).checked,
    };

    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save package');

      setMsg({ type: 'success', text: editingPkg ? 'Package updated successfully!' : 'Package created successfully!' });
      setEditingPkg(null);
      form.reset();
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving package' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete package "${name}"?`)) return;

    try {
      const res = await fetch(`/api/packages?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete package');

      setMsg({ type: 'success', text: `Package "${name}" deleted.` });
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error deleting package' });
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

      {/* Package Form Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {editingPkg ? `Edit Package (#${editingPkg.id})` : 'Add New Package'}
            </h2>
          </div>
          {editingPkg && (
            <button onClick={() => setEditingPkg(null)} className="text-xs text-slate-400 hover:text-white underline">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Package Name *</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={editingPkg?.name || ''}
              placeholder="e.g. Star Umrah Package 14 Days"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Package Type</label>
            <select
              name="package_type"
              defaultValue={editingPkg?.packageType || 'Umrah'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="Umrah">Umrah</option>
              <option value="Hajj">Hajj</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Duration (Days)</label>
            <input
              type="number"
              name="days"
              defaultValue={editingPkg?.days || 14}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Price ({currency}) *</label>
            <input
              type="number"
              name="price"
              required
              defaultValue={editingPkg?.price || ''}
              placeholder="250000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Airline</label>
            <input
              type="text"
              name="airline"
              defaultValue={editingPkg?.airline || ''}
              placeholder="Saudi Airlines / PIA"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Makkah Hotel</label>
            <input
              type="text"
              name="makkah_hotel"
              defaultValue={editingPkg?.makkahHotel || ''}
              placeholder="e.g. Swissotel Makkah"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Madinah Hotel</label>
            <input
              type="text"
              name="madinah_hotel"
              defaultValue={editingPkg?.madinahHotel || ''}
              placeholder="e.g. Dar Al Taqwa"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Room Type</label>
            <input
              type="text"
              name="room_type"
              defaultValue={editingPkg?.roomType || ''}
              placeholder="Quad / Triple / Double sharing"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Inclusions</label>
            <textarea
              name="inclusions"
              rows={2}
              defaultValue={editingPkg?.inclusions || ''}
              placeholder="Visa, Flights, Hotel, Ziyarat, Transport..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Exclusions</label>
            <textarea
              name="exclusions"
              rows={2}
              defaultValue={editingPkg?.exclusions || ''}
              placeholder="Food, personal expenses..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Public Description (Website)</label>
            <textarea
              name="public_description"
              rows={2}
              defaultValue={editingPkg?.publicDescription || ''}
              placeholder="Short catchy package summary for landing page visitors..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input type="checkbox" name="is_public" defaultChecked={editingPkg ? editingPkg.isPublic : false} className="w-4 h-4 rounded border-slate-800 accent-amber-500" />
              <span>Publish on public website</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input type="checkbox" name="is_active" defaultChecked={editingPkg ? editingPkg.isActive : true} className="w-4 h-4 rounded border-slate-800 accent-amber-500" />
              <span>Package Active</span>
            </label>
          </div>

          <div className="sm:col-span-2 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingPkg ? 'Update Package' : 'Save Package'}
            </button>
          </div>
        </form>
      </div>

      {/* Package Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">All Packages</h2>
          <a
            href="/api/export?type=packages"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Days</th>
                <th className="p-4 font-semibold">Price</th>
                <th className="p-4 font-semibold">Public</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {packages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                    No packages created yet.
                  </td>
                </tr>
              ) : (
                packages.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-white">{p.name}</td>
                    <td className="p-4 text-amber-400 font-semibold">{p.packageType}</td>
                    <td className="p-4 text-slate-300">{p.days} Days</td>
                    <td className="p-4 font-bold text-emerald-400">{formatMoney(p.price, currency)}</td>
                    <td className="p-4">
                      {p.isPublic ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Yes</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">No</span>
                      )}
                    </td>
                    <td className="p-4">
                      {p.isActive ? (
                        <span className="text-emerald-400 font-semibold">Active</span>
                      ) : (
                        <span className="text-slate-500">Disabled</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setEditingPkg(p);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-amber-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="text-rose-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
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
