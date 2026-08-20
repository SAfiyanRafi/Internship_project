import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get('public') === 'true';

  const where = publicOnly ? { publicNotice: true } : {};

  const flights = await prisma.flight.findMany({
    where,
    orderBy: { departureAt: 'asc' },
  });

  return NextResponse.json(flights);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !['Super Admin', 'Manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const airline = String(body.airline || '').trim();

    if (!airline) return NextResponse.json({ error: 'Airline is required' }, { status: 400 });

    const flight = await prisma.flight.create({
      data: {
        airline,
        flightNo: body.flightNo ? String(body.flightNo) : null,
        origin: body.origin ? String(body.origin) : null,
        destination: body.destination ? String(body.destination) : null,
        departureAt: body.departureAt ? String(body.departureAt) : null,
        arrivalAt: body.arrivalAt ? String(body.arrivalAt) : null,
        baggage: body.baggage ? String(body.baggage) : null,
        publicNotice: Boolean(body.publicNotice),
      },
    });

    return NextResponse.json({ success: true, flightId: flight.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save flight' }, { status: 500 });
  }
}
