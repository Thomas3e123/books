# Gravity Report confirmation metadata repair — November 15, 2026

The production builder stopped on `gravity-report-thanks.html`: its Open Graph URL pointed to the Gravity Report landing page, and it had no canonical URL. Added a self-canonical URL for `/gravity-report-thanks` and changed the Open Graph URL to match. Replaced the stale share title/description with general Gravity Report email wording.

The separately modified Brevo signup copy and flow were excluded from this repair. The correction was prepared against the committed page version and its source-manifest hash was updated without staging or committing the in-progress Brevo content.

Verification in a clean, detached worktree: `node scripts/verify-source.cjs` passed for 664 files; `node scripts/build-gravity-production.cjs` built 153 pages; `node scripts/test-gravity-report-reading.mjs` passed. No deployment was made.
