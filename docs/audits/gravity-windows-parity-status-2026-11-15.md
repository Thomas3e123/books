# Gravity Windows source-parity status — November 15, 2026

## Finding

The parity register listed three Windows builds as verified even though their tested website source hashes no longer match the current website source:

- Shift Lab scheduling logic
- Shift Lab first-schedule walkthrough
- Work Study Lab website shell and shared runtime bootstrap

The currently recorded Windows build evidence remains useful for those older builds. It does not prove parity with the current website source.

## Correction

Marked the three entries `needs_sync_and_retest`, preserved their last-tested source hashes and build evidence, and recorded the current web hashes separately. The existing release gate will now reject a current-parity claim until each Windows candidate is rebuilt and retested.

This status correction does not build, publish, or claim physical Windows-device verification. Inventory Center and SOP Foundry are managed through separate synchronization scripts and are outside this three-component parity register; they still require their own release checks.
