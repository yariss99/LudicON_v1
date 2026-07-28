# tests/

Cross-package verification (not a substitute for package-local unit tests).

| Folder | Purpose |
|--------|---------|
| `contract/` | Contract tests against `packages/contracts` and Engine ports |
| `integration/` | Multi-package flows through Application → EOS → Engines |
| `e2e/` | Teacher journey tests (added when apps are runnable from `apps/`) |

**Rule:** Tests must not redefine architecture. Happy-path fakes must not silently imply Teacher Approval when the scenario requires Exclusive Teacher acts (PDC-05).
