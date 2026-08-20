'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function EnquiriesClient({ initialEnquiries }: { initialEnquiries: any[] }) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshList = async () => {
    const res = await fetch('/api/enquiries');
    if (res.ok) setEnquiries(await res.json());
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) throw new Error('Failed to update enquiry status');

      await refreshList();
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete lead enquiry from "${name}"?`)) return;

    try {
      const res = await fetch(`/api/enquiries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete enquiry');

      setMsg({ type: 'success', text: `Enquiry lead from "${name}" deleted.` });
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error deleting enquiry' });
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Public Enquiries Pipeline</h2>
          <a
            href="/api/export?type=enquiries"
            target="_blank"
            className="text-xs text-amber-400 hover:underline font-semibold"
          >
            Export CSV →
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Service</th>
                <th className="p-4 font-semibold">Message</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                    No public enquiries received yet.
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-slate-400 font-mono">{formatDate(e.createdAt)}</td>
                    <td className="p-4 font-bold text-white">{e.fullName}</td>
                    <td className="p-4 text-amber-400 font-mono font-semibold">{e.phone}</td>
                    <td className="p-4 text-slate-300">{e.service || 'General'}</td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">{e.message || '-'}</td>
                    <td className="p-4">
                      <select
                        value={e.status}
                        onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                        className="bg-slate-950 border border-slate-800 text-amber-400 rounded-lg px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(e.id, e.fullName)}
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
