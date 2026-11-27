# Gravity Pilot Room readiness register

**As of:** November 27, 2026 (UTC)  
**Scope:** Production participant room `/pilot-room`, manager dashboard `/pilot-room-manager`, API, linked pilot plan, and disposable CI workflows.  
**Latest production deploy:** Netlify `6b08dfd99de251b74b19372c`, ready; source commit `6be803c9432d1850d9fffb86a891c62ee30043b0` (approved promotional-video publish). The preceding consent deploy `6b08de91f21564290ebb96ca` reported migration `20261127013000_gravity_pilot_consent_evidence` applied.  
**Roster:** The owner reports zero outside participants and two records that are both theirs. No production signup, participant-row selection, export, or participant-record edit was performed during this audit.

## Readiness summary

**Not fully certified yet.** Three participant-room usability repairs and one consent enforcement repair are deployed. CI covered core flows with synthetic browser data and a disposable PostgreSQL database. The final production UI could not be visually rechecked after the consent deployment because the browser environment became unavailable; a web text fetch returned a cached earlier version and was not used as proof of the latest UI.

| Area | Status | Evidence / notes |
|---|---|---|
| Selected participant path | **PASS** | Tool-track enrollment and improvement-track enrollment open their selected tab directly. Valid private return-link recovery infers and opens the saved track. PR #219 and #220 browser checks passed; read-only production DOM after deploy #6b08d92 confirmed the improvement path opened on the plan tab. |
| Repeated directions and links | **PASS** | After entering, the workspace hides the pre-enrollment directions; redundant resource links were removed. Invalid return links restore enrollment directions. PR #220 and #221 browser checks passed; production DOM after deploy #6b08db confirmed directions hidden and the duplicate resource block absent. |
| Duplicate participant actions | **PASS** | Duplicate “Start my tool test” / “Build my plan” buttons were removed; plan printing remains hidden until a plan exists. PR #218 was deployed as #6b08cc. |
| Enrollment consent | **PASS (CURRENT UI + API/DB CI)** | Latest production render shows the consent notice and `/privacy` link next to the checkbox. A blank enrollment attempt stops at track selection before any API call; no enrollment was submitted. API requires `consentAccepted === true` and stores `consent_version` plus `consent_accepted_at`; unit and disposable PostgreSQL tests passed. Migration was applied on deploy `6b08de91f21564290ebb96ca`, included in the current production state. |
| Existing owner records | **UNCHANGED; consent history unknown** | The new migration does not backfill historical consent. Manager detail displays “Consent: not on file” where no acceptance is recorded. This avoids inventing consent history. |
| Plan creation and milestones | **PASS IN DISPOSABLE DB** | Plan validation enforces 3–5 resources, 30/60-day pace, and dates in order. Tests create a plan and verify weekly, midpoint, and final-review progression. No production plan was created. |
| Test reports and issue reports | **PASS IN DISPOSABLE DB** | Browser CI verifies the Inventory Center walkthrough source and test-report save response; the database test verifies long test-report and issue-report persistence. No production report was submitted. |
| Participant / manager messages | **PASS IN DISPOSABLE DB** | Synthetic browser test checks reply association with the selected record; database test verifies participant message, manager receipt, manager reply, and participant retrieval. No real dashboard participant row was opened because that read marks participant messages as read. |
| Private return-link recovery | **PASS IN DISPOSABLE DB** | Manager reissue requires independent identity verification and matching registered email; the old token stops working and the new token restores the record. The coordinator delivers it manually per the playbook. No production link was reissued. |
| Reward copy and policy | **COPY ALIGNED; DELIVERY UNVERIFIED** | Participant copy says the ten most helpful verified contributors receive lifetime standard digital-library access and enrollment alone does not qualify. Pilot plan specifies the same ten-person standard across both tracks and requires a verified material improvement. Manager fields record qualification and award delivery; actual lifetime entitlement provisioning has not been exercised. |
| Guide catalog consistency | **PARTIAL; coverage repair proposed** | The current production catalog remains version 1.3 with 138 cases. A draft repair PR #224 adds three checks for features found in current tool pages: Gravity Aware quick diagnostics, Work Study recording/transcription consent, and Recipe Works revision governance/location adoption. The branch has 141 unique checks and printable-guide parity; CI is pending. Production tool behavior and linked destinations beyond prior spot checks remain only partly verified. Video metadata was checked, not spoken/content accuracy. |
| Mobile layout | **PASS IN SYNTHETIC BROWSER** | Disposable Playwright workflow checks a 390px viewport and no horizontal overflow. Physical devices and assisted-use sessions were not tested. |
| Ten-person operational capacity | **UNVERIFIED** | No concurrent ten-participant load test has been run. CI persistence tests use disposable records and do not test production-scale concurrency. |
| Current production participant / manager rendering | **PARTIAL PASS** | Current production participant page shows the new consent notice, privacy link, reward copy and expected enrollment fields. Manager login succeeded and the list summary loaded. No row was opened because detail GET marks messages read; therefore the live consent detail label was not inspected. No participant was created, changed, exported, or selected. |

## Checks run

- `node --check` for the Pilot Room API and browser/database test scripts — passed.
- `node --test tests/pilot-readiness.test.cjs` — 5 tests passed.
- `node scripts/verify-source.cjs` — 696 manifest entries verified.
- `git diff --check` — passed.
- All five PR workflows passed for consent repair PR #222, including the Pilot Room browser flow and persistence against disposable PostgreSQL.
- Netlify production deploy #6b08de91f21564290ebb96ca — ready; consent migration reports `applied: true`.

## Remaining critical checks

1. Verify the live manager consent detail without opening a real participant row; the deployed UI was inspected through the login/list view, while the detail API marks messages read.
2. Merge and verify draft PR #224 so the three newly identified live-tool workflows are covered in the catalog; then check live destinations/behavior for all linked tools. Video delivery was checked, but spoken/content accuracy was not reviewed.
3. Confirm how lifetime standard-library access will actually be granted and retained after the Founding Year offer ends; the participant promise is public, while the manager checkbox only records the award.
4. Run or explicitly waive a disposable ten-session concurrency check; the edge limit is 45 API requests per IP/domain per minute, and concurrent real-world use has not been measured.
5. Complete full manager validation/error-path review and physical-device/mobile usability checks.
