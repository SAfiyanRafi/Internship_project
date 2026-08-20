'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatMoney, formatDate, receiptNo, bookingNo } from '@/lib/utils';
import { Receipt, Download, Printer, CheckCircle2, AlertCircle } from 'lucide-react';

interface PaymentsClientProps {
  initialPayments: any[];
  bookings: any[];
  currency: string;
}

export default function PaymentsClient({ initialPayments, bookings, currency }: PaymentsClientProps) {
  const router = useRouter();
  const [payments, setPayments] = useState(initialPayments);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      bookingId: Number((form.elements.namedItem('booking_id') as HTMLSelectElement).value),
      amount: Number((form.elements.namedItem('amount') as HTMLInputElement).value),
      paymentDate: (form.elements.namedItem('payment_date') as HTMLInputElement).value,
      method: (form.elements.namedItem('method') as HTMLSelectElement).value,
      referenceNo: (form.elements.namedItem('reference_no') as HTMLInputElement).value || null,
      receivedBy: (form.elements.namedItem('received_by') as HTMLInputElement).value || null,
      notes: (form.elements.namedItem('notes') as HTMLInputElement).value || null,
    };

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      form.reset();
      router.push(`/receipt/${data.paymentId}`);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error recording payment' });
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

      {/* Payment Entry Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <Receipt className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Record Payment & Generate Receipt</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select Booking *</label>
            <select
              name="booking_id"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Choose Booking --</option>
              {bookings.map((b) => {
                const net = b.totalPrice - b.discount;
                const paid = b.payments ? b.payments.reduce((s: number, p: any) => s + p.amount, 0) : 0;
                const bal = Math.max(0, net - paid);
                return (
                  <option key={b.id} value={b.id}>
                    {bookingNo(b.id)} — {b.customer.fullName} — Remaining Balance: {formatMoney(bal, currency)}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Amount ({currency}) *</label>
            <input
              type="number"
              name="amount"
              min={1}
              required
              placeholder="50000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Payment Date *</label>
            <input
              type="date"
              name="payment_date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Payment Method</label>
            <select
              name="method"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Card">Card</option>
              <option value="Online">Online</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Reference / Txn No.</label>
            <input
              type="text"
              name="reference_no"
              placeholder="Cheque # / Bank Ref"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Received By</label>
            <input
              type="text"
              name="received_by"
              placeholder="Staff Name"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Notes</label>
            <input
              type="text"
              name="notes"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {loading ? 'Processing...' : 'Save & Print Receipt'}
            </button>
          </div>
        </form>
      </div>

      {/* Payment History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Payment History</h2>
          <a
            href="/api/export?type=payments"
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
                <th className="p-4 font-semibold">Receipt No.</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Method</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-amber-400">{receiptNo(p.id)}</td>
                    <td className="p-4 font-medium text-white">{p.booking?.customer?.fullName || '-'}</td>
                    <td className="p-4 text-slate-300 font-mono">{formatDate(p.paymentDate)}</td>
                    <td className="p-4 text-slate-300">{p.method}</td>
                    <td className="p-4 font-bold text-emerald-400">{formatMoney(p.amount, currency)}</td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/receipt/${p.id}`}
                        className="inline-flex items-center gap-1 text-amber-400 hover:underline font-semibold"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Print
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
