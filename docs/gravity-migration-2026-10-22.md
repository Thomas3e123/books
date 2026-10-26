# Gravity / Thomas Monroe Books migration — controlled start (2026-10-22)

## Decision and ownership

- Gravity, The Gravity Restaurant Leadership System, becomes the **restaurant leadership business** at `gravityleadershipsystem.com` (domain confirmed active by owner; Squarespace registrar; intended hosting: Netlify).
- `thomasmonroebooks.com` stays online and becomes the author / publishing website after Gravity cutover.
- `gravityinvironment.netlify.app` is an **existing, independent Netlify application**. Integrate it; **do not overwrite it**.
- The River/internal SOPs and customer/commercial content remain separate. No customer data should be copied into a test site.

## Recovery baseline and isolation

- Repository: `Thomas3e123/books`
- Baseline commit: `35cf7ce55c0a33d4396100f2b47d68c0bb847e6b`
- Preserved Git branch: `backup/tmb-before-gravity-migration-2026-10-22` — **do not rebase, force-push or delete**.
- Working branch: `feature/gravity-migration-phase1-2026-10-22` — staging only. No production merges or domain DNS edits without acceptance gates.
- Existing TMB Netlify site: `1548e212-4cfe-4751-ab81-f46936249304`.
- New Gravity Netlify site (empty at audit start): `fa5d39a0-bef9-4ff1-9c28-57d585d741d7`.
- Existing Gravity Invironment site: `888c8c16-85d9-49f0-ad9c-d868c42321bd`.

Git branches protect committed **source**. They are **not backups** of Netlify Database, encrypted environment variables, Netlify Forms submissions, customer data, Google Workspace, or outside application storage. Those require their own verified exports/retention plan.

## Repository inventory (baseline Git tree)

Full recursive Git tree: **885 entries**, not truncated. The tracked repository includes:

| Component | Tracked files | Size (tracked bytes) |
|---|---:|---:|
| `site/` | 579 | 171,990,669 |
| `functions/` | 15 | 192,235 |
| `netlify/database/` migrations | 4 | 5,462 |
| `scripts/` | 117 | 391,470 |
| `.github/workflows/` | 55 | 134,862 |
| `windows/` | 35 | 162,830 |

The `site/` top directory has **134 entries** including HTML pages, scripts, manuals, book resources, PDFs, and application assets. Exact downloadable binaries may live outside the Git repo / on GitHub Releases or other storage. Do not treat source inventory as proof of complete download availability.

### Hosted functions

- `foundry-hosted` — employee connection, SOP/recipe features; backend database.
- `gravity-guide` — guidance (OPENAI_API_KEY dependency).
- `gravity-tts` — spoken guidance (OPENAI_API_KEY, origin allowlist).
- `gravity-report` — 30 scheduled articles and RSS, with date gating.
- `testing-room` — feedback and manager features (GRAVITY_TESTING_MANAGER_KEY, database, origin allowlist).
- `work-study-link` — connected study workflow and persistent records.
- `work-study-process-file`, `work-study-transcribe` — work-study file processing and transcription.

Four SQL migrations, including employee-hosted SOP, testing and Work Study device links, are present in source. **Database provisioning, data completeness and credentials on the NEW project are not established**.

### Netlify Forms: existing TMB site

- `gravity-registration`: **13 submissions** as of inventory.
- `gravity-report-opt-in`: **0 submissions** as of inventory; subscription dispatch is not yet configured.
- `gravity-contact`, `gravity-customer-experience`, and other forms exist; review and export submissions before changing sites.
- Netlify Forms live on the site that received the submission. They do **not** automatically follow a new site.

### External dependencies / high-risk paths

1. Netlify database containing live SOP/recipes, training and testing state, and Work Study links.
2. Netlify environment secrets for AI/TTS, testing manager and server-side actions.
3. Hosted employee QR URLs, `/e/CODE`, employee data and authentication.
4. Registration/founding-year access, external identity sign-ins, consent logs and Netlify Forms.
5. Book PDFs, user manuals, Windows ZIP installers/releases and permanent download links.
6. The Gravity Report scheduled posts, feeds and search indexing.
7. Search Console, canonicals, sitemap, domain verification, social profiles and existing backlinks.
8. The Gravity Invironment — independently published Netlify application; inspect and retain.
9. Google Workspace mailbox and domain MX, SPF, DKIM and DMARC; DNS must not damage email.
10. The River-specific content, which must not be distributed as customer generic content.

