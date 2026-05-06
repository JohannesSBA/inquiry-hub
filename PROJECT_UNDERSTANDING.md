# InquiryHub Project Understanding

This document is the working reference for future changes in this repo. Before modifying the app, review this file together with `README.md` and `ARCHITECTURE.md` so changes stay aligned with the current product, architecture, and coding style.

## Product Summary

InquiryHub is an AI-powered inquiry management app for collecting, classifying, routing, replying to, and following up on inbound messages from multiple channels. The current product is focused on an authenticated internal dashboard rather than a public marketing site.

Core capabilities already present:

- Ingest inquiries from public API/form payloads, Gmail polling, Telegram, WhatsApp, and Instagram adapters.
- Normalize all inbound channels into `Contact` and `Inquiry` records.
- Classify inquiries with OpenAI into category, priority, intent, sentiment, draft reply, suggested assignee, and follow-up timing.
- Route inquiries to local `TeamMember` rows based on AI-suggested role.
- Display a dashboard with inquiry list, filters, search, detail view, AI analysis, draft editing, reply sending, status updates, and follow-up timeline.
- Connect Gmail per team member using OAuth, store encrypted token bundles, poll unread inbox messages, and send replies/follow-ups through the assignee mailbox.
- Emit in-process realtime events over SSE so the dashboard can refresh changed inquiries.
- Show analytics for volume, category breakdown, average response time, and follow-up conversion.

## Tech Stack

- Next.js 14 App Router with React 18.
- TypeScript with `strict: true`.
- Prisma 7 with PostgreSQL and `@prisma/adapter-pg`.
- Neon Auth, exposed through a same-origin `/api/auth` proxy.
- OpenAI SDK using the Responses API for classification and follow-up copy.
- Google Gmail API through `googleapis`.
- Recharts for analytics charts.
- Zod for environment validation.

There is no ESLint or Prettier config in the repo. Formatting is therefore inferred from existing code.

## Main Routes

- `/` currently redirects to `/dashboard`.
- `/sign-in` is a small client page for Google sign-in via Neon Auth.
- `/dashboard` is protected, server-rendered for initial data, and hands off to the client dashboard shell.
- `/analytics` is protected and server-fetches aggregate metrics, with Recharts rendered in a client component.

Public or semi-public API routes:

- `/api/inquiries/inbound` accepts normalized inbound inquiry payloads.
- `/api/webhooks/telegram`, `/api/webhooks/whatsapp`, and `/api/webhooks/instagram` adapt external payloads into the shared inbound pipeline.
- `/api/gmail/callback` receives Gmail OAuth callbacks.
- `/api/gmail/sync` and `/api/inquiries/followups` are cron endpoints; production checks `Authorization: Bearer ${CRON_SECRET}`.
- `/api/auth/[...all]` proxies Neon Auth.

Authenticated API routes:

- `/api/inquiries` lists inquiries and stats.
- `/api/inquiries/process` classifies one inquiry.
- `/api/inquiries/process-all` classifies all unprocessed `NEW` inquiries.
- `/api/inquiries/[id]` fetches or patches an inquiry.
- `/api/inquiries/[id]/reply` sends the edited/saved draft through Gmail.
- `/api/inquiries/stream` streams realtime inquiry events with SSE.
- `/api/gmail/connect` starts Gmail OAuth for the signed-in team member.

## Data Model

The Prisma schema has five main models:

- `Contact`: external senders, unique by email.
- `Inquiry`: central work item with channel, status, category, priority, AI fields, Gmail threading fields, assignee, and reply timestamp.
- `FollowUp`: scheduled outbound follow-up attempts with sent/failed/cancelled status and `lastError`.
- `TeamMember`: internal user/role, optionally linked to a Neon Auth user through `authUserId`.
- `MailAccount`: one Gmail account per team member with encrypted token bundle metadata.

Important enums:

- `Channel`: `EMAIL`, `FORM`, `SOCIAL`, `API`.
- `InquiryStatus`: `NEW`, `PROCESSING`, `AWAITING_REPLY`, `REPLIED`, `FOLLOW_UP`, `CLOSED`.
- `Category`: `PARTNERSHIP`, `SALES`, `INVESTMENT`, `SUPPORT`, `TALENT`, `ONBOARDING`, `SPAM`, `GENERAL`.
- `Priority`: `HIGH`, `MEDIUM`, `LOW`.
- `Sentiment`: `POSITIVE`, `NEUTRAL`, `NEGATIVE`, `URGENT`.
- `TeamRole`: `FOUNDER`, `SALES`, `SUPPORT`, `ENGINEERING`, `MARKETING`.

Frontend DTO types in `src/types/index.ts` intentionally duplicate Prisma enum shapes so client code does not import Prisma.

