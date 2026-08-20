import { prisma } from '@/lib/prisma';
import EnquiriesClient from '@/components/EnquiriesClient';

export const revalidate = 0;

export default async function EnquiriesPage() {
  const enquiries = await prisma.enquiry.findMany({
    orderBy: { id: 'desc' },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Public Website Enquiries</h1>
        <p className="text-slate-400 text-sm mt-1">Review incoming leads from the public website contact form and update pipeline status.</p>
      </div>

      <EnquiriesClient initialEnquiries={enquiries} />
    </div>
  );
}
