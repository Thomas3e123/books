# Gravity Report glossary link repair — November 15, 2026

## Finding

The glossary linked terms to issue cards by in-page fragment. Those cards are populated and reordered by the article catalog script; if the catalog request fails, upcoming cards are hidden, so glossary links to later published stories may not reach a readable article.

## Repair

Changed all 15 glossary story references to the permanent Gravity Report article routes. The links now lead directly to their issue regardless of whether the catalog script loads. Updated the source hash for `site/gravity-report.html` in `source-manifest.json`.

## Schedule review

Source review found all 30 issue numbers represented once, in order, with matching titles and schedule dates through January 19, 2027. As of November 15, issue 11 (November 13) is released; issue 12, “Why Do Restaurant Inventory Counts Never Match?”, is next on November 17. No schedule changes were needed.

No build, live browser test, or deployment was performed.

## Regression guard

Added a regression check requiring all 15 glossary story links to use permanent article routes, then requested each unique route through the Gravity Report handler at the current published date. `node scripts/test-gravity-report-reading.mjs` passed, preserving the full 30-issue schedule and existing article/newsletter checks. This protects the source change; it does not publish it.
