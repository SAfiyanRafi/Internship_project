'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { FileCheck, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface VisasClientProps {
  initialVisas: any[];
  customers: any[];
  bookings: any[];
}

export default function VisasClient({ initialVisas, customers, bookings }: VisasClientProps) {
  const router = useRouter();
  const [visas, setVisas] = useState(initialVisas);
  const [editingVisa, setEditingVisa] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const visaStatuses = [
    'Documents Pending',
    'Documents Received',
    'Biometric Scheduled',
    'Submitted to Embassy',
    'Visa Approved',
    'Visa Rejected',
  ];

  const refreshList = async () => {
    const updatedRes = await fetch('/api/visas');
    if (updatedRes.ok) setVisas(await updatedRes.json());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      id: editingVisa ? editingVisa.id : undefined,
      customerId: Number((form.elements.namedItem('customer_id') as HTMLSelectElement).value),
      bookingId: (form.elements.namedItem('booking_id') as HTMLSelectElement).value
        ? Number((form.elements.namedItem('booking_id') as HTMLSelectElement).value)
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

      setMsg({ type: 'success', text: editingVisa ? 'Visa record updated!' : 'Visa record saved!' });
      setEditingVisa(null);
      form.reset();
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving visa record' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete visa record #${id}?`)) return;

    try {
      const res = await fetch(`/api/visas?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete visa record');

      setMsg({ type: 'success', text: `Visa record #${id} deleted.` });
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error deleting visa record' });
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

      {/* Visa Form Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {editingVisa ? `Edit Visa Application (#${editingVisa.id})` : 'New Visa Application'}
            </h2>
          </div>
          {editingVisa && (
            <button onClick={() => setEditingVisa(null)} className="text-xs text-slate-400 hover:text-white underline">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Customer *</label>
            <select
              name="customer_id"
              required
              defaultValue={editingVisa?.customerId || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.passportNo ? `Passport: ${c.passportNo}` : `ID #${c.id}`})
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Booking (Optional)</label>
            <select
              name="booking_id"
              defaultValue={editingVisa?.bookingId || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">-- None --</option>
              {bookings.map((b) => (
                <option key={b.id} value={b.id}>
                  Booking #{b.id} — {b.customer?.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Visa Status</label>
            <select
              name="status"
              defaultValue={editingVisa?.status || 'Documents Pending'}
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
              defaultValue={editingVisa?.applicationNo || ''}
              placeholder="e.g. MOFA-992123"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Submission Date</label>
            <input
              type="date"
              name="submitted_date"
              defaultValue={editingVisa?.submittedDate || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Decision / Approval Date</label>
            <input
              type="date"
              name="decision_date"
              defaultValue={editingVisa?.decisionDate || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={editingVisa?.notes || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingVisa ? 'Update Visa Status' : 'Save Visa Status'}
            </button>
          </div>
        </form>
      </div>

      {/* Visas Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Visa Status Directory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Passport No.</th>
                <th className="p-4 font-semibold">Application No</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Submitted</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No visa records found.
                  </td>
                </tr>
              ) : (
                visas.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-medium text-white">{v.customer?.fullName || '-'}</td>
                    <td className="p-4 text-amber-400 font-mono font-semibold">{v.customer?.passportNo || '-'}</td>
                    <td className="p-4 font-mono text-slate-300">{v.applicationNo || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          v.status === 'Visa Approved'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : v.status === 'Visa Rejected'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{formatDate(v.submittedDate)}</td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setEditingVisa(v);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-amber-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(v.id)}
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
