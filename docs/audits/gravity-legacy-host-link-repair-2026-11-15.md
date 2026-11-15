# Gravity legacy-host link repair — 2026-11-15

## Finding and repair

Six customer-facing Gravity HTML pages still linked to the old `gravity-leadership-system.netlify.app` hostname, even though Gravity now uses `gravityleadershipsystem.com`. Replaced 18 outdated destinations across the About page, both legacy forms-personalizer pages, the Handbook Creator app privacy page, and the SOP Foundry Workroom and Help pages. These links now use the permanent Gravity domain. Refreshed all six source-manifest hashes.

## PDF check

Scanned link annotations in all 102 standalone site PDFs and 147 PDFs contained in 25 downloadable ZIP packages. All files parsed; none of the 249 PDFs contained a clickable destination to either `gravity-leadership-system.netlify.app` or `thomasmonroebooks.com`. This is consistent with the earlier PDF repair that gave every published PDF a clickable Gravity destination.

## Verification boundary

A source scan found no remaining old-host URLs in customer-facing HTML. Internal origin allowlists and historical audit records still name the legacy Netlify hostname for compatibility and traceability; those are not customer navigation links. The HTML edits are committed locally and have not been deployed or browser-tested on production.

## Downloadable Office-file check

Scanned 3,750 XML and relationship files from standalone DOCX/XLSX/PPTX files and Office files inside site ZIP packages. No `thomasmonroebooks.com` or legacy Gravity Netlify destinations were found; all archives parsed successfully.
