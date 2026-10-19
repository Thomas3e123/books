# Gravity Web ↔ Windows release policy

**Rule:** When shared Gravity functionality changes, verify both platforms before calling the corresponding Windows download current. Updating the website alone does NOT update an existing packaged Windows ZIP.

This repository currently contains the Work Study Windows source/build path but **does not** contain a reproducible build project for the already-published Shift Lab, SOP Foundry, or Inventory Center Windows ZIP downloads. Until those sources and reliable build workflows are available, their Windows parity must be labeled **unverified**, never silently assumed.

## Process
1. Change the shared web source and review customer-facing language.
2. Update the Windows program or its packaging source.
3. Run web behavior checks and a real Windows smoke test, including save/reopen, printing, privacy, backups, and employee QR.
4. Record the web SHA-256, tested Windows build SHA/ID, and test evidence in `windows/WEB_WINDOWS_PARITY_STATUS.json`.
5. Release web and Windows separately once approved. Do not replace a Windows download with an untested build.
6. The GitHub parity gate fails while any tracked component is changed or its Windows build remains unverified. This is deliberate; a failed parity gate prevents a false "synced" claim but **does not automatically prevent Netlify deployments**. A release coordinator should treat the failed gate as a stop sign for claiming cross-platform parity.

**Current gap:** Shift Lab tutorial additions are deployed on the website but not shown to exist in the October 12 packaged Windows beta. No automated Windows build is available here for that download.
