import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { registerSchema } from '@/lib/validation';
export async function POST(req: Request) {
  try {
    const data = registerSchema.parse(await req.json());
    const exists = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    const user = await db.user.create({ data: { name: data.name, email: data.email.toLowerCase(), phone: data.phone, passwordHash: await bcrypt.hash(data.password, 12) }, select: { id: true, name: true, email: true, role: true } });
    await createSession(user.id);
    return NextResponse.json({ user }, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Invalid request' }, { status: 400 }); }
}
