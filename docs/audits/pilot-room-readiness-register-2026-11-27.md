# Gravity Pilot Room readiness register

**As of:** November 27, 2026 (UTC)  
**Scope:** Production participant room `/pilot-room`, manager dashboard `/pilot-room-manager`, API, linked pilot plan, and authorized disposable CI workflows.  
**Latest production deploy:** Netlify `6b08efe9c8234a38e228a521`, ready; source commit `ff199db6704ee18faca4ae09fe7d26c5f4c93d8b` (shared-network capacity repair). The Pilot Room API edge rate limit in this deployment is 100 requests per 60 seconds aggregated by IP and domain.  
**Roster and safety:** The owner reports zero outside participants and two records that are both theirs. No production enrollment, participant-row selection, export, message read, or participant-record edit was performed during this audit.

## Readiness summary

**Not fully certified for all ten-person operations.** The main entry page and current protocol file were directly inspected on the latest production deploy. The new 100/60 API limit and 142-check catalog are deployed. Enrollment, plan/review/report/message workflows passed synthetic browser and disposable database tests. A disposable ten-session test through Netlify’s edge layer is still not available: PR deploy previews were canceled because Netlify detected no content change. No production burst or fake participant test was run.

| Area | Status | Evidence / notes |
|---|---|---|
| Selected participant path | **PASS** | Tool-track enrollment and improvement-track enrollment open their selected tab directly. Valid private return-link recovery infers and opens the saved track. PR #219/#220 browser checks passed; read-only production DOM after deploy #6b08d92 showed the improvement path on the plan tab. |
| Repeated directions and links | **PASS** | After entering, the workspace hides the pre-enrollment directions; redundant resource links were removed. Invalid return links restore enrollment directions. PR #220/#221 browser checks passed; production DOM after deploy #6b08db confirmed directions hidden and duplicate resource block absent. |
| Duplicate participant actions | **PASS** | Duplicate “Start my tool test” / “Build my plan” buttons were removed; plan printing remains hidden until a plan exists. PR #218 was deployed as #6b08cc. |
| Participant workspace navigation | **PASS (CI + deployment)** | PR #225 merged after all six listed GitHub workflows passed and deployed as #6b08edc7daf2a48a04541141. It hides the redundant “Start here” tab when a track is known, removes misleading step numbers from alternate paths, and preserves alternate path, reviews, issue reporting, and messages. Synthetic browser test covered known-path workspace at 390px without horizontal overflow. |
| Enrollment consent | **PASS (current UI + API/DB CI)** | Latest production enrollment page visibly includes the consent notice and `/privacy` link. Consent is required by API and `consent_version` plus `consent_accepted_at` are stored. Unit and disposable PostgreSQL tests passed; migration `20261127013000_gravity_pilot_consent_evidence` was applied on deploy `6b08de91f21564290ebb96ca`. No production signup was submitted. |
| Existing owner records | **UNCHANGED; historical consent unknown** | Migration does not backfill old consent. Manager detail displays “Consent: not on file” where no acceptance was recorded. Do not infer prior consent. Real rows were not opened because detail GET marks messages read. |
| Plan creation and milestones | **PASS IN DISPOSABLE DB** | Validation enforces 3–5 resources, 30/60-day pace, and dates in order. Synthetic tests create plans and verify weekly, midpoint, and final-review progression. No production plan was created. |
| Test reports and issue reports | **PASS IN DISPOSABLE DB** | Synthetic browser checks Inventory Center walkthrough source and test-report save response; database test verifies test-report and issue-report persistence. No production report was submitted. |
| Participant / manager messages | **PASS IN DISPOSABLE DB** | Synthetic browser test checks reply association with selected record; database test verifies participant message, manager receipt, manager reply, and participant retrieval. No real dashboard participant row was opened. |
| Private return-link recovery | **PASS IN DISPOSABLE DB** | Reissue requires manager authorization, independent identity verification, and matching registered email; old token stops working and new token restores the record. Coordinator delivers it manually per playbook. No production link was reissued. |
| Reward wording and qualification | **COPY ALIGNED; DELIVERY UNVERIFIED** | Production copy says the ten most helpful verified contributors receive lifetime access to the standard digital library and enrollment alone does not qualify. Pilot plan uses the same standard for both tracks and requires verified material improvement. Manager fields record qualification and award delivery. Actual entitlement provisioning and retention after the Founding Year (October 1, 2027) have not been exercised. Resolve before promising or issuing awards. |
| Guide catalog consistency | **PASS (CI + current production file)** | The latest deployment serves protocol catalog version 1.5; the catalog includes PIL-07, the ten-session shared-network check. PR #224’s 141-case catalog passed and was directly verified in production; PR #226 adds one case and a regression assertion for the new limit. Linked tool behavior remains only partly verified. Video file delivery/metadata was checked, not full spoken/content accuracy. |
| Shared-network API limit | **REPAIRED AND DEPLOYED; edge burst UNVERIFIED** | Production deploy `6b08efe9c8234a38e228a521` reports Pilot Room limit `window_limit: 100`, `window_size: 60`, aggregated by IP and domain. The prior deployed limit was 45/60. PR #226 source/config and catalog checks passed in the reported GitHub workflow runs. A deploy-preview burst test could not run because both Netlify previews were canceled (“Canceled build due to no content change”). No ten-session production test was run. |
| Current production participant entry | **PASS (read-only)** | Latest production deploy directly rendered the two-minute promo placement, entry instructions, path selector, name/email/role/type fields, consent checkbox and privacy link, reward copy, and pilot-plan link. No enrollment was submitted. |
| Manager dashboard rendering | **PARTIAL PASS** | Manager login/list had previously succeeded and showed the two owner records. No row was opened, because the detail GET marks messages as read; live consent detail remains unverified. Current deployment contains the merged API and page files, but no production participant was used for a write test. |
| Mobile and assistive usability | **PASS IN SYNTHETIC BROWSER; physical use UNVERIFIED** | CI checks a 390px viewport without horizontal overflow. Physical device use, 200% zoom, and assisted-use sessions were not tested. |
| Ten-person operational capacity | **PARTIAL; do not certify load behavior yet** | Limit increased and deployed; disposable end-to-end shared-IP edge burst remains blocked until an authorized disposable environment or functioning deploy preview is available. The UI and database tests do not prove edge enforcement. |

