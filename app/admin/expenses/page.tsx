import { prisma } from '@/lib/prisma';
import ExpensesClient from '@/components/ExpensesClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ExpensesPage() {
  const branches = await prisma.branch.findMany({ where: { isActive: true } });

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

  const currency = (await prisma.setting.findUnique({ where: { key: 'currency' } }))?.value || 'PKR';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Expenses & Cash Profit</h1>
        <p className="text-slate-400 text-sm mt-1">Record agency operating costs, commissions, hotel payments, and calculate net cash flow.</p>
      </div>

      <ExpensesClient
        initialExpenses={expenses}
        initialIncome={income}
        initialTotalExpenses={exp}
        initialCashDiff={income - exp}
        currency={currency}
        branches={branches}
      />
    </div>
  );
}
