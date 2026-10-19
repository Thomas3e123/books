# Gravity SOP Foundry — Windows candidate (not a public release)

This project packages the **same 65+ web source files** as the website's `site/apps/sop-foundry/` application, including its local SOP library, Build Room, Employee Library, recipes, posters, revision history, training, import/export, manager inbox and signals. Each build reads current website source, records its original file hashes, and runs verification.

The Electron application serves these pages from a **secure local application origin**, not `file://`; this allows ordinary root-relative navigation and IndexedDB storage to work inside the app. Working content stays in this Windows application's local profile until explicitly exported or synchronized.

The hosted employee connector uses the live TMB server only for explicit hosted routes. **Hosted QR links require the internet and an activated hosted employee workspace**. Only remote `/foundry-hosted/` requests are forwarded to the live TMB service; customer PINs, workroom data, and other local API paths stay on-device.

## Build

From `windows/gravity-sop-foundry/` on Windows:

```shell
npm install
npm run build:win
```

CI tests the local application before packaging. A successful automated run generates an installer and ZIP **candidate**, not a public customer release.

## Release restrictions

- This is **not a drop-in replacement** for any existing October 2026 Windows Foundry program.
- Manager and employee read/write, full SOP/recipe import/export, revision archiving, privacy, hosted sync, offline behavior, printable SOP binder/posters, mobile QR scanning, and backup/restore all require acceptance testing.
- The browser-style PIN access is **not enterprise authentication**. Change the default PINs before use and store backups securely.
- The original public Windows download stays unchanged until the candidate has passed release acceptance. No automated deployment to GitHub Releases or Netlify occurs from this project.
- Desktop customers cannot open `gravityfoundry://` links on a phone. Phone-facing QR links must point to an activated hosted workspace.
