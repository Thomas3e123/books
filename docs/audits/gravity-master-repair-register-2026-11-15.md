# Gravity master repair register

**Snapshot date:** November 15, 2026  
**Purpose:** One working queue for the Gravity site audit. New findings must be added here, deduplicated, prioritized, and given an evidence/status label before they are reported as another “new error.”

## Status rules

- **Confirmed defect — open:** A reproducible problem is evidenced in the current production version or an explicitly tested customer workflow, and the repair is not complete.
- **Fixed in source — live check needed:** The source repair is present in the audit branch, but the live deployment has not been verified to contain it.
- **Passed in stated scope:** Evidence shows the exact workflow passed in the stated environment. This does not certify other environments or devices.
- **Unverified workflow:** No defect is established; a real workflow still needs evidence.
- **Needs Thomas:** Requires a physical device, account-only action, DNS/account owner, or other access unavailable to the assistant.
- **Held:** Intentionally paused or excluded from the current repair release.

A source scan finding is not automatically a live customer defect. An old failed test is not considered open after a repair unless it is reproduced or current live source proves it remains.

## Current position

- The local audit branch is `fix/report-glossary-published-coverage-20261115` and includes the source repairs recorded below.
- Netlify confirms the current production deploy is ready: deploy `6af9520fcdf8671c72a6d43e`, commit `3a7fe3db8329fe0da35db74fc675ad26ab319fd7`, published November 15 at 06:33 UTC.
- The audit branch now includes that live commit in its ancestry. It contains additional unreleased audit and repair commits, with no live-only commit missing. This is a Git comparison, not certification of every current page or workflow.
- Comparing the live deployed Gravity Report with the audit branch confirmed that the branch contains the direct-article glossary repair but production still serves the older fragment links. This is one confirmed current-live defect; it is not a whole-site defect count.
- Four uncommitted files relate to the separate Brevo newsletter setup (`site/_redirects`, `site/gravity-report-thanks.html`, `functions/gravity-report-brevo.mjs`, `site/gravity-report-confirmed.html`). Keep them out of unrelated repair commits and do not call the email flow complete until its records, sender, delivery and consent path are verified.
- No deployment has been made during this repair batch. The exact Netlify build sequence (`npm run build` followed by the production packager) now verifies all 664 source-manifest hashes, generates the Handbook Creator assets, builds 153 production pages, and passes the site-wide internal-link scan, focused Gravity Report and Handbook Creator checks, and 67 integrated stability regressions. The comprehensive source sweep also found zero high-, medium-, or low-severity issues. Those checks caught a stale confirmation-page hash and one outdated Windows-page test expectation; both were corrected. Keep the separate Brevo draft out of the site release. The candidate is buildable; broader isolated journey checks and a review of the complete release diff remain before any coordinated deployment.
- A read-only production spot-check on Nov 15 confirmed the homepage and handbook landing page respond successfully, and the deployed Handbook Creator CSS/JavaScript return 200. It also confirmed two production items still awaiting this repair release: the Gravity Report glossary retains fragment links, and the report confirmation page lacks its canonical URL. No signup, payment, or customer-data workflow was triggered.
- The production Report schedule currently shows 11 of 30 numbered issues released; the RSS and article sitemap each contain those 11 plus the separate Gravity-move announcement. The old live-QA script still expected only five issues, so its checks would falsely fail as the schedule advanced. The script now derives release state and expected feed/sitemap counts from the approved schedule and publication timestamp.

## Confirmed current-live defect

| ID | Area | Live behavior | Repair state | Next step |
|---|---|---|---|---|
| LIVE-01 | Gravity Report glossary | Its 15 “Read Issue” links point to issue-card fragments. If the article catalog does not load, those later cards are hidden and the glossary link may not reach the article. | The audit branch changes all 15 destinations to permanent published-article routes. The repair is not in the current production deploy. A regression check now enforces all 15 permanent routes and verifies each unique target returns a published article; it passes. | Include it in a coordinated release, then open representative glossary links on the deployed site. |
| LIVE-02 | Gravity Report confirmation metadata | `/gravity-report-thanks` responds, but the current live page has no canonical URL. | Source now has a self-canonical URL and matching Open Graph URL; not yet deployed. | Include it in the coordinated release; verify canonical metadata on the deployed route. |

## Source repairs with live status to verify after release

