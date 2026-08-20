import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const whereCondition = session.role === 'Super Admin' ? {} : { branchId: session.branchId || undefined };

    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        customer: true,
        package: true,
        payments: true,
        branch: true,
      },
      orderBy: { id: 'desc' },
      take: 500,
    });

    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;
    const branchId = body.branchId ? Number(body.branchId) : session.branchId;
    const customerId = Number(body.customerId);

    if (!customerId) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }

    const data = {
      branchId: branchId || null,
      customerId,
      groupId: body.groupId ? Number(body.groupId) : null,
      packageId: body.packageId ? Number(body.packageId) : null,
      departureDate: body.departureDate ? String(body.departureDate) : null,
      returnDate: body.returnDate ? String(body.returnDate) : null,
      totalPrice: Number(body.totalPrice || 0),
      discount: Number(body.discount || 0),
      status: String(body.status || 'Booked'),
      pnr: body.pnr ? String(body.pnr) : null,
      flightNo: body.flightNo ? String(body.flightNo) : null,
      notes: body.notes ? String(body.notes) : null,
    };

    if (id) {
      await prisma.booking.update({
        where: { id },
        data,
      });
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          action: 'Update Booking',
          entityType: 'booking',
          entityId: id,
        },
      });
      return NextResponse.json({ success: true, bookingId: id });
    } else {
      const newBooking = await prisma.booking.create({
        data: {
          ...data,
          createdById: session.id,
        },
      });
      await prisma.activityLog.create({
        data: {
          userId: session.id,
          action: 'Create Booking',
          entityType: 'booking',
          entityId: newBooking.id,
          details: `Booking created for customer ID #${customerId}`,
        },
      });
      return NextResponse.json({ success: true, bookingId: newBooking.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save booking' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });

    // Safe relational cleanup before deleting booking
    await prisma.payment.deleteMany({ where: { bookingId: id } });
    await prisma.hotelAssignment.deleteMany({ where: { bookingId: id } });
    await prisma.bookingFlight.deleteMany({ where: { bookingId: id } });
    await prisma.visaRecord.updateMany({ where: { bookingId: id }, data: { bookingId: null } });

    await prisma.booking.delete({ where: { id } });

    await prisma.activityLog.create({
      data: { userId: session.id, action: 'Delete Booking', entityType: 'booking', entityId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete booking' }, { status: 500 });
  }
}
