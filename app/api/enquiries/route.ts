import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const enquiries = await prisma.enquiry.findMany({
    orderBy: { id: 'desc' },
  });
  return NextResponse.json(enquiries);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = String(body.fullName || body.full_name || '').trim();
    const phone = String(body.phone || '').trim();

    if (!fullName || !phone) {
      return NextResponse.json({ error: 'Name and Phone number are required' }, { status: 400 });
    }

    const enquiry = await prisma.enquiry.create({
      data: {
        fullName,
        phone,
        service: body.service ? String(body.service) : 'Umrah',
        message: body.message ? String(body.message) : null,
        status: 'New',
      },
    });

    return NextResponse.json({ success: true, enquiryId: enquiry.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit enquiry' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const id = Number(body.id);
    const status = String(body.status);

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and Status are required' }, { status: 400 });
    }

    await prisma.enquiry.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update enquiry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get('id'));

    if (!id) return NextResponse.json({ error: 'Enquiry ID is required' }, { status: 400 });

    await prisma.enquiry.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete enquiry' }, { status: 500 });
  }
}