| ID | Area | Repair recorded | Current status | Evidence / next check |
|---|---|---|---|---|
| SRC-01 | Production indexing and canonical URLs | Production-only packaging corrects robots, noindex, sitemap origin and canonical metadata while preserving preview restrictions. | Fixed in source; live check needed | `gravity-functional-audit-2026-11-04.md`; compare current production output and live headers before release. |
| SRC-02 | Search and navigation | Numbers Lab and several missing search destinations/keywords were added; SOP Library and Handbook routing were made explicit. | Source/hosted test evidence exists; current live check needed | `gravity-followup-2026-11-05.md`; run a compact live query/path smoke after deploy identity is known. |
| SRC-03 | Download and tool feedback | Blob/data downloads were exempted from registration gating; Numbers Lab CSV labels/results and Quick Tools feedback/validation were repaired in earlier audit work. | Historical defects; current deployed status needs reconciliation | `gravity-functional-audit-2026-11-04.md`; do not count as open without reproducing on current production. |
| SRC-04 | Responsive layout and accessible colors | Four narrow-screen overflow cases, a room contrast issue, and a phone header overlap were repaired in earlier source work. | Historical defects; current deployed status needs reconciliation | `gravity-functional-audit-2026-11-04.md`; older 390px browser checks are not physical-phone certification. |
| SRC-05 | Gravity Report article metadata | Corrected 15 glossary references, 10 guide structured-data objects, five additional article metadata records, and Fulfillment Center share metadata; added production build guards. | Fixed in source; only glossary fragment mismatch is confirmed live so far; other live fields need post-release verification. | `gravity-report-glossary-link-repair-2026-11-15.md`, `gravity-structured-data-repair-2026-11-15.md`, `gravity-metadata-build-guard-2026-11-15.md`, `gravity-sharing-metadata-repair-2026-11-15.md`. |
| SRC-06 | Gravity/TMB separation | Replaced 18 old-host destinations in six HTML pages; checked all 249 PDFs and Office package contents for TMB/legacy links. | Fixed in source; live/package state needs release reconciliation | `gravity-legacy-host-link-repair-2026-11-15.md`; PDF link repair evidence in `gravity-publisher-link-repair-2026-11-14.md`. |
| SRC-07 | Gravity Report PDF Field Sheets | Rebuilt five one-page PDFs; each footer has a clickable Gravity Report destination. | Passed source/render review; live download needs reconciliation | `gravity-publisher-link-repair-2026-11-14.md`; complete customer download check after release. |
| SRC-08 | Windows preview claims | Removed stale October download links/claims, disclosed Google Analytics, and corrected parity records. | Fixed in source; held from device certification | `gravity-windows-legacy-downloads-2026-11-15.md`, `gravity-windows-analytics-disclosure-2026-11-15.md`, `gravity-windows-parity-status-2026-11-15.md`. Keep installer execution out of this queue for now. |
| SRC-09 | Accessibility labels | Named six visible testing/import controls and two hidden Inventory Center file pickers for assistive technology. | Fixed in source; live check needed | `gravity-visible-control-labels-2026-11-15.md`, `gravity-inventory-file-picker-labels-2026-11-15.md`. Source-level only; no screen reader run. |
| SRC-10 | Cloud backup safeguards | Source fixes address rollback truthfulness and paused automatic/manual upload bypasses; current review confirms table health and describes cryptographic controls. | Source review only; hosted flow remains unverified | `gravity-cloud-backup-source-review-2026-11-15.md` and cloud-backup sections of `gravity-followup-2026-11-05.md`. |
| SRC-11 | Production source manifest | Sixteen committed Gravity pages had hashes that no longer matched the reviewed source, which would make the source verification step reject this repair branch. | Hashes refreshed for the committed pages. The remaining local mismatches come from separate uncommitted Brevo edits, deliberately excluded from the repair batch. | The committed tree verifies all 664 manifest entries. |
| SRC-12 | Gravity Report signup confirmation metadata | The production build stopped because the confirmation page’s Open Graph URL pointed to `/gravity-report` and the page had no matching canonical URL. | Added a self-canonical URL and matching Open Graph URL for `/gravity-report-thanks`; corrected its source-manifest hash in the clean release tree. | Clean release worktree verified 664 files, built 153 pages, and passed the report reading regression. This repair does not include or publish the in-progress email confirmation flow. |
| SRC-13 | Gravity Report release verification | The live QA script assumed only the first five issues would ever be released, so it no longer matched the active twice-weekly publication schedule. | Updated it to compare all schedule entries against the central publication timestamp, validate every currently released article, and derive RSS/sitemap counts while checking the next scheduled article remains embargoed. | Read-only production data currently aligns at 11 released issues plus one separate announcement. Re-run the updated QA after deployment and during later schedule checks. |

## Older failures to reconcile, not assume open

The November 4 functional audit explicitly listed the following as repaired in its candidate source but not deployed at that checkpoint: production SEO/indexing, Numbers Lab CSV, generated-download gating, four narrow-screen overflows, contrast/header layout, Copy Result feedback, prompt count, route ordering, and microphone policy. Later branch changes, merges, or deployments may have changed their status. Check current production commit and reproduce only the ones still relevant; avoid reopening each as a fresh issue without an ID.

The October 30 Recipe Works report recorded a replacement-confirmation failure and unclear storage-quota failure. Subsequent Recipe Works/Foundry audit notes describe later safeguards. Treat the October failures as historical until their current code and live behavior are reconciled.

## Unverified workflows and customer-dependent checks

