# InquiryHub — AI-Powered Inquiry Management

A lightweight system that automatically organizes, classifies, and follows up with incoming inquiries across multiple channels (email, forms, social DMs).

## Architecture

High-level flow (see **[ARCHITECTURE.md](./ARCHITECTURE.md)** for module layout and data flow):

```
Ingestion Layer          AI Processing Layer       Action Layer
┌─────────────┐         ┌──────────────────┐      ┌─────────────┐
│ Gmail API   │───┐     │ Claude API       │      │ Dashboard   │
│ Web Forms   │───┼────▶│ • Categorize     │─────▶│ Follow-ups  │
│ Social DMs  │───┘     │ • Prioritize     │      │ Team Routing│
└─────────────┘         │ • Draft replies  │      └─────────────┘
                        │ • Route          │
                        └──────────────────┘
```

## Tech Stack

- **Next.js 14** — App Router, API routes, middleware
- **Prisma** — ORM with PostgreSQL
- **Neon Auth** — Better Auth–compatible sessions, Google sign-in, same-origin `/api/auth` proxy
- **Anthropic SDK** — Claude for classification + reply drafting
- **Gmail API** — Optional OAuth connect, polling ingest, outbound replies & follow-ups
- **Recharts** — Analytics dashboards

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd inquiry-hub
npm install
```

### 2. Environment

```bash
cp .env.example .env
```

Required variables (see `.env.example` for optional webhook/Gmail keys):

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ANTHROPIC_API_KEY` | Claude API |
| `NEXT_PUBLIC_APP_URL` | App origin (no trailing slash) |
| `AUTH_URL` | Neon Auth service URL |
| `JWKS_URL` | Neon Auth JWKS URL |
| `NEON_AUTH_COOKIE_SECRET` | **≥32 chars** — `openssl rand -base64 32` |
| `CRON_SECRET` | Bearer token for cron routes in production |

**Gmail:** set `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REDIRECT_URI` (must be `{NEXT_PUBLIC_APP_URL}/api/gmail/callback`), and `MAIL_TOKEN_ENCRYPTION_KEY` (base64 32-byte key).

### 3. Database

```bash
npm run db:generate
npm run db:migrate:dev   # or db:migrate:deploy in CI/production
npm run db:seed          # optional demo data
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3000 — sign in at /sign-in
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `*` | `/api/auth/[...all]` | Neon Auth proxy (same-origin cookies) |
| `GET` | `/api/inquiries` | List inquiries + stats (authenticated) |
| `POST` | `/api/inquiries/inbound` | Public ingestion (forms, adapters) |
| `POST` | `/api/inquiries/process` | Classify single inquiry |
| `POST` | `/api/inquiries/process-all` | Batch classify NEW inquiries |
| `GET` | `/api/inquiries/[id]` | Inquiry detail |
| `PATCH` | `/api/inquiries/[id]` | Update status, assignment, `aiDraft`, etc. |
| `POST` | `/api/inquiries/[id]/reply` | Send edited draft via assignee Gmail |
| `GET` | `/api/inquiries/stream` | SSE — live inquiry updates |
| `POST` | `/api/inquiries/followups` | Cron: send due follow-ups (`Authorization: Bearer CRON_SECRET` in prod) |
| `GET` | `/api/gmail/connect` | Start Gmail OAuth |
| `GET` | `/api/gmail/callback` | OAuth redirect (**use this URI in Google Console**) |
| `POST` | `/api/gmail/sync` | Cron: poll mailboxes |
| `POST` | `/api/webhooks/telegram` | Telegram bot updates |
| `GET`/`POST` | `/api/webhooks/whatsapp` | WhatsApp Cloud API |
| `POST` | `/api/webhooks/instagram` | Instagram messaging (Meta) |

### Submit an inquiry via API

```bash
curl -X POST http://localhost:3000/api/inquiries/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "senderName": "Jane Doe",
    "senderEmail": "jane@example.com",
    "subject": "Interested in your platform",
    "body": "Hi, I saw your product and would love to learn more about enterprise pricing.",
    "channel": "FORM"
  }'
```

## UI

- **`/sign-in`** — Google via Neon Auth  
- **`/dashboard`** — Inquiry list, detail, draft edit, send reply, Gmail connect  
- **`/analytics`** — Volume, categories, response times, follow-up conversion  

## Data Model

**Contact** — People who send inquiries (auto-created/updated on inbound)  
**Inquiry** — Classification, drafts, Gmail thread linkage, `repliedAt`  
**FollowUp** — Scheduled messages; failures record `lastError`  
**TeamMember** — Internal routing; linked to Neon Auth user  
**MailAccount** — Encrypted Gmail OAuth tokens per team member  

### AI Classification Fields

Each processed inquiry gets category, priority, intent, sentiment, draft reply, and suggested assignee.

## Follow-up System

Follow-ups are scheduled after classification (priority-based delays). The cron endpoint sends via the assignee’s connected Gmail when configured.

### Vercel cron

This repo includes **`vercel.json`**:

- `/api/gmail/sync` — every 5 minutes  
- `/api/inquiries/followups` — daily 09:00 UTC  

Self-hosted: call these paths with `Authorization: Bearer <CRON_SECRET>` (required when `NODE_ENV=production`).

## Production Deployment

1. Provision PostgreSQL (Neon recommended).  
2. Set all required env vars; **never** ship without `NEON_AUTH_COOKIE_SECRET`.  
3. Run `npm run db:migrate:deploy`.  
4. Configure Google OAuth redirect: `https://<your-domain>/api/gmail/callback`.  
5. Deploy (e.g. `vercel`).  

## Extending

### New channels

Implement an adapter under `src/server/webhooks/` or POST to `/api/inquiries/inbound` — inbound schema normalizes channels into one pipeline.

### Docs

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — server layout, auth, Gmail, realtime, security notes  
