# Gravity comprehensive site-source sweep — 2026-10-30

Scope: Gravity migration branch only; source inventory of static pages, routes, assets, forms, JS syntax, report integrity and manager gate. This is not evidence that every external service or live customer workflow is functioning.

## Coverage

| Measure | Count |
| --- | ---: |
| files | 597 |
| html | 149 |
| js | 119 |
| links | 7075 |
| assets | 1040 |
| checkedJS | 119 |
| ignoredExternal | 30 |
| Gravity Report scheduled issues | 30 |
| High findings | 0 |
| Medium findings | 0 |
| Low findings | 0 |

## Findings by category

| Category | Count |
| --- | ---: |

## High findings


## Medium findings


## Low findings sample


## Most common missing path references


## Caveats

Dynamic routes, Netlify function paths, embedded client apps, and extensionless routes can generate false positives. Confirm any reported defect before changing public navigation or content.
The site/robots.txt source is intentionally staging noindex; a separate production packaging step must override it. Do not deploy raw staging files.
The site currently permits inline scripts in its CSP; tightening without migrating inline code would break existing application pages.
DO NOT change Thomas Monroe Books production or publish unreleased Report issues.
