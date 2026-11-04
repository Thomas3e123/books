# Gravity functional audit — November 4, 2026

**Release decision: HOLD. Audit incomplete; no production deployment performed.**

Repository: Thomas3e123/books. Audit branch: `audit/complete-site-2026-11-04`.
Baseline: `860626dec3caab605b085b20f0de978567387d3a`, matching Netlify production deploy `6aeb00ce30c8a404bd07037e` on `feature/gravity-migration-phase1-2026-10-22`.

This report distinguishes actual browser use, source checks, mocked backend tests, and work not yet verified. A successful page response is not proof that every feature on that page works. No claim is made that every button, template, transaction, or device has passed.

## Customer protection

Testing used a separate local copy with synthetic restaurant names and a reserved `example.invalid` registration address. The audit server blocks external service writes, payment actions, and cloud customer endpoints. No production credentials were loaded. Registration acceptance was simulated and stored no Netlify submission. Customer records were not deleted or changed. Live HTTP checks were read-only.

Source keeps its preview indexing restrictions. A separate production build directory is generated for eventual release. Nothing has been merged into the live branch or published.

## Confirmed defects and repairs

| Problem | Repair | Verification | Live status |
|---|---|---|---|
| Live robots.txt disallows all crawling; pages contain noindex and staging canonical URLs | Production-only build normalizes public metadata, sitemap origin, robots and headers; private app/manager pages retain noindex | Live defect observed; generated output tests pass; preview restrictions retained | Not deployed |
| Numbers Lab CSV contains blank results and internal field names | Export uses each calculator's displayed result and human-readable input label | Downloaded CSV contains 29.00%, 28.48%, $11.43 and other displayed results | Not deployed |
| Registration intercepts generated downloads and navigates away from the document owning the blob URL | Exempt blob/data generated output; keep static published resources gated | Failure reproduced with recipe export; repaired TXT downloaded; gate regression tests pass | Not deployed |
| Four pages overflow at phone width: home, Contact, handbook app privacy, prompt search | Targeted wrapping and control-width adjustments | Each rechecked without horizontal overflow at 390px outer viewport | Not deployed |
| Room label/search text lack contrast; phone header elements overlap | Match navigation text color and arrange phone header in two rows | Computed colors, screenshot, phone menu open/close and inventory search verified | Not deployed |
| Quick-tool Copy Result gives no success feedback and no unavailable-clipboard fallback | Success feedback plus selectable text fallback | Successful copy checked against browser clipboard; fallback code not forced in browser | Not deployed |
| Guide registry says 215 prompts; active search dataset contains 350 | Update count and prompt resource label | Count compared with actual 350-entry dataset | Not deployed |
| Broad SOP navigation rule intercepts SOP Library; no explicit Handbook Creator route | Put specific SOP Library, handbook and prompt routes first | Five routing regression cases pass | Not deployed |
| Live Permissions-Policy disables microphone, conflicting with Work Study recording | Permit same-origin microphone; keep camera/geolocation disabled and browser permission required | Live header and recording source establish defect; configuration repaired; actual hardware recording not verified | Not deployed |
| Existing quick-tools test has malformed regular expression and cannot run | Correct regex escaping | Eight quick-tool checks pass | Test repair only |

These changes address visitor discovery, usable navigation, and saving completed work. They preserve Founding Year free access and do not add a new payment restriction or weaken Gravity's proof requirements.

## Coverage and results

| Check | Result | Limits |
|---|---|---|
| Live page/download requests | 301/301 HTTP 200 | HEAD/response checks, not full downloaded content or customer transactions |
| Static source sweep | 153 HTML, 125 JS, 7,128 local links, 1,053 asset references; zero findings | 31 external references excluded; dynamic service behavior requires separate tests |
| Responsive browser sweep | All 153 HTML entries opened at 390px and 1280px; four overflow defects repaired | Responsive Chromium iframe widths, not physical Android/iPhone; gated apps show access page |
| Menus and global search | Navigation present in page sweep; mobile menu open/close and inventory search tested | Every nested menu interaction not individually exercised |
| Stored downloads | 156 PDF/Office/archive files pass structural checks | PDF parsing/ZIP CRC; not every rendered page, macro, installer or Windows execution |
| Build | Source manifest verifies 652 files; handbook bundle builds; production package contains 153 HTML pages | Netlify production build itself not run |
| Regression checks | 13 checks pass across quick tools, generated-download gate and release/Guide tests | Includes source and VM assertions, not all end-to-end behavior |

## Actual tool use

