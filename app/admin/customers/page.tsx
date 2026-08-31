import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CustomersClient from '@/components/CustomersClient';

export const revalidate = 0;

export default async function CustomersPage() {
  const session = await getSession();

  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });

  const customers = await prisma.customer.findMany({
    include: { branch: true },
    orderBy: { id: 'desc' },
    take: 500,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Customer Management</h1>
        <p className="text-slate-400 text-sm mt-1">Add, update, search customer details, and upload passports/CNIC documents.</p>
      </div>

      <CustomersClient initialCustomers={customers} branches={branches} userBranchId={session?.branchId || 1} />
    </div>
  );
}
