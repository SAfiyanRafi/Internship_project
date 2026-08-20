import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const groups = await prisma.travelGroup.findMany({
      include: {
        leader: true,
        members: {
          include: { customer: true },
        },
        bookings: true,
      },
      orderBy: { id: 'desc' },
    });

    return NextResponse.json(groups);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch travel groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;
    const groupName = String(body.groupName || '').trim();

    if (!groupName) {
      return NextResponse.json({ error: 'Group Name is required' }, { status: 400 });
    }

    const data = {
      branchId: body.branchId ? Number(body.branchId) : session.branchId,
      groupName,
      leaderCustomerId: body.leaderCustomerId ? Number(body.leaderCustomerId) : null,
      notes: body.notes ? String(body.notes) : null,
    };

    let groupId: number;

    if (id) {
      const updated = await prisma.travelGroup.update({ where: { id }, data });
      groupId = updated.id;

      if (Array.isArray(body.memberCustomerIds)) {
        await prisma.groupMember.deleteMany({ where: { groupId } });
        if (body.memberCustomerIds.length > 0) {
          await prisma.groupMember.createMany({
            data: body.memberCustomerIds.map((cid: number) => ({
              groupId,
              customerId: cid,
            })),
          });
        }
      }

      await prisma.activityLog.create({
        data: { userId: session.id, action: 'Update Travel Group', entityType: 'group', entityId: groupId },
      });
    } else {
      const group = await prisma.travelGroup.create({ data });
      groupId = group.id;

      if (Array.isArray(body.memberCustomerIds) && body.memberCustomerIds.length > 0) {
        await prisma.groupMember.createMany({
          data: body.memberCustomerIds.map((cid: number) => ({
            groupId: group.id,
            customerId: cid,
          })),
        });
      }

      await prisma.activityLog.create({
        data: { userId: session.id, action: 'Create Travel Group', entityType: 'group', entityId: groupId },
      });
    }

    return NextResponse.json({ success: true, groupId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save travel group' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });

    await prisma.travelGroup.delete({ where: { id } });

    await prisma.activityLog.create({
      data: { userId: session.id, action: 'Delete Travel Group', entityType: 'group', entityId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete travel group' }, { status: 500 });
  }
}
