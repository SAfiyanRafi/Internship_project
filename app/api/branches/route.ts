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
    const name = String(body.name || '').trim();

    if (!name) return NextResponse.json({ error: 'Branch name is required' }, { status: 400 });

    const branch = await prisma.branch.create({
      data: {
        name,
        phone: body.phone ? String(body.phone) : null,
        address: body.address ? String(body.address) : null,
      },
    });

    return NextResponse.json({ success: true, branchId: branch.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create branch' }, { status: 500 });
  }
}
