import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
export async function GET(){return NextResponse.json({products:await db.product.findMany({where:{active:true},orderBy:{name:'asc'}})})}
