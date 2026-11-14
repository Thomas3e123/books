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

## Follow-up printed-copy repair — 2026-11-14

The initial scan found printed references in 13 standalone PDFs. `scripts/repair-gravity-printed-domain-copy.py` updates the old references in the current Start Here and System Overview guides, eight companion packs, the 325-prompt workbook, the customer overview booklet, and the one-page system ad. The companion-pack note now directs readers to the Gravity releases page. The overview guides retain their clickable routes; the companion-pack release link and printed Gravity addresses are clickable.

The user then requested a Gravity link somewhere on every PDF. The full site contains 102 standalone PDFs plus 147 PDFs inside its 25 downloadable ZIP packages. A clickable `gravityleadershipsystem.com` destination is now present in every one. The repair added links to 70 standalone PDFs and 128 packaged PDFs that had none; existing destination links were retained, and printed Gravity addresses without a link were made clickable. Internal ZIP SHA-256 manifests were refreshed where PDF contents changed.

Post-repair scan: all 249 PDFs open, each has a clickable Gravity destination, zero printed `thomasmonroebooks.com` text remains, and zero PDF link annotations target that domain. The Start Here guide retains 12 clickable links and the System Overview retains 14; all point to Gravity. All 25 ZIP CRC checks passed. Rendered updated guides, inserts, representative book pages, and footer links for visual review. `scripts/verify-source.cjs` passed for all 664 manifest entries.

The PDFs' original editable sources for this set are not present in the repository. The repair script therefore applies controlled text redactions and redraws only the affected copy. The updated PDFs are included in this follow-up source change. Phone/device behavior still requires a physical-device check.
