import crypto from 'node:crypto';
function baseUrl() { return process.env.MPESA_ENV === 'production' ? 'https://api.safaricom.co.ke' : 'https://sandbox.safaricom.co.ke'; }
function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('254')) return digits;
  if (digits.startsWith('0')) return `254${digits.slice(1)}`;
  if (digits.startsWith('7')) return `254${digits}`;
  throw new Error('Invalid Kenyan phone number');
}
export async function getMpesaToken() {
  const key = process.env.MPESA_CONSUMER_KEY, secret = process.env.MPESA_CONSUMER_SECRET;
  if (!key || !secret) throw new Error('M-Pesa credentials are not configured');
  const basic = Buffer.from(`${key}:${secret}`).toString('base64');
  const res = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, { headers: { Authorization: `Basic ${basic}` }, cache: 'no-store' });
  if (!res.ok) throw new Error(`M-Pesa OAuth failed: ${res.status}`);
  return (await res.json()).access_token as string;
}
export async function initiateStkPush(amount: number, phone: string, accountRef: string) {
  const shortcode = process.env.MPESA_SHORTCODE, passkey = process.env.MPESA_PASSKEY, callback = process.env.MPESA_CALLBACK_URL;
  if (!shortcode || !passkey || !callback) throw new Error('M-Pesa STK settings are not configured');
  const token = await getMpesaToken();
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ BusinessShortCode: shortcode, Password: password, Timestamp: timestamp, TransactionType: 'CustomerPayBillOnline', Amount: amount, PartyA: normalizePhone(phone), PartyB: shortcode, PhoneNumber: normalizePhone(phone), CallBackURL: callback, AccountReference: accountRef, TransactionDesc: 'Campus Hub order' }) });
  if (!res.ok) throw new Error(`STK Push failed: ${res.status}`);
  return res.json() as Promise<{ MerchantRequestID: string; CheckoutRequestID: string; ResponseCode: string; ResponseDescription: string; CustomerMessage: string }>;
}
export function normalizeMpesaPhone(phone: string) { return normalizePhone(phone); }
export function callbackHash(payload: unknown) { return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex'); }