## Controlled deployment gates

**Gate A — static preview (this branch only):** stage a copy of the existing Gravity-oriented site with correct Gravity branding and absolute URL metadata, a visible preview banner and `noindex`; do not publish to the custom Gravity domain, and do not route existing customers to it.

**Gate B — full inventory and functional parity:** verify key pages, navigation, static assets, app script behavior, Windows links, forms, PDF manuals, newsletter gating and appropriate privacy notices. Record failed items; do not claim backend parity yet.

**Gate C — data and live backend:** inventory/export Netlify Forms and DB state where authorized; provision migrations and credentials securely on the NEW Netlify project; test employee QR routing, Gravity TTS/Guide, Work Study, Testing Room and signup **using isolated test accounts**; retain old endpoints while links transition.

**Gate D — domain and email:** preserve Squarespace ownership and Google Workspace MX/SPF/DKIM; point web-only DNS at new Netlify site after Gate C, ensure certificate/HTTPS, verify exact live URLs. Keep Gravity Invironment deployed separately.

**Gate E — TMB publishing split:** remove the Gravity application experience from TMB only after GLS pages are live and verified. Preserve relevant book pages, author information and imprint, implement old-path-to-new-path 301 redirects and Google Search Console migration checks.

**Gate F — post-launch:** repeat real customer/browser simulations on mobile and Windows, verify function logs and email, monitor broken links, latency and errors, and keep a rollback plan.

### Rollback

If the new site breaks: leave the old `thomasmonroebooks.com` source and Netlify deploy untouched, and undo **web-only** DNS changes on `gravityleadershipsystem.com`. Do **not** revert MX/SPF/DKIM to solve web routing. Retain backend records and don't try to merge newly created data back without deliberate reconciliation.

### Not yet authorized/completed

The branch, audit, or staging preview **does not** establish that the production domain moved, that database/forms histories were imported, that the Windows applications passed native testing, or that customer accounts are synchronized. These are separate verification tasks.

## Approved isolated preview build — 2026-10-22

Owner approved one coordinated Gravity preview deployment after the successful green Foundry employee-isolation workflow run. Trigger only the existing draft/alias preview workflow against Netlify site `fa5d39a0-bef9-4ff1-9c28-57d585d741d7`. Do not publish to the permanent domain, change DNS, merge into `main`, or modify the TMB Netlify site. AI credentials and live registration/authentication remain separate acceptance gates. A draft preview is not evidence that those services work.

## Controlled preview workflow retry after GitHub secret installation

The owner confirmed installation of `NETLIFY_AUTH_TOKEN` as a GitHub Actions repository secret and authorized a single draft/alias preview deployment to Gravity site `fa5d39a0-bef9-4ff1-9c28-57d585d741d7`. This documentation-only staging commit triggers the existing `gravity-site-migration.yml` path-filtered workflow. The workflow must use the *alias* deployment, never `--prod`. No DNS edits, TMB deployment, or `main` changes are authorized. Inspect workflow logs for an actual Netlify deploy ID; a green workflow check alone is insufficient.

## October 24 isolated preview verification

Request a new **staging alias only** build to verify the updated SOP Foundry Build Room guided tour, About / Help, and manual menu. Do not publish production or modify the original Thomas Monroe Books site. Confirm the generated deployment ID and preview route before reporting success.

## October 24: repair SOP Foundry onboarding boot

The first SOP tour and embedded Help failed to mount because their script-element IDs collided with the dynamically created container IDs. Fixed both collisions in the isolated migration branch. Rebuild the staging alias only for verification; keep production and Thomas Monroe Books unchanged.

## October 24: Build Room visible tour and preview notice QA

Stage a new isolated gravity-migration alias build to check First SOP Guided Tour positioned immediately below the Build Room header and the nonblocking staging preview notice. Inspect tour mounting, help/menu operation and viewport on desktop/mobile before customer release. Do not change the public TMB site or publish Gravity production.

