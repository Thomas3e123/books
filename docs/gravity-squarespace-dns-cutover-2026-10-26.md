# Gravity domain cutover — Squarespace external DNS
**Date:** 2026-10-26. **Domain:** gravityleadershipsystem.com. **Owner approved website-domain cutover preparation.**
**Netlify new project:** gravity-leadership-system; ID `fa5d39a0-bef9-4ff1-9c28-57d585d741d7`.
**Verified production version:** `6adf42b89e5f066c1d9eba37`, still **noindex** pending TLS/redirect validation.

## Confirmed live DNS baseline — GitHub Actions `40321649238`
The below came from public DNS read-only checks, not a DNS change:
- Nameservers: `nsa1.squarespacedns.com`, `nsa2.squarespacedns.com`, `nsa3.squarespacedns.com`, `nsa4.squarespacedns.com`. **Leave unchanged.**
- Apex `@` A: `198.185.159.144`, `198.185.159.145`, `198.49.23.144`, `198.49.23.145` (Squarespace website defaults).
- `www` CNAME: `ext-sq.squarespace.com` (Squarespace website default).
- `@` MX: priority `1`, target `smtp.google.com` (Google Workspace). **Leave unchanged.**
- Apex TXT records: 1; do not modify (potential mail authentication, verification).
- CAA: none in public response. AAAA: none in public response.

## WEBSITE records to change at Squarespace (only)
In Squarespace Domains > gravityleadershipsystem.com > DNS > DNS Settings:
1. Remove **only** the Squarespace website `@` A records and `www` CNAME above (often grouped under "Squarespace Defaults"). Do not delete Google Workspace MX, TXT/SPF, DKIM, DMARC, Google verification, registrar nameservers or DNSSEC settings.
2. Add **A** record: **Name / Host `@`**, value **`75.2.60.5`**. Do not leave legacy Squarespace A addresses present alongside it.
3. Add **CNAME** record: **Name / Host `www`**, value **`gravity-leadership-system.netlify.app`** (hostname only; no `https://` or slash).
4. Leave record TTL on existing/default value. Save. **Do not modify Netlify project's domain attachment**: apex is already primary and `www` redirects to apex.

If Netlify's "Pending DNS verification" modal specifies unique high-performance load-balancer values instead of standard endpoints, pause and use the Netlify-generated values.

## Read-only verification after owner changes Squarespace DNS
- GitHub script `scripts/check-gravity-domain-dns.cjs`, workflow `.github/workflows/gravity-domain-cutover-readonly-2026-10-26.yml`: run `workflow_dispatch` with `after_dns_change=true` or, at minimum, recheck public A/CNAME/MX through a GitHub runner. No write access to Squarespace is provided by connected tools.
- Both apex HTTPS and `www` redirect must resolve to the correct NEW Gravity site with a valid TLS certificate.
- The `@ MX smtp.google.com` record must remain, and sender/recipient email flow needs an acceptance test.
- Hosted Foundry `/foundry-hosted/health`, Book Reader, Report, registration, downloads, redirects and domain canonical tags must be checked on permanent HTTPS.
- **Do not turn off search noindex/robots protection until TLS, DNS and full public-domain checks PASS** and public indexing is separately authorized.
- Do not change `thomasmonroebooks.com`, its Netlify project, or its forms.

**Status when document created:** Netlify production verified; DNS still points to Squarespace; Google Workspace MX preserved; website cutover **not yet performed**.
