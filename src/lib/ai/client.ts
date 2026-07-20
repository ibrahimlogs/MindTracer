import "server-only";

import OpenAI from "openai";

import { getServerEnv } from "@/lib/validation/env";

let client: OpenAI | undefined;

export function getOpenAIClient() {
  if (!client) {
    const apiKey = getServerEnv().OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required before using OpenAI.");
    }

    client = new OpenAI({ apiKey });
  }

  return client;
}