| Tool | Inputs / calculations | Save and reopen | Downloads / print | Outstanding |
|---|---|---|---|---|
| Gravity Aware quick tools | All four forms completed with unknown, needs-review or verified examples; evidence/owner/deadline boundaries retained | Deliberately stateless | Copy result verified | Other combinations; print/file outputs |
| Gravity Aware assessment | 20 Unknown answers produce 20 unknowns and three priorities | Not tested | Print invoked; actual PDF/print not captured | Full answer matrix; printer output |
| Numbers Lab | All 12 calculators exercised with known expected answers | Stateless; reload clears entries | Repaired CSV downloaded and contents inspected | Print output; additional boundary inputs |
| Quick Tools | Recipe 10→25 portions: 2lb→5lb, 1.5 cups→3.75; 212°F→100°C; overnight shift less 30min break→7.5hr; 7h30→7.5; $100 tips at 1:3→$25/$75; cash→$102.25; cases→27 each; Nov4+3→Nov7; 100→125→25%; rotation correct; label rendered | Not tested | Recipe TXT downloaded after fix | Every tool export; invalid-input matrix |
| Shift Lab | 8-hour shift at $20 gives $160 and 1.6% of $10,000 sales | Saved week and reopened employee | Backup JSON and CSV downloaded; employee schedule print action publishes v1 locally | Overtime and next-week copy subsequently passed below; imports, employee QR, cloud sync and actual print remain |
| Inventory Center | Profile/location/item created; 10 units at $4 = $40; missing-profile safeguard works | Item persists after reload; tour advances | Backup JSON downloaded | Barcode hardware and cloud sync; receipts/transfers/counts/restore subsequently passed below |
| Recipe Works | Audit Sauce, yield10, ingredient2lb at $3 gives $6 batch | Recipe saved and found after reload | Full backup JSON downloaded | Approval/revision/import flows, cost-unit edges, print |
| Work Study Lab | Synthetic timed work step recorded and finished; measured output shown; unverified demand not represented as proven | Saved study resumes with blockers and sustainable-pace hold | Not yet exported | Complex study pathways, recordings/transcription, publishing, print |
| Document Studio | Manager Handoff Form filled with test restaurant, responsible role and frequency; preview updates | Saved draft survives reload | Editable export reports created, but no browser download completed | All 152 previews subsequently passed below; actual DOC and print output still unverified |
| Forms Personalizer | Custom title and two checklist lines rendered | Draft survives reload | PNG proof downloaded; package ZIP did not complete in test browser | Uploads, all templates, actual package/print |
| QR Generator | Start Here URL generates 33×33-module QR preview | Not tested | Download link invoked but no file completed | Decode/scan with physical phone, SVG/PNG downloads, print |
| Handbook Creator | Synthetic restaurant and mission; remaining examples filled; 23-page preview generated | Name and answers survive reload | PDF/Word/backup report ready but no browser download completed | Actual exports/print on HTTPS, all levels/design paths, mobile app behavior |
| Book Reader | All 15 books and eight published articles selectable with matching title; Quiet Gravity text reads correctly | Next to part8; reload resumes part8 | No audio generated in isolated test | Hosted narration, seek/continuous audio, mobile background audio |
| SOP Foundry / Employee Library | Access and room-selection screen loads | Authenticated UI not entered | Not tested | PIN login, editing, revisions, employee training, posters, sharing and full hosted lifecycle |
| Ask Gravity / Help | Source registry and specific navigation repaired | Not tested | Not applicable | Hosted answers, current-knowledge completeness, voice, history |

Calculator evidence: labor29%; food28.48%; menu11.43; margin64%/markup177.78%; waste3.83%; inventory usage4600; sales/labor-hour38.46; portion2; yield84%; par35; sales variance2000/20%; break-even12500. These are arithmetic test fixtures, not restaurant performance advice.

## Backend/source checks already passed

- Labor engine: 13 cases.
- Inventory outflow: historical costing validation.
- Foundry employee isolation: 27 mock cases, no external requests.
- Cloud backup: 10 mocked contract cases covering ownership, authentication, versions, retention and input checks.
- Work Study: 56 existing suites passed; many are source assertions, not interactive workflow validation.
- Gravity Report tests: all 30 issue records and release gates preserved; reading test passes against production output; listening source checks pass.
- Handbook: free-access boundary, generated PDF/Word bytes, later payment gate and simulated valid/tampered/refunded/pending/underpaid licenses pass. No real payment was taken.

## Critical remaining checks before release

