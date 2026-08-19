import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { db } from './db';
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'development-secret-change-me');
const COOKIE = 'campus_hub_session';
export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('7d').sign(secret);
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 7 });
}
export async function clearSession() { (await cookies()).delete(COOKIE); }
export async function getCurrentUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub) return null;
    return db.user.findUnique({ where: { id: payload.sub }, select: { id: true, name: true, email: true, phone: true, role: true } });
  } catch { return null; }
}
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || !['STAFF', 'ADMIN'].includes(user.role)) throw new Error('FORBIDDEN');
  return user;
}
