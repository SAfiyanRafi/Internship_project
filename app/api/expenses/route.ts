import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const expenses = await prisma.expense.findMany({
    include: { branch: true },
    orderBy: [{ expenseDate: 'desc' }, { id: 'desc' }],
  });

  const totalPayments = await prisma.payment.aggregate({
    _sum: { amount: true },
  });

  const totalExpenses = await prisma.expense.aggregate({
    _sum: { amount: true },
  });

  const income = totalPayments._sum.amount || 0;
  const exp = totalExpenses._sum.amount || 0;

  return NextResponse.json({
    expenses,
    income,
    totalExpenses: exp,
    cashDifference: income - exp,
  });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || !['Super Admin', 'Manager', 'Accountant'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const category = String(body.category || '').trim();
    const amount = Number(body.amount || 0);

    if (!category || amount <= 0) {
      return NextResponse.json({ error: 'Category and positive amount are required' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        branchId: body.branchId ? Number(body.branchId) : session.branchId,
        expenseDate: String(body.expenseDate || new Date().toISOString().split('T')[0]),
        category,
        description: body.description ? String(body.description) : null,
        amount,
        createdById: session.id,
      },
    });

    return NextResponse.json({ success: true, expenseId: expense.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to record expense' }, { status: 500 });
  }
}
