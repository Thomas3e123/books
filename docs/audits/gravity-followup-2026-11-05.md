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

Follow-up browser verification passed on isolated deploy `6aec2e1b8d36956157553c4c` (commit `ca8c0435ceb8026289bbc183ddd3818b2312e88b`): opening the original `?open=recipe-b1a9ede5` URL now displays Citrus soda, revision 1.0, and its `250 mL test glass` service vessel. Reload retained both. Draft PR #16 holds these repairs for the next coordinated batch; production remains PR #15.

## Recipe imports and required competency — continued November 5

- CONFIRMED FAILURE, REPAIRED AND BROWSER VERIFIED: JSON recipe imports dropped `buildType` because normalization read only lowercase `buildtype`. Repeated normalization could also erase a CSV's already-normalized method. The importer now validates and preserves both accepted keys. Real file-chooser upload showed the method absent before repair and present afterward, including after import and reopening the saved Build Room draft. Glassware, ingredients, steps, yield, ice and garnish remained intact. Isolated repair commit: `247c7dfdf51598a1955d4681792aefbf1634f8c2`.
- CONFIRMED FAILURE, REPAIRED AND DOWNLOAD VERIFIED: opening a bar recipe through its legacy direct link selected the bar section but downloaded a food template. Templates now derive the active section at download time. Actual JSON and CSV downloads were parsed and both contained type `bar` and the `buildType` field.
- PASS: review confirmation initially disables import; reviewed synthetic JSON imported one recipe as Draft, not employee-published. Uploading it again with the default keep-existing option imported zero and skipped one. Reopening the Build Room showed the complete original draft, still unapproved and unpublished. Replacement imports, malformed-file UI cases, bulk limits and actual CSV upload remain untested in this checkpoint. Three parser regression tests cover JSON/repeated normalization, CSV/repeated normalization, invalid method types and duplicate records.
- PASS: synthetic SOP revision 1.2 saved with required manager competency, approved and deliberately published. Employee view displayed the correct revision and training requirement. All ten guided sections worked; five correct answers scored 100% and explicitly left manager demonstration/sign-off outstanding.
- PASS: Training Records showed the pending competency record. Saving Retrain with synthetic manager and notes kept training incomplete. After reload, a follow-up Approved decision completed training. Another reload retained approval and the expandable prior Retrain decision, both sets of notes, and older revision 1.0 passed/failed records. This verifies software state transitions only; no real employee demonstration or identity certification was performed.

These new import repairs join draft PR #16. Production remains the already verified PR #15 release. Hosted cloud sync/restore, delivery/payment/AI services, physical mobile/Windows/printing and remaining tool edge cases are still not certified.

## CSV replacement, import guards, and QR continuation

- PASS: actual CSV upload parsed quoted commas and pipe-separated ingredient/method lines. Deliberate replacement of the synthetic imported drink saved revision 1.1 as Draft, not published, with 120 mL soda / 15 mL citrus, 250 mL glass and the CSV build method.
- PASS: malformed CSV (unclosed quote), 101 recipes and a file over 2 MB each displayed a specific rejection; review stayed hidden and import disabled. Reopening the Build Room confirmed the saved replacement was intact after all rejected uploads.
- CONFIRMED QR DEFECT: after generating a valid destination then entering 1,801 characters, validation displayed an error but left the previous preview and downloads visible. Source repair clears obsolete output and object URLs on edits, invalid input, failures and reset; stale asynchronous PNG callbacks cannot restore old output. Regression test covers these transitions.
- QR PNG click still produced no download with the previous data-URL implementation in the audit browser. Switched the PNG link to a canvas Blob/object URL, matching the working SVG download mechanism. This is a compatibility repair pending hosted browser retest; the original failure is not claimed to affect every browser.

QR hosted retest PASS on isolated commit `5a67934efda85e947dae41c595bac97d3e011848`: actual PNG download completed; Pillow identified a 984×984 PNG and independent ZXing decoding returned exactly `https://gravityleadershipsystem.com/start-here`. Invalid 1,801-character input hid PNG, SVG and canvas; reset and regeneration recovered normally, and an actual SVG download still completed. Physical phone scans/printed pieces remain untested. These repairs are staged with PR #16, not yet production-deployed.

## Work Study export continuation

