import { z } from 'zod';
export const registerSchema = z.object({ name: z.string().min(2).max(80), email: z.email(), phone: z.string().min(9).max(20).optional(), password: z.string().min(8).max(100) });
export const loginSchema = z.object({ email: z.email(), password: z.string().min(1) });
export const foodOrderSchema = z.object({ items: z.array(z.object({ productId: z.string(), quantity: z.int().min(1).max(20) })).min(1).max(20) });
export const printOrderSchema = z.object({ fileKey: z.string().min(1), fileName: z.string().min(1).max(255), mimeType: z.enum(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']), pages: z.int().min(1).max(500), color: z.enum(['BW', 'COLOR']), binding: z.enum(['NONE', 'SPIRAL', 'STAPLE']) });
export const statusSchema = z.object({ status: z.enum(['RECEIVED','IN_PROGRESS','READY','COMPLETED','CANCELLED']), note: z.string().max(500).optional() });
export const stkSchema = z.object({ orderId: z.string(), phone: z.string().min(9).max(15) });
