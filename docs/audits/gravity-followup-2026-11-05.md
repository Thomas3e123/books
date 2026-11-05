# Gravity audit continuation — November 5, 2026

Production remains on verified release b03358a (PR14), deployed November 4 at 11:43 PM America/Chicago. This follow-up is not whole-site certification.

## Passed through the actual hosted interface

The separate test project gravity-isolated-audit-20261104 runs commit 3caaeac, deploy 6aec16e516cb07d5d8633fe3. Only the stateless handbook function is deployed. It accepts status, preview and export; payment actions are rejected. Customer-service functions are absent and Forms processing remains disabled.

- Entered synthetic company name and mission, filled remaining Basic examples: 115 answered, one optional logo unanswered.
- Generated 23-page preview containing the entered wording.
- Downloaded PDF (593,604 bytes), editable DOCX (14,923 bytes) and JSON project backup (34,576 bytes) through the actual buttons. File hashes are in evidence/handbook-https/downloads.json.
- DOCX archive CRC passes and word/document.xml contains the test company name.
- Opened the downloaded backup through the file chooser. A separate restored project appeared; the original project remained available.
- Reloaded the page; both projects remained listed and the restored company name and mission retained the exact test wording.

The PDF signature and preview were checked. This continuation does not certify physical printing, native Word layout, legal adequacy, all interview levels or all design choices.

## Confirmed and repaired in the follow-up branch

The live site search returned no result for "numbers" despite a working Numbers Lab link in Gravity Assist. The hard-coded search catalog omitted Numbers Lab, Forms Personalizer, Document Studio, Quick Tools, QR Code Maker and AI Prompt Search. Added these public landing pages and useful task keywords. Updated site.js release query strings in HTML because JavaScript is served with immutable caching. No account/customer records changed.

Build and 13 existing regression checks pass. Added a coverage check for the missing queries and all catalog destinations; it passes. Hosted browser verification passed all seven queries: numbers, calculator, personalizer, document studio, quick tools, qr and prompt. Test deploy 6aec1de6bdaffd9eb7191067 serves commit d1fc35a.

## Test-environment correction

Netlify automatically applied five repository database migrations to the separate test project's database when its Git build ran. Therefore, the earlier static test environment's "no database" description no longer describes the whole hosted project. The deployed handbook wrapper does not use the database and no customer records were copied by this work. No database deletion or customer-data operation was performed. Database isolation must be verified before adding customer-backed functions to this environment.

## Still not certified

Secure Foundry workflows, hosted cloud backup/restore, notification delivery, payments, AI/voice, physical mobile/Windows/printer checks, QR PNG transfer, and remaining tool edge cases. These are outstanding tests, not claimed passes.

## Release workflow finding

GitHub Actions commit b58bb44 followed the production merge and rewrote 118 HTML pages, including restoring the older 20261025-cedar-prereply-3 script URL. The old migration workflow automatically runs on changes to selected public-site files and commits prepared preview content back to the live source branch. The follow-up makes this historical workflow manual-only, preserving its explicitly requested preview capability while preventing automatic post-release source rewrites. It does not disable CI tests or deployment safeguards. Current public deploy remains b03358a; the bot commit used skip-ci. Production packaging now derives the Guide script URL version from its actual content hash, so older preview cache tags cannot cause customers to retain an outdated script. A regression check verifies this behavior.

## Foundry hands-on continuation — November 5

Access was securely unlocked for both local Build Room and Employee Library in the isolated hosted project. No customer workspace or hosted employee database was used.

| Check | Result and evidence |
| --- | --- |
| Create and save | PASS: new `AUDIT ONLY — Station readiness verification`, Audit Station, three procedure steps, revision 1.0. |
| Approve separately from publishing | PASS: named test approver and effective date recorded; approval alone still showed not published. |
| Publish | PASS: deliberate publication created employee revision 1.0. |
| Edit after publication | PASS: fourth draft-only step saved as revision 1.1; approval cleared; employee revision stayed 1.0. |
| Employee view and reload | PASS: only original three steps and revision 1.0 shown, also after reload. |
| Employee profile | PASS: synthetic employee and Audit Station saved for the session. |
| Guided review | PASS: all nine sections navigated. |
| Knowledge check failure | PASS: deliberately wrong answers scored 0%, showed corrections, permitted review/retry. |
| Knowledge check success | PASS: correct answers scored 100%, acknowledged revision 1.0, correctly required no manager sign-off for this revision. |
| Training records | PASS: both 0% failure and 100% pass retained separately with employee, revision, date and requirement. |
| Full backup download | PASS: actual download, valid JSON, 5,060,818 bytes, contains test SOP, draft addition and test employee. SHA256 `c3b3f41960f628b90ef2b989cf39e991cecc463c42a231a8cc109f3a6468b5d6`. Backup is not committed because it includes room settings. |
| Unlock return navigation | FAIL confirmed: room-gate supplied `staff-sops.html#...`, but access resolved against the origin root and discarded the deep link. Repaired in source with Foundry-relative resolution and explicit allowed destinations. Added missing poster/training and manager import/connection destinations, retaining manager restrictions. Three regression tests pass, including external/unknown URL rejection. Hosted repair retest still pending. |

