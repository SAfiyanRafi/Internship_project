import { prisma } from '@/lib/prisma';
import GroupsClient from '@/components/GroupsClient';

export const revalidate = 0;

export default async function GroupsPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { id: 'desc' },
    select: { id: true, fullName: true, passportNo: true },
  });

  const groups = await prisma.travelGroup.findMany({
    include: {
      leader: true,
      members: { include: { customer: true } },
      bookings: true,
    },
    orderBy: { id: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Family & Travel Groups</h1>
        <p className="text-slate-400 text-sm mt-1">Manage pilgrim groups, assign group leaders, and link family members for rooming and group bookings.</p>
      </div>

      <GroupsClient initialGroups={groups} customers={customers} />
    </div>
  );
}
