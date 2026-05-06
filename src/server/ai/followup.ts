/**
 * Generates follow-up email body text for scheduled reminders.
 */

import { OPENAI_MODEL, openai } from "@/server/ai/client";

const FALLBACK =
  "Following up on our previous conversation. Would love to connect when you have a moment.\n\nBest,\nThe Team";

export async function generateFollowUp(
  originalBody: string,
  category: string,
  attempt: number,
): Promise<string> {
  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      max_output_tokens: 512,
      input: `Generate a follow-up email for an inquiry that hasn't received a response yet.

Original inquiry: ${originalBody}
Category: ${category}
Follow-up attempt: ${attempt}

Write a brief, professional follow-up (2-3 sentences) that:
- References the original inquiry naturally
- Is warmer/more urgent with each attempt
- Attempt 1: gentle check-in
- Attempt 2: slightly more direct
- Attempt 3+: final nudge with clear call-to-action

Respond with ONLY the email body text, no subject line or metadata. Sign off as "Best, The Team".`,
    });

    return response.output_text || FALLBACK;
  } catch {
    return FALLBACK;
  }
}
