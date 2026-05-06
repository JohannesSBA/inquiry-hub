import Anthropic from "@anthropic-ai/sdk";
import type { AIClassification } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI inquiry classifier for a tech startup called InquiryHub. Your job is to analyze incoming inquiries and produce structured classification data.

You MUST respond with ONLY valid JSON — no markdown, no backticks, no preamble, no explanation. Just the raw JSON object.

The JSON must have these exact fields:
{
  "category": one of "partnership", "sales", "investment", "support", "talent", "onboarding", "spam", "general",
  "priority": one of "high", "medium", "low",
  "intent": a concise 10-20 word summary of what the sender wants,
  "sentiment": one of "positive", "neutral", "negative", "urgent",
  "suggestedAssignment": one of "FOUNDER", "SALES", "SUPPORT", "ENGINEERING", "MARKETING",
  "draftReply": a professional 3-4 sentence reply that acknowledges their specific ask and outlines next steps. Be warm but concise. Sign off as "Best, The Team",
  "followUpDays": number of days before a follow-up should be sent (1-3 for high priority, 3-5 for medium, 7 for low)
}

Classification rules:
- "investment" = anyone asking about funding, investing, equity, Series rounds
- "partnership" = integration proposals, joint ventures, B2B collaboration
- "sales" = pricing questions, enterprise inquiries, demo requests
- "support" = bug reports, errors, complaints, feature issues — always HIGH priority if blocking
- "talent" = job applications, freelance offers, hiring
- "onboarding" = new user questions, how-to, getting started
- "spam" = irrelevant, mass marketing, phishing attempts — always LOW priority
- "general" = anything that doesn't fit above`;

export async function classifyInquiry(
  subject: string,
  body: string,
  channel: string,
  senderName: string
): Promise<AIClassification> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Classify this inquiry:

From: ${senderName}
Channel: ${channel}
Subject: ${subject}
Body: ${body}`,
        },
      ],
    });

    const text =
      message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("") || "";

    const cleaned = text.replace(/```json|```/g, "").trim();
    const result: AIClassification = JSON.parse(cleaned);

    // Validate required fields
    const validCategories = [
      "partnership", "sales", "investment", "support",
      "talent", "onboarding", "spam", "general",
    ];
    const validPriorities = ["high", "medium", "low"];
    const validSentiments = ["positive", "neutral", "negative", "urgent"];

    if (!validCategories.includes(result.category)) result.category = "general";
    if (!validPriorities.includes(result.priority)) result.priority = "medium";
    if (!validSentiments.includes(result.sentiment)) result.sentiment = "neutral";
    if (!result.followUpDays || result.followUpDays < 1) result.followUpDays = 3;

    return result;
  } catch (error) {
    console.error("AI classification failed:", error);
    return {
      category: "general",
      priority: "medium",
      intent: "Classification failed — review manually",
      sentiment: "neutral",
      suggestedAssignment: "FOUNDER",
      draftReply:
        "Thank you for reaching out. We've received your inquiry and will get back to you shortly.\n\nBest,\nThe Team",
      followUpDays: 3,
    };
  }
}

export async function generateFollowUp(
  originalBody: string,
  category: string,
  attempt: number
): Promise<string> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Generate a follow-up email for an inquiry that hasn't received a response yet.

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
        },
      ],
    });

    return (
      message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("") || "Following up on our previous conversation. Would love to connect when you have a moment.\n\nBest,\nThe Team"
    );
  } catch {
    return "Following up on our previous conversation. Would love to connect when you have a moment.\n\nBest,\nThe Team";
  }
}
