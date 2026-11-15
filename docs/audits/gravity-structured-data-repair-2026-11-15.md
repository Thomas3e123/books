# Gravity guide structured-data repair — November 15, 2026

## Finding

A source review of Article JSON-LD found ten published Knowledge Center guide pages whose structured data still identified them as `restaurant-sop-template-guide`. Their search metadata reused that page's headline, description, and canonical article URL despite containing different guide content.

Affected pages:

- `gravity-signals-manager-guide.html`
- `restaurant-employee-schedule-publishing-guide.html`
- `restaurant-employee-training-acknowledgment-qualification-guide.html`
- `restaurant-inventory-barcode-local-purchasing-guide.html`
- `restaurant-inventory-count-variance-backup-guide.html`
- `restaurant-inventory-setup-workflow-guide.html`
- `restaurant-operational-poster-qr-guide.html`
- `restaurant-schedule-validation-conflict-overtime-guide.html`
- `restaurant-sop-revision-control-guide.html`
- `restaurant-sop-training-retraining-guide.html`

## Repair

Updated each affected Article JSON-LD object to use that page's visible H1, its own meta description, and its own Gravity canonical URL. No page body, routing, customer records, or external service settings were changed.

## Source review

Inspected all 48 Article JSON-LD objects in top-level site HTML. All now point to the HTML page that contains them. This is source-level evidence only; no production deployment or live search-engine validation was performed.
