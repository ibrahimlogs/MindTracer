import "server-only";

import OpenAI from "openai";

import { getServerEnv } from "@/lib/validation/env";

let client: OpenAI | undefined;

export function getOpenAIClient() {
  if (!client) {
    client = new OpenAI({ apiKey: getServerEnv().OPENAI_API_KEY });
  }

  return client;
}
