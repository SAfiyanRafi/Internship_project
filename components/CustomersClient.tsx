'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Download, UserPlus, FileText, Edit, CheckCircle2, AlertCircle } from 'lucide-react';

interface CustomersClientProps {
  initialCustomers: any[];
  branches: any[];
  userBranchId: number;
}

export default function CustomersClient({ initialCustomers, branches, userBranchId }: CustomersClientProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      (c.phone && c.phone.toLowerCase().includes(q)) ||
      (c.passportNo && c.passportNo.toLowerCase().includes(q)) ||
      (c.cnic && c.cnic.toLowerCase().includes(q))
    );
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save customer');

      setMsg({ type: 'success', text: 'Customer saved successfully!' });
      setEditingCustomer(null);
      router.refresh();
      
      // Refresh local list
      const updatedRes = await fetch('/api/customers');
      if (updatedRes.ok) {
        setCustomers(await updatedRes.json());
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error saving customer' });
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

      {/* Customer Form Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <UserPlus className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {editingCustomer ? `Edit Customer (#${editingCustomer.id})` : 'Add New Customer'}
            </h2>
          </div>
          {editingCustomer && (
            <button
              onClick={() => setEditingCustomer(null)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {editingCustomer && <input type="hidden" name="id" value={editingCustomer.id} />}

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch</label>
            <select
              name="branch_id"
              defaultValue={editingCustomer?.branchId || userBranchId}
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
              name="full_name"
              required
              defaultValue={editingCustomer?.fullName || ''}
              placeholder="e.g. Ahmad Hassan"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Father Name</label>
            <input
              type="text"
              name="father_name"
              defaultValue={editingCustomer?.fatherName || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Phone / WhatsApp</label>
            <input
              type="text"
              name="phone"
              defaultValue={editingCustomer?.phone || ''}
              placeholder="+92 300 1234567"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              defaultValue={editingCustomer?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">CNIC Number</label>
            <input
              type="text"
              name="cnic"
              defaultValue={editingCustomer?.cnic || ''}
              placeholder="35202-0000000-0"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Passport No.</label>
            <input
              type="text"
              name="passport_no"
              defaultValue={editingCustomer?.passportNo || ''}
              placeholder="AB1234567"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Passport Expiry</label>
            <input
              type="date"
              name="passport_expiry"
              defaultValue={editingCustomer?.passportExpiry || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Date of Birth</label>
            <input
              type="date"
              name="dob"
              defaultValue={editingCustomer?.dob || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Gender</label>
            <select
              name="gender"
              defaultValue={editingCustomer?.gender || 'Male'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Nationality</label>
            <input
              type="text"
              name="nationality"
              defaultValue={editingCustomer?.nationality || 'Pakistani'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Emergency Contact</label>
            <input
              type="text"
              name="emergency_contact"
              defaultValue={editingCustomer?.emergencyContact || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Passport Document Upload</label>
            <input
              type="file"
              name="passport_file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">CNIC Document Upload</label>
            <input
              type="file"
              name="cnic_file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Address</label>
            <input
              type="text"
              name="address"
              defaultValue={editingCustomer?.address || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={editingCustomer?.notes || ''}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>

      {/* Customer Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search customer, phone, CNIC, passport..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <a
            href="/api/export?type=customers"
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
                <th className="p-4 font-semibold">ID</th>
                <th className="p-4 font-semibold">Full Name</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Passport No</th>
                <th className="p-4 font-semibold">CNIC</th>
                <th className="p-4 font-semibold">Branch</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500 italic">
                    No customers found matching search criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-slate-400">#{c.id}</td>
                    <td className="p-4 font-medium text-white">{c.fullName}</td>
                    <td className="p-4 text-slate-300 font-mono">{c.phone || '-'}</td>
                    <td className="p-4 text-amber-400/90 font-mono font-semibold">{c.passportNo || '-'}</td>
                    <td className="p-4 text-slate-300 font-mono">{c.cnic || '-'}</td>
                    <td className="p-4 text-slate-400">{c.branch?.name || '-'}</td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setEditingCustomer(c);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-amber-400 hover:underline font-semibold"
                      >
                        Edit
                      </button>
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-blue-400 hover:underline font-semibold"
                      >
                        Profile →
                      </Link>
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
