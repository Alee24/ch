# Campus Hub — production-ready full-stack foundation

This replaces the original client-only prototype with a deployable Next.js + PostgreSQL application while preserving its core flows: food ordering, print/upload, M-Pesa payment, ticketing, status tracking, and staff/admin operations.

## Included
- Next.js App Router + TypeScript
- PostgreSQL + Prisma data model
- Customer registration/login with signed HTTP-only session cookie
- Food catalogue and persistent orders
- Print PDF/Word upload through S3-compatible object storage
- Print pricing and binding rules from the prototype
- M-Pesa Daraja STK Push adapter and callback handling
- Order state machine: pending → payment → received → in progress → ready → completed
- Staff/admin dashboard
- Order tracking page
- Dockerfile and local PostgreSQL compose file
- Seed data and test-ready project structure

## Run locally
1. Copy `.env.example` to `.env` and set `AUTH_SECRET`.
2. Start PostgreSQL: `docker compose up -d`.
3. Install: `npm install`.
4. Create schema: `npm run db:push`.
5. Seed: `npm run db:seed`.
6. Start: `npm run dev`.
7. Visit `http://localhost:3000`.

Seed admin: `admin@ch.com` / `Digital2026`. Change this immediately outside local development.

## Production checklist
- Use managed PostgreSQL and run versioned Prisma migrations.
- Set a strong random `AUTH_SECRET` and rotate credentials through a secrets manager.
- Configure production Daraja credentials and a public HTTPS callback URL.
- Configure S3/Cloudflare R2/MinIO-compatible storage and enforce bucket privacy.
- Put the app behind HTTPS and a reverse proxy/CDN.
- Add rate limiting/WAF, structured logging, monitoring, backups, and alerting.
- Verify M-Pesa callback authenticity and reconciliation with your payment provider before going live.
- Add an explicit privacy policy, retention/deletion controls, and Kenyan data-protection compliance review before collecting real customer data.
- Change the seeded administrator password and ideally create administrators through an audited bootstrap process.

## Important production boundary
The code contains the application and integration layers, but real M-Pesa and object-storage credentials, a public callback endpoint, production infrastructure, DNS/HTTPS, and operational security controls must be supplied by the deployment owner. Those cannot safely be hard-coded into the application.