## October 24: guided-tour visual QA corrections

Request isolated staging alias build after changing first-SOP tour highlight to crimson and conditional Resume Tour visibility and synchronizing the Build Room section with tour steps. Validate all seven steps in browser. Keep public domains, production deploy, and original TMB site unchanged.

## October 24 — Shift Lab visual QA deploy

Deploy the current migration branch to the **gravity-migration preview alias only** to verify new Shift Lab steampunk clockwork artwork and the crimson guided-tour focus outline. Do not deploy to production, enable continuous builds, modify TMB, or modify DNS. Test staging before release.

## October 24 — Shift Lab direct workspace entry staging deployment

Rebuild the isolated `gravity-migration` preview alias with Shift Lab direct-entry fix (commit `3231ff7337675d9aebbffe5ee88a3fd8b879f619`). QA that `/gravity-shift-lab` enters the scheduling workspace without a second click, retaining steampunk clockwork visuals and the crimson guided-tour outline. Never publish production, change DNS, enable continuous builds, or change Thomas Monroe Books.

## October 24 — explicit redeploy retry (Shift Lab)

User requested a retry of the existing isolated staging branch deploy. Invoke the path-filtered Gravity migration GitHub Actions workflow by this documentation change. Target the `gravity-migration` alias of site `fa5d39a0-bef9-4ff1-9c28-57d585d741d7` only; do not touch the public production site, original TMB, DNS, or continuous build settings. Verify `/gravity-shift-lab` enters the workspace and inspect the deployed content.

## October 24 — Shift Lab hero obstruction and redundant entry correction

The latest screenshot showed the default Shift Lab link still at the oversized introductory hero with decorative gears overlapping explanation text. Stage the direct-workspace-by-default correction from commit `76711052f09f4c6bb7c99fb64551dfb72a0da4ac`. Preserve the original hero for optional `?intro=1` and retain a subdued clockwork motif in the scheduling workspace. Preview alias only; no customer publication or production changes.

## October 24 — Shift Lab guided tour action overlap fix

Staging alias QA: Shift Lab's 31-step guided tour actions were inaccessible behind the fixed preview notice and Gravity Guide launcher. Commit `0affed9cfb115ee892049db76586d3d13a97d470` moves the tour panel to the top, makes its actions sticky, and temporarily hides overlapping launchers only while the tour is active. Deploy to isolated gravity-migration preview alias; do not publish or change original TMB. Verify controls remain accessible at common desktop and mobile heights.

## October 24 — cache-busted Shift Lab tour overlay release

The prior overlay repair could not reach customers with the unchanged script URL version. Updated Shift Lab's first-schedule tour asset query to `20261024-tour-overlay-fix` to invalidate browser/service-worker URL caches. Trigger isolated preview alias redeployment for visual QA; do not publish production or alter TMB.

## October 24 — Inventory Center next-program static QA

Checked 29 first-inventory guided steps against the current Inventory Center application's HTML: all 29 target element IDs exist. Verified application references for manuals, tour script, backup, restore and main views. Discovered nine hard-coded absolute links to the Gravity production host from the inventory application (tool navigation and manual); changed them to relative same-origin routes to avoid accidentally leaving the isolated staging site while testing (`94c226d826447d4df6ffb227e7c6d55a4343e3bd`). The explicit migration-warning link to the existing TMB site remains intentional. Trigger staging alias only. Dynamic 29-step completion, inventory posting, backup/restore integrity, barcode hardware, offline support and Windows parity are not certified by source inspection; do not mark release ready.

## October 24 — Voice credential rotation staging verification

The owner reports replacement of the expired `OPENAI_API_KEY` in the isolated Gravity Netlify project. Redeploy the existing migration branch to the `gravity-migration` staging alias using GitHub Actions, without touching production. Verify live `gravity-tts` Cedar and `gravity-guide` requests return success before claiming restoration; check Work Study and Ask Gravity separately. Do not include or expose credentials in commits or logs.

## October 25 — Customer-registration continuity audit (read-only)

