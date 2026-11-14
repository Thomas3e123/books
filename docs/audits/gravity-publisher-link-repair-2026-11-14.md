# Gravity PDF and package link repair

Date: 2026-11-14

## Scope

Follow-up to the product-document audit in PR #87. The four public-page wording findings were already addressed by merged PR #129. This repair addresses legacy Thomas Monroe Books destinations and customer instructions in Gravity PDFs and downloaded ZIP packages.

## Changes

- Changed every Thomas Monroe Books link annotation found in the 102 site PDFs to the matching Gravity URL. A post-change scan found zero PDF link annotations still targeting `thomasmonroebooks.com`.
- Repaired the review, private-feedback, current-release, and QR destinations in the feedback insert and the Founding Year insert. The optional Square donation destination remains unchanged.
- Repaired legacy links and publisher-domain instructions in the downloadable package guides, and updated the affected embedded PDFs in all 25 site ZIP packages.
- Refreshed internal SHA-256 lists for package members that changed, updated the customer policy page to link to the latest feedback insert, and regenerated `source-manifest.json`.

## Verification

- `scripts/verify-source.cjs`: passed for all 664 manifest entries.
- ZIP integrity and embedded-document scan: all 25 ZIPs opened; zero CRC errors and zero remaining `thomasmonroebooks.com` strings or link annotations in their PDFs and text documents.
- All 102 site PDFs opened during the link scan; zero retained Thomas Monroe Books link annotations.
- Rendered the feedback insert and affected Founding Year pages from the onboarding guide for visual review.

## Remaining document copy review

Some standalone PDFs still *print* the old publisher domain as historical or navigational text even though their clickable links were redirected. The current Start Here and System Overview guides, customer overview, companion packs, AI workbook, and one-page system ad are among the affected files. Those printed references need a separate copy/layout pass before claiming every visible mention has been removed. No live-site deployment or physical-device check is included in this source repair.
