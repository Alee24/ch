import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { getCurrentUser } from '@/lib/auth';
import { createUploadUrl } from '@/lib/storage';
const allowed = new Set(['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/msword']);
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(); if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 });
    const { fileName, contentType, size } = await req.json();
    const max = Number(process.env.MAX_PRINT_FILE_MB || 20) * 1024 * 1024;
    if (!allowed.has(contentType) || size > max) return NextResponse.json({ error: 'Unsupported file or size exceeds limit' }, { status: 400 });
    const ext = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
    const key = `print/${user.id}/${crypto.randomUUID()}.${ext}`;
    const url = await createUploadUrl(key, contentType);
    return NextResponse.json({ key, url });
  } catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : 'Storage unavailable' }, { status: 503 }); }
}
