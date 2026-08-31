import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payments = await prisma.payment.findMany({
      include: {
        booking: {
          include: { customer: true, package: true },
        },
      },
      orderBy: { id: 'desc' },
      take: 500,
    });

    return NextResponse.json(payments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !['Super Admin', 'Manager', 'Accountant'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;
    const bookingId = Number(body.bookingId);
    const amount = Number(body.amount);

    if (!bookingId || amount <= 0) {
      return NextResponse.json({ error: 'Booking and valid positive amount are required' }, { status: 400 });
    }

    const bookingExists = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!bookingExists) {
      return NextResponse.json({ error: 'Selected booking does not exist' }, { status: 400 });
    }

    let createdById: number | null = session.id ? Number(session.id) : null;
    if (createdById) {
      const userExists = await prisma.user.findUnique({ where: { id: createdById } });
      if (!userExists) createdById = null;
    }

    const data = {
      bookingId,
      amount,
      paymentDate: String(body.paymentDate || new Date().toISOString().split('T')[0]),
      method: String(body.method || 'Cash'),
      referenceNo: body.referenceNo ? String(body.referenceNo) : null,
      receivedBy: String(body.receivedBy || session.name),
      notes: body.notes ? String(body.notes) : null,
    };

    if (id) {
      await prisma.payment.update({ where: { id }, data });
      if (createdById) {
        try {
          await prisma.activityLog.create({
            data: { userId: createdById, action: 'Update Payment', entityType: 'payment', entityId: id },
          });
        } catch (_) {}
      }
      return NextResponse.json({ success: true, paymentId: id });
    } else {
      const payment = await prisma.payment.create({
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
              action: 'Create Payment',
              entityType: 'payment',
              entityId: payment.id,
              details: `Recorded payment of ${amount} for booking #${bookingId}`,
            },
          });
        } catch (_) {}
      }

      return NextResponse.json({ success: true, paymentId: payment.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record payment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || !['Super Admin', 'Manager', 'Accountant'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 });

    await prisma.payment.delete({ where: { id } });

    let userId: number | null = session.id ? Number(session.id) : null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) {
        try {
          await prisma.activityLog.create({
            data: { userId, action: 'Delete Payment', entityType: 'payment', entityId: id },
          });
        } catch (_) {}
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete payment' }, { status: 500 });
  }
}
