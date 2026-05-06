/**
 * Classifies an inquiry via Claude; returns structured AIClassification or safe fallback.
 */

import type Anthropic from "@anthropic-ai/sdk";
import type { AIClassification } from "@/types";
import { anthropic } from "@/server/ai/client";
import { CLASSIFIER_SYSTEM_PROMPT } from "@/server/ai/prompts";

export async function classifyInquiry(
  subject: string,
  body: string,
  channel: string,
  senderName: string,
): Promise<AIClassification> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: CLASSIFIER_SYSTEM_PROMPT,
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

    const validCategories = [
      "partnership",
      "sales",
      "investment",
      "support",
      "talent",
      "onboarding",
      "spam",
      "general",
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
