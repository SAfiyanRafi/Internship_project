'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { FileCheck2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function VisasClient({ initialVisas, customers }: { initialVisas: any[]; customers: any[] }) {
  const router = useRouter();
  const [visas, setVisas] = useState(initialVisas);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const visaStatuses = ['Documents Pending', 'Submitted', 'Processing', 'Approved', 'Rejected'];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      customerId: Number((form.elements.namedItem('customer_id') as HTMLSelectElement).value),
      bookingId: (form.elements.namedItem('booking_id') as HTMLInputElement).value
        ? Number((form.elements.namedItem('booking_id') as HTMLInputElement).value)
        : null,
      status: (form.elements.namedItem('status') as HTMLSelectElement).value,
      applicationNo: (form.elements.namedItem('application_no') as HTMLInputElement).value || null,
      submittedDate: (form.elements.namedItem('submitted_date') as HTMLInputElement).value || null,
      decisionDate: (form.elements.namedItem('decision_date') as HTMLInputElement).value || null,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    try {
      const res = await fetch('/api/visas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save visa record');

      setMsg({ type: 'success', text: 'Visa record added successfully!' });
      form.reset();
      router.refresh();

      const updatedRes = await fetch('/api/visas');
      if (updatedRes.ok) setVisas(await updatedRes.json());
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving visa' });
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

      {/* Visa Entry Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <FileCheck2 className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Add Visa Application Record</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Customer *</label>
            <select
              name="customer_id"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.passportNo || 'No Passport'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Booking ID (Optional)</label>
            <input
              type="number"
              name="booking_id"
              placeholder="e.g. 1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Visa Status</label>
            <select
              name="status"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {visaStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Application / MOFA No.</label>
            <input
              type="text"
              name="application_no"
              placeholder="MOFA-987654"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Submitted Date</label>
            <input
              type="date"
              name="submitted_date"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Decision Date</label>
            <input
              type="date"
              name="decision_date"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
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
              {loading ? 'Saving...' : 'Save Visa Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Visa Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Visa Records</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Passport</th>
                <th className="p-4 font-semibold">Application No</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Submitted Date</th>
                <th className="p-4 font-semibold">Decision Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No visa records created yet.
                  </td>
                </tr>
              ) : (
                visas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-white">{v.customer?.fullName || '-'}</td>
                    <td className="p-4 text-amber-400 font-mono font-semibold">{v.customer?.passportNo || '-'}</td>
                    <td className="p-4 font-mono text-slate-300">{v.applicationNo || '-'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{formatDate(v.submittedDate)}</td>
                    <td className="p-4 text-slate-300 font-mono">{formatDate(v.decisionDate)}</td>
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
