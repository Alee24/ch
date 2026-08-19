import crypto from 'node:crypto';
export function ticketCode() { return `CH-${crypto.randomInt(1000, 10000)}`; }
