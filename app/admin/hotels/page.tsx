import { prisma } from '@/lib/prisma';
import HotelsClient from '@/components/HotelsClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HotelsPage() {
  const hotels = await prisma.hotel.findMany({
    orderBy: { id: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div className="p-3.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-extrabold flex items-center justify-between shadow-lg">
        <span>✨ CRM Live Build v2.1 — Actions Column Enabled (Column #1 Edit & Delete)</span>
        <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black text-[10px]">V2.1 ACTIVE</span>
      </div>

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Hotels Directory</h1>
        <p className="text-slate-400 text-sm mt-1">Manage Makkah, Madinah and destination hotel details and public visibility.</p>
      </div>

      <HotelsClient initialHotels={hotels} />
    </div>
  );
}
