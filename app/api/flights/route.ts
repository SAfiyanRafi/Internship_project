import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('public') === 'true';

    const where = publicOnly ? { publicNotice: true } : {};

    const flights = await prisma.flight.findMany({
      where,
      orderBy: { departureAt: 'asc' },
    });

    return NextResponse.json(flights);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch flights' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !['Super Admin', 'Manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;
    const airline = String(body.airline || '').trim();

    if (!airline) return NextResponse.json({ error: 'Airline is required' }, { status: 400 });

    const data = {
      airline,
      flightNo: body.flightNo ? String(body.flightNo) : null,
      origin: body.origin ? String(body.origin) : null,
      destination: body.destination ? String(body.destination) : null,
      departureAt: body.departureAt ? String(body.departureAt) : null,
      arrivalAt: body.arrivalAt ? String(body.arrivalAt) : null,
      baggage: body.baggage ? String(body.baggage) : null,
      publicNotice: Boolean(body.publicNotice),
    };

    if (id) {
      await prisma.flight.update({ where: { id }, data });
      await prisma.activityLog.create({
        data: { userId: session.id, action: 'Update Flight', entityType: 'flight', entityId: id },
      });
      return NextResponse.json({ success: true, flightId: id });
    } else {
      const flight = await prisma.flight.create({ data });
      await prisma.activityLog.create({
        data: { userId: session.id, action: 'Create Flight', entityType: 'flight', entityId: flight.id },
      });
      return NextResponse.json({ success: true, flightId: flight.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save flight' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || !['Super Admin', 'Manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) return NextResponse.json({ error: 'Flight ID is required' }, { status: 400 });

    await prisma.bookingFlight.deleteMany({ where: { flightId: id } });
    await prisma.flight.delete({ where: { id } });

    await prisma.activityLog.create({
      data: { userId: session.id, action: 'Delete Flight', entityType: 'flight', entityId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete flight' }, { status: 500 });
  }
}
