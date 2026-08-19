import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const configured = !!process.env.S3_BUCKET && !!process.env.S3_ACCESS_KEY_ID && !!process.env.S3_SECRET_ACCESS_KEY;
const s3 = new S3Client({ region: process.env.S3_REGION || 'auto', endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: !!process.env.S3_ENDPOINT, credentials: configured ? { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! } : undefined });
export async function createUploadUrl(key: string, contentType: string) {
  if (!configured) throw new Error('Object storage is not configured');
  const command = new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, ContentType: contentType });
  return getSignedUrl(s3, command, { expiresIn: 600 });
}
