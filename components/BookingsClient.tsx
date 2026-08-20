'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney, formatDate, bookingNo } from '@/lib/utils';
import { BookOpen, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookingsClientProps {
  initialBookings: any[];
  customers: any[];
  packages: any[];
  branches: any[];
  currency: string;
}

export default function BookingsClient({
  initialBookings,
  customers,
  packages,
  branches,
  currency,
}: BookingsClientProps) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const statuses = [
    'Booked',
    'Documents Pending',
    'Visa Processing',
    'Visa Approved',
    'Ticket Issued',
    'Ready to Travel',
    'Travelled',
    'Completed',
    'Cancelled',
  ];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);

    const form = e.currentTarget;
    const body = {
      branchId: Number((form.elements.namedItem('branch_id') as HTMLSelectElement).value),
      customerId: Number((form.elements.namedItem('customer_id') as HTMLSelectElement).value),
      groupId: (form.elements.namedItem('group_id') as HTMLInputElement).value
        ? Number((form.elements.namedItem('group_id') as HTMLInputElement).value)
        : null,
      packageId: (form.elements.namedItem('package_id') as HTMLSelectElement).value
        ? Number((form.elements.namedItem('package_id') as HTMLSelectElement).value)
        : null,
      departureDate: (form.elements.namedItem('departure_date') as HTMLInputElement).value || null,
      returnDate: (form.elements.namedItem('return_date') as HTMLInputElement).value || null,
      totalPrice: Number((form.elements.namedItem('total_price') as HTMLInputElement).value),
      discount: Number((form.elements.namedItem('discount') as HTMLInputElement).value || 0),
      status: (form.elements.namedItem('status') as HTMLSelectElement).value,
      pnr: (form.elements.namedItem('pnr') as HTMLInputElement).value || null,
      flightNo: (form.elements.namedItem('flight_no') as HTMLInputElement).value || null,
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value || null,
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');

      setMsg({ type: 'success', text: 'Booking created successfully!' });
      form.reset();
      router.refresh();

      const updatedRes = await fetch('/api/bookings');
      if (updatedRes.ok) setBookings(await updatedRes.json());
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Error creating booking' });
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

      {/* Booking Form Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Create New Booking</h2>
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

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Select Customer *</label>
            <select
              name="customer_id"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName} ({c.passportNo ? `Passport: ${c.passportNo}` : c.phone || `ID #${c.id}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Group ID (Optional)</label>
            <input
              type="number"
              name="group_id"
              placeholder="e.g. 101"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Package</label>
            <select
              name="package_id"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="">Custom Package</option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({formatMoney(p.price, currency)})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Departure Date</label>
            <input
              type="date"
              name="departure_date"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Return Date</label>
            <input
              type="date"
              name="return_date"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Total Price ({currency}) *</label>
            <input
              type="number"
              name="total_price"
              required
              placeholder="250000"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Discount ({currency})</label>
            <input
              type="number"
              name="discount"
              defaultValue={0}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Booking Status</label>
            <select
              name="status"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">PNR Code</label>
            <input
              type="text"
              name="pnr"
              placeholder="X7Y9Z2"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Flight No.</label>
            <input
              type="text"
              name="flight_no"
              placeholder="SV-735"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Booking Notes</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 resize-none"
            ></textarea>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>

      {/* Bookings Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Bookings List</h2>
          <a
            href="/api/export?type=bookings"
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
                <th className="p-4 font-semibold">Booking ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Package</th>
                <th className="p-4 font-semibold">Departure</th>
                <th className="p-4 font-semibold">Net Price</th>
                <th className="p-4 font-semibold">Paid</th>
                <th className="p-4 font-semibold">Balance</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                    No bookings created yet.
                  </td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const net = b.totalPrice - b.discount;
                  const paid = b.payments ? b.payments.reduce((sum: number, p: any) => sum + p.amount, 0) : 0;
                  const balance = Math.max(0, net - paid);

                  return (
                    <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-amber-400">{bookingNo(b.id)}</td>
                      <td className="p-4 font-medium text-white">{b.customer?.fullName || '-'}</td>
                      <td className="p-4 text-slate-300">{b.package?.name || 'Custom'}</td>
                      <td className="p-4 font-mono text-slate-300">{formatDate(b.departureDate)}</td>
                      <td className="p-4 font-bold text-white">{formatMoney(net, currency)}</td>
                      <td className="p-4 font-bold text-emerald-400">{formatMoney(paid, currency)}</td>
                      <td className="p-4 font-bold text-rose-400">{formatMoney(balance, currency)}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
