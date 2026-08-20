import { prisma } from '@/lib/prisma';
import PaymentsClient from '@/components/PaymentsClient';

export const revalidate = 0;

export default async function PaymentsPage() {
  const bookings = await prisma.booking.findMany({
    include: { customer: true, payments: true },
    orderBy: { id: 'desc' },
  });

  const payments = await prisma.payment.findMany({
    include: { booking: { include: { customer: true } } },
    orderBy: { id: 'desc' },
    take: 500,
  });

  const currency = (await prisma.setting.findUnique({ where: { key: 'currency' } }))?.value || 'PKR';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Payments & Receipts</h1>
        <p className="text-slate-400 text-sm mt-1">Record installment payments against pilgrim bookings and print numbered receipts.</p>
      </div>

      <PaymentsClient initialPayments={payments} bookings={bookings} currency={currency} />
    </div>
  );
}
