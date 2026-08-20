import { prisma } from '@/lib/prisma';
import HotelsClient from '@/components/HotelsClient';

export const revalidate = 0;

export default async function HotelsPage() {
  const hotels = await prisma.hotel.findMany({
    orderBy: { id: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Hotels Directory</h1>
        <p className="text-slate-400 text-sm mt-1">Manage Makkah, Madinah and destination hotel details and public visibility.</p>
      </div>

      <HotelsClient initialHotels={hotels} />
    </div>
  );
}
