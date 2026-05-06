/**
 * Classifies an inquiry via OpenAI; returns structured AIClassification or safe fallback.
 */

import type { AIClassification } from "@/types";
import { OPENAI_MODEL, openai } from "@/server/ai/client";
import { CLASSIFIER_SYSTEM_PROMPT } from "@/server/ai/prompts";

const CLASSIFICATION_RESPONSE_FORMAT = {
  type: "json_schema",
  name: "inquiry_classification",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      category: {
        type: "string",
        enum: [
          "partnership",
          "sales",
          "investment",
          "support",
          "talent",
          "onboarding",
          "spam",
          "general",
        ],
      },
      priority: { type: "string", enum: ["high", "medium", "low"] },
      intent: { type: "string" },
      sentiment: {
        type: "string",
        enum: ["positive", "neutral", "negative", "urgent"],
      },
      suggestedAssignment: {
        type: "string",
        enum: ["FOUNDER", "SALES", "SUPPORT", "ENGINEERING", "MARKETING"],
      },
      draftReply: { type: "string" },
      followUpDays: { type: "number" },
    },
    required: [
      "category",
      "priority",
      "intent",
      "sentiment",
      "suggestedAssignment",
      "draftReply",
      "followUpDays",
    ],
  },
} as const;

export async function classifyInquiry(
  subject: string,
  body: string,
  channel: string,
  senderName: string,
): Promise<AIClassification> {
  try {
    const response = await openai.responses.create({
      model: OPENAI_MODEL,
      instructions: CLASSIFIER_SYSTEM_PROMPT,
      max_output_tokens: 1024,
      text: { format: CLASSIFICATION_RESPONSE_FORMAT },
      input: `Classify this inquiry:

From: ${senderName}
Channel: ${channel}
Subject: ${subject}
Body: ${body}`,
    });

    const text = response.output_text || "";

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
