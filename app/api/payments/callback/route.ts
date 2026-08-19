import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function POST(req: Request) {
  const body = await req.json();
  try {
    const callback = body?.Body?.stkCallback;
    const checkoutRequestId = callback?.CheckoutRequestID as string | undefined;
    if (!checkoutRequestId) return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    const payment = await db.payment.findUnique({ where: { checkoutRequestId } });
    if (!payment) return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    const successful = callback.ResultCode === 0;
    const metadata = callback.CallbackMetadata?.Item || [];
    const receipt = metadata.find((x: any) => x.Name === 'MpesaReceiptNumber')?.Value;
    await db.$transaction(async tx => {
      await tx.payment.update({ where: { id: payment.id }, data: { status: successful ? 'SUCCESSFUL' : 'FAILED', receipt: receipt ? String(receipt) : undefined, rawCallback: body } });
      const order = await tx.order.findUnique({ where: { id: payment.orderId } });
      if (order && successful) {
        await tx.order.update({ where: { id: order.id }, data: { status: 'RECEIVED' } });
        await tx.orderStatusLog.create({ data: { orderId: order.id, from: order.status, to: 'RECEIVED', note: 'M-Pesa payment confirmed' } });
      } else if (order && !successful) {
        await tx.order.update({ where: { id: order.id }, data: { status: 'FAILED' } });
        await tx.orderStatusLog.create({ data: { orderId: order.id, from: order.status, to: 'FAILED', note: callback.ResultDesc || 'M-Pesa payment failed' } });
      }
    });
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch { return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' }); }
}
