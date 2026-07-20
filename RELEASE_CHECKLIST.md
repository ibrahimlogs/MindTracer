# Release Checklist

- [ ] Configure live services if available.
- [ ] Run deterministic validation.
- [ ] Run live OpenAI smoke tests if `OPENAI_API_KEY` is available.
- [ ] Run PostgreSQL smoke test only with `SAFE_TEST_DATABASE=true`.
- [ ] Record demo video.
- [ ] Push public repository.
- [ ] Deploy.
- [ ] Submit.

Release tag instruction: `git tag v1.0.0-build-week`.
