'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface GroupsClientProps {
  initialGroups: any[];
  customers: any[];
  branches: any[];
}

export default function GroupsClient({ initialGroups, customers, branches }: GroupsClientProps) {
  const router = useRouter();
  const [groups, setGroups] = useState(initialGroups);
  const [editingGroup, setEditingGroup] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshList = async () => {
    const res = await fetch('/api/groups');
    if (res.ok) setGroups(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const selectedMembers = Array.from(
      (form.elements.namedItem('member_ids') as HTMLSelectElement).selectedOptions
    ).map((opt) => Number(opt.value));

    const body = {
      id: editingGroup ? editingGroup.id : undefined,
      branchId: Number((form.elements.namedItem('branch_id') as HTMLSelectElement).value),
      groupName: (form.elements.namedItem('group_name') as HTMLInputElement).value,
      leaderCustomerId: (form.elements.namedItem('leader_id') as HTMLSelectElement).value
        ? Number((form.elements.namedItem('leader_id') as HTMLSelectElement).value)
        : null,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
      memberCustomerIds: selectedMembers,
    };

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save group');

      setMsg({ type: 'success', text: editingGroup ? 'Travel group updated!' : 'Travel group created!' });
      setEditingGroup(null);
      form.reset();
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving group' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete travel group "${name}"?`)) return;

    try {
      const res = await fetch(`/api/groups?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete travel group');

      setMsg({ type: 'success', text: `Travel group "${name}" deleted.` });
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error deleting travel group' });
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

      {/* Group Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {editingGroup ? `Edit Travel Group (#${editingGroup.id})` : 'Create Family / Travel Group'}
            </h2>
          </div>
          {editingGroup && (
            <button onClick={() => setEditingGroup(null)} className="text-xs text-slate-400 hover:text-white underline">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch</label>
            <select
              name="branch_id"
              defaultValue={editingGroup?.branchId || branches[0]?.id}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Group Name *</label>
            <input
              type="text"
              name="group_name"
              required
              defaultValue={editingGroup?.groupName || ''}
              placeholder="e.g. Hassan Family Group"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Group Leader</label>
            <select
              name="leader_id"
              defaultValue={editingGroup?.leaderCustomerId || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Choose Leader --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName} ({c.phone || `ID #${c.id}`})</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select Family Members (Hold Ctrl/Cmd to select multiple)</label>
            <select
              name="member_ids"
              multiple
              className="w-full h-28 px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.fullName} — Passport: {c.passportNo || 'N/A'}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={editingGroup?.notes || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingGroup ? 'Update Group' : 'Save Travel Group'}
            </button>
          </div>
        </form>
      </div>

      {/* Groups Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Travel & Family Groups</h2>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 font-semibold">Actions</th>
                <th className="px-3 py-3 font-semibold">Group ID</th>
                <th className="px-3 py-3 font-semibold">Group Name</th>
                <th className="px-3 py-3 font-semibold">Group Leader</th>
                <th className="px-3 py-3 font-semibold">Total Members</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                    No travel groups registered yet.
                  </td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingGroup(g);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(g.id, g.groupName)}
                          className="px-2.5 py-1 rounded-md bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-bold transition-all inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Del
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-bold text-amber-400 whitespace-nowrap">GRP-{g.id}</td>
                    <td className="px-3 py-3 font-bold text-white whitespace-nowrap">{g.groupName}</td>
                    <td className="px-3 py-3 text-slate-300 whitespace-nowrap">{g.leader?.fullName || '-'}</td>
                    <td className="px-3 py-3 font-bold text-emerald-400 whitespace-nowrap">{g.members ? g.members.length : 0} Pilgrims</td>
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
