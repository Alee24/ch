import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const products = [
    { name: 'Chips', slug: 'chips', price: 100, emoji: '🍟' },
    { name: 'Sausage', slug: 'sausage', price: 70, emoji: '🌭' },
    { name: 'Smokie', slug: 'smokie', price: 50, emoji: '🌯' },
    { name: 'Burger', slug: 'burger', price: 250, emoji: '🍔' },
    { name: 'Pizza Slice', slug: 'pizza', price: 150, emoji: '🍕' },
    { name: 'Samosa', slug: 'samosa', price: 40, emoji: '🥟' },
    { name: 'Chapati', slug: 'chapati', price: 20, emoji: '🥞' },
    { name: 'Soda', slug: 'soda', price: 70, emoji: '🥤' },
    { name: 'Coffee', slug: 'coffee', price: 80, emoji: '☕' },
    { name: 'Fresh Juice', slug: 'juice', price: 100, emoji: '🍹' },
    { name: 'Bottled Water', slug: 'water', price: 50, emoji: '💧' },
  ];
  for (const p of products) await prisma.product.upsert({ where: { slug: p.slug }, update: p, create: p });
  const passwordHash = await bcrypt.hash('Digital2026', 12);
  await prisma.user.upsert({
    where: { email: 'admin@ch.com' },
    update: { role: 'ADMIN', passwordHash },
    create: { name: 'Campus Hub Admin', email: 'admin@ch.com', passwordHash, role: 'ADMIN' }
  });
}
main().finally(() => prisma.$disconnect());