A new synthetic Quick Study was created on the isolated origin (its history initially showed zero saved studies). Named work element `AUDIT ONLY — Verify synthetic station`; entered explicit synthetic quality/safety guardrails; timed one observation through Work → Stop Current → Finish Observation. Gravity correctly showed 11 unresolved blockers and Sustainable-Pace Hold rather than approving a production standard. Saved study `WS_mw38l8dduwe32` into history.

Confirmed failures: optional short-element, shift-position and sequence-changeover reviews threw `Cannot read properties of undefined (reading length)` because their non-applicable result omitted the arrays consumed by rendering. Repairs return empty issues/warnings/facts consistently. Separately, Study History saved the previous screen before switching to history, so expert panels read the old screen and the complete evidence export controls were absent. History now uses the existing save-before-render navigation routine. Four focused regressions and the source/build checks pass. Hosted export retest follows below.

Hosted retest PASS on isolated commit `b3bc3de987156e678021ab2128cac460f81a09a7`: all three non-applicable panels rendered; Study History exposed Export/Import complete study package. Actual JSON download parsed as a Gravity evidence package with the correct ID, one 0.697-second synthetic observation, named element, saved history entry and both guardrails. Actual file-chooser import restored the package, reloaded and retained exactly one saved study. Opening it retained the displayed 0.7-second result and 11-blocker Sustainable-Pace Hold. No real work standard was approved. This package had zero saved expert sidecar records; populated sidecar portability, recorded audio, hosted transcription, physical printing and Windows parity remain unverified. Repairs join PR #16; production unchanged.

## PR #16 production release and continued verification

User-authorized release completed: PR #16 merged as `08401d44fb5b0f5b4eac3aaef31ff82a3b4f6f9a`; Netlify production deploy `6aec358f443221f326239c4b` is published and ready. Twenty targeted tests passed, 652 source entries verified, 153-page production packaging passed, and GitHub browser-tests / Windows candidate build succeeded on the released PR head. This does not certify installing the Windows program on a physical computer. No customer data rewrite, migration, deletion or isolated-environment configuration was included.

Production smoke PASS: actual PNG download from https://gravityleadershipsystem.com/qr-code-generator completed. Independent ZXing decoding returned exactly `https://gravityleadershipsystem.com/start-here`.

Continued isolated Work Study portability PASS: entered a synthetic short-element review note, exported a package containing one keyed-by-study expert evidence record, then replaced the note with temporary test text. Importing the exported package restored the original note exactly after page reload and reopening. This verifies one populated expert record format, not every sidecar format or multi-device/cloud synchronization.

All recipe, QR and Work Study code repairs described for PR #16 above are now live. Remaining incomplete areas include hosted cloud workflows/notification/payment/AI services, physical mobile and Windows execution, actual printed output, further multi-record evidence import cases and other outstanding per-tool edge cases. The full audit is not declared complete.

## Quick Tools downloads and calculation edge cases

PASS: actual label text download retained the synthetic item name, preparation time, use-by text and initials/station. Actual Unit Conversion download contained `0 °C` after entering 32 °F. These close the two remaining text-download checks; physical label printing remains unverified.

CONFIRMED FAILURES: $10 split among three equal-point names displayed $3.33 each (only $9.99 allocated); a negative original recipe yield produced negative ingredient quantities. Repair allocates integer cents by largest fractional remainder (entry order breaks ties), displays total allocated and explains rounding; rejects negative/invalid totals, sub-cent amounts and malformed/negative points instead of silently discarding rows. Recipe scaling now requires finite positive yields. Three focused regression tests and source/build checks pass. Hosted retest is pending below.

Hosted retest PASS on isolated commit `12c4b9eec04bd2bca2af2d4040682f342565460d`: entering $10 and three equal-point names produced $3.34/$3.33/$3.33 with $10.00 allocated. Negative tip totals and negative-point rows were rejected. Negative original recipe yield was rejected; correcting it to 10 and scaling to 25 changed 2 lb to 5 lb. Result text now wraps: the browser document width and viewport both measured 1,348 px, with no horizontal page overflow. This is desktop browser evidence; this particular repair has not yet had a physical phone retest. These Quick Tools repairs are staged for the next coordinated release and are not live in production.

## PR #17 published; remaining calculator input checks

