import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const visas = await prisma.visaRecord.findMany({
    include: { customer: true, booking: true },
    orderBy: { id: 'desc' },
  });

  return NextResponse.json(visas);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const customerId = Number(body.customerId);

    if (!customerId) return NextResponse.json({ error: 'Customer is required' }, { status: 400 });

    const visa = await prisma.visaRecord.create({
      data: {
        customerId,
        bookingId: body.bookingId ? Number(body.bookingId) : null,
        status: String(body.status || 'Documents Pending'),
        applicationNo: body.applicationNo ? String(body.applicationNo) : null,
        submittedDate: body.submittedDate ? String(body.submittedDate) : null,
        decisionDate: body.decisionDate ? String(body.decisionDate) : null,
        notes: body.notes ? String(body.notes) : null,
      },
    });

    return NextResponse.json({ success: true, visaId: visa.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save visa record' }, { status: 500 });
  }
}
