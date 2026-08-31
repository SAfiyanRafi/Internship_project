import { prisma } from '@/lib/prisma';
import { formatMoney, bookingNo } from '@/lib/utils';
import { BarChart3, Download, DollarSign, CheckCircle2, AlertCircle } from 'lucide-react';

export const revalidate = 0;

export default async function ReportsPage() {
  const currency = (await prisma.setting.findUnique({ where: { key: 'currency' } }))?.value || 'PKR';

  const totalSalesAgg = await prisma.booking.aggregate({
    _sum: { totalPrice: true, discount: true },
  });
  const totalSales = (totalSalesAgg._sum.totalPrice || 0) - (totalSalesAgg._sum.discount || 0);

  const totalReceivedAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
  });
  const totalReceived = totalReceivedAgg._sum.amount || 0;

  const totalExpensesAgg = await prisma.expense.aggregate({
    _sum: { amount: true },
  });
  const totalExpenses = totalExpensesAgg._sum.amount || 0;

  const totalOutstanding = Math.max(0, totalSales - totalReceived);

  // Fetch bookings with outstanding balances
  const allBookings = await prisma.booking.findMany({
    include: { customer: true, payments: true },
  });

  const outstandingBookings = allBookings
    .map((b) => {
      const net = b.totalPrice - b.discount;
      const paid = b.payments.reduce((acc, p) => acc + p.amount, 0);
      const balance = Math.max(0, net - paid);
      return {
        ...b,
        net,
        paid,
        balance,
      };
    })
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Financial Reports & Audit</h1>
        <p className="text-slate-400 text-sm mt-1">Comprehensive breakdown of total sales, collected payments, expenses, and outstanding pilgrim balances.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Booking Value</span>
            <BarChart3 className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{formatMoney(totalSales, currency)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Payments Received</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{formatMoney(totalReceived, currency)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding Balances</span>
            <AlertCircle className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{formatMoney(totalOutstanding, currency)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <DollarSign className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-300">{formatMoney(totalExpenses, currency)}</div>
        </div>
      </div>

      {/* Outstanding Balances Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Outstanding Customer Balances</h2>
          <a
            href="/api/export?type=outstanding"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export Outstanding CSV
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Booking ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Phone</th>
                <th className="p-4 font-semibold">Total Price</th>
                <th className="p-4 font-semibold">Amount Paid</th>
                <th className="p-4 font-semibold">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {outstandingBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    Great! All bookings have been fully paid.
                  </td>
                </tr>
              ) : (
                outstandingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-amber-400">{bookingNo(b.id)}</td>
                    <td className="p-4 font-medium text-white">{b.customer.fullName}</td>
                    <td className="p-4 text-slate-300 font-mono">{b.customer.phone || '-'}</td>
                    <td className="p-4 font-bold text-white">{formatMoney(b.net, currency)}</td>
                    <td className="p-4 font-bold text-emerald-400">{formatMoney(b.paid, currency)}</td>
                    <td className="p-4 font-bold text-rose-400 font-mono">{formatMoney(b.balance, currency)}</td>
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
