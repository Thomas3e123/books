# Gravity page-sharing metadata repair — November 15, 2026

A source cross-check compared canonical page URLs with Open Graph share URLs and compared share titles/descriptions with page-specific metadata.

## Repair

`gravity-fulfillment-center.html` used the homepage's social share title and summary, and its Open Graph URL pointed to the homepage even though the page has its own canonical URL. Updated Open Graph and Twitter title/description fields to match the Fulfillment Center page and changed the share URL to its canonical page URL.

## Source review

The canonical and Open Graph URL paths now agree for all 96 top-level HTML pages that define both fields. This is source-level review only; no live deployment or social preview fetch was performed.
