import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { foodOrderSchema, printOrderSchema } from '@/lib/validation';
import { ticketCode } from '@/lib/ticket';
import { printTotal } from '@/lib/pricing';
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const type = body.type as 'FOOD' | 'PRINT';
    if (type === 'FOOD') {
      const data = foodOrderSchema.parse(body);
      const products = await db.product.findMany({ where: { id: { in: data.items.map(i => i.productId) }, active: true } });
      if (products.length !== new Set(data.items.map(i => i.productId)).size) return NextResponse.json({ error: 'One or more products are unavailable' }, { status: 400 });
      const total = data.items.reduce((s, i) => s + products.find(p => p.id === i.productId)!.price * i.quantity, 0);
      const order = await db.order.create({ data: { ticketCode: ticketCode(), type: 'FOOD', total, userId: user?.id, items: { create: data.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: products.find(p => p.id === i.productId)!.price })) }, statusLogs: { create: { to: 'PENDING', note: 'Order created' } } }, include: { items: { include: { product: true } } } });
      return NextResponse.json({ order }, { status: 201 });
    }
    const data = printOrderSchema.parse(body);
    const total = printTotal(data.pages, data.color, data.binding);
    const order = await db.order.create({ data: { ticketCode: ticketCode(), type: 'PRINT', total, userId: user?.id, printJob: { create: { fileKey: data.fileKey, fileName: data.fileName, mimeType: data.mimeType, pages: data.pages, color: data.color, binding: data.binding, bindingPrice: data.binding === 'SPIRAL' ? 100 : data.binding === 'STAPLE' ? 20 : 0 } }, statusLogs: { create: { to: 'PENDING', note: 'Print order created' } } }, include: { printJob: true } });
    return NextResponse.json({ order }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid request' }, { status: 400 }); }
}
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ orders: [] });
  const orders = await db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 50, include: { items: { include: { product: true } }, printJob: true, payment: true } });
  return NextResponse.json({ orders });
}
