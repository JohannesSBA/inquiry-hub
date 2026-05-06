/**
 * Shared OpenAI SDK instance for classification and follow-up generation.
 */

import OpenAI from "openai";
import { env } from "@/server/config/env";

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export const OPENAI_MODEL = env.OPENAI_MODEL ?? "gpt-5.2";