## Checks run

- PR #224: guide expansion to version 1.4 / 141 unique cases; six listed workflows passed; production JSON directly verified.
- PR #225: participant navigation simplification; six listed workflows passed, including synthetic 390px layout; production deploy directly verified.
- PR #226: shared-network limit and PIL-07. Five PR-triggered GitHub Actions workflow runs were returned, all completed successfully. Production deploy `6b08efe9c8234a38e228a521` is ready and reports the Pilot Room edge limit as 100 per 60 seconds/IP+domain. The deploy-preview burst check did not run.
- Earlier disposable checks: `node --check`, `node --test tests/pilot-readiness.test.cjs`, `node scripts/verify-source.cjs`, and `git diff --check` passed; PR #226 test asserts 142 unique catalog cases match the printable guide and asserts the 100/60 source config.
- No production participant records were created, modified, selected, exported, or used for load testing.

## Remaining readiness actions

1. Obtain or configure an authorized disposable test environment or working deploy preview with an isolated Pilot Room database; run PIL-07 through Netlify’s edge limiter and confirm no 429 responses and correct synthetic-session association.
2. Verify manager consent detail and manager validation/error paths using a disposable record, without opening real participant rows.
3. Verify every linked tool destination and representative workflow. Watch/listen to all newly linked videos and compare spoken instructions with the current tool UI and guides; file delivery alone is not a content check.
4. Define and verify lifetime standard-library entitlement provisioning/retention after October 1, 2027 before issuing rewards.
5. Complete physical-device/mobile and assisted-use checks.

**Decision:** The Pilot Room has meaningful repairs deployed and is safer for a ten-person start, but this register does not certify every critical launch check. The two highest remaining operational gaps are the isolated edge-capacity test and reward fulfillment verification.
