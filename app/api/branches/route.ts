import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(branches);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;
    const name = String(body.name || '').trim();

    if (!name) return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });

    const data = {
      name,
      phone: body.phone ? String(body.phone) : null,
      address: body.address ? String(body.address) : null,
    };

    if (id) {
      await prisma.branch.update({ where: { id }, data });
      return NextResponse.json({ success: true, branchId: id });
    } else {
      const branch = await prisma.branch.create({ data });
      return NextResponse.json({ success: true, branchId: branch.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save branch' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) return NextResponse.json({ error: 'Branch ID is required' }, { status: 400 });

    await prisma.branch.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete branch' }, { status: 500 });
  }
}
