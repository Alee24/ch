import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession } from '@/lib/auth';
import { loginSchema } from '@/lib/validation';
export async function POST(req: Request) {
  try {
    const data = loginSchema.parse(await req.json());
    const user = await db.user.findUnique({ where: { email: data.email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    await createSession(user.id);
    return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch { return NextResponse.json({ error: 'Invalid request' }, { status: 400 }); }
}
