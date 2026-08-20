import { prisma } from '@/lib/prisma';
import { formatMoney, formatDate, bookingNo } from '@/lib/utils';
import { getSession } from '@/lib/auth';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  FileClock, 
  Calendar 
} from 'lucide-react';

export const revalidate = 0;

export default async function DashboardPage() {
  const session = await getSession();
  const currency = (await prisma.setting.findUnique({ where: { key: 'currency' } }))?.value || 'PKR';

  // 1. Metric Queries
  const totalCustomers = await prisma.customer.count();

  const activeBookings = await prisma.booking.count({
    where: {
      status: { notIn: ['Completed', 'Cancelled'] },
    },
  });

  const totalSalesAgg = await prisma.booking.aggregate({
    _sum: { totalPrice: true, discount: true },
  });

  const totalSales = (totalSalesAgg._sum.totalPrice || 0) - (totalSalesAgg._sum.discount || 0);

  const totalReceivedAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
  });
  const totalReceived = totalReceivedAgg._sum.amount || 0;

  const outstanding = Math.max(0, totalSales - totalReceived);

  const visaPending = await prisma.visaRecord.count({
    where: {
      status: { notIn: ['Approved', 'Rejected'] },
    },
  });

  // 2. Upcoming Departures
  const upcomingDepartures = await prisma.booking.findMany({
    include: { customer: true, package: true },
    orderBy: { departureDate: 'asc' },
    take: 12,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time stats and upcoming departures</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Customers</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalCustomers}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Bookings</span>
            <BookOpen className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeBookings}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Sales</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400">{formatMoney(totalSales, currency)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Received</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-white">{formatMoney(totalReceived, currency)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Outstanding</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-black text-rose-400">{formatMoney(outstanding, currency)}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Visa Pending</span>
            <FileClock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{visaPending}</div>
        </div>
      </div>

      {/* Upcoming Departures Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Upcoming Departures</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Booking ID</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Package</th>
                <th className="p-4 font-semibold">Departure Date</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {upcomingDepartures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 italic">
                    No upcoming departures scheduled.
                  </td>
                </tr>
              ) : (
                upcomingDepartures.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-amber-400">{bookingNo(b.id)}</td>
                    <td className="p-4 font-medium text-white">{b.customer.fullName}</td>
                    <td className="p-4 text-slate-300">{b.package?.name || 'Custom Booking'}</td>
                    <td className="p-4 text-slate-300 font-mono">{formatDate(b.departureDate)}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {b.status}
                      </span>
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
