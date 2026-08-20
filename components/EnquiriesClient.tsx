'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';
import { MessageSquare, Download, CheckCircle2 } from 'lucide-react';

export default function EnquiriesClient({ initialEnquiries }: { initialEnquiries: any[] }) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState(initialEnquiries);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const statuses = ['New', 'Contacted', 'Converted', 'Closed'];

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Enquiries Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Public Leads</h2>
          </div>
          <a
            href="/api/export?type=enquiries"
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
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Full Name</th>
                <th className="p-4 font-semibold">Phone / WhatsApp</th>
                <th className="p-4 font-semibold">Service</th>
                <th className="p-4 font-semibold">Message</th>
                <th className="p-4 font-semibold">Pipeline Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {enquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No enquiries submitted yet.
                  </td>
                </tr>
              ) : (
                enquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono text-slate-400">{formatDate(e.createdAt)}</td>
                    <td className="p-4 font-medium text-white">{e.fullName}</td>
                    <td className="p-4 font-mono text-amber-400">{e.phone}</td>
                    <td className="p-4 font-semibold text-slate-300">{e.service || 'Umrah'}</td>
                    <td className="p-4 text-slate-300 max-w-xs whitespace-normal leading-relaxed">{e.message || '-'}</td>
                    <td className="p-4">
                      <select
                        value={e.status}
                        disabled={updatingId === e.id}
                        onChange={(evt) => handleStatusChange(e.id, evt.target.value)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
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
