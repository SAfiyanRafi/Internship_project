import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

function arrayToCSV(rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [headers.join(',')];

  for (const row of rows) {
    const values = headers.map((header) => {
      const val = row[header] ?? '';
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  return csvRows.join('\n');
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  let rows: any[] = [];
  const filename = `${type || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;

  switch (type) {
    case 'customers':
      const customers = await prisma.customer.findMany({
        include: { branch: true },
        orderBy: { id: 'desc' },
      });
      rows = customers.map((c) => ({
        ID: c.id,
        'Full Name': c.fullName,
        'Father Name': c.fatherName || '',
        Phone: c.phone || '',
        Email: c.email || '',
        CNIC: c.cnic || '',
        Passport: c.passportNo || '',
        'Passport Expiry': c.passportExpiry || '',
        Nationality: c.nationality || '',
        Address: c.address || '',
        Branch: c.branch?.name || '',
      }));
      break;

    case 'packages':
      const pkgs = await prisma.package.findMany({ orderBy: { id: 'desc' } });
      rows = pkgs.map((p) => ({
        ID: p.id,
        Name: p.name,
        Type: p.packageType,
        Days: p.days,
        Price: p.price,
        Airline: p.airline || '',
        'Makkah Hotel': p.makkahHotel || '',
        'Madinah Hotel': p.madinahHotel || '',
        Public: p.isPublic ? 'Yes' : 'No',
        Active: p.isActive ? 'Yes' : 'No',
      }));
      break;

    case 'bookings':
      const bookings = await prisma.booking.findMany({
        include: { customer: true, package: true },
        orderBy: { id: 'desc' },
      });
      rows = bookings.map((b) => ({
        ID: `BKG-${b.id}`,
        Customer: b.customer.fullName,
        Package: b.package?.name || 'Custom',
        Departure: b.departureDate || '',
        Return: b.returnDate || '',
        Total: b.totalPrice,
        Discount: b.discount,
        Net: b.totalPrice - b.discount,
        Status: b.status,
        PNR: b.pnr || '',
        Flight: b.flightNo || '',
      }));
      break;

    case 'payments':
      const payments = await prisma.payment.findMany({
        include: { booking: { include: { customer: true } } },
        orderBy: { id: 'desc' },
      });
      rows = payments.map((p) => ({
        Receipt: `RCPT-${p.id}`,
        Date: p.paymentDate,
        Customer: p.booking.customer.fullName,
        Amount: p.amount,
        Method: p.method,
        Reference: p.referenceNo || '',
        'Received By': p.receivedBy || '',
      }));
      break;

    case 'enquiries':
      const enquiries = await prisma.enquiry.findMany({ orderBy: { id: 'desc' } });
      rows = enquiries.map((e) => ({
        ID: e.id,
        Date: e.createdAt.toISOString(),
        Name: e.fullName,
        Phone: e.phone,
        Service: e.service || '',
        Message: e.message || '',
        Status: e.status,
      }));
      break;

    case 'outstanding':
      const allBookings = await prisma.booking.findMany({
        include: { customer: true, payments: true },
      });

      rows = allBookings
        .map((b) => {
          const total = b.totalPrice - b.discount;
          const paid = b.payments.reduce((acc, p) => acc + p.amount, 0);
          const balance = total - paid;
          return {
            Booking: `BKG-${b.id}`,
            Customer: b.customer.fullName,
            Phone: b.customer.phone || '',
            Total: total,
            Paid: paid,
            Balance: Math.max(0, balance),
          };
        })
        .filter((b) => b.Balance > 0);
      break;

    default:
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 });
  }

  const csvContent = arrayToCSV(rows);

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
