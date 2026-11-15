# Gravity Windows download page audit — 2026-11-15

## Change made

Removed 11 direct download links for older October Windows builds from `site/windows-programs.html`. The current November preview downloads remain available: six SOP Foundry, Shift Lab, and Work Study Lab installer/ZIP links from the November 13 candidate, plus two Inventory Center installer/ZIP links from the November 14 diagnostic candidate.

Removed stale October preview notices and the Inventory Center note that claimed the removed October build had passed first-click, setup, tour-resumption, backup/restore, and installed-application tests. Updated the older Inventory manual note so it no longer directs users to an unavailable October walkthrough build.

## Customer-facing status

The page directs ordinary work to the web workspaces in Gravity Assist and labels the current November Windows packages as unsigned test previews. It tells customers to back up existing work before testing. No October GitHub release assets were deleted; only links and outdated claims on the Gravity page were removed.

## Verification boundary

Static source inspection confirmed that the page has eight direct Windows binary download links and that they point only to the November 13 and November 14 candidate tags. This audit did not fetch the GitHub files, run installers, or verify printing, scanning, migration, or other customer-device behavior. The current packages remain previews until those checks are completed.
