# Gravity Restaurant Leadership System — Final production-release audit
**Audit date:** October 26, 2026 (GitHub Actions UTC timestamps).
**Disposition: HOLD — release is NOT approved, and no public/production or Squarespace DNS change has been made.**
**Scope:** isolated `feature/gravity-migration-phase1-2026-10-22`, new Gravity Netlify project only; legacy `main`, original TMB site, its custom domain and data remain unchanged.

## Evidence and test status

| Gate | Status | Evidence and limits |
|---|---|---|
| Static candidate generation | PASS | Audit workflow `40283380056`: pinned dependency install, source integrity, staging guards, 148 HTML files, public canonical `https://gravityleadershipsystem.com`, sitemap, private-page noindex and critical routes. Build created **offline only**. |
| Website navigation and assets | PASS, with exception below | Static customer service audit confirmed 141 local assets, working relative links and four current Windows manual sets (PDF/DOCX/HTML). Source origin tests, QR presets, and isolated SOP employee contracts passed. |
| **Gravity Report original articles and RSS** | **PASS — RESOLVED** | The alleged six missing paths were a **false positive**: articles, feed and sitemap are generated dynamically by the existing `functions/gravity-report/index.mjs` (not static files). Verified original approved article bodies unchanged, 5/5 articles serve HTTP 200, RSS contains 5 items, article sitemap contains 5, future article embargo holds, Gravity canonical URLs and preview noindex correct. Live read-only audit `40307632095` PASS on both staging and release-review. Strict corrected link audit `40307495668` PASS. |
| Staging and release-review HTTP/noindex | PASS after repair | Audit `40283380056` live-preview job: both preview aliases returned HTTP 200 on all selected site and app routes; noindex headers; hosted Foundry health check succeeded. |
| Staging freshness | REPAIRED | Initial final audit `40282449861` discovered `gravity-migration` alias was returning older Oct. 22 Book Reader files and a 502 function error, like the current old production deploy. We redeployed **only the noindex staging alias** through isolated workflow `40283157937`; current preview is fresh and backend health now PASS. No production publication occurred. |
| Book Reader | PASS | Fresh mobile-browser checks `40283380056`: registration gate, 15 book titles, front-matter skip, one Pause, audio seek, precise resume, continuous on/off part transitions, EQ, volume, sleep, wake-lock lifecycle (simulated browser audio). Owner separately reported real-phone Cedar reader worked great on October 26. |
| Live downloads hosted on Netlify | PASS | Read-only HEAD audit on the **release-review** alias `40283122999`: 141 distinct local download URLs checked and returned valid non-HTML responses, 0 failures. |
| GitHub Windows release attachments | PRESENT; installers NOT VERIFIED | Eleven linked ZIP/EXE assets belong to published prerelease GitHub release tags `windows-beta-2026-10-13`, `gravity-windows-preview-2026-10-19`, and `gravity-inventory-guided-clickfix-2026-10-19`. Release API lists those named files as uploaded, but customer Windows installation / integrity re-hash / full launch candidate parity were **not** proven by this audit. |
| Existing Gravity production host | **FAIL for launch readiness** | Netlify current production deploy remains `6adae16a6c1e94ead73d9e7b` (Oct. 22), and old deployed `/foundry-hosted/health` returned 502. Netlify request logs reported `MissingDatabaseConnectionError`. The newer tested preview/review aliases respond successfully, but it is not safe to point the permanent domain at the old production deploy. |
| Domain, DNS, SSL | NOT VERIFIED FOR GO-LIVE | Owner confirmed `gravityleadershipsystem.com` active at Squarespace and added as primary to the new Gravity Netlify project with `www` redirect. Netlify says **Pending DNS verification**. Read-only DNS check `40281052943` confirmed apex and `www` still point to Squarespace and Google Workspace MX is `smtp.google.com`. HTTPS on the permanent domain is not established. |
| Registration, reviews and subscription data | PASS for form detection; migration decision pending | New Gravity Netlify project currently has 4 `gravity-registration` submissions and 1 `gravity-report-opt-in`. Original TMB project retains 15 Gravity registrations. Do not merge or delete consent records without separate approval. |
| Connected Google Workspace mailbox | NOT VERIFIED | DNS MX exists, but the new domain's mailbox send/receive end-to-end is not demonstrated in this audit. Preserve email MX/SPF/DKIM/DMARC. |
| Other mobile tools and user acceptance | NOT VERIFIED | Real-device acceptance for Shift Lab, Inventory Center, Work Study Lab beta, Testing Room and final release-review registration/download flow is incomplete. |
| Rollback | DEFINED, NOT EXECUTED | Preserve TMB production deploy `6ad7b614109e5fdf878475f8` and Gravity prelaunch production deploy `6adae16a6c1e94ead73d9e7b`. Never overwrite legacy forms/data. Store exact final source SHA, candidate artifact hash, deploy ID, DNS record baseline before separately authorized cutover. |

## Gravity Report false-positive audit corrected (October 26, 2026)
The original article content was **already present** in `functions/gravity-report/articles.json`; 20 additional prepared articles are in adjacent editorial volumes. Pages are served by a **Netlify serverless function**, not stored as `site/gravity-report/*.html` files. The earlier offline auditor treated serverless routes as missing physical assets. The 5 published article routes and `/gravity-report/feed.xml` were incorrectly labeled launch blockers. Their original contents were preserved; **no new or reconstructed article copy was invented**.

- Updated the strict link auditor to recognize the actual deployed function route declarations and known 30-issue inventory. Audit `40307495668` PASS.
- Changed article canonical URLs, RSS links/GUIDs and article sitemap links in the isolated Gravity branch from legacy TMB host to `https://gravityleadershipsystem.com`. Kept **Thomas Butler** byline and **Published by Thomas Monroe Books** attribution.
- Added `X-Robots-Tag: noindex, nofollow` to Netlify staging/review function responses; future issues remain HTTP 404 until their announced Central Time release.
- Verified using read-only live checks on both Gravity preview aliases: **5/5 full original published articles HTTP 200 with unchanged bodies; 5 RSS items; 5 article sitemap entries; future issue HTTP 404; correct canonicals and preview noindex**. Workflow `40307632095` PASS.
- These resolved editorial concerns no longer block launch; outstanding production/database, domain TLS and final acceptance gates **still block launch**.

## Release sequence, NOT YET AUTHORIZED
1. **COMPLETED:** Confirm original serverless articles/feed and correct strict auditor; 5 live articles/RSS and their preview indexing protections passed. Keep this verified in the final release candidate.
2. Complete remaining real-device and business-mailbox end-to-end acceptance and confirm consent-handling decision.
3. Freeze source at exact SHA; regenerate and audit the offline candidate with all required gates PASS.
4. Obtain **separate, explicit** approval to promote that exact candidate to production of the **new Gravity Netlify project only**. Verify updated default `netlify.app` production site, hosted database/function health, forms, critical downloads and customer navigation **before any DNS cutover**.
5. Only after approved production validation, obtain separate explicit approval to change **website-only** Squarespace apex A and `www` CNAME records; preserve Google Workspace email records. Verify TLS, redirects, canonical URLs, mail and rollback path. Leave original `thomasmonroebooks.com` intact.

**Status summary: staging restored; comprehensive automated site and Reader checks green; original five articles and RSS proven healthy; stale Gravity production/database + pending permanent-domain SSL and acceptance remain launch blockers. NO PRODUCTION RELEASE.**
