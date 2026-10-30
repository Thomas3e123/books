# Gravity customer data protection, backup and cross-device QA — October 30, 2026

Real production website tested in isolated headless Chrome profiles with fictional customer data. No real user records, hosted database writes, payment requests or live staff workspace mutations.

| Test | Classification | Observed evidence |
| --- | --- | --- |
| Shift Lab — reload same browser | **PASS** | Synthetic schedule and restaurant persisted after reload. |
| Shift Lab — automatic synchronization to a second browser | **NOT_IMPLEMENTED** | Separate browser did not receive synthetic schedule. No automatic account/device sync was observed. |
| Shift Lab — automatic backup download on Save | **NOT_IMPLEMENTED** | Saving a schedule did not produce an automatic off-device backup. |
| Shift Lab — recovery without prior manual backup after browser storage clearing | **AT_RISK** | Synthetic schedule no longer appears after local storage removal. No automatic recovery detected. |
| Inventory Center — reload same browser | **PASS** | Synthetic restaurant persisted in current browser. |
| Inventory Center — automatic synchronization to a second browser | **NOT_IMPLEMENTED** | New browser did not receive synthetic inventory profile; no automatic cloud synchronization detected. |
| Inventory Center — automatic backup on profile Save | **NOT_IMPLEMENTED** | No off-device backup was created automatically when profile saved. |
| Recipe Works — local recipe Save | **PASS** | Synthetic recipe persisted in browser-local storage. |
| Recipe Works — reopen existing recipe | **PASS** | Saved recipe was retained after reload. |
| Recipe Works — manual backup transferred to a new browser | **PASS** | Downloaded JSON restored recipe in a clean browser and survived another reload. |
| Recipe Works — invalid backup rejection | **PASS** | Invalid-format backup rejected without replacing saved recipe. |
| Recipe Works — replacement backup requires explicit confirmation | **FAIL** | An empty-but-shaped backup replaced saved recipe without confirmation. |
| Recipe Works — quota/storage failure surfaced to user | **FAIL** | Browser raised QA injected quota failure; no clear on-page storage failure warning. |

## Interpretation

PASS means a capability worked in the tested conditions. NOT_IMPLEMENTED means no automatic off-device backup or cross-browser synchronization was observed. AT_RISK means stored data disappeared in the deliberately cleared test profile. FAIL means an explicitly protective expectation was violated. TEST_ERROR/INCONCLUSIVE means the test cannot establish the outcome.

## Boundaries
Manual browser-local persistence is not cloud synchronization. A backup must be exported and stored away from the browser/device before local data loss. Separate device recovery without a file, authentication-based account recovery, hosted Foundry write durability, Windows desktop installers, and remote update rollover have not been proven by these tests.

## Totals
- PASS: 6
- NOT_IMPLEMENTED: 4
- AT_RISK: 1
- FAIL: 2
