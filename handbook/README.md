# Gravity public Handbook Creator

Public landing: /gravity-handbook-creator. Editor: /handbook-creator/index.html.
The original private Sites project, Android/Windows builds and Square sandbox bridge are preserved.

Free PDF and Word export access is decided on the server and lasts through October 1, 2027 inclusive in America/Chicago. No account, card or checkout is needed during this period. Projects remain in browser IndexedDB; editable backups move work between the web, Android and Windows versions.

The original source modules drive interviews, styles, previews and exports. Build output is derived from reviewed source and excluded from the source manifest; no PDF/Word generator is shipped in the public client bundle. The server still provides previews after the offer expires, and requires a verified license for exports.

## Payments after the Founding Year

Price: USD 29 once, unlimited handbooks. Production Square Payment Links, signed checkout tickets, payment verification and reusable signed unlock codes are implemented. Pending, underpaid, mismatched, tampered and refunded receipts do not unlock exports. The server rechecks paid receipts when exporting. Free-period checkout requests are blocked to prevent accidental charges.

Before paid sales, set production Function-scoped `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID` in Netlify. The existing `GRAVITY_HANDBOOK_BRIDGE_SECRET` signs tickets and licenses: preserve it, and plan explicit license migration before rotating it. Sandbox credentials do not enable live payments. The return URL is the public Gravity landing page. Test a real checkout and refund before announcing paid availability; no live transaction has been performed for this release.

Build: npm ci; node scripts/update-manifest.cjs; npm run build.
Checks: node scripts/test-handbook-public.mjs. Coverage includes the inclusive free-period boundary, free PDF/Word generation without payment calls, post-period export gating, valid/refunded/pending/underpaid/tampered license behavior and origin checks.

Deployment uses the existing reviewed Gravity production workflow. It copies this source directory into the isolated deploy root so function imports resolve. No changes to the TMB site or private test audience are required.
