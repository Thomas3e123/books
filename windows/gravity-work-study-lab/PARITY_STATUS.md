# Gravity Work Study Lab — Windows Parity Status

Controlled source status: 2026-10-16

## Verified in the Windows package

- Local JSON study persistence under the Electron user-data directory.
- Study import/export and PDF/report paths.
- Runtime navigation hardening.
- Active observation timing is now preserved before observation-screen rerender (`renderObserve()` records the active segment instead of silently discarding it).
- Complete website v56 Work Study evidence packages can be imported into Windows while preserving the original study ID and expert sidecar evidence.
- When a v56 evidence package is re-exported from Windows, the preserved expert sidecars remain in the package instead of being silently dropped.
- The normal Windows GitHub Actions build performs dependency audit, JavaScript syntax checks, installer build, ZIP build, and artifact upload.

## Website expert source of truth

The website Work Study Lab is the current expert source through v56. It includes the controlled expert stack for guided teaching, clock control, production-safe multi-run timing, comparability, standard-minute validity, scaling, baseline provenance, allowance control, observer agreement, proficiency, observation effect, precision, demand coverage, shared setup, crew labor, yield/waste protection, Work Sampling, queue/recovery, incomplete-cycle protection, short-element measurement adequacy, shift-position representativeness, sequence-dependent changeovers, and complete study evidence packaging.

## Parity rule

Do not describe the Windows edition as having full website expert parity until those expert decisions are deliberately ported and regression-tested in the Windows architecture. The website remains the master expert source of truth.

The v56 bridge provides a safe manual portability path between website/mobile use and Windows. It is not automatic hosted cross-device sync.

This file is intentionally kept with the Windows package so future builds cannot silently lose track of parity status.