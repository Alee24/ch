import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { stkSchema } from '@/lib/validation';
import { initiateStkPush, normalizeMpesaPhone } from '@/lib/mpesa';
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const data = stkSchema.parse(await req.json());
    const order = await db.order.findUnique({ where: { id: data.orderId } });
    if (!order || order.userId !== user.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status !== 'PENDING' && order.status !== 'PAYMENT_PENDING') return NextResponse.json({ error: 'Order cannot be paid' }, { status: 409 });
    const phone = normalizeMpesaPhone(data.phone);
    const response = await initiateStkPush(order.total, phone, order.ticketCode);
    await db.payment.upsert({ where: { orderId: order.id }, update: { amount: order.total, phone, merchantRequestId: response.MerchantRequestID, checkoutRequestId: response.CheckoutRequestID, status: 'PENDING' }, create: { orderId: order.id, amount: order.total, phone, merchantRequestId: response.MerchantRequestID, checkoutRequestId: response.CheckoutRequestID } });
    await db.order.update({ where: { id: order.id }, data: { status: 'PAYMENT_PENDING' } });
    return NextResponse.json({ message: response.CustomerMessage || 'Check your phone for the M-Pesa prompt' });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Payment failed' }, { status: 400 }); }
}
