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
    const id = body.id ? Number(body.id) : null;
    const email = String(body.email || '').trim().toLowerCase();
    const name = String(body.name || '').trim();
    const password = body.password ? String(body.password) : null;
    const role = String(body.role || 'Staff');
    const branchId = body.branchId ? Number(body.branchId) : null;

    if (!email || !name) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    if (id) {
      const data: any = {
        branchId,
        name,
        email,
        role,
      };

      if (password && password.length >= 6) {
        data.passwordHash = await hashPassword(password);
      }

      await prisma.user.update({ where: { id }, data });
      return NextResponse.json({ success: true, userId: id });
    } else {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password (min 6 chars) is required for new accounts' }, { status: 400 });
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
    }
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to save user' }, { status: 500 });
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

    if (!id) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    if (id === session.id) {
      return NextResponse.json({ error: 'You cannot delete your own active session account' }, { status: 400 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete user account' }, { status: 500 });
  }
}
