import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const whereCondition = session.role === 'Super Admin' ? {} : { branchId: session.branchId || undefined };

  const customers = await prisma.customer.findMany({
    where: whereCondition,
    include: { branch: true },
    orderBy: { id: 'desc' },
    take: 500,
  });

  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await request.formData();
    const id = formData.get('id') ? Number(formData.get('id')) : null;
    const branchId = formData.get('branch_id') ? Number(formData.get('branch_id')) : session.branchId;

    const data = {
      branchId: branchId || null,
      fullName: String(formData.get('full_name') || '').trim(),
      fatherName: formData.get('father_name') ? String(formData.get('father_name')) : null,
      phone: formData.get('phone') ? String(formData.get('phone')) : null,
      email: formData.get('email') ? String(formData.get('email')) : null,
      cnic: formData.get('cnic') ? String(formData.get('cnic')) : null,
      passportNo: formData.get('passport_no') ? String(formData.get('passport_no')) : null,
      passportExpiry: formData.get('passport_expiry') ? String(formData.get('passport_expiry')) : null,
      dob: formData.get('dob') ? String(formData.get('dob')) : null,
      gender: formData.get('gender') ? String(formData.get('gender')) : 'Male',
      nationality: formData.get('nationality') ? String(formData.get('nationality')) : 'Pakistani',
      address: formData.get('address') ? String(formData.get('address')) : null,
      emergencyContact: formData.get('emergency_contact') ? String(formData.get('emergency_contact')) : null,
      notes: formData.get('notes') ? String(formData.get('notes')) : null,
    };

    if (!data.fullName) {
      return NextResponse.json({ error: 'Full Name is required' }, { status: 400 });
    }

    let customerId: number;

    if (id) {
      const updated = await prisma.customer.update({
        where: { id },
        data,
      });
      customerId = updated.id;
      await prisma.activityLog.create({
        data: { userId: session.id, action: 'Update Customer', entityType: 'customer', entityId: customerId },
      });
    } else {
      const created = await prisma.customer.create({
        data: {
          ...data,
          createdById: session.id,
        },
      });
      customerId = created.id;
      await prisma.activityLog.create({
        data: { userId: session.id, action: 'Create Customer', entityType: 'customer', entityId: customerId },
      });
    }

    // Handle File Uploads (Passport / CNIC)
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const fileFields = [
      { fieldName: 'passport_file', docType: 'Passport' },
      { fieldName: 'cnic_file', docType: 'CNIC' },
    ];

    for (const item of fileFields) {
      const file = formData.get(item.fieldName) as File | null;
      if (file && file.size > 0) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = path.extname(file.name) || '.pdf';
        const fileName = `${crypto.randomBytes(16).toString('hex')}${ext}`;
        const filePath = path.join(uploadDir, fileName);

        await fs.writeFile(filePath, buffer);

        await prisma.customerDocument.create({
          data: {
            customerId,
            docType: item.docType,
            fileName,
            uploadedById: session.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, customerId });
  } catch (error: any) {
    console.error('Error saving customer:', error);
    return NextResponse.json({ error: error.message || 'Failed to save customer' }, { status: 500 });
  }
}
