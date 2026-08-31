import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UsersClient from '@/components/UsersClient';

export const revalidate = 0;

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') redirect('/admin/dashboard');

  const branches = await prisma.branch.findMany({ where: { isActive: true } });
  const users = await prisma.user.findMany({
    include: { branch: true },
    orderBy: { id: 'asc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Staff & Permissions</h1>
        <p className="text-slate-400 text-sm mt-1">Create and manage staff accounts, roles (Super Admin, Manager, Accountant, Staff), and branch assignments.</p>
      </div>

      <UsersClient initialUsers={users} branches={branches} />
    </div>
  );
}
