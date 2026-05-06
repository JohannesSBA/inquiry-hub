/**
 * Shared Anthropic SDK instance for classification and follow-up generation.
 */

import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/server/config/env";

export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});
