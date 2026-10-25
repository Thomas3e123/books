# Gravity public launch — release decision and rollback checklist
Date: 2026-10-25 | Scope: proposed Gravity public site only | **NO LAUNCH AUTHORIZATION**
 
## Evidence received
- Owner screenshot: GitHub Actions workflow "Gravity production candidate — offline QA only", run #4, commit `71849d4`, green success indicator. This demonstrates offline artifact preparation/static checks passed. It is NOT a live production deploy, mobile test, backend integration test, or DNS switch.
- Owner successfully submitted a form on the Gravity migration preview and downloaded one book. Netlify destination `gravity-registration` metadata was previously confirmed at 1 submission; original TMB form had 15 submissions. No automated customer-record migration occurred.
- Navigation/static asset and Windows GitHub release links reviewed in earlier migration checks. Availability of a release asset is NOT proof Windows install or functional parity.
 
## Required before owner is asked to authorize launch
- [ ] Inspect generated artifact from successful run #4 for index, book/download, sign-in, menus, CSS, JS, all program entry paths; confirm candidate not empty and preview-specific banner/index restriction absent.
- [ ] Preview candidate via a separate **non-public, access-controlled** deploy and complete customer registration (new test submission), download and redirect tests; ensure form routing and serverless functions use the intended new Netlify project. Do not turn off staging noindex on a public-facing review URL.
- [ ] Phone viewport/real mobile user test of menu, registration, Books, main four programs, and Testing Room. Mark Work Study Lab beta features separately from website launch basics.
- [ ] Test new Employee Connection workspace creation, sync, and employee login against new staging backend, using disposable test records only. No production employees or QR codes exist yet.
- [ ] Confirm publisher/author language and public business address/email in metadata; remove testing copy only on release build, not staging branch.
- [ ] Determine whether original 15 Netlify registration submissions need consent-preserving export/import, or if records remain on legacy Netlify as a permanent archive. Preserve timestamps and subscription consent. **No silent imports**.
- [ ] Determine whether Google/Facebook social login should be supported; if unavailable, don't advertise it. Normal email form is primary route.
- [ ] Check proper release host/canonical domain, SSL, Netlify Forms, environment variables, TTS, serverless functions, redirects, robots and sitemap. Do not reveal credentials.
- [ ] Record production Netlify deployment ID, build commit, page sample HTTP status, rollback deploy ID, and DNS before/after snapshot.

## Controlled cutover plan (requires explicit owner approval)
1. Preserve original TMB Netlify deploy and custom domain as rollback target. Do not delete or disconnect legacy project.
2. Freeze independent content changes briefly; record branch commit and production deploy IDs for both sites.
3. Promote verified Gravity candidate through a **separately approved production deployment**, verify on default Netlify domain first, and confirm database/forms/AI functions.
4. Change domain routing only after separately approving desired domains and SEO redirects; maintain TMB attribution/legacy URL preservation.
5. Immediately smoke-test homepage, registration/form receipt, download, navigation, Windows links, SOP Employee Connection, Ask Gravity and Cedar voice.
6. If critical smoke checks fail, restore recorded known-good deploy/domain mapping and re-test; preserve and reconcile any registrations submitted during transition. Rollbacks of code do **not** automatically roll back database mutations or submitted forms.
 
## Current disposition
**HOLD — release candidate static QA green; launch authorization NOT granted.** Most important outstanding proof: real-device mobile, candidate live preview, employee backend, and registration/consent preservation decision. Existing `thomasmonroebooks.com` remains untouched.
