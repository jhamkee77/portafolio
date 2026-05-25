import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@indor.com' },
    update: {},
    create: {
      email: 'admin@indor.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      name: 'INDOR Admin',
      role: UserRole.admin,
      authProvider: 'local',
    },
  });

  // Homeowner user
  const homeowner = await prisma.user.upsert({
    where: { email: 'homeowner@example.com' },
    update: {},
    create: {
      email: 'homeowner@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'John Homeowner',
      phone: '+17045551234',
      role: UserRole.homeowner,
      authProvider: 'local',
    },
  });

  // Provider user
  const providerUser = await prisma.user.upsert({
    where: { email: 'provider@example.com' },
    update: {},
    create: {
      email: 'provider@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      name: 'Mike Provider',
      phone: '+17045555678',
      role: UserRole.provider,
      authProvider: 'local',
    },
  });

  // Property
  const property = await prisma.property.create({
    data: {
      userId: homeowner.id,
      address: '123 Main Street',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      beds: 3,
      baths: 2,
      sqft: 1800,
      yearBuilt: 2005,
      homeValue: 350000,
      maintenanceScore: 75,
    },
  });

  // Home systems
  await prisma.homeSystem.createMany({
    data: [
      {
        propertyId: property.id,
        type: 'hvac',
        brand: 'Carrier',
        model: '24ACC636A003',
        serialNumber: 'CAR-2019-001',
        installDate: new Date('2019-06-15'),
        warrantyExpiry: new Date('2029-06-15'),
        warrantyStatus: 'active',
      },
      {
        propertyId: property.id,
        type: 'water_heater',
        brand: 'Rheem',
        model: 'PROG50-38N RH67',
        serialNumber: 'RHM-2020-042',
        installDate: new Date('2020-03-10'),
        warrantyExpiry: new Date('2026-03-10'),
        warrantyStatus: 'active',
      },
    ],
  });

  // Services
  const hvacService = await prisma.service.create({
    data: {
      name: 'HVAC Maintenance',
      category: 'HVAC',
      description: 'Complete HVAC system inspection, cleaning, and tune-up',
      basePrice: 149,
      priceRangeMin: 89,
      priceRangeMax: 299,
      duration: '1-2 hours',
      rating: 4.8,
      addOns: JSON.stringify([
        { name: 'Filter Replacement', price: 29 },
        { name: 'Duct Cleaning', price: 199 },
      ]),
    },
  });

  await prisma.service.createMany({
    data: [
      {
        name: 'Plumbing Repair',
        category: 'Plumbing',
        description: 'General plumbing diagnostics and repair',
        basePrice: 199,
        priceRangeMin: 99,
        priceRangeMax: 499,
        duration: '1-3 hours',
        rating: 4.7,
      },
      {
        name: 'Electrical Inspection',
        category: 'Electrical',
        description: 'Full home electrical system inspection',
        basePrice: 189,
        priceRangeMin: 89,
        priceRangeMax: 399,
        duration: '2-3 hours',
        rating: 4.6,
      },
      {
        name: 'House Cleaning',
        category: 'Cleaning',
        description: 'Professional deep cleaning service',
        basePrice: 149,
        priceRangeMin: 89,
        priceRangeMax: 199,
        duration: '2-4 hours',
        rating: 4.9,
      },
    ],
  });

  // Provider
  const provider = await prisma.provider.create({
    data: {
      userId: providerUser.id,
      companyName: 'Charlotte HVAC Pros',
      contactName: 'Mike Provider',
      email: 'provider@example.com',
      phone: '+17045555678',
      providerType: 'company',
      rating: 4.8,
      status: 'active',
      isVerified: true,
    },
  });

  console.log('Seed complete:', {
    admin: admin.email,
    homeowner: homeowner.email,
    provider: provider.email,
    property: property.address,
    services: 4,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
