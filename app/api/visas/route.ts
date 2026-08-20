import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const visas = await prisma.visaRecord.findMany({
      include: { customer: true, booking: true },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(visas);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch visa records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;
    const customerId = Number(body.customerId);

    if (!customerId) return NextResponse.json({ error: 'Customer is required' }, { status: 400 });

    const customerExists = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customerExists) {
      return NextResponse.json({ error: 'Selected customer does not exist' }, { status: 400 });
    }

    let bookingId = body.bookingId ? Number(body.bookingId) : null;
    if (bookingId) {
      const bookingExists = await prisma.booking.findUnique({ where: { id: bookingId } });
      if (!bookingExists) bookingId = null;
    }

    const data = {
      customerId,
      bookingId,
      status: String(body.status || 'Documents Pending'),
      applicationNo: body.applicationNo ? String(body.applicationNo) : null,
      submittedDate: body.submittedDate ? String(body.submittedDate) : null,
      decisionDate: body.decisionDate ? String(body.decisionDate) : null,
      notes: body.notes ? String(body.notes) : null,
    };

    if (id) {
      await prisma.visaRecord.update({ where: { id }, data });
      let userId: number | null = session.id ? Number(session.id) : null;
      if (userId) {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (userExists) {
          try {
            await prisma.activityLog.create({
              data: { userId, action: 'Update Visa Record', entityType: 'visa', entityId: id },
            });
          } catch (_) {}
        }
      }
      return NextResponse.json({ success: true, visaId: id });
    } else {
      const visa = await prisma.visaRecord.create({ data });
      let userId: number | null = session.id ? Number(session.id) : null;
      if (userId) {
        const userExists = await prisma.user.findUnique({ where: { id: userId } });
        if (userExists) {
          try {
            await prisma.activityLog.create({
              data: { userId, action: 'Create Visa Record', entityType: 'visa', entityId: visa.id },
            });
          } catch (_) {}
        }
      }
      return NextResponse.json({ success: true, visaId: visa.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save visa record' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) return NextResponse.json({ error: 'Visa Record ID is required' }, { status: 400 });

    await prisma.visaRecord.delete({ where: { id } });

    let userId: number | null = session.id ? Number(session.id) : null;
    if (userId) {
      const userExists = await prisma.user.findUnique({ where: { id: userId } });
      if (userExists) {
        try {
          await prisma.activityLog.create({
            data: { userId, action: 'Delete Visa Record', entityType: 'visa', entityId: id },
          });
        } catch (_) {}
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete visa record' }, { status: 500 });
  }
}
