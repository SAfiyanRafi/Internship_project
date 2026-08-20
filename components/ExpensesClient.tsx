'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney, formatDate } from '@/lib/utils';
import { DollarSign, Edit, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExpensesClientProps {
  initialExpenses: any[];
  initialIncome: number;
  initialTotalExpenses: number;
  initialCashDiff: number;
  currency: string;
  branches: any[];
}

export default function ExpensesClient({
  initialExpenses,
  initialIncome,
  initialTotalExpenses,
  initialCashDiff,
  currency,
  branches,
}: ExpensesClientProps) {
  const router = useRouter();
  const [data, setData] = useState({
    expenses: initialExpenses,
    income: initialIncome,
    totalExpenses: initialTotalExpenses,
    cashDifference: initialCashDiff,
  });
  const [editingExpense, setEditingExpense] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const categories = [
    'Office Rent & Utilities',
    'Staff Salaries & Commissions',
    'Hotel Reservations Cost',
    'Flight Tickets Cost',
    'Visa Processing Fees',
    'Marketing & Advertisements',
    'Transportation & Fuel',
    'Miscellaneous Expense',
  ];

  const refreshData = async () => {
    const res = await fetch('/api/expenses');
    if (res.ok) {
      const json = await res.json();
      setData(json);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      id: editingExpense ? editingExpense.id : undefined,
      branchId: (form.elements.namedItem('branch_id') as HTMLSelectElement).value
        ? Number((form.elements.namedItem('branch_id') as HTMLSelectElement).value)
        : null,
      expenseDate: (form.elements.namedItem('expense_date') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLSelectElement).value,
      amount: Number((form.elements.namedItem('amount') as HTMLInputElement).value),
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value || null,
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to record expense');

      setMsg({ type: 'success', text: editingExpense ? 'Expense updated!' : 'Expense recorded!' });
      setEditingExpense(null);
      form.reset();
      await refreshData();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error recording expense' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete expense record #${id}?`)) return;

    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete expense');

      setMsg({ type: 'success', text: `Expense record #${id} deleted.` });
      await refreshData();
      router.refresh();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error deleting expense' });
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

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customer Payments</div>
          <div className="text-2xl font-black text-emerald-400 mt-2">{formatMoney(data.income, currency)}</div>
          <p className="text-xs text-slate-500 mt-1">Revenue collected from bookings</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Operational Expenses</div>
          <div className="text-2xl font-black text-rose-400 mt-2">{formatMoney(data.totalExpenses, currency)}</div>
          <p className="text-xs text-slate-500 mt-1">Rent, salaries, vendor costs</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Net Cash Profit</div>
          <div className={`text-2xl font-black mt-2 ${data.cashDifference >= 0 ? 'text-amber-400' : 'text-rose-500'}`}>
            {formatMoney(data.cashDifference, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">Collected Revenue minus Expenses</p>
        </div>
      </div>

      {/* Expense Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">
              {editingExpense ? `Edit Expense Record (#${editingExpense.id})` : 'Record Operating Expense'}
            </h2>
          </div>
          {editingExpense && (
            <button onClick={() => setEditingExpense(null)} className="text-xs text-slate-400 hover:text-white underline">
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch</label>
            <select
              name="branch_id"
              defaultValue={editingExpense?.branchId || branches[0]?.id}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Expense Date *</label>
            <input
              type="date"
              name="expense_date"
              required
              defaultValue={editingExpense?.expenseDate || new Date().toISOString().split('T')[0]}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category *</label>
            <select
              name="category"
              required
              defaultValue={editingExpense?.category || categories[0]}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Amount ({currency}) *</label>
            <input
              type="number"
              name="amount"
              min={1}
              required
              defaultValue={editingExpense?.amount || ''}
              placeholder="15000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description / Notes</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={editingExpense?.description || ''}
              placeholder="Provide context or receipt reference..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingExpense ? 'Update Expense' : 'Save Expense Record'}
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Expenses Ledger</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Branch</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {data.expenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                data.expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-slate-300 font-mono">{formatDate(e.expenseDate)}</td>
                    <td className="p-4 font-bold text-white">{e.category}</td>
                    <td className="p-4 text-slate-400">{e.description || '-'}</td>
                    <td className="p-4 text-slate-400">{e.branch?.name || '-'}</td>
                    <td className="p-4 font-bold text-rose-400">{formatMoney(e.amount, currency)}</td>
                    <td className="p-4 text-right space-x-3">
                      <button
                        onClick={() => {
                          setEditingExpense(e);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-amber-400 hover:underline font-semibold inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(e.id)}
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
