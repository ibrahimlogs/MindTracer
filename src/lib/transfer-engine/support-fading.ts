import type { TransferSupportStateValue } from "./schemas.ts";

export interface SupportFadingPolicy {
  initialState(): TransferSupportStateValue;
  canShowHint(input: { meaningfulAttemptSubmitted: boolean }): boolean;
}

export class DeterministicSupportFadingPolicy implements SupportFadingPolicy {
  initialState() {
    return "independent" as const;
  }

  canShowHint(input: { meaningfulAttemptSubmitted: boolean }) {
    return input.meaningfulAttemptSubmitted;
  }
}
