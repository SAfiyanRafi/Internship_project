'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UsersRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GroupsClient({ initialGroups, customers }: { initialGroups: any[]; customers: any[] }) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const groupName = (form.elements.namedItem('group_name') as HTMLInputElement).value;
    const leaderCustomerId = (form.elements.namedItem('leader_id') as HTMLSelectElement).value
      ? Number((form.elements.namedItem('leader_id') as HTMLSelectElement).value)
      : null;
    const notes = (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null;

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName, leaderCustomerId, notes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create travel group');

      setMsg({ type: 'success', text: 'Travel group created successfully!' });
      form.reset();
      router.refresh();

      const updatedRes = await fetch('/api/groups');
      if (updatedRes.ok) setGroups(await updatedRes.json());
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error creating group' });
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

      {/* Group Entry Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <UsersRound className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Create Family / Travel Group</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Group Name *</label>
            <input
              type="text"
              name="group_name"
              required
              placeholder="e.g. Khan Family Umrah 2026"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Group Leader</label>
            <select
              name="leader_id"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Choose Group Leader --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.passportNo || 'No Passport'})</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Group Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Rooming preferences, family member relationship details..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Travel Group'}
            </button>
          </div>
        </form>
      </div>

      {/* Groups Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Travel Groups List</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Group ID</th>
                <th className="p-4 font-semibold">Group Name</th>
                <th className="p-4 font-semibold">Group Leader</th>
                <th className="p-4 font-semibold">Members Count</th>
                <th className="p-4 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                    No travel groups created yet.
                  </td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-amber-400">GRP-#{g.id}</td>
                    <td className="p-4 font-medium text-white">{g.groupName}</td>
                    <td className="p-4 text-slate-300">{g.leader?.fullName || 'Not assigned'}</td>
                    <td className="p-4 font-bold text-emerald-400">{g.members ? g.members.length : 0} Members</td>
                    <td className="p-4 text-slate-400">{g.notes || '-'}</td>
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