Verified directly against both Netlify site form inventories:
- Thomas Monroe Books `gravity-registration`: **15 stored submissions** on original Netlify project, not 15 proven Identity accounts; do not mislabel form submissions as account records. The destination Gravity Netlify project has **0** recorded `gravity-registration` submissions.
- Both registration forms have the same 16 named fields, including consent, provider/method, contact and operation profile fields. A copied HTML form does not migrate those stored submissions.
- Source `site/register.html` submits as a Netlify Form to `/registration-thanks`; the optional social-provider script only pre-populates the form after an Identity login when available. Consequently the 15 form submissions do not establish 15 existing login accounts.
- Exact user identities/consent and deduplication cannot be audited using current Netlify integration: it offers form metadata/counts but not a submission-list read or import. No submissions were copied or modified. Preserve original Netlify project and submissions; obtain a secure original-project CSV export and approved destination handling before considering records migrated.
- Do not submit duplicate registrations for existing customers or activate social sign-in on the new project without verifying provider configuration and access continuity.
- Existing SOP Foundry Employee Connection uses `@netlify/database` on a separate project; no evidence yet that original employee data exists in the destination database. Freeze no data; delete none; test workspace continuity using a non-production test workspace only.

**Release gate:** registration and Employee Connection migration remain unresolved, despite equal form field definitions. Preserve the legacy site and its data until a verified transfer/access plan is complete.

## October 25 — final access audit: download-gate security limitation

Read-only inspection confirmed that registration HTML posts as a Netlify Form to `/registration-thanks`, and that the browser-side download gate currently sets `gravity_founding_year_download_access_v1=registered` whenever `/registration-thanks` is visited. **The current implementation does not prove a successful registration submission before granting browser-local access.** This is an application behavior limitation, not a database migration, and must not be represented to customers as authenticated download access. Static download files are also publicly URL-addressable; do not promise enforced membership or secure download entitlements on this scheme.

Live verification attempt: the current browser/web fetch mechanisms could not access the public staging alias, so they could not submit a synthetic registration, establish PDF/ZIP HTTP responses, or render mobile viewports. The Netlify form metadata shows a destination form registered with zero submissions; this alone does not prove end-to-end POST handling. Avoid contaminating actual opt-in/consent counts with automated synthetic accounts. No production or customer records changed.

**Release decision:** website navigation/file parity is progressing; registration is a lightweight form and browser-local convenience gate, not actual identity proof. Before public transition, either explicitly accept this low-friction model with accurate copy and reliable post-submit UX, or separately design authenticated access. Preserve original form submissions and consent history; no automatic import or re-registration assumptions. Employee Connection customer data migration not required per owner, but new-workspace test remains necessary.

## October 25 — lightweight Founding Year registration flow correction

Stage commit `6bc5e0cb470c990cd12d2805ac8f787042569f89` to isolated gravity-migration alias only. Instead of marking every visitor to `/registration-thanks` as registered, the client now submits the actual Netlify Form via URL-encoded POST and records browser-local convenience access only after a successful response. Failed submissions retain form data and explain retry. This remains a lightweight browser gate, **not authenticated protected downloads**; static URLs remain public. Existing registered browser storage remains recognized. Require real-form submission QA and confirmation that the new Gravity Forms submission count increments before public deployment. Do not modify TMB.

## October 25 — Final branding and public switch readiness review

Audited Home, About, Books, Start Here, Gravity Assist, Windows Programs, Registration, SOP Foundry, Shift Lab, Inventory Center, Work Study Lab, and Testing Room on isolated migration branch. All 12 carry the mandatory migration-preview warning, and none use a legacy Thomas Monroe Books canonical URL. TMB branding is mostly publisher/history attribution, especially on About, but needs editorial review for public presentation. **Do not simply publish the staging alias as production:** the staging build intentionally injects the 'GRAVITY MIGRATION PREVIEW — NOT LIVE FOR CUSTOMERS' banner, links registration/download users back to TMB, and sets robots.txt disallow plus X-Robots-Tag noindex. This is incompatible with a public launch. The production build must remove those preview-only notices and indexing blocks while retaining publisher attribution, existing registrations, and TMB fallback until cutover validated.

