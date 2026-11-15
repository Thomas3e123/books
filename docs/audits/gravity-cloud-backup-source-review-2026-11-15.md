# Gravity encrypted cloud backup review — 2026-11-15

## Source review

Reviewed `functions/gravity-cloud-backup/index.mjs`, `core.mjs`, the database migration, and `site/assets/js/gravity-cloud-vault-v1.js`.

The implementation has the expected controls for the current two workspaces: server-derived Netlify Identity account IDs; same-origin checks on writes and deletions; strict workspace and method allowlists; browser-encrypted AES-GCM envelopes; bounded request size; optimistic revision checks; five-version retention; explicit deletion confirmation; and local rollback checks during recovery. The recovery phrase is held only in the open tab and is not posted to the function. The Identity deletion hook removes that user's backup rows.

## Production readiness evidence

Netlify's aggregate production status data showed one HTTP 200 response from `/gravity-cloud-backup/health` during the preceding 24 hours. This endpoint returns 200 only when the production backup table exists. No customer account or backup content was read.

## What remains unverified

This confirms that the production database and backup table were reachable when the health request ran. It does **not** verify account signup/confirmation, encrypted upload, multi-device restore, recovery after an incorrect passphrase, deletion under an open tool tab, or user-facing error recovery. Those require a controlled synthetic account and real flow execution; no customer data was accessed and no hosted records were changed during this review.
