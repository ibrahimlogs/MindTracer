import { z } from "zod";

export const approachOptions = [
  "I compared consecutive values",
  "I looked for a repeated pattern",
  "I used multiplication",
  "I used addition",
  "I tried to form an equation",
  "I guessed",
  "I am not sure",
] as const;

export const confidenceOptions = [
  "Confident",
  "Somewhat confident",
  "Unsure",
  "Guessing",
] as const;

export const initialAttemptSchema = z.object({
  answer: z.string().trim().min(1, "Enter an answer."),
  explanation: z
    .string()
    .trim()
    .min(18, "Add a short explanation of the reasoning used."),
  approach: z.enum(approachOptions, {
    error: "Choose the closest approach.",
  }),
  confidence: z.enum(confidenceOptions, {
    error: "Choose a confidence level.",
  }),
});

export const shortResponseSchema = z.object({
  response: z.string().trim().min(6, "Add a meaningful response."),
});

export const retrySchema = z.object({
  answer: z.string().trim().min(1, "Enter a revised answer."),
  explanation: z
    .string()
    .trim()
    .min(18, "Explain how the revised reasoning works."),
});

export const transferSchema = retrySchema;

export type InitialAttemptValues = z.infer<typeof initialAttemptSchema>;
export type ShortResponseValues = z.infer<typeof shortResponseSchema>;
export type RetryValues = z.infer<typeof retrySchema>;
