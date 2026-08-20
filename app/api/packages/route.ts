import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const packages = await prisma.package.findMany({
    orderBy: { id: 'desc' },
  });
  return NextResponse.json(packages);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !['Super Admin', 'Manager'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const id = body.id ? Number(body.id) : null;

    const data = {
      name: String(body.name || '').trim(),
      packageType: String(body.packageType || 'Umrah'),
      days: Number(body.days || 14),
      price: Number(body.price || 0),
      airline: body.airline ? String(body.airline) : null,
      makkahHotel: body.makkahHotel ? String(body.makkahHotel) : null,
      madinahHotel: body.madinahHotel ? String(body.madinahHotel) : null,
      roomType: body.roomType ? String(body.roomType) : null,
      inclusions: body.inclusions ? String(body.inclusions) : null,
      exclusions: body.exclusions ? String(body.exclusions) : null,
      publicDescription: body.publicDescription ? String(body.publicDescription) : null,
      isPublic: Boolean(body.isPublic),
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    };

    if (!data.name || data.price <= 0) {
      return NextResponse.json({ error: 'Package Name and Price are required' }, { status: 400 });
    }

    if (id) {
      await prisma.package.update({ where: { id }, data });
    } else {
      await prisma.package.create({ data });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save package' }, { status: 500 });
  }
}
