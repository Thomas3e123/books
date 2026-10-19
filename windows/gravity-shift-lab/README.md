# Gravity Shift Lab — Windows candidate (not a public release)

This project creates a reproducible Electron Windows installer from the same **Gravity Shift Lab website source** used by Netlify. The first-schedule walkthrough and core scheduling logic are copied on each build, preventing manual JavaScript drift.

Build (Windows CI): `npm install && npm run build:win`.

**Important:** This is a NEW candidate package, not the original October 12 Windows program. No existing Windows release ZIP is replaced automatically. Before publishing, verify file:// asset loading, scheduling calculations, saving/reopening, backups, PDF/printing, employee QR scanning from a second phone, availability, pay privacy, and installer behavior. Electron's file origin and local-storage behavior may differ from the previous program. No evidence of a successful physical Windows customer test is claimed.

Do not promote this candidate until those tests pass.
