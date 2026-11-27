# Gravity Pilot Room readiness register

**As of:** November 27, 2026 (UTC)  
**Scope:** Production participant room `/pilot-room`, manager dashboard `/pilot-room-manager`, API, linked pilot plan, and disposable CI workflows.  
**Latest production deploy:** Netlify `6b08de91f21564290ebb96ca`, ready; source commit `4f773fa733a9b8555f6bce383f74860d1b7e11d8`. Netlify reports migration `20261127013000_gravity_pilot_consent_evidence` applied.  
**Roster:** The owner reports zero outside participants and two records that are both theirs. No production signup, participant-row selection, export, or participant-record edit was performed during this audit.

## Readiness summary

**Not fully certified yet.** Three participant-room usability repairs and one consent enforcement repair are deployed. CI covered core flows with synthetic browser data and a disposable PostgreSQL database. The final production UI could not be visually rechecked after the consent deployment because the browser environment became unavailable; a web text fetch returned a cached earlier version and was not used as proof of the latest UI.

| Area | Status | Evidence / notes |
|---|---|---|
| Selected participant path | **PASS** | Tool-track enrollment and improvement-track enrollment open their selected tab directly. Valid private return-link recovery infers and opens the saved track. PR #219 and #220 browser checks passed; read-only production DOM after deploy #6b08d92 confirmed the improvement path opened on the plan tab. |
| Repeated directions and links | **PASS** | After entering, the workspace hides the pre-enrollment directions; redundant resource links were removed. Invalid return links restore enrollment directions. PR #220 and #221 browser checks passed; production DOM after deploy #6b08db confirmed directions hidden and the duplicate resource block absent. |
| Duplicate participant actions | **PASS** | Duplicate “Start my tool test” / “Build my plan” buttons were removed; plan printing remains hidden until a plan exists. PR #218 was deployed as #6b08cc. |
| Enrollment consent | **REPAIRED / PASS IN CI** | Launch blocker found: browser validation required the checkbox, but the API did not. API now requires `consentAccepted === true`; it stores `consent_version` and `consent_accepted_at`. The privacy link is next to the checkbox. Unit and disposable database tests passed. Latest Netlify deploy is ready and reports migration applied. |
| Existing owner records | **UNCHANGED; consent history unknown** | The new migration does not backfill historical consent. Manager detail displays “Consent: not on file” where no acceptance is recorded. This avoids inventing consent history. |
| Plan creation and milestones | **PASS IN DISPOSABLE DB** | Plan validation enforces 3–5 resources, 30/60-day pace, and dates in order. Tests create a plan and verify weekly, midpoint, and final-review progression. No production plan was created. |
| Test reports and issue reports | **PASS IN DISPOSABLE DB** | Browser CI verifies the Inventory Center walkthrough source and test-report save response; the database test verifies long test-report and issue-report persistence. No production report was submitted. |
| Participant / manager messages | **PASS IN DISPOSABLE DB** | Synthetic browser test checks reply association with the selected record; database test verifies participant message, manager receipt, manager reply, and participant retrieval. No real dashboard participant row was opened because that read marks participant messages as read. |
| Private return-link recovery | **PASS IN DISPOSABLE DB** | Manager reissue requires independent identity verification and matching registered email; the old token stops working and the new token restores the record. The coordinator delivers it manually per the playbook. No production link was reissued. |
| Reward copy and policy | **COPY ALIGNED; DELIVERY UNVERIFIED** | Participant copy says the ten most helpful verified contributors receive lifetime standard digital-library access and enrollment alone does not qualify. Pilot plan specifies the same ten-person standard across both tracks and requires a verified material improvement. Manager fields record qualification and award delivery; actual lifetime entitlement provisioning has not been exercised. |
| Guide catalog consistency | **PASS (STATIC)** | All 138 protocol cases match the printable guide. Live reachability and playback for every linked tool and video are not verified. |
| Mobile layout | **PASS IN SYNTHETIC BROWSER** | Disposable Playwright workflow checks a 390px viewport and no horizontal overflow. Physical devices and assisted-use sessions were not tested. |
| Ten-person operational capacity | **UNVERIFIED** | No concurrent ten-participant load test has been run. CI persistence tests use disposable records and do not test production-scale concurrency. |
| Current production rendering after consent change | **UNVERIFIED** | Netlify reports the latest production deploy ready and the consent migration applied. The available web text fetch showed an older cached page, so it cannot confirm the latest rendered checkbox or manager consent detail. No production write was used as a substitute. |

## Checks run

- `node --check` for the Pilot Room API and browser/database test scripts — passed.
- `node --test tests/pilot-readiness.test.cjs` — 5 tests passed.
- `node scripts/verify-source.cjs` — 696 manifest entries verified.
- `git diff --check` — passed.
- All five PR workflows passed for consent repair PR #222, including the Pilot Room browser flow and persistence against disposable PostgreSQL.
- Netlify production deploy #6b08de91f21564290ebb96ca — ready; consent migration reports `applied: true`.

## Remaining critical checks

1. Recheck the final production participant and manager DOM when browser access is available; do not create participants or open real records for this check.
2. Verify live destinations and media playback for each guide link in the protocol catalog.
3. Confirm lifetime digital-library access can actually be provisioned and recorded, including the access path after the Founding Year offer ends.
4. Decide whether a disposable ten-session concurrency/load test is needed before the first ten invitations.
5. Finish the word-for-word review of every manager-dashboard label, validation, and edge case against API behavior.
