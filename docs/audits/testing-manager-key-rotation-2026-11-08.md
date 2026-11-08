# Gravity Testing Room manager key rotation — 2026-11-08

## Purpose
Refresh the deployed production Functions environment after the manager lost access to the private Testing Room inbox. The manager credential is held only in the Netlify production-context secret environment variable `GRAVITY_TESTING_MANAGER_KEY`.

## Safety
- The credential is **not** stored in this repository or this release note.
- Do **not** change the public Testing Room tester tokens or database records.
- Preserve the separate manager and tester authorization gates.
- Do not disable Netlify secret scanning to force a release through.
- Previous deploy failed after Netlify detected potential secret matches in build output, mostly pre-existing PDF files. A new high-entropy production key was rotated in Netlify to avoid false matches without suppressing security controls.

## Release verification
- Netlify should build from production branch `feature/gravity-migration-phase1-2026-10-22` with a fresh production-context secret.
- Confirm deploy state `ready` and unchanged public site behavior.
- Manager personally verifies the new key at `/testing-room-manager`; do not include the key in screenshots, logs or test submissions.
- If a secret scan still fails, inspect the validation report before changing any scanner configuration.
