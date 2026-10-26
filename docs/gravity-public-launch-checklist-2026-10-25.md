# Gravity public launch — evidence, remaining gates and rollback plan
Last verified: 2026-10-25 (Central), GitHub Actions timestamps 2026-10-26 UTC.
Scope: Gravity migration branch only. **NO PRODUCTION LAUNCH, CUSTOM DOMAIN CHANGE OR TMB MAIN BRANCH CHANGE AUTHORIZED.**

## Latest independently verified deployment states

| Asset | State | Identifier |
| --- | --- | --- |
| Legacy TMB site | Ready; untouched | Netlify site `1548e212-4cfe-4751-ab81-f46936249304`, current production deploy `6ad7b614109e5fdf878475f8` |
| New Gravity project | Existing production deploy unchanged | Netlify site `fa5d39a0-bef9-4ff1-9c28-57d585d741d7`, current production deploy `6adae16a6c1e94ead73d9e7b` |
| Gravity migration preview | Green staging workflow #40263726970 | `https://gravity-migration--gravity-leadership-system.netlify.app/` |
| Gravity **offline** production candidate | Green candidate QA workflow #40265069303 | GitHub Actions release candidate artifact; **not published** |
| Gravity review alias | Ready; nonindexed via HTTP X-Robots-Tag and robots.txt | Deploy `6adecb6baefd5047dbb2beae`; `https://gravity-release-review--gravity-leadership-system.netlify.app/` |

IMPORTANT: Review alias is **not password-protected**, even though it is noindex. Do not enter real staff data or represent it as a private/customer-ready deployment.

## Customer registrations and data protection
- Original TMB `gravity-registration`: **15** Netlify form submissions (latest count checked 2026-10-25 Central). They remain on the legacy site, together with original Netlify consent/timestamp records.
- New Gravity `gravity-registration`: **2** submissions, verified through Netlify after owner's mobile test.
- No registration import, deletion, merge, or backfill has been performed.
- Default preservation recommendation: retain the original TMB Netlify project and its 15 submissions as a readable archive, without silently importing people/consents into the new system. Any later consent-preserving export/import requires separate explicit approval.

## Test evidence completed
- User mobile acceptance: site and menu navigation, book download, Netlify-received registration, Cedar acknowledgment, Employee Access login, SOPs, recipes, posters, training, and saved sample SOP all reported working.
- Employee Connection server: disposable live staging workspace creation, PIN validation, login, published SOP/recipe/poster read, quiz/acknowledgment, messages/activity, manager status, revision sync, stale training prevention — integration workflow #40258873709 passed. No actual River or customer records used.
- Candidate offline QA workflow #40265069303 passed: generated >100 HTML files, asset existence, no red migration banner, public canonical metadata intended for `https://gravityleadershipsystem.com`, same-domain sitemap, public index directives, and **intentional noindex on employee, manager, receipt and internal app pages**.
- Review alias: successful HTTP responses/noindex header for home, Books, registration, employee home and posters; successful live `foundry-hosted/health` on both staging and release review aliases.
- Candidate review previously returned function HTTP 502 because the build job had omitted `npm ci` / `@netlify/database` dependencies. Added dependency install and validated successful hosted function health in workflow #40265069303.

### Book Reader — extended mobile QA (October 26, 2026)
- GitHub Actions workflow #40279272279, **rerun completed SUCCESS**: simulated mobile-browser playback, one dedicated Pause control, Play/Resume labeling, +15/-15 seconds, volume independent of bass/treble, saved exact seconds and last book, Screen Wake Lock lifecycle, and all 15 book text entrypoints.
- Synthetic audio tests verified **continuous ON** automatically moves from part 1 to part 2 and plays both, and **continuous OFF** stops cleanly before the next part; this passed on migration staging and release review.
- Front-matter skip inspected for all 15 books; fixed SOP Library Volume 3 long contents list so listening starts at first controlled SOP (`V3-001`).
- **Owner's real-phone acceptance (October 26, 2026):** owner reported the Book Reader "worked great" after being asked to verify actual Cedar narration and playback. Record **Book Reader overall mobile experience: PASS (owner-reported)**. Do not overstate this as independently verified lock-screen/background operation or a measured full chapter transition; those specific behaviors are not individually documented. Browser tests used synthetic audio.

