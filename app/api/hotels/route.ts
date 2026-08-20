import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicOnly = searchParams.get('public') === 'true';

    const where = publicOnly ? { isPublic: true } : {};

    const hotels = await prisma.hotel.findMany({
      where,
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(hotels);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch hotels' }, { status: 500 });
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
    const city = String(body.city || '').trim();
    const name = String(body.name || '').trim();

    if (!city || !name) {
      return NextResponse.json({ error: 'City and Hotel Name are required' }, { status: 400 });
    }

    const data = {
      city,
      name,
      distance: body.distance ? String(body.distance) : null,
      phone: body.phone ? String(body.phone) : null,
      notes: body.notes ? String(body.notes) : null,
      isPublic: Boolean(body.isPublic),
    };

    if (id) {
      await prisma.hotel.update({ where: { id }, data });
      await prisma.activityLog.create({
        data: { userId: session.id, action: 'Update Hotel', entityType: 'hotel', entityId: id },
      });
      return NextResponse.json({ success: true, hotelId: id });
    } else {
      const hotel = await prisma.hotel.create({ data });
      await prisma.activityLog.create({
        data: { userId: session.id, action: 'Create Hotel', entityType: 'hotel', entityId: hotel.id },
      });
      return NextResponse.json({ success: true, hotelId: hotel.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save hotel' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'Hotel ID is required' }, { status: 400 });

    await prisma.hotelAssignment.deleteMany({ where: { hotelId: id } });
    await prisma.hotel.delete({ where: { id } });

    await prisma.activityLog.create({
      data: { userId: session.id, action: 'Delete Hotel', entityType: 'hotel', entityId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete hotel' }, { status: 500 });
  }
}
