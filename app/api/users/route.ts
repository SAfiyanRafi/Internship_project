import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, hashPassword } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      branchId: true,
      branch: true,
      createdAt: true,
    },
    orderBy: { id: 'asc' },
  });

  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== 'Super Admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const password = String(body.password || '');
    const role = String(body.role || 'Staff');
    const branchId = body.branchId ? Number(body.branchId) : null;

    if (!email || !name || !password || password.length < 6) {
      return NextResponse.json({ error: 'Name, email, and password (min 6 chars) are required' }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        branchId,
        name,
        email,
        passwordHash,
        role,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}