Release gates outstanding: existing Netlify Form registration submissions are not imported (15 original submissions preserved), actual phone viewport check remains unverified, social OAuth is not established on new Netlify site, and new hosted employee workspace should be tested before customer launch. Current registration and book download, voice playback, and GitHub Windows release presence passed earlier checks. A release checklist, rollback plan, and isolated production-ready build QA are required before changing public DNS/hosting. Do not alter original TMB site or publish production without explicit owner approval.

## Cedar voice latency pilot — October 25

Changed only the migration branch `site/assets/js/gravity-guide-ai.js` in commit `4861e330`. Gravity now synthesizes a short first speech segment (~210 characters), queues subsequent segments (~600 characters) while the first plays, and plays all speech sequentially. Full written answer unchanged, Cedar remains default, voice cancellation still uses the speech token, and Cache API reuse remains. JavaScript syntax parsing passed. This is a **staging-only pilot**, not yet empirically latency tested, and must be validated for speech completion, punctuation, interruption, audio gaps, simultaneous requests, and actual first-sound delay. No voice-performance guarantee until tested. Do not merge to main or release without passing pilot QA.

## Cedar varied acknowledgment pilot — October 25

Staging change `495eb1fc`: if a guide request is still awaiting the answer after 2.2 seconds and voice is on, play a short varied acknowledgment selected from ten phrases with last-five anti-repeat rotation. The actual answer interrupts the cue when available and immediately speaks; written response remains independent. Audio uses the existing TTS endpoint/cache; **first-time acknowledgments are not pre-recorded and may have network latency**. Requires live QA for overlap, interruption, speed, and phone access; do not treat as production-ready yet.

## Cedar 8-second delay follow-up

Netlify request logs showed successful Gravity Guide and TTS requests with multiple-second spacing, indicating working services but no evidence of fast audio-start latency. Updated staging `gravity-guide-ai.js` to request and browser-cache a single selected short Cedar acknowledgment shortly after the page loads, instead of first generating the phrase after the user has already waited 2.2 seconds. It is only played if the real answer remains pending; it may incur one extra TTS request per fresh session, and its preload may not finish before a very rapid first question. Acknowledgment must not interrupt or prolong delivery of the real answer. Javascript syntax check passed; **first-sound latency not yet proven**. User should test after staging preview deploy, inspect transition and measure voice startup. Public production unchanged.

## Cedar audio-wait acknowledgement — October 25

Identified actual logic issue: the previous acknowledgment timer only watched the answer-text HTTP request; for fast text responses, it never fired, yet audio synthesis then took ~8 seconds. Staging change `541257af` now starts a cached Cedar cue 1.3 seconds into **audio synthesis**, with cancellation as soon as answer audio is ready. The cue prefetch remains speculative and may not finish; first-sound latency still requires user testing. Speech and cue overlap must be checked before release. No public production deploy.

## Immediate Cedar prerecorded cue pilot — 2026-10-25

GitHub workflow `.github/workflows/gravity-cedar-acknowledgments.yml` was added to generate 8 Cedar MP3 clips under `site/assets/audio/gravity-ack/` using the existing TTS endpoint (CI result not independently verified yet). Migration-only Gravity Guide now preloads local Cedar MP3, begins playback on the Ask click when voice is on, and stops the cue **only when the real speech actually starts**, bridging the observed 7–8 second audio generation delay. Voice off skips cue. The assets MUST exist in deployed build, otherwise no prereply is heard. Validate successful recording CI run, MP3 existence and playback, cancellation, full real speech, browser autoplay, and latency before public release. No change to production branch.

## October 25 — prerecorded voice deployment diagnosis

Eight Cedar MP3 assets exist on the migration branch at `site/assets/audio/gravity-ack/cedar-01.mp3` through `cedar-08.mp3`, but their generation happened in a CI `[skip ci]` commit and the preview deployment is triggered only by specific paths. A live preview could therefore still be serving an older build without these files. Additionally, the homepage script URL had an old fixed cache-busting query, potentially retaining outdated JavaScript. Commit `505c0a1e` updates the homepage script version. This docs change is intentionally triggering the isolated **staging** deployment with the prerecorded clips now committed. Before calling this fixed, independently confirm staging deploy success and 200 responses for actual Cedar MP3 files, then test audible prereply. Neither successful backend TTS responses nor a branch file's existence proves a deployed clip.
