import { prisma } from '@/lib/prisma';
import PackagesClient from '@/components/PackagesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PackagesPage() {
  const packages = await prisma.package.findMany({
    orderBy: { id: 'desc' },
  });

  const currency = (await prisma.setting.findUnique({ where: { key: 'currency' } }))?.value || 'PKR';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Hajj & Umrah Packages</h1>
        <p className="text-slate-400 text-sm mt-1">Manage pilgrimage packages, pricing, inclusions, and website publishing.</p>
      </div>

      <PackagesClient initialPackages={packages} currency={currency} />
    </div>
  );
}
