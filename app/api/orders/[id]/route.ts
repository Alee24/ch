import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const user = await getCurrentUser();
  const order = await db.order.findUnique({ where: { id }, include: { items: { include: { product: true } }, printJob: true, payment: true, statusLogs: { orderBy: { createdAt: 'asc' } } } });
  if (!order || (order.userId && order.userId !== user?.id && !['STAFF','ADMIN'].includes(user?.role || ''))) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ order });
}
