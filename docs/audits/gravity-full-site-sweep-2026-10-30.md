# Gravity comprehensive site-source sweep — 2026-10-30

Scope: Gravity migration branch only; source inventory of static pages, routes, assets, forms, JS syntax, report integrity and manager gate. This is not evidence that every external service or live customer workflow is functioning.

## Coverage

| Measure | Count |
| --- | ---: |
| files | 597 |
| html | 149 |
| js | 119 |
| links | 7097 |
| assets | 1040 |
| checkedJS | 119 |
| ignoredExternal | 30 |
| Gravity Report scheduled issues | 10 |
| High findings | 2 |
| Medium findings | 27 |
| Low findings | 0 |

## Findings by category

| Category | Count |
| --- | ---: |
| missing-action | 19 |
| redirect | 4 |
| duplicate-id | 2 |
| missing-href | 2 |
| missing-src | 1 |
| editorial | 1 |

## High findings

- **gravity-inventory-center.html** (missing-src): src /apps/inventory-center/
- **articles.json** (editorial): Expected original 30 articles; found 10

## Medium findings

- apps/sop-foundry/workroom.html (duplicate-id): ${esc(s.id)}
- apps/sop-foundry/workroom.html (duplicate-id): ${esc(r.id)}
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/new-sop
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/publish-sop
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/withdraw-sop
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/edit-sop
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/approve-sop
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/unapprove-sop
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/print-sop
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/open-recipe
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/edit-recipe
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/publish-recipe
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/withdraw-recipe
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/back-recipes
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/edit-recipe
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/approve-recipe
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/unapprove-recipe
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/print-recipe
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/export
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/close-modal
- apps/sop-foundry/workroom.html (missing-action): action /apps/sop-foundry/new-sop
- gravity-inventory-center.html (missing-href): href /apps/inventory-center/
- gravity-inventory-center.html (missing-href): href /apps/inventory-center/
- _redirects (redirect): /books/quiet-gravity to /books#quiet-gravity (301)
- _redirects (redirect): /books/quiet-gravity.html to /books#quiet-gravity (301)
- _redirects (redirect): /books/the-owners-chair to /books#owners-chair (301)
- _redirects (redirect): /books/the-owners-chair.html to /books#owners-chair (301)

## Low findings sample


## Most common missing path references

- action /apps/sop-foundry/new-sop (2 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/edit-recipe (2 page(s)): apps/sop-foundry/workroom.html
- href /apps/inventory-center/ (2 page(s)): gravity-inventory-center.html
- action /apps/sop-foundry/publish-sop (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/withdraw-sop (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/edit-sop (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/approve-sop (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/unapprove-sop (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/print-sop (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/open-recipe (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/publish-recipe (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/withdraw-recipe (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/back-recipes (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/approve-recipe (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/unapprove-recipe (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/print-recipe (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/export (1 page(s)): apps/sop-foundry/workroom.html
- action /apps/sop-foundry/close-modal (1 page(s)): apps/sop-foundry/workroom.html
- src /apps/inventory-center/ (1 page(s)): gravity-inventory-center.html

## Caveats

Dynamic routes, Netlify function paths, embedded client apps, and extensionless routes can generate false positives. Confirm any reported defect before changing public navigation or content.
The site/robots.txt source is intentionally staging noindex; a separate production packaging step must override it. Do not deploy raw staging files.
The site currently permits inline scripts in its CSP; tightening without migrating inline code would break existing application pages.
DO NOT change Thomas Monroe Books production or publish unreleased Report issues.
