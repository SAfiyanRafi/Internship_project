import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BranchesClient from '@/components/BranchesClient';

export const revalidate = 0;

export default async function BranchesPage() {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') redirect('/admin/dashboard');

  const branches = await prisma.branch.findMany({
    orderBy: { id: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Branches Management</h1>
        <p className="text-slate-400 text-sm mt-1">Configure company branch locations, phone numbers, and addresses.</p>
      </div>

      <BranchesClient initialBranches={branches} />
    </div>
  );
}
