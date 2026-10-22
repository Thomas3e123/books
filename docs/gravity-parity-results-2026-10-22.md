# Gravity Migration — Parity Verification Report

**Date:** October 22, 2026  
**Scope:** Existing published Thomas Monroe Books website versus the new Gravity preview, source copy and responsive navigation.  
**Status:** **Static parity and navigation gate PASSED.** No approval yet for production-domain cutover or customer data migration.

## Passed checks

| Gate | Evidence | Outcome |
|---|---|---|
| Every HTML page on the published websites | [Read-only live comparison — run 39774140961](https://github.com/Thomas3e123/books/actions/runs/39774140961) | 148 / 148 returned HTTP 200, with **0 unexplained differences** in page titles, navigation markup, image counts, form counts, and application script counts. |
| Source structural parity | [Local build comparison — run 39774416467](https://github.com/Thomas3e123/books/actions/runs/39774416467) | 148 HTML pages, 120 common page nav menus, critical CSS/JS/redirects unchanged; **0 structural exceptions**. |
| Actual desktop and mobile responsive menu | [Chromium side-by-side screen test — run 39774416467](https://github.com/Thomas3e123/books/actions/runs/39774416467) | Menu matched at **390, 820, 1280, 1920 px**. All 17 homepage navigation links were available. **0 additional blocked menu links** from the Gravity preview notice. |
| Working staging code | [Gravity preview build — run 39774546156](https://github.com/Thomas3e123/books/actions/runs/39774546156) | Source build and static verification **PASSED**. |
| Public TMB preservation | Netlify project `thomasmonroebooks` | No migration changes published to TMB. |
| Future Gravity project | Netlify project `gravity-leadership-system` | Still the previous published preview. Corrected source is committed on staging branch, but **has not been redeployed**. |

## Explained runtime difference

Thomas Monroe Books' live Netlify responses contain **one additional platform-injected script** that is absent from both sites' tracked HTML source. The local TMB source and Gravity source retain the same application scripts. The live-page parity report excludes **only** this TMB-only injection after comparing the exact script counts to the checked-in source; no additional application script loss was detected. Analytics/monitoring behavior remains a separate functional migration consideration.

## Navigation issue and fix

- The earlier Gravity preview had an in-document warning block. It pushed down the sticky header and reduced menu space on mobile.
- The initial test detected that warning caused extra obstruction of the *Start Here* link at 820 px.
- The corrected candidate uses a floating warning layered **below the navigation/header**.
- On the corrected **local** candidate, Chromium found the same 17 homepage navigation links and the same mobile visibility as TMB at all four widths, with **zero extra overlay obstruction**.
- This fix **is not yet reflected on the published Gravity preview**. It requires one approved new build/deployment to the Gravity project, not to TMB.

## Remaining launch blockers (not covered by HTML/code parity)

- Netlify Forms are separate across sites. TMB had **13 gravity-registration submissions**; new Gravity site had **no registered forms/submissions** during inspection. Export/retain and decide how to preserve registration records before cutover.
- Verify provisioned database state/data for hosted SOP Foundry, training/QR links, testing rooms, and Work Study. Migrations alone do not mean live data migrated or connections are working.
- Verify `OPENAI_API_KEY`, TTS origin allowlists, hosted app/Google OAuth configuration and other Netlify function environment settings on the new project. Do not move credentials into Git.
- Test each Windows download, installer link, book PDF, manuals, newsletter feed/date gating, contact and registration submission, mobile navigation, and customer workflow.
- Verify the external Gravity Invironment deploy remains independent and links correctly.
- Prepare durable old URL `301` redirect plan and keep Google Workspace email MX/SPF/DKIM unchanged during DNS/web switch.

## Source and recovery

- Original TMB source: `main` at `35cf7ce55c0a33d4396100f2b47d68c0bb847e6b`
- Backup branch (do not move): `backup/tmb-before-gravity-migration-2026-10-22`
- Future Gravity project staging branch: `feature/gravity-migration-phase1-2026-10-22`
- Isolated QA branch: `audit/gravity-parity-2026-10-22`

**Release decision:** **PASS for static appearance and navigation equivalence; HOLD for published corrected preview and all customer-facing/backend migration gates.** Keep existing live sites and their domains unchanged.
