import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Branch
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Head Office',
      phone: '+92 300 1234567',
      address: 'Suite 404, Main Boulevard, Lahore, Pakistan',
      isActive: true,
    },
  });

  // 2. Settings
  const settings = [
    { key: 'company_name', value: 'THABBA Travel & Tour Pvt Ltd' },
    { key: 'phone', value: '+92 300 1234567' },
    { key: 'email', value: 'info@thabba.local' },
    { key: 'address', value: 'Suite 404, Main Boulevard, Lahore, Pakistan' },
    { key: 'currency', value: 'PKR' },
    { key: 'public_tagline', value: 'Your journey, managed with care.' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
  }

  // 3. Admin User (admin@thabba.local / ChangeMe123!)
  const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@thabba.local' },
    update: {},
    create: {
      branchId: branch.id,
      name: 'Administrator',
      email: 'admin@thabba.local',
      passwordHash: passwordHash,
      role: 'Super Admin',
      isActive: true,
    },
  });

  // 4. Sample Packages
  const existingPkgCount = await prisma.package.count();
  if (existingPkgCount === 0) {
    await prisma.package.createMany({
      data: [
        {
          name: 'Economy Umrah Package 14 Days',
          packageType: 'Umrah',
          days: 14,
          price: 245000,
          airline: 'Saudi Arabian Airlines',
          makkahHotel: 'Al Eiman Royal (600m)',
          madinahHotel: 'Saja Al Madinah (400m)',
          roomType: 'Quad Sharing',
          inclusions: 'Visa, Flights, Hotel Accommodation, Transport, Ziyarat',
          exclusions: 'Personal Expenses, Food',
          publicDescription: 'Affordable 14-day Umrah package with comfortable quad sharing accommodation and direct flights.',
          isPublic: true,
          isActive: true,
        },
        {
          name: 'VIP Executive Hajj Package 2026',
          packageType: 'Hajj',
          days: 21,
          price: 1850000,
          airline: 'PIA / Saudi Airlines',
          makkahHotel: 'Swissotel Makkah (Clock Tower)',
          madinahHotel: 'Dar Al Taqwa Madinah',
          roomType: 'Double Sharing',
          inclusions: 'VIP Tents in Mina/Arafat, Luxury Transport, Full Board Meals, Executive Guidance',
          exclusions: 'Qurbani (can be added)',
          publicDescription: '5-Star luxury Hajj experience with private tent facilities, luxury buses, and 5-star hotel stay.',
          isPublic: true,
          isActive: true,
        },
        {
          name: 'Star Deluxe Umrah 10 Days',
          packageType: 'Umrah',
          days: 10,
          price: 380000,
          airline: 'Emirates',
          makkahHotel: 'Pullman Zamzam Makkah',
          madinahHotel: 'Frontel Al Harithia',
          roomType: 'Double Sharing',
          inclusions: '5-Star Hotels right at Haram entrance, Private GMC Transfer, Visa & Flight',
          exclusions: 'Tours outside standard Ziyarat',
          publicDescription: 'Premium 10-day Umrah package with top 5-star hotels next to the Haram.',
          isPublic: true,
          isActive: true,
        }
      ]
    });
  }

  // 5. Sample Hotels
  const existingHotels = await prisma.hotel.count();
  if (existingHotels === 0) {
    await prisma.hotel.createMany({
      data: [
        { city: 'Makkah', name: 'Swissotel Makkah', distance: 'Clock Tower (0m from Haram)', phone: '+966 12 571 8000', notes: 'Direct access to King Abdulaziz gate', isPublic: true },
        { city: 'Madinah', name: 'Dar Al Taqwa Madinah', distance: '50m from Prophet Mosque', phone: '+966 14 829 1111', notes: 'Facing Ladies Gate 25', isPublic: true },
        { city: 'Makkah', name: 'Al Eiman Royal', distance: '600m from Haram', phone: '+966 12 550 0000', notes: 'Free shuttle service available 24/7', isPublic: true },
      ]
    });
  }

  // 6. Sample Flights
  const existingFlights = await prisma.flight.count();
  if (existingFlights === 0) {
    await prisma.flight.createMany({
      data: [
        { airline: 'Saudi Arabian Airlines', flightNo: 'SV-735', origin: 'Lahore (LHE)', destination: 'Jeddah (JED)', departureAt: '2026-09-10 04:30', arrivalAt: '2026-09-10 08:15', baggage: '2x 23kg', publicNotice: true },
        { airline: 'PIA', flightNo: 'PK-741', origin: 'Islamabad (ISB)', destination: 'Madinah (MED)', departureAt: '2026-09-15 14:00', arrivalAt: '2026-09-15 18:00', baggage: '30kg + 7kg Hand', publicNotice: true },
      ]
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