| ID | Area | What remains unverified | Owner |
|---|---|---|---|
| QA-01 | Cloud backup | Synthetic account signup, encrypted upload, restore on another browser/device, wrong recovery phrase, clear recovery error, and deletion while an app remains open. | Assistant can prepare/run only in an isolated authorized test namespace; never use customer backups. |
| QA-02 | Registration, newsletter and notifications | Confirm the complete opt-in/consent path, sender authentication, delivery and failure handling to a test inbox; verify no accidental customer mailing. | Assistant after a safe test destination and isolated config are established; Brevo draft remains separate. |
| QA-03 | Downloads and print | Finish actual-file and print checks for formats/workflows that older evidence marked incomplete, including DOC/DOCX, ZIP, QR image transfer and selected PDF layouts. | Assistant can test in isolated browser; physical printer check needs Thomas. |
| QA-04 | Gravity tools and persistence | Remaining authenticated Foundry paths, hosted save/reopen, employee access, import/export edges, and Work Study transcription/recording paths. | Assistant in isolated environment; Thomas only for account/device steps that cannot be delegated. |
| QA-05 | AI, voice and Book Reader | Hosted AI answer quality, voice generation, listening/seek behavior and mobile background audio. | Assistant in safe test mode where available; device-only checks need Thomas. |
| QA-06 | Payments | Sandbox checkout and protected file delivery, including failure/refund states; no live charge. | Assistant only after sandbox credentials/config are available. |
| QA-07 | Physical device coverage | Representative phone layout/flows, QR scan, and printer output. | Thomas supplies observations; assistant prepares a short checklist and fixes reproducible issues. |
| QA-08 | Windows applications | Installer/ZIP install, update, printing and source parity. | Held per current direction until the rest of Gravity is reconciled. |

These entries mean “not yet proven,” not “confirmed broken.”

## Working repair timeline

Targets are based on the current known queue and assume no new production defect or access blocker. Device-only checks depend on Thomas being available; the source and browser work does not. If a dependency blocks a target, update the register with the blocker and the next date instead of labeling it a site defect.

| Target | Goal | What counts as complete |
|---|---|---|
| **Nov 15 — complete** | Reconcile source and make the candidate buildable | The exact Netlify build sequence passed: 664/664 manifest entries, Handbook Creator generated assets, 153-page production output, zero broken internal links, zero comprehensive-sweep findings, 67 stability regressions, Gravity Report reading regression, and Handbook Creator access/export gate test. Brevo draft remains isolated. |
| **Nov 16–17** | Review candidate changes and close source fixes for confirmed defects | Check the full release diff and issue register; inspect any remaining current-live customer failures; add focused regression checks for repaired paths. |
| **Nov 18–20** | Check the highest-impact customer journeys in an isolated environment | Exercise Gravity Report discovery/search/article links, registration and downloads, Inventory/Recipe/Foundry save and recovery, and service-backed flows where safe credentials exist. Mark blocked integrations as unverified, not broken. |
| **Nov 20–21** | Complete short device-dependent checks | Phone layout and QR scan, plus one representative PDF/print check. Provide Thomas one compact checklist for only the steps that require his device or account. |
| **Nov 22–23** | Prepare and verify one coordinated release | Review the full candidate diff, run the clean production build and focused regression checks, confirm no staging/noindex output or unrelated Brevo work is included, publish the coordinated batch when release gates pass, then smoke-check production and record the deployed commit. |

**Current target:** most source repairs and core journey checks by **Nov 20**; release-ready/production-verified batch by **Nov 23** if credentials, device checks, and build access do not block it. The source/build phase is complete; the remaining schedule is driven by isolated journey verification, concise device-dependent checks, and the release gate. “Most fixed” means confirmed high-impact defects are corrected and the main customer paths are verified; it does not mean every external integration or every Windows build is certified.

## Release and reporting sequence

1. **Reconcile live version.** This is complete for this snapshot: Netlify deploy `6af9520fcdf8671c72a6d43e` serves commit `3a7fe3db8329fe0da35db74fc675ad26ab319fd7`; the audit branch includes it. Keep this comparison current before any release.
2. **Dedupe and prioritize.** Keep one issue ID per defect family/affected path. Prioritize customer access/data loss, then core flows/downloads, navigation/search, then presentation/accessibility.
3. **Repair by batch.** Group related changes. Each confirmed defect gets reproduction, fix, focused regression evidence, and a production smoke step.
4. **Separate blockers from checks.** Never describe an unverified integration or physical-device task as a bug unless it fails.
5. **Release once a batch is reviewable.** Preserve the previous deploy for rollback; do not publish staging/noindex files or unrelated Brevo work.
6. **Close only with evidence.** Use `fixed in source` before release and `fixed live` only after the deployed route/workflow is checked.

## Audit references

This register consolidates status from `gravity-functional-audit-2026-11-04.md`, `gravity-followup-2026-11-05.md`, the October 30 critical-path/data-protection/operating-tools audits, and the dated November 14–15 repair notes in this directory, including `gravity-source-sweep-2026-11-15.md`. Those detailed files remain the evidence trail; this register is the single queue and status summary.
