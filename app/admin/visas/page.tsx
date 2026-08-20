import { prisma } from '@/lib/prisma';
import VisasClient from '@/components/VisasClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function VisasPage() {
  const customers = await prisma.customer.findMany({ orderBy: { id: 'desc' }, select: { id: true, fullName: true, passportNo: true } });
  const bookings = await prisma.booking.findMany({
    include: { customer: true },
    orderBy: { id: 'desc' },
  });
  const visas = await prisma.visaRecord.findMany({
    include: { customer: true, booking: true },
    orderBy: { id: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Visa Tracking</h1>
        <p className="text-slate-400 text-sm mt-1">Track pilgrim visa applications from document collection to submission and decision.</p>
      </div>

      <VisasClient initialVisas={visas} customers={customers} bookings={bookings} />
    </div>
  );
}
