import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export function generateStaticParams() {
  return [{ id: '1' }];
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      branch: true,
      documents: { orderBy: { id: 'desc' } },
      bookings: {
        include: { package: true, payments: true },
        orderBy: { id: 'desc' },
      },
    },
  });

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

  return NextResponse.json(customer);
}
