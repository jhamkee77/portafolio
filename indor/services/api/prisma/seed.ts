import { PrismaClient, UserRole, OrderStatus, PaymentStatus, ProviderStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding INDOR database...\n');

  const hash = (pw: string) => bcrypt.hash(pw, 10);

  // ─── Users ──────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@indor.com' },
    update: {},
    create: {
      email: 'admin@indor.com',
      passwordHash: await hash('admin123'),
      name: 'Ricardo Rivera',
      phone: '+17045550001',
      role: UserRole.admin,
      authProvider: 'local',
    },
  });

  const homeowner1 = await prisma.user.upsert({
    where: { email: 'john@example.com' },
    update: {},
    create: {
      email: 'john@example.com',
      passwordHash: await hash('password123'),
      name: 'John Mitchell',
      phone: '+17045551234',
      role: UserRole.homeowner,
      authProvider: 'local',
    },
  });

  const homeowner2 = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: {},
    create: {
      email: 'sarah@example.com',
      passwordHash: await hash('password123'),
      name: 'Sarah Johnson',
      phone: '+17045552345',
      role: UserRole.homeowner,
      authProvider: 'local',
    },
  });

  const renter1 = await prisma.user.upsert({
    where: { email: 'carlos@example.com' },
    update: {},
    create: {
      email: 'carlos@example.com',
      passwordHash: await hash('password123'),
      name: 'Carlos Mendez',
      phone: '+17045553456',
      role: UserRole.renter,
      authProvider: 'local',
    },
  });

  const providerUser1 = await prisma.user.upsert({
    where: { email: 'mike@hvacpros.com' },
    update: {},
    create: {
      email: 'mike@hvacpros.com',
      passwordHash: await hash('password123'),
      name: 'Mike Thompson',
      phone: '+17045555678',
      role: UserRole.provider,
      authProvider: 'local',
    },
  });

  const providerUser2 = await prisma.user.upsert({
    where: { email: 'lisa@plumbworks.com' },
    update: {},
    create: {
      email: 'lisa@plumbworks.com',
      passwordHash: await hash('password123'),
      name: 'Lisa Chen',
      phone: '+17045556789',
      role: UserRole.provider,
      authProvider: 'local',
    },
  });

  const providerUser3 = await prisma.user.upsert({
    where: { email: 'dave@sparkelectric.com' },
    update: {},
    create: {
      email: 'dave@sparkelectric.com',
      passwordHash: await hash('password123'),
      name: 'Dave Wilson',
      phone: '+17045557890',
      role: UserRole.provider,
      authProvider: 'local',
    },
  });

  const realtor1 = await prisma.user.upsert({
    where: { email: 'amber@realty.com' },
    update: {},
    create: {
      email: 'amber@realty.com',
      passwordHash: await hash('password123'),
      name: 'Amber Reyes',
      phone: '+17045558901',
      role: UserRole.realtor,
      authProvider: 'local',
    },
  });

  console.log('✅ Users created (8)');

  // ─── Properties (Charlotte NC) ──────────────────────────
  const prop1 = await prisma.property.create({
    data: {
      userId: homeowner1.id,
      address: '4521 Sharon View Rd',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28226',
      beds: 4,
      baths: 3,
      sqft: 2800,
      yearBuilt: 2008,
      homeValue: 485000,
      maintenanceScore: 82,
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      userId: homeowner1.id,
      address: '1200 East Blvd',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28203',
      beds: 2,
      baths: 1,
      sqft: 1200,
      yearBuilt: 1955,
      homeValue: 320000,
      maintenanceScore: 58,
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      userId: homeowner2.id,
      address: '8900 J.M. Keynes Dr',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28262',
      beds: 5,
      baths: 3.5,
      sqft: 3400,
      yearBuilt: 2015,
      homeValue: 620000,
      maintenanceScore: 91,
    },
  });

  const prop4 = await prisma.property.create({
    data: {
      userId: renter1.id,
      address: '525 N Church St Apt 412',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      beds: 1,
      baths: 1,
      sqft: 750,
      yearBuilt: 2020,
      homeValue: 280000,
      maintenanceScore: 95,
    },
  });

  console.log('✅ Properties created (4)');

  // ─── Home Systems ────────────────────────────────────────
  await prisma.homeSystem.createMany({
    data: [
      {
        propertyId: prop1.id, type: 'hvac', brand: 'Carrier',
        model: '24ACC636A003', serialNumber: 'CAR-2019-001',
        installDate: new Date('2019-06-15'), warrantyExpiry: new Date('2029-06-15'),
        warrantyStatus: 'active',
      },
      {
        propertyId: prop1.id, type: 'water_heater', brand: 'Rheem',
        model: 'PROG50-38N RH67', serialNumber: 'RHM-2020-042',
        installDate: new Date('2020-03-10'), warrantyExpiry: new Date('2026-03-10'),
        warrantyStatus: 'active',
      },
      {
        propertyId: prop1.id, type: 'roof', brand: 'GAF Timberline',
        model: 'HDZ Charcoal', serialNumber: 'GAF-2018-789',
        installDate: new Date('2018-09-01'), warrantyExpiry: new Date('2043-09-01'),
        warrantyStatus: 'active',
      },
      {
        propertyId: prop2.id, type: 'hvac', brand: 'Lennox',
        model: 'XC14-024-230', serialNumber: 'LEN-2015-321',
        installDate: new Date('2015-04-20'), warrantyExpiry: new Date('2025-04-20'),
        warrantyStatus: 'expired',
      },
      {
        propertyId: prop2.id, type: 'plumbing', brand: 'N/A',
        model: 'Copper piping', notes: 'Original 1955 plumbing, partial PEX replacement in 2019',
        installDate: new Date('1955-01-01'),
        warrantyStatus: 'unknown',
      },
      {
        propertyId: prop3.id, type: 'hvac', brand: 'Trane',
        model: 'XR15', serialNumber: 'TRN-2015-555',
        installDate: new Date('2015-08-10'), warrantyExpiry: new Date('2027-08-10'),
        warrantyStatus: 'active',
      },
      {
        propertyId: prop3.id, type: 'electrical', brand: 'Square D',
        model: 'QO 200A Panel', serialNumber: 'SQD-2015-888',
        installDate: new Date('2015-08-10'), warrantyExpiry: new Date('2035-08-10'),
        warrantyStatus: 'active',
      },
      {
        propertyId: prop3.id, type: 'safety_devices', brand: 'Ring',
        model: 'Alarm Pro', serialNumber: 'RNG-2023-101',
        installDate: new Date('2023-01-15'), warrantyExpiry: new Date('2025-01-15'),
        warrantyStatus: 'active', notes: 'Whole-home security system with 8 sensors',
      },
    ],
  });

  console.log('✅ Home systems created (8)');

  // ─── Services ────────────────────────────────────────────
  const svcHVAC = await prisma.service.create({
    data: {
      name: 'HVAC Maintenance & Repair',
      category: 'HVAC',
      description: 'Complete HVAC system inspection, cleaning, and tune-up. Includes filter check, refrigerant levels, and electrical connections.',
      basePrice: 149,
      priceRangeMin: 89,
      priceRangeMax: 349,
      duration: '1-2 hours',
      rating: 4.8,
      addOns: JSON.stringify([
        { name: 'Filter Replacement', price: 29 },
        { name: 'Duct Cleaning', price: 199 },
        { name: 'UV Light Install', price: 349 },
      ]),
    },
  });

  const svcPlumbing = await prisma.service.create({
    data: {
      name: 'Plumbing Repair & Diagnostics',
      category: 'Plumbing',
      description: 'General plumbing diagnostics, leak detection, and repair. Covers faucets, toilets, water lines, and drain issues.',
      basePrice: 199,
      priceRangeMin: 99,
      priceRangeMax: 599,
      duration: '1-3 hours',
      rating: 4.7,
      addOns: JSON.stringify([
        { name: 'Water Heater Flush', price: 89 },
        { name: 'Drain Camera Inspection', price: 149 },
      ]),
    },
  });

  const svcElectrical = await prisma.service.create({
    data: {
      name: 'Electrical Inspection & Repair',
      category: 'Electrical',
      description: 'Full home electrical system inspection. Covers panel, outlets, switches, grounding, and code compliance.',
      basePrice: 189,
      priceRangeMin: 89,
      priceRangeMax: 499,
      duration: '2-3 hours',
      rating: 4.6,
    },
  });

  const svcCleaning = await prisma.service.create({
    data: {
      name: 'Deep House Cleaning',
      category: 'Cleaning',
      description: 'Professional deep cleaning including kitchen, bathrooms, floors, windows, and all living spaces.',
      basePrice: 149,
      priceRangeMin: 99,
      priceRangeMax: 299,
      duration: '3-5 hours',
      rating: 4.9,
      addOns: JSON.stringify([
        { name: 'Fridge & Oven Deep Clean', price: 59 },
        { name: 'Garage Cleaning', price: 79 },
      ]),
    },
  });

  const svcLawn = await prisma.service.create({
    data: {
      name: 'Lawn Care & Landscaping',
      category: 'Landscaping',
      description: 'Mowing, edging, trimming, and seasonal cleanup. Includes mulch beds and bush trimming.',
      basePrice: 79,
      priceRangeMin: 49,
      priceRangeMax: 249,
      duration: '1-3 hours',
      rating: 4.5,
    },
  });

  const svcPest = await prisma.service.create({
    data: {
      name: 'Pest Control Treatment',
      category: 'Pest Control',
      description: 'Interior and exterior pest control treatment for ants, roaches, spiders, and more. Quarterly plans available.',
      basePrice: 129,
      priceRangeMin: 79,
      priceRangeMax: 299,
      duration: '1-2 hours',
      rating: 4.4,
    },
  });

  const svcPainting = await prisma.service.create({
    data: {
      name: 'Interior Painting',
      category: 'Painting',
      description: 'Professional interior painting including prep, priming, and two coats. Price per room.',
      basePrice: 299,
      priceRangeMin: 199,
      priceRangeMax: 799,
      duration: '4-8 hours',
      rating: 4.7,
    },
  });

  const svcInspection = await prisma.service.create({
    data: {
      name: 'Home Inspection',
      category: 'Inspection',
      description: 'Comprehensive home inspection covering structure, roof, HVAC, plumbing, electrical, and more. Ideal for buyers and annual checkups.',
      basePrice: 399,
      priceRangeMin: 299,
      priceRangeMax: 599,
      duration: '3-4 hours',
      rating: 4.8,
    },
  });

  console.log('✅ Services created (8)');

  // ─── Providers ───────────────────────────────────────────
  const provider1 = await prisma.provider.create({
    data: {
      userId: providerUser1.id,
      companyName: 'Charlotte HVAC Pros',
      contactName: 'Mike Thompson',
      email: 'mike@hvacpros.com',
      phone: '+17045555678',
      providerType: 'company',
      rating: 4.8,
      status: ProviderStatus.active,
      isVerified: true,
      serviceAreas: JSON.stringify(['28202', '28203', '28204', '28205', '28207', '28226']),
      servicesOffered: JSON.stringify(['HVAC']),
    },
  });

  const provider2 = await prisma.provider.create({
    data: {
      userId: providerUser2.id,
      companyName: 'PlumbWorks Charlotte',
      contactName: 'Lisa Chen',
      email: 'lisa@plumbworks.com',
      phone: '+17045556789',
      providerType: 'company',
      rating: 4.7,
      status: ProviderStatus.active,
      isVerified: true,
      serviceAreas: JSON.stringify(['28202', '28203', '28205', '28262']),
      servicesOffered: JSON.stringify(['Plumbing']),
    },
  });

  const provider3 = await prisma.provider.create({
    data: {
      userId: providerUser3.id,
      companyName: 'Spark Electric',
      contactName: 'Dave Wilson',
      email: 'dave@sparkelectric.com',
      phone: '+17045557890',
      providerType: 'individual',
      rating: 4.6,
      status: ProviderStatus.pending,
      isVerified: false,
      serviceAreas: JSON.stringify(['28202', '28226']),
      servicesOffered: JSON.stringify(['Electrical']),
    },
  });

  console.log('✅ Providers created (3)');

  // ─── Orders (full lifecycle demo) ────────────────────────

  // Order 1: Completed HVAC job with payment + review (full lifecycle)
  const payment1 = await prisma.payment.create({
    data: {
      userId: homeowner1.id,
      amount: 178,
      method: 'card',
      status: PaymentStatus.succeeded,
      stripeIntentId: 'pi_stub_hvac_001',
      stripeChargeId: 'ch_stub_hvac_001',
    },
  });

  const order1 = await prisma.order.create({
    data: {
      userId: homeowner1.id,
      propertyId: prop1.id,
      serviceId: svcHVAC.id,
      providerId: provider1.id,
      paymentId: payment1.id,
      status: OrderStatus.Completed,
      bookingDate: new Date('2026-04-10'),
      scheduledDate: new Date('2026-04-15T09:00:00'),
      completedDate: new Date('2026-04-15T11:30:00'),
      totalAmount: 178,
      notes: 'Annual HVAC tune-up before summer',
      addOns: JSON.stringify([{ name: 'Filter Replacement', price: 29 }]),
    },
  });

  // Order 2: In-progress plumbing job (WorkInProgress state)
  const order2 = await prisma.order.create({
    data: {
      userId: homeowner1.id,
      propertyId: prop2.id,
      serviceId: svcPlumbing.id,
      providerId: provider2.id,
      status: OrderStatus.WorkInProgress,
      bookingDate: new Date('2026-05-20'),
      scheduledDate: new Date('2026-05-25T10:00:00'),
      totalAmount: 199,
      notes: 'Slow drain in kitchen and master bath',
    },
  });

  // Order 3: Newly requested cleaning (waiting for confirmation)
  const order3 = await prisma.order.create({
    data: {
      userId: homeowner2.id,
      propertyId: prop3.id,
      serviceId: svcCleaning.id,
      status: OrderStatus.Requested,
      bookingDate: new Date('2026-05-24'),
      scheduledDate: new Date('2026-06-01T08:00:00'),
      totalAmount: 208,
      notes: 'Deep clean before hosting a party',
      addOns: JSON.stringify([{ name: 'Fridge & Oven Deep Clean', price: 59 }]),
    },
  });

  // Order 4: Provider on the way (real-time tracking demo)
  const order4 = await prisma.order.create({
    data: {
      userId: homeowner2.id,
      propertyId: prop3.id,
      serviceId: svcHVAC.id,
      providerId: provider1.id,
      status: OrderStatus.OnTheWay,
      bookingDate: new Date('2026-05-23'),
      scheduledDate: new Date('2026-05-25T14:00:00'),
      totalAmount: 149,
      notes: 'AC not cooling evenly upstairs',
    },
  });

  // Order 5: Completed + Reviewed (with property record)
  const payment2 = await prisma.payment.create({
    data: {
      userId: homeowner1.id,
      amount: 399,
      method: 'card',
      status: PaymentStatus.succeeded,
      stripeIntentId: 'pi_stub_insp_002',
      stripeChargeId: 'ch_stub_insp_002',
    },
  });

  const order5 = await prisma.order.create({
    data: {
      userId: homeowner1.id,
      propertyId: prop1.id,
      serviceId: svcInspection.id,
      providerId: provider1.id,
      paymentId: payment2.id,
      status: OrderStatus.SavedToPropertyRecord,
      bookingDate: new Date('2026-03-01'),
      scheduledDate: new Date('2026-03-05T09:00:00'),
      completedDate: new Date('2026-03-05T13:00:00'),
      totalAmount: 399,
      notes: 'Annual home inspection',
    },
  });

  // Order 6: Renter order — confirmed, waiting for provider
  const order6 = await prisma.order.create({
    data: {
      userId: renter1.id,
      propertyId: prop4.id,
      serviceId: svcPest.id,
      status: OrderStatus.Confirmed,
      bookingDate: new Date('2026-05-24'),
      scheduledDate: new Date('2026-05-28T11:00:00'),
      totalAmount: 129,
      notes: 'Ant problem in kitchen area',
    },
  });

  console.log('✅ Orders created (6)');

  // ─── Reviews ─────────────────────────────────────────────
  await prisma.review.create({
    data: {
      orderId: order1.id,
      userId: homeowner1.id,
      rating: 5,
      comment: 'Mike was on time, professional, and thorough. HVAC is running great now. Highly recommend!',
    },
  });

  await prisma.review.create({
    data: {
      orderId: order5.id,
      userId: homeowner1.id,
      rating: 4,
      comment: 'Very detailed inspection report. Found a few items I would have missed. Only reason for 4 stars is it took longer than quoted.',
    },
  });

  console.log('✅ Reviews created (2)');

  // ─── Messages (order conversation demo) ──────────────────
  await prisma.message.createMany({
    data: [
      { orderId: order2.id, senderId: homeowner1.id, content: 'The kitchen drain has been slow for about 2 weeks now', type: 'text', createdAt: new Date('2026-05-20T10:00:00') },
      { orderId: order2.id, senderId: providerUser2.id, content: 'Thanks for the details. I\'ll bring a drain camera to check for any blockages. See you at 10am!', type: 'text', createdAt: new Date('2026-05-20T10:15:00') },
      { orderId: order2.id, senderId: providerUser2.id, content: 'I\'m at the property now. Found a partial blockage in the P-trap under the kitchen sink. Working on clearing it.', type: 'text', createdAt: new Date('2026-05-25T10:20:00') },
      { orderId: order4.id, senderId: providerUser1.id, content: 'On my way! ETA about 15 minutes.', type: 'text', createdAt: new Date('2026-05-25T13:45:00') },
    ],
  });

  console.log('✅ Messages created (4)');

  // ─── Audit Logs ──────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'provider.approved', entityType: 'provider', entityId: provider1.id, metadata: JSON.stringify({ providerName: 'Charlotte HVAC Pros' }), createdAt: new Date('2026-03-01T09:00:00') },
      { userId: admin.id, action: 'provider.approved', entityType: 'provider', entityId: provider2.id, metadata: JSON.stringify({ providerName: 'PlumbWorks Charlotte' }), createdAt: new Date('2026-03-15T10:00:00') },
      { userId: admin.id, action: 'order.assign_provider', entityType: 'order', entityId: order1.id, metadata: JSON.stringify({ providerId: provider1.id, providerName: 'Charlotte HVAC Pros' }), createdAt: new Date('2026-04-10T14:00:00') },
      { userId: providerUser1.id, action: 'order.status_changed', entityType: 'order', entityId: order1.id, metadata: JSON.stringify({ from: 'ProviderAssigned', to: 'Completed' }), createdAt: new Date('2026-04-15T11:30:00') },
      { userId: homeowner1.id, action: 'order.status_changed', entityType: 'order', entityId: order5.id, metadata: JSON.stringify({ from: 'Reviewed', to: 'SavedToPropertyRecord' }), createdAt: new Date('2026-03-06T09:00:00') },
    ],
  });

  console.log('✅ Audit logs created (5)');

  // ─── Summary ─────────────────────────────────────────────
  console.log('\n🎉 Seed complete! Test accounts:\n');
  console.log('  Admin:      admin@indor.com / admin123');
  console.log('  Homeowner:  john@example.com / password123');
  console.log('  Homeowner:  sarah@example.com / password123');
  console.log('  Renter:     carlos@example.com / password123');
  console.log('  Provider:   mike@hvacpros.com / password123');
  console.log('  Provider:   lisa@plumbworks.com / password123');
  console.log('  Provider:   dave@sparkelectric.com / password123 (pending approval)');
  console.log('  Realtor:    amber@realty.com / password123\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