PR #17 merged as `82c951920188efd0e1ef07980ca3abe471d9b06b`. Production Netlify deploy `6aecabe8fb790c33aaa383d6` published November 5, 2026 at 10:17 AM Central. Live browser verification: $10 split equally returned $3.34/$3.33/$3.33 and total allocated $10.00. Netlify reports no database migrations applied.

Continued isolated checks confirmed three additional defects: 09:00–17:00 with a -30 minute break gave 8.50 paid hours; -1 twenty-dollar bill gave $-20.00; 7 hours and 90 minutes silently became 7.98 hours. Source repairs now reject negative/overlong breaks, negative/fractional bill counts and invalid minute fields with clear instructions. Ten focused tests pass after producing the 153-page production package, including overnight shift and corrected-input recovery. These additional repairs are not yet production-deployed. Hosted retest remains pending.

Hosted retest PASS on isolated commit `fac8b833b403cad6a5fd77389fc54346966a8b80`: all three invalid entries now display explicit instructions instead of fabricated numeric results. Correcting to 22:00–06:00 with a 30-minute break returned 7.50 paid hours / 450 minutes; correcting decimal minutes to 30 returned 7.50 hours; two $20 bills plus $1.25 coins returned $41.25. Additional actual-browser known answers passed: 2 cases × 12 plus 3 loose = 27 each; 100 → 80 = -20%; February 28, 2028 plus two days = March 1, 2028. Source verification covered 652 files and production packaging covered 153 pages. These three new validation repairs remain staged, not live. Physical mobile/Windows/printer and remaining hosted workflows remain incomplete.

## Remaining Quick Tools validation repairs

Actual isolated-browser failures confirmed: -2 cases at 12 per case yielded -24 each; a start date of 2026-11-05 with -3 allowed days silently yielded the unchanged date; entering only an old percentage value of 100 yielded -100% despite the new value being blank. Repairs now reject negative case/loose quantities and nonpositive pack sizes, require explicit nonnegative whole allowed days with calendar bounds, and distinguish missing percentage inputs from explicit zero. Fractional case quantities remain supported. No customer records or existing stored values are modified.

Thirteen focused tests pass, 652 source files verify, and the 153-page production package builds. Cases include fractional-case arithmetic, leap-year rollover, date overflow, and a valid explicit zero new percentage value. Browser retest follows below. These changes extend the pending PR #18 batch; they are not yet production-deployed.

Hosted retest PASS on isolated commit `724759324ca51c8b1ea340b0dd0204debb078a0d`: all three reproduced invalid states now show the intended correction messages. After correcting inputs, 1.5 cases × 12 plus 3 loose returned 21 each; February 28, 2028 plus two days returned March 1; explicit new value 0 against old value 100 returned -100%, correctly distinguished from a blank. The test used only synthetic entries in the isolated browser. Physical device coverage remains unverified.

## Recipe fraction and download repair

Actual isolated-browser failure: doubling `1/2 cup sugar`, `1 1/2 cups flour`, and `2 tbsp oil` returned unchanged half-cup sugar, incorrect `2 1/2 cups flour`, and correct 4 tbsp oil. The parser previously treated only an initial decimal as a quantity. Repair supports simple/mixed fractions and common Unicode fractions, preserves small quantities instead of rounding to zero at two decimals, rejects malformed numeric quantities, and explicitly marks free-text notes as not scaled. Empty ingredient lists no longer look like completed recipes.

Source inspection also confirmed the download handler simply copied the previous output after input edits. It now runs the scaler before downloading and only exports a successful calculation. An attempted pre-repair browser download timed out; actual downloaded-file retest is still required, rather than claiming that timeout proved a customer-facing download failure. Fourteen focused checks pass, 652 source files verify, and 153-page packaging passes. Production remains unchanged.

Hosted retest PASS on isolated commit `2bab5a0a03429f8c2dc6fe945cbdb205cc0f9f6e`: 2× scaling returned 1 cup sugar, 3 cups flour and 1 tsp salt for the simple/mixed/Unicode half fractions. Changing the new yield from 20 to 30 and directly downloading recalculated at 3×. The actual downloaded text file was opened and contained 1.5 cup sugar, 4.5 cups flour and 1.5 tsp salt, not the old 2× values. `1/0 cup sugar` displayed a specific line-1 correction message. The earlier timeout did not recur when using the observed download control. These changes remain staged with PR #18, not in production.
