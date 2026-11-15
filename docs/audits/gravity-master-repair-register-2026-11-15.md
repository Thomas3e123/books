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
- The verified repair batch was merged in PR [#138](https://github.com/Thomas3e123/books/pull/138). The tracker and QA-script follow-up was merged in PR [#139](https://github.com/Thomas3e123/books/pull/139). Netlify's latest production deploy `6afa21bbd34110213f5c2341`, commit `a55050e35f607368a3f72cbee07511e4bc0539fe`, is ready and serves `https://gravityleadershipsystem.com`.
- The post-deploy smoke check confirmed the deployed homepage and Gravity Report load; all 15 glossary links lead to permanent article routes; 11 unique published article targets and the report confirmation page return 200 with correct canonical metadata; Handbook Creator CSS/JS return 200; the schedule/feed counts are current; and no future issue was exposed. This is evidence for those routes and checks, not certification of every workflow or device.
- Four uncommitted files relate to the separate Brevo newsletter setup (`site/_redirects`, `site/gravity-report-thanks.html`, `functions/gravity-report-brevo.mjs`, `site/gravity-report-confirmed.html`). Keep them out of unrelated repair commits and do not call the email flow complete until its records, sender, delivery and consent path are verified.
- Before release, the exact Netlify build sequence (`npm run build` followed by the production packager) verified all 664 source-manifest hashes, generated the Handbook Creator assets, built 153 production pages, and passed the strict internal-link scan, focused Gravity Report and Handbook Creator checks, and 67 integrated stability regressions. The comprehensive source sweep found zero high-, medium-, or low-severity source findings. The separate Brevo draft was excluded. These are source/build checks, not proof of hosted integrations or physical-device behavior.
- No signup, payment, or customer-data workflow was triggered during release verification. Current direct page retrieval is unavailable through the web lookup path, so findings below distinguish routes already smoke-checked from repairs only known to be in the ready production build. That lookup limitation is not evidence that the site is down.
- The production Report schedule currently shows 11 of 30 numbered issues released; the RSS and article sitemap each contain those 11 plus the separate Gravity-move announcement. The old live-QA script still expected only five issues, so its checks would falsely fail as the schedule advanced. The script now derives release state and expected feed/sitemap counts from the approved schedule and publication timestamp.

## Confirmed current-live defect

| ID | Area | Live behavior | Repair state | Next step |
|---|---|---|---|---|
| LIVE-01 | Gravity Report glossary | Its 15 “Read Issue” links pointed to issue-card fragments, which could fail when the catalog did not load. | **Fixed live.** All 15 glossary links now use permanent article routes; each unique published target returned 200 in the production smoke check. | Closed for checked routes. |
| LIVE-02 | Gravity Report confirmation metadata | `/gravity-report-thanks` lacked a canonical URL. | **Fixed live.** Canonical and Open Graph URLs match the confirmation route. | Closed for checked metadata. |

## Source repairs: status after the November 15 production deploy

| ID | Area | Repair recorded | Current status | Evidence / next check |
|---|---|---|---|---|
| SRC-01 | Production indexing and canonical URLs | Production-only packaging corrects robots, noindex, sitemap origin and canonical metadata while preserving preview restrictions. | **Unverified live.** Included in the ready production build; robots, sitemap origin, and representative page headers have not been re-fetched from production in this pass. | Check `robots.txt`, main sitemap and representative page canonical/noindex headers when direct live retrieval is available. |
| SRC-02 | Search and navigation | Numbers Lab and several missing search destinations/keywords were added; SOP Library and Handbook routing were made explicit. | **Unverified live.** Source is in the ready build; actual live search and nested routes were not exercised in this pass. | Search a distinctive term and open the SOP Library and Handbook routes on production. |
| SRC-03 | Download and tool feedback | Blob/data downloads were exempted from registration gating; Numbers Lab CSV labels/results and Quick Tools feedback/validation were repaired in earlier audit work. | **Unverified live.** No broken current download has been reproduced; real production export behavior still needs a safe test. | Verify a generated export and its contents without submitting customer data. |
| SRC-04 | Responsive layout and accessible colors | Four narrow-screen overflow cases, a room contrast issue, and a phone header overlap were repaired in earlier source work. | **Unverified live.** Repairs are in the ready build; this pass did not inspect them at phone width or with a screen reader. | Check representative home, Contact, and workspace pages at narrow width; physical phone remains separate. |
| SRC-05 | Gravity Report article metadata | Corrected 15 glossary references, 10 guide structured-data objects, five additional article metadata records, and Fulfillment Center share metadata; added production build guards. | **Partially fixed live.** Glossary routes, 11 published article targets and the confirmation canonical/OG URL passed the production smoke check. The remaining structured-data and share metadata were not directly checked. | Spot-check metadata on representative guide/article pages and Fulfillment Center page when direct live retrieval is available. |
| SRC-06 | Gravity/TMB separation | Replaced 18 old-host destinations in six HTML pages; checked all 249 PDFs and Office package contents for TMB/legacy links. | **Unverified live.** The corrected source is in the ready production build; public page links and downloadable packages were not opened in this pass. | Check the six affected page routes and a representative downloadable Office/PDF file. |
| SRC-07 | Gravity Report PDF Field Sheets | Rebuilt five one-page PDFs; each footer has a clickable Gravity Report destination. | **Unverified live.** Source/render checks passed before release; live file download and footer link were not checked in this pass. | Download one Field Sheet from production and confirm its footer link opens Gravity Report. |
| SRC-08 | Windows preview claims | Removed stale October download links/claims, disclosed Google Analytics, and corrected parity records. | **Unverified live copy; device certification held.** Source is in the ready build, but the affected public pages were not directly fetched. Windows installer behavior remains outside this check. | Check affected public copy after live retrieval; keep installer execution held. |
| SRC-09 | Accessibility labels | Named six visible testing/import controls and two hidden Inventory Center file pickers for assistive technology. | **Unverified live.** Labels are in the ready build; no live accessibility tree or screen-reader check was available in this pass. | Inspect labels on production and run a focused screen-reader check later. |
| SRC-10 | Cloud backup safeguards | Source fixes address rollback truthfulness and paused automatic/manual upload bypasses; current review confirms table health and describes cryptographic controls. | **Unverified workflow.** A ready deploy does not prove account ownership, upload, restore or deletion behavior. | Test only with a synthetic account and isolated data; never use customer backups. |
| SRC-11 | Production source manifest | Sixteen committed Gravity pages had hashes that no longer matched the reviewed source, which would make the source verification step reject this repair branch. | **Build verified.** The clean production sequence verified all 664 manifest entries before deployment. This is source integrity evidence, not a customer-facing live behavior check. | No additional live check needed unless the source changes. |
| SRC-12 | Gravity Report signup confirmation metadata | The production build stopped because the confirmation page’s Open Graph URL pointed to `/gravity-report` and the page had no matching canonical URL. | **Fixed live.** `/gravity-report-thanks` returned 200 with matching canonical and Open Graph URLs in the production smoke check. This does not verify the email signup/delivery flow. | Closed for metadata; keep signup/delivery under QA-02. |
| SRC-13 | Gravity Report release verification | The live QA script assumed only the first five issues would ever be released, so it no longer matched the active twice-weekly publication schedule. | **Fixed in repository; live QA rerun pending.** Schedule logic was updated; the sitemap count now includes the landing page. Node syntax check passed; full QA script was not rerun after the count correction. | Run the corrected script against the preview once it is available; do not treat the earlier count mismatch as a site defect. |

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
| **Nov 15 — complete** | Publish the verified repair batch and confirm it is live | PR #138 merged; Netlify deploy `6afa203f477940c78aec4b3c` is ready. Production smoke checks passed for the report glossary routes, confirmation metadata, Handbook Creator assets, schedule, RSS, and sitemap. |
| **Nov 16–17** | Reconcile remaining known repairs against the new live version | Run focused live checks for the prior source repairs (navigation/search, downloads, responsive layout, metadata, old-host links, accessible labels); update each register item to fixed-live, still-open, or unverified based on evidence. |
| **Nov 18–20** | Check highest-impact customer journeys in an isolated environment | Exercise Gravity Report discovery/search/article links, registration and downloads, Inventory/Recipe/Foundry save and recovery, and service-backed flows where safe credentials exist. Mark blocked integrations as unverified, not broken. |
| **Nov 20–21** | Complete short device-dependent checks | Phone layout and QR scan, plus one representative PDF/print check. Provide Thomas one compact checklist for only the steps that require his device or account. |
| **Nov 22–23** | Close the next repair batch and report the remaining queue | Fix any reproducible defects from journey checks, run focused regressions and the clean production build, then deploy only if the batch is verified. Record the live commit and update this register. |

**Current target:** reconcile the deployed source repairs by **Nov 17**, verify the main isolated customer journeys by **Nov 20**, and finish the next verified repair batch by **Nov 23**, subject to integration credentials and device-dependent checks. The Nov 15 batch is already live. “Most fixed” means confirmed high-impact defects are corrected and the main customer paths are verified; it does not mean every external integration or every Windows build is certified.

## Release and reporting sequence

1. **Reconcile live version.** This release is complete: PR #138 is merged; Netlify deploy `6afa203f477940c78aec4b3c` serves commit `6c72a105136c282082fb623634fdf467d55282af`. Keep this comparison current before the next release.
2. **Dedupe and prioritize.** Keep one issue ID per defect family/affected path. Prioritize customer access/data loss, then core flows/downloads, navigation/search, then presentation/accessibility.
3. **Repair by batch.** Group related changes. Each confirmed defect gets reproduction, fix, focused regression evidence, and a production smoke step.
4. **Separate blockers from checks.** Never describe an unverified integration or physical-device task as a bug unless it fails.
5. **Release once a batch is reviewable.** Preserve the previous deploy for rollback; do not publish staging/noindex files or unrelated Brevo work.
6. **Close only with evidence.** Use `fixed in source` before release and `fixed live` only after the deployed route/workflow is checked.

## Audit references

This register consolidates status from `gravity-functional-audit-2026-11-04.md`, `gravity-followup-2026-11-05.md`, the October 30 critical-path/data-protection/operating-tools audits, and the dated November 14–15 repair notes in this directory, including `gravity-source-sweep-2026-11-15.md`. Those detailed files remain the evidence trail; this register is the single queue and status summary.
