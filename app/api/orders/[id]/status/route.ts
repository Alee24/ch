import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaff } from '@/lib/auth';
import { statusSchema } from '@/lib/validation';
const transitions: Record<string, string[]> = { RECEIVED: ['IN_PROGRESS','CANCELLED'], IN_PROGRESS: ['READY','CANCELLED'], READY: ['COMPLETED'], COMPLETED: [], CANCELLED: [], FAILED: [] };
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireStaff(); const { id } = await params; const data = statusSchema.parse(await req.json());
    const order = await db.order.findUnique({ where: { id } }); if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (!transitions[order.status]?.includes(data.status)) return NextResponse.json({ error: `Invalid transition ${order.status} → ${data.status}` }, { status: 409 });
    const updated = await db.$transaction(async tx => {
      const o = await tx.order.update({ where: { id }, data: { status: data.status } });
      await tx.orderStatusLog.create({ data: { orderId: id, from: order.status, to: data.status, note: data.note, actorId: actor.id } }); return o;
    });
    return NextResponse.json({ order: updated });
  } catch (e) { return NextResponse.json({ error: e instanceof Error && e.message === 'FORBIDDEN' ? 'Forbidden' : 'Invalid request' }, { status: e instanceof Error && e.message === 'FORBIDDEN' ? 403 : 400 }); }
}
