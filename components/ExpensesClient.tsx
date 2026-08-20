'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney, formatDate } from '@/lib/utils';
import { DollarSign, CheckCircle2, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface ExpensesClientProps {
  initialExpenses: any[];
  branches: any[];
  income: number;
  totalExpenses: number;
  cashDifference: number;
  currency: string;
}

export default function ExpensesClient({
  initialExpenses,
  branches,
  income,
  totalExpenses,
  cashDifference,
  currency,
}: ExpensesClientProps) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initialExpenses);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      branchId: Number((form.elements.namedItem('branch_id') as HTMLSelectElement).value),
      expenseDate: (form.elements.namedItem('expense_date') as HTMLInputElement).value,
      category: (form.elements.namedItem('category') as HTMLInputElement).value,
      amount: Number((form.elements.namedItem('amount') as HTMLInputElement).value),
      description: (form.elements.namedItem('description') as HTMLInputElement).value || null,
    };

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record expense');

      setMsg({ type: 'success', text: 'Expense recorded successfully!' });
      form.reset();
      router.refresh();

      const updatedRes = await fetch('/api/expenses');
      if (updatedRes.ok) {
        const d = await updatedRes.json();
        setExpenses(d.expenses);
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error recording expense' });
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

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Payments Received</span>
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatMoney(income, currency)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{formatMoney(totalExpenses, currency)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Cash Difference (Net)</span>
            <DollarSign className="w-5 h-5 text-amber-400" />
          </div>
          <div className={`text-2xl font-black ${cashDifference >= 0 ? 'text-amber-400' : 'text-rose-500'}`}>
            {formatMoney(cashDifference, currency)}
          </div>
        </div>
      </div>

      {/* Expense Form Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <DollarSign className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Record Expense</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Branch</label>
            <select
              name="branch_id"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Date *</label>
            <input
              type="date"
              name="expense_date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Category *</label>
            <input
              type="text"
              name="category"
              required
              placeholder="e.g. Hotel / Visa / Office / Commission"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Amount ({currency}) *</label>
            <input
              type="number"
              name="amount"
              required
              placeholder="15000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Description</label>
            <input
              type="text"
              name="description"
              placeholder="Detailed description of the expenditure..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>

      {/* Expenses Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Expense Records</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Branch</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold">Description</th>
                <th className="p-4 font-semibold">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                    No expense entries recorded yet.
                  </td>
                </tr>
              ) : (
                expenses.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-mono text-slate-300">{formatDate(ex.expenseDate)}</td>
                    <td className="p-4 text-slate-400">{ex.branch?.name || '-'}</td>
                    <td className="p-4 font-bold text-amber-400">{ex.category}</td>
                    <td className="p-4 text-slate-300">{ex.description || '-'}</td>
                    <td className="p-4 font-bold text-rose-400">{formatMoney(ex.amount, currency)}</td>
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
