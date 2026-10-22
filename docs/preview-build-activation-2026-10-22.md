# Gravity staging publication request — 2026-10-22

This Git commit requests **one** new Git-connected Netlify build of the isolated Gravity project after automatic builds were reactivated by the site owner.

**Deploy target:** Netlify site `fa5d39a0-bef9-4ff1-9c28-57d585d741d7`, project `gravity-leadership-system`. The site's linked production branch must be `feature/gravity-migration-phase1-2026-10-22`, not `main`.

**Verified staging source:** the static preview contains 148 HTML pages, a noindex header, a staging banner repositioned below navigation, absolute links to the reachable Netlify preview host, and an intact TMB baseline. All full-site structural and mobile/desktop menu parity tests passed in the audit branch.

**Keep unchanged:** the TMB project `1548e212-4cfe-4751-ab81-f46936249304`, the independent Gravity Invironment project, the Squarespace-managed GLS domain, Google Workspace email DNS, production user data, original registration forms, all Git `main` files and the immutable pre-migration backup branch.

**Release gate:** this commit does not approve a custom-domain cutover, import customer data, or claim backend/customer-system parity. The public preview must remain marked as staging and noindexed.

**Credit discipline:** leave this document unchanged after the initial build; batch future changes and run non-deploy GitHub tests until the next explicit release.
