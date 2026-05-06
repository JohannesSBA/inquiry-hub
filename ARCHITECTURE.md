# InquiryHub architecture

## Overview

Next.js 14 (App Router) application with a **thin route layer** (`src/app/api/**`) that delegates to **`src/server/*`** modules: configuration, auth, inquiries, Gmail, follow-ups, realtime, analytics, and webhooks.

## Directory map

| Area | Path | Role |
|------|------|------|
| Env validation | `src/server/config/env.ts` | Zod-parsed `process.env`; no `dotenv` import (Edge-safe middleware). |
| Auth | `src/server/auth/*` | Neon Auth handler, session helpers, API guard, JWT (JWKS), team member resolution. |
| Inquiries | `src/server/inquiries/*` | Repository, service (list/get/patch/process/inbound), reply sending orchestration. |
| AI | `src/server/ai/*` | Anthropic client, prompts, classify + follow-up copy. |
| Gmail | `src/server/gmail/*` | OAuth client, state signing, token encryption, ingest/sync, send, `MailAccount` repository. |
| Follow-ups | `src/server/followups/processDue.ts` | Due follow-up dispatch via Gmail; status + error fields. |
| Realtime | `src/server/realtime/broadcaster.ts` | In-process `EventEmitter` for SSE subscribers. |
| Analytics | `src/server/analytics/queries.ts` | Read-only aggregations for `/analytics`. |
| Webhooks | `src/server/webhooks/*` | Telegram / WhatsApp / Instagram adapters → shared inbound creation. |

## Request flow

1. **Browser** → Next middleware (`src/middleware.ts`) applies Neon Auth (`loginUrl: /sign-in`) with public prefixes for auth proxy, inbound ingestion, webhooks, cron targets, and Gmail OAuth callback.
2. **Authenticated API** → `requireTeamMemberApi()` links Neon Auth user → `TeamMember` (e.g. `authUserId`).
3. **Inbound** → `POST /api/inquiries/inbound` (and channel webhooks) → `serviceCreateInbound` → optional AI processing paths.
4. **Gmail** → User hits `GET /api/gmail/connect` → Google OAuth → `GET /api/gmail/callback` stores **encrypted** tokens on `MailAccount`. Cron `POST /api/gmail/sync` polls and creates inquiries; emits realtime events.
5. **Replies** → `POST /api/inquiries/[id]/reply` sends mail via assignee’s `MailAccount`, updates inquiry (`REPLIED`, `repliedAt`), cancels pending follow-ups.
6. **Realtime** → `GET /api/inquiries/stream` (SSE) subscribes to broadcaster; dashboard hooks merge events without full refetch.

## Data model (Prisma)

- **TeamMember** — internal users; `authUserId` ties to Neon Auth.
- **MailAccount** — per-member Gmail connection; `tokensCipher` + `tokensIv` (AES-256-GCM JSON bundle).
- **Inquiry** — channel metadata, AI fields, Gmail thread/message ids, `repliedAt`.
- **FollowUp** — schedule + `lastError` on failure.

Migrations live under `prisma/migrations/`. Deploy with `npm run db:migrate:deploy` (see README).

## External dependencies

- **Neon Auth** — session cookies + `/api/auth/[...all]` proxy; `AUTH_URL`, `JWKS_URL`, `NEON_AUTH_COOKIE_SECRET`.
- **Anthropic** — classification and drafts.
- **Google Gmail API** — OAuth, read sync, send.
- **Vercel cron** — `vercel.json`: Gmail sync + follow-ups (Bearer `CRON_SECRET` in production).

## Security notes

- Do not log or expose `DATABASE_URL`, `ANTHROPIC_API_KEY`, OAuth secrets, or token encryption keys.
- Rotate keys if `.env` was shared or committed.
- Production must set a strong `NEON_AUTH_COOKIE_SECRET` (the app warns and uses a dev fallback if missing/short).