## Architecture And Separation Of Concerns

The repo follows a thin-route, server-module architecture:

- `src/app/**`: pages and route handlers. Route handlers should parse requests, perform auth checks, call service functions, and return responses. They should not contain domain-heavy logic.
- `src/server/config/env.ts`: single source for validated env vars. Prefer importing `env` over direct `process.env` access in server code.
- `src/server/auth/*`: Neon Auth session, API auth guard, JWT helper, and TeamMember linking.
- `src/server/inquiries/service.ts`: inquiry domain workflows and business rules.
- `src/server/inquiries/repository.ts`: database-only Prisma operations, with no business rules.
- `src/server/ai/*`: OpenAI client, prompts, classifier, and follow-up generation.
- `src/server/gmail/*`: OAuth, signed state, token encryption, Gmail polling, message parsing, repository access, and sending.
- `src/server/followups/processDue.ts`: cron workflow for due follow-ups.
- `src/server/realtime/broadcaster.ts`: in-process `EventEmitter` pub/sub for SSE.
- `src/server/analytics/queries.ts`: read-only analytics aggregations.
- `src/server/webhooks/*`: channel-specific payload verification/parsing, then dispatch into shared inbound service.
- `src/components/dashboard/*`: dashboard UI components, hook state, UI constants, and CSS module.
- `src/components/analytics/AnalyticsCharts.tsx`: client-only Recharts rendering.

When adding new behavior, keep this layering:

- Page or API route: request/response and auth only.
- Service: orchestration and business rules.
- Repository: Prisma calls only.
- UI component: rendering and user interaction only.
- Hook: client state, fetch calls, realtime subscription handling.

## Auth And Security

Authentication is handled by Neon Auth through `src/server/auth/neon.ts` and `/api/auth/[...all]`. Middleware protects all non-public paths and redirects to `/sign-in`.

`ensureTeamMemberForUser` creates or links a local `TeamMember` for each authenticated user. The first team member becomes `FOUNDER`; later auto-created members default to `SALES`.

Security-sensitive conventions:

- Do not log secrets, OAuth tokens, database URLs, or API keys.
- `NEON_AUTH_COOKIE_SECRET` must be 32+ chars in real deployments.
- Gmail OAuth state is HMAC-signed with a 15 minute TTL.
- Gmail tokens are encrypted at rest with AES-256-GCM through `MAIL_TOKEN_ENCRYPTION_KEY`.
- Production cron endpoints require `CRON_SECRET`.
- Optional `AUTH_ALLOWED_EMAIL_DOMAINS` restricts allowed sign-in domains.

## AI Workflow

`classifyInquiry` calls OpenAI through the Responses API using the default `gpt-5.2` model, unless `OPENAI_MODEL` overrides it, and a strict JSON-only system prompt. The result is validated against known enum strings and falls back to a safe manual-review classification if parsing or the API call fails.

Classification updates the inquiry with uppercase enum values, draft reply, intent, sentiment, assignee, `PROCESSING` status, and `processedAt`. It also creates the first `FollowUp` based on the AI-provided `followUpDays`.

`generateFollowUp` creates short follow-up text for due scheduled reminders and has a static fallback.

## Gmail Workflow

The Gmail connect route requires an authenticated team member, signs OAuth state, and requests readonly/send/modify scopes. The callback verifies state, exchanges the code, fetches the Gmail profile email, encrypts access/refresh tokens, and upserts a `MailAccount`.

The sync cron polls unread inbox messages, fetches full messages, extracts plain text, deduplicates using `Message-ID`, creates inquiries, and marks messages read where possible.

Replies and follow-ups are sent from the assignee's connected Gmail account. Sending a direct reply marks the inquiry `REPLIED`, sets `repliedAt`, cancels pending follow-ups, and emits a realtime update.

## Realtime

Realtime is in-process only. `emitInquiryEvent` publishes lifecycle events to an `EventEmitter`; `/api/inquiries/stream` exposes them as SSE. This works for dev and small single-instance deployments. Scaling to multiple instances would require Redis, Postgres `NOTIFY`, or another shared pub/sub.

## UI And Styling Conventions

The existing UI is compact, operational, and dashboard-oriented. It is not a marketing-style app yet.

Current styling patterns:

- Global design tokens live in `src/app/globals.css`.
- Dashboard styles live in `src/components/dashboard/Dashboard.module.css`.
- Some pages/components use inline styles, especially `sign-in`, `analytics`, and tiny layout wrappers.
- Colors are restrained neutrals with blue accent, plus semantic danger/success/warning tokens.
- Borders are subtle, often `0.5px solid var(--border)`.
- Border radii are usually `6px`, `8px`, or `12px`.
- Layouts are dense and utilitarian: max-width container, metric grid, filter row, split list/detail view.
- Dashboard components use small type, simple badges, and minimal decoration.
- Existing UI uses a few Unicode symbols/icons (`✦`, `✉`, emoji channel icons), not an icon library.
- CSS supports dark mode through `prefers-color-scheme`.

