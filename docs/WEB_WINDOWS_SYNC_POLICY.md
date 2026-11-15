# Gravity Web ↔ Windows release policy

**Rule:** When shared Gravity functionality changes, verify both platforms before calling the corresponding Windows download current. Updating the website alone does NOT update an existing packaged Windows ZIP.

The repository now contains candidate build projects and GitHub Actions workflows for Shift Lab, SOP Foundry, and Inventory Center, plus the Work Study Windows source/build path. These workflows produce **new candidate artifacts**; they do not rebuild or replace the older public Windows downloads. Do not call a public download current based only on a candidate workflow existing or passing.

The October 2026 public ZIPs remain separate releases. Their original independent source/build inputs are not all available here, so a new candidate must pass its own acceptance checks before it can replace a public download. Windows parity must be labeled **unverified** until the exact candidate source hash and build evidence are recorded; physical customer-device checks remain separate.

## Process
1. Change the shared web source and review customer-facing language.
2. Update the Windows program or its packaging source.
3. Run web behavior checks and a real Windows smoke test, including save/reopen, printing, privacy, backups, and employee QR.
4. Record the web SHA-256, tested Windows build SHA/ID, and test evidence in `windows/WEB_WINDOWS_PARITY_STATUS.json`.
5. Release web and Windows separately once approved. Do not replace a Windows download with an untested build.
6. The GitHub parity gate fails while any tracked component is changed or its Windows build remains unverified. This is deliberate; a failed parity gate prevents a false "synced" claim but **does not automatically prevent Netlify deployments**. A release coordinator should treat the failed gate as a stop sign for claiming cross-platform parity.

## Status checked November 15, 2026

- The parity register at `windows/WEB_WINDOWS_PARITY_STATUS.json` now marks Shift Lab scheduling, its first-schedule walkthrough, and the Work Study page shell as `needs_sync_and_retest`. Their previously recorded Windows test evidence applies to older web-source hashes; current web hashes are recorded separately.
- Candidate workflows are present at `.github/workflows/shift-lab-windows-candidate.yml`, `.github/workflows/sop-foundry-windows-candidate.yml`, and `.github/workflows/inventory-center-windows-candidate.yml`. This audit did not run those Windows workflows or verify a fresh candidate artifact.
- Inventory Center and SOP Foundry candidate projects explicitly state that they are not drop-in replacements for the older public programs. Their acceptance and customer-device checks are still outstanding.
- The October 12 Shift Lab tutorial changes are not proven to be in the public Windows beta. A current candidate must be built, reviewed, and accepted before replacing the public download.

No public Windows package or website was changed by this status review.
