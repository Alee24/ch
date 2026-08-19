import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main() {
  const products = [
    { name: 'Chips', slug: 'chips', price: 100, emoji: '🍟' },
    { name: 'Sausage', slug: 'sausage', price: 70, emoji: '🌭' },
    { name: 'Smokie', slug: 'smokie', price: 50, emoji: '🌯' },
  ];
  for (const p of products) await prisma.product.upsert({ where: { slug: p.slug }, update: p, create: p });
  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  await prisma.user.upsert({
    where: { email: 'admin@campushub.local' },
    update: { role: 'ADMIN', passwordHash },
    create: { name: 'Campus Hub Admin', email: 'admin@campushub.local', passwordHash, role: 'ADMIN' }
  });
}
main().finally(() => prisma.$disconnect());