### Gravity domain DNS preflight (October 26, 2026)
- Owner confirmed Squarespace domain status **Active**.
- A **read-only** GitHub Actions DNS inspection #40281052943 succeeded; no DNS, mail, hosting, Netlify, or domain settings were changed.
- Authoritative NS: `nsa1.squarespacedns.com` through `nsa4.squarespacedns.com`.
- Apex A currently points to Squarespace: `198.49.23.145`, `198.185.159.144`, `198.49.23.144`, `198.185.159.145`. The `www` CNAME points to `ext-sq.squarespace.com`.
- Google Workspace MX is present: `1 smtp.google.com.`. **Preserve MX and other Google Workspace verification/authentication records** during website cutover.
- No Netlify apex/`www` DNS pointing has occurred. New Gravity Netlify project's primary host is still `gravity-leadership-system.netlify.app` and its production deploy is older than the tested staging/release-review aliases.
- Next sequencing: finish all release acceptance, attach domain to new Gravity project with appropriate approval, publish the exact reviewed candidate after explicit authorization, then change **website-only** A/`www` records at Squarespace and verify HTTPS/redirects. Leave `thomasmonroebooks.com` and Workspace mail untouched. No automated tool currently available to administer Squarespace DNS; never describe the domain as already live on Netlify.

## Must resolve before authorizing a public launch
- [ ] **Destination domain and SSL**: purchase of `gravityleadershipsystem.com` through Google Workspace / Squarespace Domains confirmed by Sept. 20, 2026 purchase email. Netlify Gravity project's primary hostname still only `gravity-leadership-system.netlify.app` (verified Oct. 26). A Sept. 20 Squarespace `[Action Required] Verify your Squarespace domain contact` message exists; **whether verified is not independently established**. Check domain registration is active. Confirm Squarespace DNS baseline (especially Workspace MX, SPF, DKIM, DMARC), attach domain ONLY to new Gravity Netlify site, verify SSL and final canonical host. **DO NOT switch apex/www DNS until the reviewed Gravity build is actually published on the new project's production domain and owner separately authorizes cutover**: at present the Netlify production deploy is older than the tested migration/review aliases. Preserve old TMB hostname and all mail records. Reference DNS targets after approval: `@` A `75.2.60.5` (or supported ALIAS `apex-loadbalancer.netlify.com`), `www` CNAME `gravity-leadership-system.netlify.app`; confirm final values in Netlify project dashboard before applying.
- [ ] **Final customer-facing candidate acceptance**: validate complete registration flow, book download, redirect, Windows download/manual links, all Gravity tool entrypoints, Ask Gravity voice, and employee operations on the **release-review** alias (the owner's previous acceptance was on migration staging).
- [ ] **Remaining mobile features**: direct real-device navigation/use of Shift Lab, Inventory Center, Work Study Lab, Gravity Assist, and Testing Room; flag Work Study Lab beta separately from baseline website launch readiness.
- [ ] **Social authentication and business mailbox**: Google/Facebook registration remains hidden; do not market those choices unless separately proven. Verify `thomas.butler@gravityleadershipsystem.com` receives mail end to end.
- [ ] **Consent handling decision**: owner explicitly approves keeping 15 original TMB registrations archived or requests documented consent-preserving migration. Never overwrite or delete existing consent records.
- [ ] **Review-access policy**: review alias is noindex but publicly accessible. Limit use to synthetic test data until access controls and launch posture are explicitly agreed.
- [ ] **Real launch permissions**: obtain explicit owner approval for public deployment and separately for any DNS/domain cutover. Preserve Netlify IDs, deployment IDs, last known-good commit, forms/export and rollback plan.
- [ ] **Final post-release smoke check**: HTTPS, menus, registration/form delivery, book downloads, Ask Gravity/Cedar, API functions, employee login, apps, resources and Windows links.

## Controlled production cutover and rollback (NOT AUTHORIZED)
1. Freeze changing content briefly; record verified source commit, offline artifact hash, legacy TMB deploy ID `6ad7b614109e5fdf878475f8`, and Gravity existing production deploy ID `6adae16a6c1e94ead73d9e7b`.
2. Preserve **legacy TMB custom domain/project, 15 registrations, timestamps and newsletter consent** as the safe fallback; verify export is possible without removing anything.
3. Obtain explicit approval for Gravity production deploy. Publish reviewed candidate only to **new** Gravity project; verify default Netlify host and forms/functions **before** configuring custom domain.
4. Approve and apply the exact domain/DNS mapping separately, confirm SSL, canonical host and safe forwarding of old links with retained TMB publisher attribution.
5. Immediately run smoke tests and inspect real registration receipt count. If essential functions fail, restore the known-good Gravity deploy and (if domain changed) original DNS/host mapping. Treat submitted forms and database writes as **non-rollbackable data** to preserve/reconcile separately.

## Current launch disposition
**HOLD — technical production-candidate and noindex review alias QA passed, but public domain configuration and the remaining release-specific mobile/functional acceptance and owner authorization are outstanding.**

**The River remains the first planned live operational pilot *after* approved launch; its branded private edition must remain segregated from the generic customer edition.**
