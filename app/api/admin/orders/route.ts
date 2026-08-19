import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireStaff } from '@/lib/auth';
export async function GET(){try{await requireStaff();const orders=await db.order.findMany({orderBy:{createdAt:'desc'},take:100,include:{items:{include:{product:true}},printJob:true,payment:true}});return NextResponse.json({orders})}catch(e){return NextResponse.json({error:'Forbidden'},{status:403})}}
