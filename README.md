# InquiryHub — AI-Powered Inquiry Management

A lightweight system that automatically organizes, classifies, and follows up with incoming inquiries across multiple channels (email, forms, social DMs).

## Architecture

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

- **Next.js 14** — App Router, API routes, server components
- **Prisma** — ORM with PostgreSQL
- **Anthropic SDK** — Claude for AI classification + reply drafting
- **Gmail API** — Email ingestion (optional)

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd inquiry-hub
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Edit .env with your database URL and Anthropic API key
```

### 3. Set up database

```bash
npx prisma generate
npx prisma db push
npm run db:seed     # Load demo data
```

### 4. Run

```bash
npm run dev
# Open http://localhost:3000
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/inquiries` | List inquiries with filters |
| `POST` | `/api/inquiries/inbound` | Accept new inquiry from any channel |
| `POST` | `/api/inquiries/process` | Classify single inquiry with AI |
| `POST` | `/api/inquiries/process-all` | Batch classify all new inquiries |
| `GET` | `/api/inquiries/[id]` | Get single inquiry with details |
| `PATCH` | `/api/inquiries/[id]` | Update inquiry status/assignment |
| `POST` | `/api/inquiries/followups` | Process due follow-ups (cron) |

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

## Data Model

**Contact** — People who send inquiries (auto-created/updated on inbound)
**Inquiry** — The inquiry itself, with AI-generated classification
**FollowUp** — Scheduled follow-up messages with escalating urgency
**TeamMember** — Internal team for routing assignments

### AI Classification Fields

Each processed inquiry gets:
- **Category** — partnership, sales, investment, support, talent, onboarding, spam, general
- **Priority** — high, medium, low
- **Intent** — concise summary of what the sender wants
- **Sentiment** — positive, neutral, negative, urgent
- **Draft Reply** — ready-to-send response
- **Team Assignment** — auto-routed to the right person

## Follow-up System

Follow-ups are scheduled automatically after classification:
- High priority: 1-day follow-up
- Medium priority: 3-day follow-up
- Low priority: 7-day follow-up

Each inquiry gets up to 3 follow-up attempts with escalating urgency.

### Setting up the cron job

For Vercel, add to `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/inquiries/followups",
    "schedule": "0 9 * * *"
  }]
}
```

For self-hosted, use a cron service to POST to `/api/inquiries/followups` with the `CRON_SECRET` header.

## Production Deployment

1. Set up a PostgreSQL database (Supabase, Railway, Neon, etc.)
2. Add your `ANTHROPIC_API_KEY` to environment variables
3. Run `prisma db push` against your production database
4. Deploy to Vercel: `npx vercel`

## Extending

### Add Gmail integration

1. Set up Google Cloud project with Gmail API enabled
2. Create OAuth2 credentials
3. Add credentials to `.env`
4. Implement a Gmail webhook listener in `/api/webhooks/gmail`

### Add new channels

POST to `/api/inquiries/inbound` from any source — the schema normalizes all channels into the same format.
