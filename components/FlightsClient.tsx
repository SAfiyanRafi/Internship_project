'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plane, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function FlightsClient({ initialFlights }: { initialFlights: any[] }) {
  const router = useRouter();
  const [flights, setFlights] = useState(initialFlights);
  const [editingFlight, setEditingFlight] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshList = async () => {
    const updatedRes = await fetch('/api/flights');
    if (updatedRes.ok) setFlights(await updatedRes.json());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      id: editingFlight ? editingFlight.id : undefined,
      airline: (form.elements.namedItem('airline') as HTMLInputElement).value,
      flightNo: (form.elements.namedItem('flight_no') as HTMLInputElement).value || null,
      origin: (form.elements.namedItem('origin') as HTMLInputElement).value || null,
      destination: (form.elements.namedItem('destination') as HTMLInputElement).value || null,
      departureAt: (form.elements.namedItem('departure_at') as HTMLInputElement).value || null,
      arrivalAt: (form.elements.namedItem('arrival_at') as HTMLInputElement).value || null,
      baggage: (form.elements.namedItem('baggage') as HTMLInputElement).value || null,
      publicNotice: (form.elements.namedItem('public_notice') as HTMLInputElement).checked,
    };

    try {
      const res = await fetch('/api/flights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save flight');

      setMsg({ type: 'success', text: editingFlight ? 'Flight updated successfully!' : 'Flight added successfully!' });
      setEditingFlight(null);
      form.reset();
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving flight' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, flightNo: string) => {
    if (!confirm(`Are you sure you want to delete flight "${flightNo}"?`)) return;

    try {
      const res = await fetch(`/api/flights?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete flight');

      setMsg({ type: 'success', text: `Flight "${flightNo}" deleted.` });
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error deleting flight' });
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

      {/* Flight Form Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Plane className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {editingFlight ? `Edit Flight Notice (#${editingFlight.id})` : 'Add New Flight Notice'}
            </h2>
          </div>
          {editingFlight && (
            <button onClick={() => setEditingFlight(null)} className="text-xs text-slate-400 hover:text-white underline">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Airline *</label>
            <input
              type="text"
              name="airline"
              required
              defaultValue={editingFlight?.airline || ''}
              placeholder="e.g. Saudi Arabian Airlines"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Flight No.</label>
            <input
              type="text"
              name="flight_no"
              defaultValue={editingFlight?.flightNo || ''}
              placeholder="e.g. SV-735"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Origin</label>
            <input
              type="text"
              name="origin"
              defaultValue={editingFlight?.origin || ''}
              placeholder="Lahore (LHE)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Destination</label>
            <input
              type="text"
              name="destination"
              defaultValue={editingFlight?.destination || ''}
              placeholder="Jeddah (JED)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Departure Date & Time</label>
            <input
              type="text"
              name="departure_at"
              defaultValue={editingFlight?.departureAt || ''}
              placeholder="2026-09-10 04:30"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Arrival Date & Time</label>
            <input
              type="text"
              name="arrival_at"
              defaultValue={editingFlight?.arrivalAt || ''}
              placeholder="2026-09-10 08:15"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Baggage Allowance</label>
            <input
              type="text"
              name="baggage"
              defaultValue={editingFlight?.baggage || ''}
              placeholder="2x 23kg + 7kg Hand Baggage"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input type="checkbox" name="public_notice" defaultChecked={editingFlight ? editingFlight.publicNotice : true} className="w-4 h-4 rounded border-slate-800 accent-amber-500" />
              <span>Publish in website flight notices</span>
            </label>
          </div>

          <div className="sm:col-span-2 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingFlight ? 'Update Flight' : 'Save Flight'}
            </button>
          </div>
        </form>
      </div>

      {/* Flights Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Flight Schedules Directory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Airline</th>
                <th className="p-4 font-semibold">Flight No</th>
                <th className="p-4 font-semibold">Route</th>
                <th className="p-4 font-semibold">Departure</th>
                <th className="p-4 font-semibold">Public Notice</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {flights.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No flight notices registered yet.
                  </td>
                </tr>
              ) : (
                flights.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-white">{f.airline}</td>
                    <td className="p-4 text-amber-400 font-mono font-semibold">{f.flightNo || '-'}</td>
                    <td className="p-4 text-slate-300 font-semibold">{f.origin} → {f.destination}</td>
                    <td className="p-4 text-slate-300 font-mono">{f.departureAt || 'TBA'}</td>
                    <td className="p-4">
                      {f.publicNotice ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Published</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">Internal</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setEditingFlight(f);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-amber-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.flightNo || f.airline)}
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
