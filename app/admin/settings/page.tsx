import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SettingsClient from '@/components/SettingsClient';

export const revalidate = 0;

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') redirect('/admin/dashboard');

  const settingsArr = await prisma.setting.findMany();
  const settingsObj: Record<string, string> = {};
  settingsArr.forEach((s) => (settingsObj[s.key] = s.value));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Company Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure company name, contact numbers, address, currency symbol, and landing page headlines.</p>
      </div>

      <SettingsClient initialSettings={settingsObj} />
    </div>
  );
}
