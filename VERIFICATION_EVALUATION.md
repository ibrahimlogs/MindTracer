# Verification evaluation

Step 7 adds a prototype misconception and verification evaluation harness.

```bash
corepack pnpm evaluate:verification -- --mode=deterministic
```

The report is written to `artifacts/verification-evaluation/latest.json`, which is gitignored.

The harness reports engineering metrics, not learning-outcome metrics: candidate recall, top-1 agreement, top-2 recall, verification-required agreement, verification-type agreement, post-verification agreement, false confident diagnosis rate, unknown-ID rate, prohibited-output rate, fallback rate, and average latency.

Current deterministic run over 30 prototype cases:

- candidate recall: `0.60`
- initial top-1 agreement: `0.2667`
- top-2 recall: `0.5333`
- post-verification family/status agreement: `0.6333`
- false confident diagnosis rate: `0`
- unresolved-case rate: `0.0667`
- unknown-ID rate: `0`
- prohibited-output rate: `0`
- fallback rate: `0`

The required comparison is recorded as Method A, single-pass ranking without verification, versus Method B, ranking followed by a synthetic verification response. These results are useful for regression tracking only and are not an external benchmark.