1. Establish an HTTPS hosted test environment with a separate database/Identity namespace, test-only mail delivery, and sandbox payment configuration. Do not merely enable a branch preview that inherits customer credentials.
2. Complete actual document, ZIP and QR exports there. The isolated browser produced CSV/TXT/JSON and one PNG, but several other exports timed out. Their cause is unresolved; application success messages are insufficient evidence.
3. Complete SOP Foundry manager/employee workflows through the secure login flow. The existing mock isolation tests do not replace this.
4. Test real registration/contact/newsletter delivery against a test destination; verify no customer communications are sent. Current local registration test is a simulation only.
5. Verify cloud save/reopen/restore across separate test users and devices; hosted employee access and QR links; AI answers, voice and recording services.
6. Complete remaining buttons/templates, edge cases, uploads/imports, real Android/iPhone checks and printer/PDF layout verification. Windows executables cannot be certified by ZIP integrity alone.

## Coordinated deployment preparation

The candidate changes are collected on one audit branch. Production build command is `npm run build && node scripts/build-gravity-production.cjs`, publishing `build/gravity-production`. Preview/default builds retain `site` and noindex. Functions directory remains unchanged. No database migration or customer-data deletion is included.

After critical checks pass: verify the live branch has not advanced, merge the reviewed candidate once, run one production deployment, smoke-test discovery/navigation/registration/tool exports, and retain the previous deployment as rollback. Do not merge this audit branch merely because static checks pass.

## Evidence files

- `gravity-live-http-2026-11-04.json`: each of 301 live response checks.
- `gravity-download-integrity-2026-11-04.json`: repository document/archive integrity results.
- `gravity-source-sweep-2026-11-04.md`: source inventory and findings.
- `gravity-work-study-checks-2026-11-04.json`: existing suite outcomes.
- `evidence/`: downloaded synthetic outputs and visual verification; contains no customer data.

This is a checkpoint report with an explicit release hold, not a completed whole-site certification.


## Continuation checkpoint — November 4, 2026

Production remains unchanged and draft PR #14 remains on hold.

### Additional browser checks passed

- **Inventory full lifecycle:** start with 10 units at $4; receive 5 at $5; transfer 3 from Audit Walk-in to Audit Line Cooler; reject waste of 4 when only 3 available; post waste of 1; reject a full count with one blank line; post counts of 11 and 2. Reload shows 13 units valued at $65, with six history rows retaining the original opening cost and the later cost change. Export History CSV and full backup JSON downloaded. Restore of that synthetic backup succeeds and preserves the $65 valuation and history. Count differences remain distinct from classified waste.
- **Document Studio:** all 152 distinct templates selected through all category buttons; every title matches its preview, and every preview contains document content. This verifies template opening/rendering only, not every customized document, export or print layout. Evidence: `gravity-studio-templates-2026-11-04.json`.
- **Shift Lab:** five 9-hour days at $20 produce 45 hours and $950 (40 regular hours plus 5 hours at 1.5×), or 9.5% of $10,000 forecast sales. Editing a previously published week sets REVISED and requests a new employee QR. Opening the next week clears shifts/sales but preserves employee details. Copy Previous Week restores the 45-hour/$950 schedule; save and reload preserve it.
- **Forms configuration:** all three source Netlify forms are detected on the live project: gravity-registration, gravity-customer-experience, gravity-report-opt-in. No submissions were read, changed or sent. Detection does not prove delivery or notifications.

### Export investigation

The real handbook export handler generated a full-example PDF and DOCX using 173 synthetic/example answers. The PDF has 27 letter-sized pages; all pages rendered and a contact sheet showed intact margins, section flow and page footers. PDF text extraction recovered the document text. The PDF renderer emitted Adobe-Identity-H character-collection warnings; cross-viewer/font compatibility remains to be checked. This is a layout/export-engine test, not legal validation of example wording.

The same generated PDF was served through a plain download link in the isolated test environment. It still did not produce a browser download, including through the browser's direct download action. Therefore, the unsuccessful browser transfer is not isolated to the handbook's export button. Browser PDF/DOC/ZIP transfer remains unverified; no speculative application download change was made.

### Access blockers observed

The isolated SOP Foundry Build Room is still on its PIN screen. The earlier secure sign-in request could not attach; its browser handoff remains available. Netlify dashboard access is not signed in. Existing connected Netlify tools inspect projects and configuration but do not provide deployment uploads. Dashboard sign-in is needed to proceed with a separate HTTPS test deployment, unless an authenticated deployment capability becomes available. No new Netlify project has been created and no live settings were changed during this continuation.
