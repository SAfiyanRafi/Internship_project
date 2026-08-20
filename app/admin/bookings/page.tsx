import { prisma } from '@/lib/prisma';
import BookingsClient from '@/components/BookingsClient';

export const revalidate = 0;

export default async function BookingsPage() {
  const branches = await prisma.branch.findMany({ where: { isActive: true } });
  const customers = await prisma.customer.findMany({ orderBy: { id: 'desc' }, select: { id: true, fullName: true, passportNo: true, phone: true } });
  const packages = await prisma.package.findMany({ orderBy: { id: 'desc' } });
  
  const bookings = await prisma.booking.findMany({
    include: { customer: true, package: true, payments: true },
    orderBy: { id: 'desc' },
    take: 500,
  });

  const currency = (await prisma.setting.findUnique({ where: { key: 'currency' } }))?.value || 'PKR';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Bookings Management</h1>
        <p className="text-slate-400 text-sm mt-1">Create and manage pilgrim bookings, track status lifecycle, total pricing, and balance payments.</p>
      </div>

      <BookingsClient initialBookings={bookings} customers={customers} packages={packages} branches={branches} currency={currency} />
    </div>
  );
}
