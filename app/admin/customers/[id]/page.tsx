import { prisma } from '@/lib/prisma';
import { formatDate, formatMoney, bookingNo } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, User, FileText, BookOpen, ExternalLink } from 'lucide-react';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function CustomerProfilePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      branch: true,
      documents: { orderBy: { id: 'desc' } },
      bookings: {
        include: { package: true, payments: true },
        orderBy: { id: 'desc' },
      },
    },
  });

  if (!customer) notFound();

  const currency = (await prisma.setting.findUnique({ where: { key: 'currency' } }))?.value || 'PKR';

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/admin/customers"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Customers
        </Link>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-2xl">
            {customer.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">{customer.fullName}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Father Name: {customer.fatherName || '-'} • Branch: {customer.branch?.name || '-'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Phone / WhatsApp</span>
            <span className="text-white font-mono text-sm">{customer.phone || '-'}</span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Passport No</span>
            <span className="text-amber-400 font-mono text-sm font-bold">{customer.passportNo || '-'}</span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">CNIC Number</span>
            <span className="text-white font-mono text-sm">{customer.cnic || '-'}</span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Passport Expiry</span>
            <span className="text-slate-300 font-mono">{formatDate(customer.passportExpiry)}</span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Nationality</span>
            <span className="text-slate-300">{customer.nationality || 'Pakistani'}</span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Date of Birth</span>
            <span className="text-slate-300 font-mono">{formatDate(customer.dob)}</span>
          </div>

          <div className="sm:col-span-2">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Address</span>
            <span className="text-slate-300">{customer.address || '-'}</span>
          </div>

          <div>
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">Emergency Contact</span>
            <span className="text-slate-300">{customer.emergencyContact || '-'}</span>
          </div>
        </div>

        {/* Uploaded Documents */}
        <div className="pt-6 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Uploaded Documents
          </h3>

          {customer.documents.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No files uploaded for this customer yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {customer.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-amber-400 block">{doc.docType}</span>
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px] block">
                      {doc.fileName}
                    </span>
                  </div>
                  <a
                    href={`/uploads/${doc.fileName}`}
                    target="_blank"
                    className="p-2 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customer Booking History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white">Booking History</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Booking ID</th>
                <th className="p-4 font-semibold">Package</th>
                <th className="p-4 font-semibold">Departure</th>
                <th className="p-4 font-semibold">Net Total</th>
                <th className="p-4 font-semibold">Paid Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {customer.bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                    No bookings found for this customer.
                  </td>
                </tr>
              ) : (
                customer.bookings.map((b) => {
                  const net = b.totalPrice - b.discount;
                  const paid = b.payments.reduce((acc, p) => acc + p.amount, 0);
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 font-bold text-amber-400">{bookingNo(b.id)}</td>
                      <td className="p-4 font-medium text-white">{b.package?.name || 'Custom Booking'}</td>
                      <td className="p-4 text-slate-300 font-mono">{formatDate(b.departureDate)}</td>
                      <td className="p-4 font-bold text-white">{formatMoney(net, currency)}</td>
                      <td className="p-4 font-bold text-emerald-400">{formatMoney(paid, currency)}</td>
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