For future public pages, keep the product visible immediately and avoid drifting into decorative-only marketing. Use the existing token system as a base, but public pages will likely need a dedicated CSS module or shared marketing styles so dashboard styles remain focused.

## Code Style Conventions

Inferred coding standards:

- TypeScript modules use named exports for most functions and components.
- Imports use the `@/` path alias for app code.
- Server files often start with a short file-level comment describing responsibility.
- Client components start with `"use client";`.
- Route handlers export `dynamic = "force-dynamic"` where runtime data/auth matters.
- API errors return concise JSON and log server-side failures with `console.error`.
- Async work generally uses `async` functions and explicit `try/catch` around request handlers.
- Components are small and prop-typed inline unless types are reused.
- Helpers and constants are separated from components when they are shared.
- Repository functions are prefixed with `repo`.
- Service functions are prefixed with `service`.
- Long conditional JSX is acceptable, but components are split when a panel grows.
- Existing code uses semicolons, double quotes, trailing commas in multiline calls/objects, and two-space indentation.

## File Size Expectations

Most files are intentionally small:

- Most route handlers are about 28-70 lines.
- Most UI components are about 18-90 lines.
- Larger UI panels/hooks are about 80-160 lines.
- `src/server/inquiries/service.ts` is currently the largest TypeScript file at about 286 lines.
- `Dashboard.module.css` is about 572 lines because it centralizes dashboard styling.

Future changes should prefer focused files over large mixed-responsibility files. A new public page can be longer if needed, but if it grows beyond roughly 150-200 lines, split reusable sections/data into separate components or constants.

## Known Current Gaps And Risks

- `/` redirects to `/dashboard`, so there is no public landing page yet.
- `/sign-in` does not currently show privacy/terms acknowledgement language.
- There are no `/privacy-policy`, `/terms-of-service`, or `/pricing` routes.
- No Stripe integration exists yet, and pricing should be presentation-only until implementation is explicitly requested.
- Public inbound ingestion is unauthenticated by design, but any real public form should add spam/rate-limit protection before production exposure.
- Realtime SSE is single-process only.
- `servicePatchInquiry` trusts incoming enum strings and could benefit from explicit validation if exposed to broader clients.
- `sendAssigneeReply` requires the acting user to be the assigned team member; unassigned or differently assigned inquiries cannot be replied to by another logged-in user.
- Seed data still references "Meda" domain examples, which may be legacy context rather than InquiryHub product copy.
- README has local uncommitted edits, mostly table formatting plus a TODO section. Preserve those unless explicitly asked to edit README.

## Future Work Requested But Not Yet Built

The user requested future planning for these pages and copy areas, but explicitly said not to build yet:

- Create a public landing page that highlights all major features.
- Create a privacy policy page with pertinent information about inquiry data, account data, AI processing, Gmail OAuth/token handling, communications, analytics, cookies/auth sessions, security, retention, user rights, and contact details.
- Create a terms of service page covering account use, acceptable use, AI output limitations, Gmail/channel integrations, customer data responsibilities, subscriptions/billing placeholders, disclaimers, limitation of liability, termination, and changes.
- Update sign-in so users are aware of and acknowledge/are notified of the Privacy Policy and Terms of Service when signing up/signing in.
- Create a pricing page only, without Stripe implementation.
- Future pricing copy should be feature-oriented and based on usage:
  - Free: roughly 20 inquiries/month, manual classification only, positioned as a way to try the product.
  - Pro: roughly `$29-49/month`, unlimited AI classification, auto follow-ups, and Gmail integration.
  - Enterprise: roughly `$99+/month`, team routing, multiple inboxes, API access, and priority support.
- Stripe will be used later, but no Stripe wiring, checkout, webhooks, customer portal, or database billing model should be implemented until requested.

## Change Checklist For Future Work

Before making future changes:

- Re-read this file plus `README.md` and `ARCHITECTURE.md`.
- Check `git status --short` and preserve user changes.
- Keep route handlers thin and put business logic in `src/server/*`.
- Keep public marketing/legal/pricing pages separate from dashboard CSS unless sharing global tokens.
- Reuse existing token names, spacing, radii, and typography patterns where appropriate.
- Add or update metadata when adding public pages.
- Protect authenticated app routes and keep intended public pages listed in middleware public paths if middleware would otherwise block them.
- Do not implement Stripe until explicitly asked.
