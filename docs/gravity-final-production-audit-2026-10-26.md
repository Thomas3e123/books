# Gravity Restaurant Leadership System — Final production-release audit
**Audit date:** October 26, 2026 (GitHub Actions UTC timestamps).
**Disposition: HOLD — release is NOT approved, and no public/production or Squarespace DNS change has been made.**
**Scope:** isolated `feature/gravity-migration-phase1-2026-10-22`, new Gravity Netlify project only; legacy `main`, original TMB site, its custom domain and data remain unchanged.

## Evidence and test status

| Gate | Status | Evidence and limits |
|---|---|---|
| Static candidate generation | PASS | Audit workflow `40283380056`: pinned dependency install, source integrity, staging guards, 148 HTML files, public canonical `https://gravityleadershipsystem.com`, sitemap, private-page noindex and critical routes. Build created **offline only**. |
| Website navigation and assets | PASS, with exception below | Static customer service audit confirmed 141 local assets, working relative links and four current Windows manual sets (PDF/DOCX/HTML). Source origin tests, QR presets, and isolated SOP employee contracts passed. |
| **Gravity Report published links** | **FAIL — LAUNCH BLOCKER** | Strict offline link audit found **six missing paths** in the release candidate: `/gravity-report/feed.xml` and five first-issue article URLs listed below. The homepage of The Gravity Report claims those articles are available, but their pages/assets are missing from the build. Cannot call this release ready. |
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

## Six confirmed missing Gravity Report routes
- `/gravity-report/feed.xml`
- `/gravity-report/why-do-my-restaurant-managers-keep-making-excuses`
- `/gravity-report/why-is-my-restaurant-food-cost-so-high`
- `/gravity-report/how-do-i-get-restaurant-managers-to-follow-through`
- `/gravity-report/how-do-i-stop-restaurant-food-waste`
- `/gravity-report/why-cant-i-keep-good-restaurant-employees`

Initially the strict audit flagged 28 paths, but 22 were false positives from inline JavaScript `data-action` values and query-string relative URLs. The link auditor was corrected without changing customer content, leaving **6 genuine missing routes** across **7 link instances**. The article pages and RSS feed are not present in the feature branch or `main` at these expected paths. Do not invent the missing approved article content or silently link users to a different page.

## Release sequence, NOT YET AUTHORIZED
1. Restore approved Gravity Report articles and feed (or expressly defer that feature and correct all claims/links). Repeat strict link audit with zero failures.
2. Complete remaining real-device and business-mailbox end-to-end acceptance and confirm consent-handling decision.
3. Freeze source at exact SHA; regenerate and audit the offline candidate with all required gates PASS.
4. Obtain **separate, explicit** approval to promote that exact candidate to production of the **new Gravity Netlify project only**. Verify updated default `netlify.app` production site, hosted database/function health, forms, critical downloads and customer navigation **before any DNS cutover**.
5. Only after approved production validation, obtain separate explicit approval to change **website-only** Squarespace apex A and `www` CNAME records; preserve Google Workspace email records. Verify TLS, redirects, canonical URLs, mail and rollback path. Leave original `thomasmonroebooks.com` intact.

**Status summary: staging restored; comprehensive automated site and Reader checks green; 6 broken published-article links + stale Gravity production/database + pending permanent-domain SSL and acceptance remain launch blockers. NO PRODUCTION RELEASE.**