The source build verifies all 652 manifest entries. Eight targeted regression tests pass. This update does not certify required hands-on manager sign-off, backup restore, all poster/recipe paths, hosted sync, physical printing or the other outstanding areas above. No production deployment was made for this continuation.

Full backup restore subsequently passed: restored the downloaded synthetic backup through the actual file chooser and confirmation, reauthenticated after the app cleared its session, then verified the draft 1.1 still contained the fourth step, the employee publication remained revision 1.0, and both failed and passed training records remained present. This is browser-local restore, not hosted cloud restore.

## Poster, recipe, history and source-helper continuation

- PASS: searched the 178-template poster catalog, selected Opening Readiness, entered a synthetic title/station/three instructions/footer, linked the published audit SOP, and saved revision 1.0. Reload and reopening retained all values. Changing orientation/footer saved revision 1.1. Employee Posters showed the updated revision and its related-SOP link opened published SOP 1.0.
- PARTIAL: poster print review checkbox correctly gates printing; poster and employee recipe print previews show the selected content. Invoked poster Print / Save as PDF, but no browser PDF download or physical output was observed. Neither is claimed as passed.
- CONFIRMED FAILURE, REPAIRED AND BROWSER VERIFIED: recipe approval silently reverted to Draft, bumped the revision, and prevented publication, despite a success toast. The workroom save handler counted the approval's effective date as a content edit. Approval-only dates now retain approval and revision; substantive edits still reset approval and archive the prior recipe. The regression test failed before the repair and passes afterward, including proof that published ingredients remain unchanged by later draft edits.
- PASS AFTER REPAIR: approved the existing synthetic food recipe, published it, opened its employee copy, reloaded, and verified ingredients (200 mL water/10 g sugar), two-portion yield, two method steps, notes and revision 1.1. Repair browser-tested on isolated deploy 6aec291e62e06ebfef1a6f92 (71fe191).
- CONFIRMED FAILURE, REPAIRED AND BROWSER VERIFIED: Revision History rendered blank titles/revisions/content because browser-local records use item/note while the display expected snapshot/reason and flattened metadata. The renderer now accepts both stored formats without modifying saved history. Existing poster, SOP and recipe archives show titles; expanded poster revision 1.0 shows original instructions, footer, portrait orientation and links. Searching Opening returns only its archive. Verified on isolated deploy 6aec29b4623d5625342e6482 (3fe8fce). Regression covers both formats, distinct document grouping, search and HTML escaping.
- PASS: Foundry employee Ask Gravity selected published SOP 1.0 and answered 'What should I do first?' with its actual first step, not the unpublished draft.
- CONFIRMED DESCRIPTION DEFECT: the same browser-local helper claimed it sent questions to a shared AI service. Updated status copy for the source-grounded-web mode and renamed its shortcuts to Show steps, Show checks and Show safety notes. Connected AI mode is unchanged. Browser verification of this wording is pending at this checkpoint.

Current verification: source build passes with 652 verified files; 10 targeted tests pass; 27 hosted isolation checks pass using fake records only. Production remains unchanged. Full bar-recipe lifecycle, required manager competency sign-off, all 178 poster templates individually, remaining import edge cases, hosted sync and other previously noted limitations are still not certified.

Follow-up browser evidence supersedes two pending statements above:
- All 178 poster template options were selected through the live UI and produced a nonempty preview. Results are in evidence/foundry-2026-11-05/poster-catalog-checks.json. This does not certify each template's wording or printed layout.
- Source-helper wording and the Show checks / Show safety notes controls passed browser verification on isolated deploy 6aec2a972d4f15373de5de61 (c6375c3). The manager source correctly used draft 1.1, while the earlier employee test used published 1.0. General practice/review claims elsewhere on the page are not yet certified as interactive training or substantive draft review.

## Production release and continued audit — November 5

PR #15 merged to the production migration branch as `9a0da7e0af6e34479cc68b5f12701873f1c6721d`. Netlify production deploy `6aec2cbbe359a5b88b3978bc` was ready and published at 07:14 UTC. Live browser smoke checks confirmed Numbers Lab search, public canonical/indexing metadata, and the updated Guide asset. Customer data was not migrated or deleted.

Continued isolated bar-recipe test: saved, approved, and published `AUDIT ONLY — Citrus soda`, revision 1.0. Ingredients, preparation, ice, build method, garnish, and notes survived publication. Two defects were confirmed: the Build Room employee-copy link ignored its selected recipe and defaulted to food; employee display omitted the Build Room's serviceware field. Follow-up repair supports legacy `?open=` links and hash links, selects the actual recipe section, renders either stored glassware field with HTML escaping, and keeps unavailable IDs from silently opening another recipe. Regression tests pass for these cases. This follow-up repair is separate from PR #15 and is not yet in production.
