import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid Receipt ID' }, { status: 400 });

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          customer: true,
          package: true,
          payments: {
            orderBy: { id: 'asc' },
          },
        },
      },
    },
  });

  if (!payment) return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });

  // Calculate previously paid & balance
  const booking = payment.booking;
  const netTotal = booking.totalPrice - booking.discount;
  
  let paidToDate = 0;
  let prevPaid = 0;

  for (const p of booking.payments) {
    if (p.id <= payment.id) {
      paidToDate += p.amount;
    }
  }

  prevPaid = paidToDate - payment.amount;
  const remainingBalance = Math.max(0, netTotal - paidToDate);

  const settingsObj: Record<string, string> = {};
  const settings = await prisma.setting.findMany();
  settings.forEach((s) => (settingsObj[s.key] = s.value));

  return NextResponse.json({
    payment,
    booking,
    netTotal,
    prevPaid,
    paidToDate,
    remainingBalance,
    settings: settingsObj,
  });
}
