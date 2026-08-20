import { prisma } from '@/lib/prisma';
import { formatDate, formatMoney, receiptNo, bookingNo } from '@/lib/utils';
import Link from 'next/link';
import { Printer, ArrowLeft } from 'lucide-react';
import PrintButton from '@/components/PrintButton';
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function ReceiptPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          customer: true,
          package: true,
          payments: { orderBy: { id: 'asc' } },
        },
      },
    },
  });

  if (!payment) notFound();

  const booking = payment.booking;
  const netTotal = booking.totalPrice - booking.discount;

  let paidToDate = 0;
  for (const p of booking.payments) {
    if (p.id <= payment.id) {
      paidToDate += p.amount;
    }
  }

  const prevPaid = paidToDate - payment.amount;
  const remainingBalance = Math.max(0, netTotal - paidToDate);

  const settingsArr = await prisma.setting.findMany();
  const settings: Record<string, string> = {};
  settingsArr.forEach((s) => (settings[s.key] = s.value));

  const companyName = settings.company_name || 'THABBA Travel & Tour Pvt Ltd';
  const address = settings.address || 'Suite 404, Main Boulevard, Lahore, Pakistan';
  const phone = settings.phone || '+92 300 1234567';
  const email = settings.email || 'info@thabba.local';
  const currency = settings.currency || 'PKR';

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-8 sm:p-12 shadow-2xl space-y-8 border border-slate-200 printable-receipt">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-bold text-xl">
                T
              </div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">{companyName}</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {address}<br />
              Ph: {phone} • Email: {email}
            </p>
          </div>

          <div className="sm:text-right">
            <h1 className="text-xs font-extrabold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block">
              OFFICIAL PAYMENT RECEIPT
            </h1>
            <div className="text-2xl font-black text-slate-900 mt-2">{receiptNo(id)}</div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{formatDate(payment.paymentDate)}</p>
          </div>
        </div>

        {/* Receipt Rows */}
        <div className="space-y-3 text-sm divide-y divide-slate-100">
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Customer Name</span>
            <span className="font-bold text-slate-900">{booking.customer.fullName}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Passport No.</span>
            <span className="font-mono font-semibold text-slate-800">{booking.customer.passportNo || '-'}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Booking ID</span>
            <span className="font-mono font-bold text-amber-700">{bookingNo(booking.id)}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Package</span>
            <span className="font-semibold text-slate-800">{booking.package?.name || 'Custom Package'}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Package Net Total</span>
            <span className="font-bold text-slate-900">{formatMoney(netTotal, currency)}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Previously Paid</span>
            <span className="font-semibold text-slate-700">{formatMoney(prevPaid, currency)}</span>
          </div>

          <div className="flex justify-between py-3 px-4 rounded-xl bg-amber-500/10 text-amber-900 font-extrabold text-base border border-amber-200">
            <span>Amount Received</span>
            <span>{formatMoney(payment.amount, currency)}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Remaining Balance</span>
            <span className="font-bold text-slate-900">{formatMoney(remainingBalance, currency)}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Payment Method</span>
            <span className="font-semibold text-slate-800">{payment.method}</span>
          </div>

          <div className="flex justify-between py-1.5">
            <span className="text-slate-500 font-medium">Reference / Cheque No.</span>
            <span className="font-mono text-slate-700">{payment.referenceNo || '-'}</span>
          </div>
        </div>

        {/* Signatures */}
        <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs text-slate-600">
          <div>
            <span>Received By: </span>
            <span className="font-bold text-slate-900">{payment.receivedBy || 'Authorized Agent'}</span>
          </div>

          <div className="text-center">
            <div className="w-48 border-b border-slate-400 mb-1"></div>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500">Authorized Signature</span>
          </div>
        </div>

        {/* Actions bar (Hidden when printing) */}
        <div className="no-print pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
          <Link
            href="/admin/payments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payments
          </Link>

          <PrintButton />
        </div>
      </div>
    </div>
  );
}
