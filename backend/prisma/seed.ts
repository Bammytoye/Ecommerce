import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // ── Admin user ──────────────────────────────────────────────
    const adminPassword = await bcrypt.hash('Admin@123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@store.com' },
        update: {},
        create: {
            email: 'admin@store.com',
            passwordHash: adminPassword,
            firstName: 'Store',
            lastName: 'Admin',
            role: Role.ADMIN,
            isVerified: true,
        },
    })

    // ── Customer user ────────────────────────────────────────────
    const customerPassword = await bcrypt.hash('Customer@123', 12)
    const customer = await prisma.user.upsert({
        where: { email: 'customer@example.com' },
        update: {},
        create: {
            email: 'customer@example.com',
            passwordHash: customerPassword,
            firstName: 'John',
            lastName: 'Doe',
            role: Role.CUSTOMER,
            isVerified: true,
            addresses: {
                create: {
                    type: 'SHIPPING',
                    fullName: 'John Doe',
                    phone: '+1234567890',
                    street: '123 Main Street',
                    city: 'New York',
                    state: 'NY',
                    postalCode: '10001',
                    country: 'US',
                    isDefault: true,
                },
            },
        },
    })

    // ── Categories ───────────────────────────────────────────────
    const electronics = await prisma.category.upsert({
        where: { slug: 'electronics' },
        update: {},
        create: {
            name: 'Electronics',
            slug: 'electronics',
            description: 'Gadgets, devices and accessories',
        },
    })

    const clothing = await prisma.category.upsert({
        where: { slug: 'clothing' },
        update: {},
        create: {
            name: 'Clothing',
            slug: 'clothing',
            description: 'Fashion for men, women and kids',
        },
    })

    const phones = await prisma.category.upsert({
        where: { slug: 'phones' },
        update: {},
        create: {
            name: 'Phones',
            slug: 'phones',
            description: 'Smartphones and accessories',
            parentId: electronics.id,
        },
    })

    // ── Tags ─────────────────────────────────────────────────────
    const tags = await Promise.all(
        ['new-arrival', 'bestseller', 'sale', 'featured'].map((name) =>
            prisma.tag.upsert({
                where: { slug: name },
                update: {},
                create: { name, slug: name },
            })
        )
    )

    // ── Products ─────────────────────────────────────────────────
    const phone = await prisma.product.upsert({
        where: { sku: 'PHN-001' },
        update: {},
        create: {
            name: 'ProMax X15 Smartphone',
            slug: 'promax-x15-smartphone',
            description: 'A flagship smartphone with 200MP camera, 5000mAh battery and 6.8" AMOLED display.',
            basePrice: 999.99,
            comparePrice: 1199.99,
            sku: 'PHN-001',
            stock: 50,
            isFeatured: true,
            categoryId: phones.id,
            images: {
                create: [
                    {
                        url: 'https://placehold.co/800x800?text=ProMax+X15',
                        publicId: 'products/phone-001-main',
                        altText: 'ProMax X15 front view',
                        isPrimary: true,
                        position: 0,
                    },
                ],
            },
            variants: {
                create: [
                    { name: 'Color', value: 'Midnight Black', stock: 20, sku: 'PHN-001-BLK' },
                    { name: 'Color', value: 'Pearl White', stock: 20, sku: 'PHN-001-WHT' },
                    { name: 'Color', value: 'Ocean Blue', stock: 10, sku: 'PHN-001-BLU' },
                ],
            },
            tags: {
                create: [
                    { tag: { connect: { slug: 'new-arrival' } } },
                    { tag: { connect: { slug: 'featured' } } },
                ],
            },
        },
    })

    const tshirt = await prisma.product.upsert({
        where: { sku: 'CLT-001' },
        update: {},
        create: {
            name: 'Premium Cotton T-Shirt',
            slug: 'premium-cotton-tshirt',
            description: '100% organic cotton, pre-shrunk, available in multiple sizes.',
            basePrice: 29.99,
            comparePrice: 39.99,
            sku: 'CLT-001',
            stock: 200,
            categoryId: clothing.id,
            images: {
                create: [
                    {
                        url: 'https://placehold.co/800x800?text=T-Shirt',
                        publicId: 'products/tshirt-001-main',
                        altText: 'Premium Cotton T-Shirt',
                        isPrimary: true,
                        position: 0,
                    },
                ],
            },
            variants: {
                create: [
                    { name: 'Size', value: 'S', stock: 50, sku: 'CLT-001-S' },
                    { name: 'Size', value: 'M', stock: 80, sku: 'CLT-001-M' },
                    { name: 'Size', value: 'L', stock: 50, sku: 'CLT-001-L' },
                    { name: 'Size', value: 'XL', stock: 20, sku: 'CLT-001-XL' },
                ],
            },
            tags: {
                create: [{ tag: { connect: { slug: 'bestseller' } } }],
            },
        },
    })

    // ── Coupon ───────────────────────────────────────────────────
    await prisma.coupon.upsert({
        where: { code: 'WELCOME20' },
        update: {},
        create: {
            code: 'WELCOME20',
            description: '20% off your first order',
            discountType: 'PERCENT',
            discountValue: 20,
            minOrderAmount: 50,
            maxUses: 1000,
            isActive: true,
        },
    })

    console.log('✅ Seed complete!')
    console.log(`   Admin   → admin@store.com / Admin@123`)
    console.log(`   Customer → customer@example.com / Customer@123`)
    console.log(`   Products → ${phone.name}, ${tshirt.name}`)
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => { await prisma.$disconnect() })