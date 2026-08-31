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
        group: true,
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
    const customerId = Number(body.customerId);

    if (!customerId) {
      return NextResponse.json({ error: 'Customer is required' }, { status: 400 });
    }

    // 1. Verify customer existence
    const customerExists = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customerExists) {
      return NextResponse.json({ error: 'Selected customer does not exist' }, { status: 400 });
    }

    // 2. Verify branch existence
    let branchId = body.branchId ? Number(body.branchId) : session.branchId;
    if (branchId) {
      const existingBranch = await prisma.branch.findUnique({ where: { id: branchId } });
      if (!existingBranch) branchId = null;
    }

    // 3. Verify Travel Group existence
    let groupId = body.groupId ? Number(body.groupId) : null;
    if (groupId) {
      const existingGroup = await prisma.travelGroup.findUnique({ where: { id: groupId } });
      if (!existingGroup) groupId = null;
    }

    // 4. Verify Package existence
    let packageId = body.packageId ? Number(body.packageId) : null;
    if (packageId) {
      const existingPkg = await prisma.package.findUnique({ where: { id: packageId } });
      if (!existingPkg) packageId = null;
    }

    // 5. Verify User existence for createdById
    let createdById: number | null = session.id ? Number(session.id) : null;
    if (createdById) {
      const existingUser = await prisma.user.findUnique({ where: { id: createdById } });
      if (!existingUser) createdById = null;
    }

    const data = {
      branchId,
      customerId,
      groupId,
      packageId,
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

      if (createdById) {
        try {
          await prisma.activityLog.create({
            data: { userId: createdById, action: 'Update Booking', entityType: 'booking', entityId: id },
          });
        } catch (_) {}
      }

      return NextResponse.json({ success: true, bookingId: id });
    } else {
      const newBooking = await prisma.booking.create({
        data: {
          ...data,
          createdById,
        },
      });

      if (createdById) {
        try {
          await prisma.activityLog.create({
            data: {
              userId: createdById,
              action: 'Create Booking',
              entityType: 'booking',
              entityId: newBooking.id,
              details: `Booking created for customer ID #${customerId}`,
            },
          });
        } catch (_) {}
      }

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

    await prisma.payment.deleteMany({ where: { bookingId: id } });
    await prisma.hotelAssignment.deleteMany({ where: { bookingId: id } });
    await prisma.bookingFlight.deleteMany({ where: { bookingId: id } });
    await prisma.visaRecord.updateMany({ where: { bookingId: id }, data: { bookingId: null } });

    await prisma.booking.delete({ where: { id } });

    let userId: number | null = session.id ? Number(session.id) : null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) {
        try {
          await prisma.activityLog.create({
            data: { userId, action: 'Delete Booking', entityType: 'booking', entityId: id },
          });
        } catch (_) {}
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete booking' }, { status: 500 });
  }
}
