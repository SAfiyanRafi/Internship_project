import { prisma } from '@/lib/prisma';
import FlightsClient from '@/components/FlightsClient';

export const revalidate = 0;

export default async function FlightsPage() {
  const flights = await prisma.flight.findMany({
    orderBy: { departureAt: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Flights Management</h1>
        <p className="text-slate-400 text-sm mt-1">Schedule international flights, route details, and publish public flight notices.</p>
      </div>

      <FlightsClient initialFlights={flights} />
    </div>
  );
}
