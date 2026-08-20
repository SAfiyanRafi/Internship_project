import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get('public') === 'true';

  const where = publicOnly ? { isPublic: true } : {};

  const hotels = await prisma.hotel.findMany({
    where,
    orderBy: { id: 'desc' },
  });

  return NextResponse.json(hotels);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !['Super Admin', 'Manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const city = String(body.city || '').trim();
    const name = String(body.name || '').trim();

    if (!city || !name) {
      return NextResponse.json({ error: 'City and Hotel Name are required' }, { status: 400 });
    }

    const hotel = await prisma.hotel.create({
      data: {
        city,
        name,
        distance: body.distance ? String(body.distance) : null,
        phone: body.phone ? String(body.phone) : null,
        notes: body.notes ? String(body.notes) : null,
        isPublic: Boolean(body.isPublic),
      },
    });

    return NextResponse.json({ success: true, hotelId: hotel.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save hotel' }, { status: 500 });
  }
}
