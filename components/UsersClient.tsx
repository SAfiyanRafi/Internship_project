'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface UsersClientProps {
  initialUsers: any[];
  branches: any[];
}

export default function UsersClient({ initialUsers, branches }: UsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const roles = ['Super Admin', 'Manager', 'Accountant', 'Staff'];

  const refreshList = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      id: editingUser ? editingUser.id : undefined,
      branchId: (form.elements.namedItem('branch_id') as HTMLSelectElement).value
        ? Number((form.elements.namedItem('branch_id') as HTMLSelectElement).value)
        : null,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value || undefined,
      role: (form.elements.namedItem('role') as HTMLSelectElement).value,
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save staff account');

      setMsg({ type: 'success', text: editingUser ? 'Staff account updated!' : 'Staff account created!' });
      setEditingUser(null);
      form.reset();
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving staff account' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete staff user account "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user account');

      setMsg({ type: 'success', text: `Staff user account "${name}" deleted.` });
      await refreshList();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error deleting staff account' });
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

      {/* Staff Account Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {editingUser ? `Edit Staff Account (#${editingUser.id})` : 'Add New Staff Member'}
            </h2>
          </div>
          {editingUser && (
            <button onClick={() => setEditingUser(null)} className="text-xs text-slate-400 hover:text-white underline">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch</label>
            <select
              name="branch_id"
              defaultValue={editingUser?.branchId || branches[0]?.id}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Full Name *</label>
            <input
              type="text"
              name="name"
              required
              defaultValue={editingUser?.name || ''}
              placeholder="e.g. Usman Ali"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address *</label>
            <input
              type="email"
              name="email"
              required
              defaultValue={editingUser?.email || ''}
              placeholder="usman@thabba.local"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {editingUser ? 'Password (Leave blank to keep existing)' : 'Password *'}
            </label>
            <input
              type="password"
              name="password"
              required={!editingUser}
              minLength={6}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Role Permissions</label>
            <select
              name="role"
              defaultValue={editingUser?.role || 'Staff'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingUser ? 'Update Staff Account' : 'Create Staff Account'}
            </button>
          </div>
        </form>
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Staff Accounts Directory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Name</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Branch</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-white">{u.name}</td>
                  <td className="p-4 text-slate-300 font-mono">{u.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{u.branch?.name || 'All Branches'}</td>
                  <td className="p-4 text-right space-x-3">
                    <button
                      onClick={() => {
                        setEditingUser(u);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-amber-400 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      className="text-rose-400 hover:underline font-semibold inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
