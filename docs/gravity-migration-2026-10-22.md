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
