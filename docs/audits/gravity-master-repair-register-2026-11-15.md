# Gravity master repair register

**Snapshot date:** November 22, 2026
**Purpose:** One working queue for the Gravity site audit. New findings must be added here, deduplicated, prioritized, and given an evidence/status label before they are reported as another “new error.”

## November 22 public navigation and help entry points

**SRC-48.** The Help Center opens with one primary action, Browse Common Questions, and a secondary Report a Problem link. Getting Started remains in the next help section.

**SRC-49.** A request to a missing production URL returned HTTP 404 with the Gravity logo, visible business branding and recovery links. The branded page already exists.

**SRC-50.** Confirmed the homepage, support and other standard public headers shipped different links before JavaScript loaded. The Gravity build now publishes the same nine links in the same order as the enhanced menu. This supersedes the longer initial menu described in SRC-47. The Report and tool-specific navigation retain their own controls.

**SRC-51.** Standard public-page action buttons and compact book actions use a red primary style and a white, outlined secondary style. Layout, interactions and specialized application controls retain their existing behavior.

**SRC-52.** Reduced the enhanced menu from ten links to nine. Pilot enrollment remains on the homepage and beside Help in standard footers. Detailed resources remain accessible through the public hubs.

## November 22 first-visit menu labels

**SRC-47.** The standard menu names the tool finder and restaurant systems directly. The initial HTML also identifies the checkup, procedure-writing workspace and resource kits beside their product names. The last two were selected after inspecting the public menu and destination pages because the audit named only three of its five labels. Destinations, order, and separate workroom and Report navigation are preserved.

## November 22 shorter Help Center form

**SRC-46.** Reduced 14 visitor-facing support fields to optional name, reply email and message. Only email and message are required. Kept the existing Netlify form identity and submission field names, reference and timestamp, spam trap, retry handling and email fallback. The separate Ask Gravity tool is unaffected.

## November 22 Overview workbook count

**SRC-45.** Page 6 now dates the expansion to 350 prompts to November 2026. Verified the count against the current Word workbook and the 350-entry searchable index. Compared the PDF structure tree, all link destinations, extracted text and rendered pages with the tagged edition. Only the revised line changed. Queue for the next Gravity deployment.

## November 22 keyboard focus and accessible Overview PDF

**SRC-43.** Public pages use the measured header height for the document’s scroll padding. Keyboard focus in main content gets a visibility check if the browser leaves it underneath the header. The catalog reverse-Tab regression covers a control without its own ID.

**SRC-44.** Added a document structure tree to the eight-page Overview, with heading levels, paragraphs, lists, reading order and all 14 link annotations. Marked repeating footers and decorations as artifacts. Rendered all eight before/after page pairs at 108 dpi and compared pixels, text and URLs. All were identical. This was a structure repair to the dated October edition. Its 215-prompt reference predates the current 350-prompt workbook.

## November 22 control boundaries

**SRC-42.** Confirmed low-contrast input borders on the light Registration/Review, Contact, Testing Room and Pilot Room forms. Darkened these borders and the standard light-background outline button edge. The mobile Menu button uses its light text color for the border on the dark header. The original audit did not identify its 1.06:1 control.

## November 22 visitor form autofill

**SRC-41.** Added field-specific autofill hints to eight visitor controls in Registration, Review, Pilot Room and Testing Room. Testing Room sends a phone number only for a phone appointment. Registration already marked its email address for autofill. Its optional email consent checkbox stays unchecked and requires a visitor choice.

## November 22 descriptive catalog links

**SRC-40.** Replaced 28 generic Details and View Details labels with visible destination names on Books (12), Toolkit (11), Free Resources (4) and Releases (1). Checked all 14 destination pages against their main headings. The links retain their original URLs.

## November 22 Gravity Assist section headings

**SRC-39.** The output-options card and footer directory both used “Gravity Assist” as their heading. Renamed them “Print, save, or download your work” and “Gravity Assist tools” to describe their contents.

## November 22 homepage and welcome descriptions

**SRC-38.** The normal homepage summarizes Gravity’s operating systems, procedures and tools. Requests to the explicit welcome view receive a description of the problem picker and its suggested resources. Both descriptions are in the server response and match their respective social descriptions. The homepage stays canonical.

## November 22 homepage SEO title

**SRC-37.** Shortened the homepage title to “The Gravity System | Restaurant Leadership & Operations” and aligned the matching social title metadata. Release with the queued SRC-36 invitation change.

## November 22 homepage Windows testing invitation

**SRC-36.** Moved the existing Windows beta invitation and all three links into the homepage HTML. Its heading, both paragraphs, and destinations are available before scripts load. Removed the two script additions that previously built this section. No changes to Windows packages or installer status.

**SRC-51.** Standard public-page action buttons and compact book actions use a red primary style and a white, outlined secondary style. Layout, interactions and specialized application controls retain their existing behavior.

**SRC-52.** Reduced the enhanced menu from ten links to nine. Pilot enrollment remains on the homepage and beside Help in standard footers. Detailed resources remain accessible through the public hubs.

## November 22 first-visit homepage and mobile menu

**SRC-35.** A fresh homepage visit opened the full-screen guide over the header. The guide now opens only via the explicit welcome link and includes a close button at the top. A separate dependency affected public mobile navigation: before the shared script registered its tap handler, CSS hid the links and displayed an inert button. The compact header now exposes the links until the button works. Browser regressions cover two consecutive tap-throughs, navigation with the script blocked, and opening and dismissing the optional guide. Physical handset verification is pending.

## November 22 homepage buyer question

Added “Why choose Gravity over alternatives?” immediately after the homepage introduction. A closing-shift example explains how a manager can use the standard, training, assignment and follow-up together. The heading and two sentences ship in the page HTML.

## November 22 grouped release verification

**SRC-33 and SRC-34 verified on production.** [Gravity deployment](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b035bd4831658707c2bd9d8) published commit `6b1a4ad3` after all four hosted checks passed on [PR #196](https://github.com/Thomas3e123/books/pull/196). The first link on each of the three public pages targets a unique, focusable main landmark. Both the public Shift Lab service worker and the versioned labor calculator matched the tested build byte for byte. Offline fallback was tested with simulated network loss. Before deployment, all 156 audited Gravity URLs returned HTTP 200 on the Gravity host, and the 584 section links in the returned pages resolved to static targets or the Workroom’s Blank SOP handler.

## November 22 Shift Lab offline labor calculations

**SRC-34 — Shift Lab omitted the labor calculator from its offline cache.** The live worker matched the source and the live scheduler calls the calculator when updating shift totals. With the network unavailable, the old worker passed the calculator request through. Added the public calculator script to the existing cache list and incremented the cache version. A service-worker regression test now installs the cache, simulates a network failure and checks the returned script for a versioned request. It failed before the repair and passed afterward. All 138 Node tests, source verification, the production build and strict link audit passed. Published together with SRC-33.

**Section navigation audit.** Checked 587 same-site fragment links on 129 pages in the 156-page production build. Of 293 distinct destinations, 292 were static targets. The remaining destination, Blank SOP, has an explicit form-opening handler in the live Workroom. All 156 built pages had unique element IDs and alternative-text attributes on their static images.

## November 22 keyboard navigation

**SRC-33 — Handbook Creator, SOP Library Volume 3 and Testing Room Manager.** Each live page had 11–15 navigation links before the content and lacked a skip link. Added a first-tab “Skip to content” link and a focusable main landmark on all three pages. The production build already had 121 skip links with unique targets. The new browser regression checks that Tab focuses the link and Enter moves focus to main on each repaired page. Verified on the public pages in the deployment recorded above.

## November 22 missing-page recovery

**SRC-32 — nested missing URLs lost their styling, logo and navigation scripts.** A live request for a missing page inside a directory returned the correct 404 status, but five distinct asset URLs inherited the missing directory and also returned 404. Changed the six affected stylesheet, logo and script references to root-relative URLs. Added a regression test for nested URL resolution. Verified 12 distinct internal main-content links from Contact and Help Center, including the report-problem and FAQ destinations. No forms were submitted. The production build, internal link audit and 137 regression tests passed.

**Verified live — SRC-32 closed.** [PR #193](https://github.com/Thomas3e123/books/pull/193) passed all four hosted checks. [Gravity production deploy 6b0357318ab05321720a38b8](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b0357318ab05321720a38b8) published commit `90892a73`. Three missing URLs, including a nested path and a deeper trailing-slash path, returned HTTP 404. On each recovery page the six distinct styles, scripts and logo assets returned 200 and matched the build byte for byte. Return Home, Browse Books and Open Downloads all opened successfully.

## November 22 published Quick Tools calculations

Fetched the public Quick Tools HTML and executed its calculator handlers against synthetic input controls. All 12 existing validation cases passed, covering fractional recipe scaling, malformed ingredients, overnight shifts and breaks, decimal hours, bill and coin counts, weighted tips, case conversions, leap dates, percent changes, rotations and unit conversions. An additional 396 tip-pool scenarios tested eleven totals and 36 weight combinations. The individual shares always summed to the pool and differed from each exact proportional share by less than one cent. A 10 p.m.–6 a.m. shift with a 30-minute break returned 7.50 paid hours. Two twenties plus $1.25 returned $41.25. These checks cover the deployed calculation logic using simulated controls. All 136 repository regression tests also passed. No repair or site deployment was needed for this check.

## November 22 tool routes and resource page titles

**SRC-31 — Gravity resource browser titles.** A live sweep of the 22 main-content links on Start Here and 31 on Gravity Assist reached all 39 distinct destinations. The linked downloads matched the source files. All 11 Quick Tools fragment links resolved to a single section with the corresponding tool heading. The Overview Booklet and Owner–GM Governance & Agreement Pack were the two pages in the production build whose browser title identified the separate publisher as the site. Updated the browser titles to identify Gravity while retaining the publisher attribution in the page content. Corrected the article preceding “8-page” in the overview metadata. Group this with SRC-30 and verify both source repairs after publication.

**Verified live — SRC-30 and SRC-31 closed.** [PR #190](https://github.com/Thomas3e123/books/pull/190) passed all four hosted checks and shipped together with PR #188 in [Gravity deploy 6b03443625f0507b6b1ac57c](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b03443625f0507b6b1ac57c), commit `414f5ab7`. Both public browser titles identify Gravity and both pages retain their publisher credit. The Quiet Gravity caption, image description and accessible link name identify the first contents page. The live full-size Builder image matched the corrected asset byte for byte and the 480-pixel public thumbnail matched the refreshed image in the raster comparison. The 156-page build, internal link check, 676 source hashes and 136 Node tests passed.

## November 22 live catalog and Reader download verification

All 15 PDF URLs in the live Book Reader catalog are reachable from the public Books catalog. Thirteen downloads appear on Books itself. SOP Library volumes 1 and 2 are linked through the SOP Library set page. Fetched and opened every PDF from its public URL. All matched the reviewed release files byte for byte and contained 3,889 pages in total. All 2,024 embedded bookmarks in the six PDFs that contain them point within their respective books. This verifies the downloadable editions and bookmark page bounds. The 676 source hashes and 136 Node regression tests passed. No catalog repair or production deployment was necessary. The SRC-30 preview changes remain queued for live verification with the next deployment.

## November 22 book preview audit

**SRC-30 — book preview accuracy.** All 44 thumbnails and larger images on 11 public book pages opened. Each gallery's images corresponded to the correct book and appeared in increasing PDF page order. The 160 responsive variants with explicit width descriptors decoded at their declared widths. One image showed an earlier revision of the correct page. The Station Operations Builder contents preview used the older library name and omitted the Gravity SOP Test entry visible in the current PDF. Regenerated that one preview directly from page 3 of the linked PDF at the existing 1100 × 1424 dimensions. The Quiet Gravity contents continue onto page 8, whereas its single-page preview shows page 7. Updated the caption, alternative text, and accessible link name to identify it as the first contents page.

**Source repair, pending next production release.** Verified the updated Builder preview contains the current SOP Test entry and the built Quiet Gravity page contains all three corrected labels. The 156-page build, 676 source hashes, internal link audit and 136 regression tests passed. Batch the repairs with the next Gravity deployment. After publication, compare the live Builder image with the repaired file, verify the responsive thumbnail and confirm the new Quiet Gravity labels.

## November 22 system package downloads and verification

**SRC-29 — Customer Resources download directions.** The card for all 15 systems promised a master manifest, checksum and validation record. Its button landed above the release history, while the individual package links were farther down the page. Updated the card to describe the material provided and point directly to the clearly labeled system downloads table. The separate release-history link retains its original destination.

All 25 ZIPs downloaded from the public Gravity site matched source byte for byte. ZIP integrity checks passed for all 277 archive members. All 139 entries in the 14 included SHA-256 lists matched their named files. Those dated lists cover selected release files. They omit the later feedback insert, and the Facilities list also omits its validation report. The Manager Development ZIP contains no separate checksum list. The public table contains 15 unique system ZIPs. The production build, 676 source hashes, internal links and 136 Node tests passed.

**Verified live.** [PR #186](https://github.com/Thomas3e123/books/pull/186) passed all four hosted workflows. [Gravity production deploy 6b03284cd4e487aa319b36ff](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b03284cd4e487aa319b36ff) published commit `a2b390bc`. The public Customer Resources button targets `/releases#current-system-downloads`. That heading exists once on the live release page and its table links to all 15 verified current system packages. SRC-29 is closed.

## November 22 downloadable workbook calculations

**SRC-28 — blank forecasts.** In both the standalone and packaged Sales Intelligence and Forecasting workbooks, each unused Daily Forecast row showed `#VALUE!` for its low and high estimates. Recalculating all 18 distinct published workbooks reproduced 200 errors per affected workbook. The other 16 recalculated without error cells. Both repaired editions leave the estimates blank until a date is entered and preserve the existing confidence-factor calculation. Test copies recalculated with zero error cells. A zero-dollar forecast returned zero for both bounds. A $1,200 forecast with low confidence returned $960 and $1,440.

All 19 live downloads containing workbooks matched source before repair. Across 336 worksheets, 38,483 formulas were screened for invalid sheet references. All 505 dropdown definitions had usable inline lists and target ranges. A Daily Journal test with $1,200 in sales, 60 guests and 12 labor hours calculated $20 per check, $100 in sales per labor hour and five guests per labor hour. These are structural and calculation checks in LibreOffice. Interactive Excel and physical printing remain separate. The updated package passed its checksum manifest. The 156-page production build, 676 source hashes, 136 Node tests and internal link checks passed.

**Verified live.** [PR #184](https://github.com/Thomas3e123/books/pull/184) passed all four hosted checks. Gravity [production deploy 6b0326469da66f85d924fc8b](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b0326469da66f85d924fc8b) published commit `116c8083`. Both public downloads matched the tested files byte for byte after publication. SRC-28 is closed.

## November 22 Office download references

**SRC-27 — incorrect printed references.** Quiet Gravity cited Kristin Neff's 2003 article with an incorrect DOI. The Employee Training and Certification system listed an FDA training address that returned 404. Corrected the book's Word, PDF and Reader editions, the public training manual preview, and the manual and slides in both editable and PDF formats inside the system package. The journal confirms DOI `10.1080/15298860309032`. The FDA lists its training resource under `/food/retail-food-protection/retail-food-industryregulatory-assistance-training`.

Checked 107 Office file copies (98 distinct files), including standalone and packaged downloads. All 3,529 internal package relationships, 268 Word bookmark links and the target sheet for 12 spreadsheet glossary links resolved. None of the external hyperlink targets pointed to Thomas Monroe Books. Of 73 distinct web hyperlink destinations, 54 returned 200 and 19 limited automated access. Checking additional URLs printed as text revealed the two 404s above. Rebuilt the training package checksums. PDF checks preserved page counts and surrounding words and confirmed the corrected citation text. The 156-page Gravity build, 676 source hashes and 136 Node tests passed.

The corrected FDA page and the DOI registration both returned HTTP 200. A second text scan of standalone and packaged PDFs found zero remaining occurrences of either obsolete address. The production build's internal link audit reported zero missing paths.

The Reader catalog and its embedded fallback now carry matching character counts for all 15 published text files. This reconciled the changed book and 12 previously stale counts. The fallback catalog also had the old 325-prompt title for the published 350-prompt workbook. All fallback records now match the primary catalog.

**Verified live.** [PR #182](https://github.com/Thomas3e123/books/pull/182) passed all four hosted regression workflows. [Gravity production deploy 6b031487fde51239f0aadda9](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b031487fde51239f0aadda9) published commit `665ab27e`. All 21 public files matched the tested production output byte for byte, including the four downloads, both Reader catalog sources and all 15 book texts. SRC-27 is closed.

## November 22 QR destination audit

**SRC-26 — downloadable Foundry QR.** The public image at `/assets/images/gravity-sop-foundry-qr.png` encoded the old Thomas Monroe Books host. Replaced its destination with the canonical Gravity SOP Foundry page, preserving the filename and 185 × 185 dimensions. The new code decoded at original size, at 150 pixels, rotated 12 degrees and with mild blur. The Gravity destination returned HTTP 200. No HTML reference to this static image was found in the site source. This repair applies to newly fetched copies.

[PR #180](https://github.com/Thomas3e123/books/pull/180) passed all four hosted workflows. The 156-page production build and 136 local Node tests passed. [Gravity production deploy 6b02976fc528d3f775cbdfd6](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b02976fc528d3f775cbdfd6) published commit `c293f5e6`. The image downloaded from the public Gravity domain matched the reviewed file byte for byte and decoded directly to the Foundry page, which returned HTTP 200 with the correct title. The old printed destination also redirected to that page during the audit. SRC-26 is closed for the downloadable image.

Automated decoding covered 9,293 rendered pages in 249 standalone and archived PDFs, plus 282 distinct images. No former-host QR was detected inside the PDFs. The Gravity contact and review destinations and the Square support checkout opened successfully. The corrected Foundry image was verified digitally. Physical print quality remains open under QA-07.

## November 21 external PDF reference follow-up

Of the 19 previously restricted addresses, 12 are now verified. All three exact Google Business Profile Help addresses opened with the intended content (local ranking, the Help Center, and customer reviews). A separate [read-only check](https://github.com/Thomas3e123/books/actions/runs/44991123286) retrieved all six Ready.gov pages and all three CISA pages at the cited addresses with HTTP 200 and matching page titles.

Seven exact URLs still returned HTTP 403 from the independent runner. These remain unverified. A related publication or indexed search result is insufficient to close an exact link. No new broken link was confirmed and no PDF replacement or website deployment was needed.

- https://www.fema.gov/national-disaster-recovery-framework
- https://www.fema.gov/about/glossary/incident-command-system
- https://www.fema.gov/emergency-managers/nims/components
- https://www.fema.gov/emergency-managers/national-preparedness/continuity/documents
- https://www.fema.gov/emergency-managers/national-preparedness/continuity
- https://www.fcc.gov/consumers/guides/stop-unwanted-robocalls-and-texts
- https://www.fcc.gov/general/telemarketing

## November 21 downloadable overview and PDF references

**SRC-25 — public overview and moved sources.** The public one-page overview printed the Gravity address without a clickable annotation and advertised 13 books and 215 AI prompts. The Reader catalog lists 15 books and the published workbook contains 350 prompts. Corrected both counts and linked the printed address. Replaced two confirmed 404 destinations with the same official [CDC article](https://www.cdc.gov/niosh/bulletin/2021/supportive-leaders.html) and [FDA Food Code page](https://www.fda.gov/food/retail-food-protection/fda-food-code). The corrections cover three standalone manual previews and the corresponding manager development, standards and intelligence, and risk and continuity packages, including affected editable source references.

The 102 standalone PDFs contained 318 web links to 112 distinct URLs and 317 internal page links. All internal links pointed within their documents. Of the web destinations, 91 initially returned 200, two returned 404, and 19 blocked or rate-limited automated requests (FEMA, Ready.gov, FCC, CISA and Google). The two replacement URLs returned 200. The 19 restricted URLs remain unverified. Validation compared PDF page sizes and extracted words, checked unrelated link destinations, and verified ZIP integrity, member lists, changed Office XML, and updated package checksums.

[PR #177](https://github.com/Thomas3e123/books/pull/177) passed all four hosted checks and shipped in [Gravity production deploy 6b027972c586c564cae526d7](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b027972c586c564cae526d7) at `84efce2a`. All seven public downloads matched the verified artifacts byte for byte. The production build, 136 Node tests and 5,519 internal references passed. SRC-25 is closed for the corrected overview and two moved sources.

## November 21 manager keyboard access and file pickers

**SRC-24 — manager sign-in and retry.** Testing Room did not submit from the key field on Enter. Both manager pages fetched the initial list twice, hid the sign-in controls before the second fetch completed, and left keyboard focus outside the opened workspace. Use a native form and a single roster request, keep errors visible in a status region, and move focus to Testers or the pilot status filter on success. Synthetic desktop browser regressions failed before the repair and passed after it, including retry after temporary service failure.

**SRC-09 follow-up.** Keyboard activation in Inventory Center opened the correct named JSON restore and CSV import pickers. Targeted browser checks on six routes found no violations in the seven rules checked for input, select and button names, ARIA attributes, focusable hidden content, and nested controls. Synthetic manager and tester sessions are isolated from live messages. Actual speech from an assistive-technology device remains unverified.

[PR #175](https://github.com/Thomas3e123/books/pull/175) passed all four hosted checks and shipped in Gravity [production deploy 6b01f304313583e7556b0f84](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b01f304313583e7556b0f84) at `94322a48`. Both canonical pages served the repaired forms. Browser checks using that released HTML and synthetic service responses verified failed entry, keyboard retry, correct focus and exactly one request per attempt. SRC-24 is closed for these behaviors. The 156-page production build, 5,519 internal references, 136 Node tests and 244 desktop/mobile browser tests passed.

**QA-04 microphone follow-up.** Two additional browser runs simulated denied microphone permission, verified the visible error, retried with a synthetic audio track, and successfully recorded, marked, saved and exported the recording. Physical phone audio quality and playback remain open.

## November 21 backup recovery follow-up

**SRC-23 — recovery history and retry feedback.** In Shift Lab and Inventory Center, unlocking could replace the recovery-history error with a success message. A manual save attempted while automatic backups were paused could also announce a retry that was never scheduled. The deployed repair preserves the recovery-history notice independently, clears stale choices, disables recovery until a copy is available, and offers a history-only retry. A rate-limited manual save now tells the manager when to try again.

The production build and 136 Node tests passed. All ten backup API contract checks and five isolated browser workflows passed, including an interrupted history request followed by retry and recovery in a second browser. Browser tests used synthetic identity and storage. QA-01 still needs a disposable, email-confirmed test account for hosted verification.

[PR #173](https://github.com/Thomas3e123/books/pull/173) passed all four hosted workflows and shipped as Gravity production commit `89642332` in [deploy 6b01da5edbdb57aeb8cc603a](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b01da5edbdb57aeb8cc603a). The canonical Shift Lab, Inventory Center and account pages each referenced the new asset version and returned the tested JavaScript byte for byte. The additional eight isolated account onboarding checks passed. SRC-23 is closed.

## November 21 site sweep and Report feed

- **Production closeout.** [PR #171](https://github.com/Thomas3e123/books/pull/171) passed all five hosted checks. Netlify published Gravity commit `70790e45` in [deploy 6b0187d57f7636fabd5480fe](https://app.netlify.com/projects/gravity-leadership-system/deploys/6b0187d57f7636fabd5480fe). The canonical feed returned all 20 distinct items newest first, led by Issue 13 dated November 20. All six repaired routes served the tested styles. All 156 local pages fit at both 320 and 360 pixels, and the final desktop/mobile suite passed all 240 tests. Thomas Monroe Books still serves its previous production deploy.
- **Website baseline.** Gravity production deploy `6b008501f6984904dd06561a` serves `0f616bd`. Thomas Monroe Books is separately published from main, deploy `6b006c24656dd2371e2d26d7`.
- **SRC-21 — RSS publication order.** The November 21 feed contained 20 items but led with the October move announcement. Fixed live in PR #171. The date-based regression failed before the repair and passed afterward. Sorting the feed by Central publication date and time keeps the latest article first and preserves the release gate, full catalog, and item identifiers.
- **QA-10 — site link checker.** The static checker reported 34 missing links across 156 pages because it checked the filesystem for Report function routes. It now runs the Report handler locally for those destinations. A deliberately nonexistent story still failed. The clean sweep examined 629 files and 156 HTML pages and returned zero errors or warnings. The production build, all 135 Node regressions and the Report release checks passed. All 238 existing desktop/mobile browser tests passed using headless Chromium. The production link audit found zero broken destinations across 5,519 references. All 135 distinct live sitemap addresses opened with matching canonicals, a title and indexable page metadata. All 149 unique PDF, Office and ZIP downloads linked from the production HTML matched release files byte for byte.
- **SRC-22 — narrow phone layout.** At 360 pixels the review form and the Foundry HTML manual widened the page. At 320 pixels Windows Programs, Privacy, Releases and Cloud Vault also overflowed. Fixed live in PR #171 by allowing form fields to shrink, long text to wrap, and Vault cards to fit the available width. A dedicated browser regression checks all six destinations at 320 pixels.
- **Owner confirmations.** Thomas confirmed the phone QR scan, Reader playback with the phone locked, and account signup, email confirmation and login. Encrypted backup/restore, physical print output and phone microphone capture still need independent evidence. Windows remains deferred.

## November 20 search discovery repairs

[PR #169](https://github.com/Thomas3e123/books/pull/169) passed five checks and shipped in production deploy `6b008501f6984904dd06561a`. The canonical Report page served all 20 published links in the initial HTML, with and without a trailing slash. The two sitemaps listed 135 distinct addresses with no overlap. The three worked examples and their companion links passed live checks. Both Google verification tags are present. Google confirmed ownership of the canonical HTTPS URL-prefix property and reported that the submitted sitemap index was processed successfully. Performance and indexing reports are still processing. [Audit and measurement plan](gravity-google-search-discovery-2026-11-20.md).

## November 20 print, QR and Reader follow-up

All five live Field Sheets rendered as single US Letter pages. The clickable article addresses on sheets 01 and 02 extended into a quarter-inch bottom printer margin at full size. Raised both footers and their clickable areas by 12 points. All words now fit inside the simulated printable area on all five sheets. The two revised sheets preserve the original text and article destinations. A paper proof on an actual printer remains open.

An existing Start Here PNG export decoded to the correct HTTPS address at original size, at 150 pixels square, rotated 12 degrees, and with reduced contrast plus mild blur. Physical camera scanning remains open.

In the live public Reader, Issue 01 played with Cedar narration, paused, advanced 15 seconds and restored Part 1 at exactly 0:27 after reload and reselecting the article. Physical phone lock and resume remain open. Work Study recording and export previously passed with synthetic audio. For physical playback, use Export Recording + Markers and open the audio file in the device player. Hosted cloud recovery still requires an isolated verified customer account.

## November 20 first-visit and restaurant profile checks

All 11 choices in the live homepage welcome panel reached their destinations, including the specified sections. All 136 URLs across the live sitemaps opened at their listed addresses, had a page title and matching canonical URL, and returned no explicit noindex directive in the checked metadata or headers. All 97 distinct PDF links in the production HTML returned a PDF signature. The optional Start Here guide contained six pages.

A scan across 156 built HTML pages checked 583 links to sections in resolved HTML destinations. The SOP Foundry new-SOP link opens its editor through script. The other checked section links had matching targets.

The restaurant profile controls in 12 workspaces previously reported success even if the browser refused a save or clear. [PR #166](https://github.com/Thomas3e123/books/pull/166) verifies the write before applying the profile, preserves entered details on failure and lets the manager retry. Desktop and mobile Chromium covered failed save, failed clear, retry and reload, plus the path from the homepage through Start Here and Gravity Assist to saving and backing up a Shift Lab week and returning. All 238 browser tests, 135 Node tests and six PR workflows passed. Production deploy `6b007193527fc5ba7f7dee8c` served the tested shared script byte for byte through the verified profile routes.

## November 20 scheduled release and Ask Gravity

The canonical Report release check passed after Issue 13 opened on schedule. The catalog contained 19 published numbered stories out of 36, the RSS feed contained 20 entries including the separate announcement, and the Report sitemap contained 21 URLs. The next scheduled issue returned 404.

The live Guide initially answered the count correctly but could not identify the November 20 issue. [PR #164](https://github.com/Thomas3e123/books/pull/164) supplied the release dates and issue numbers for published entries. The production Guide then answered with 19 published stories and Issue 13, “Why Do Restaurant Managers Avoid Difficult Employee Conversations?” A separate test confirmed the Guide receives no scheduled titles through this lookup. All 135 Node tests and three PR checks passed. Production deploy `6b006da01959e48c9b104338`.

## SOP Foundry import review, November 19

[PR #161](https://github.com/Thomas3e123/books/pull/161) fixed duplicate handling that reset the manager's choice after another item entered the review queue. Skipping all duplicates now issues no workroom write and reports the actual count. A failed save preserves the queue for retry. Pasted training requirements and the role and training columns from Gravity's own exports now survive import.

Desktop and mobile Chromium completed the Build Room sign-in, keyboard paste, draft save, reload and duplicate skip on fictional data. All 236 browser tests and 135 Node tests passed. Production deploy `6aff334adc16e4fbacc5906d` served the tested import script byte for byte. Spoken announcements inside the room remain unverified.

## Download, Report and Testing Room verification, November 19

The Gravity Report release check now defaults to the canonical domain. The November 19 run matched all 36 schedule records, all 18 published stories and their canonical URLs. RSS included 19 entries with the move announcement and the Report sitemap listed 20 URLs including its landing page. A separate exact-set comparison confirmed there were no missing, extra or duplicate entries. The next scheduled story returned 404 with noindex. The optional `--previews` run retains the preview noindex checks.

All 149 distinct PDF, Word, Excel, PowerPoint and ZIP downloads linked in the public build matched the reviewed files byte for byte on the live Gravity site. All 157 packaged files in these formats opened locally. The 102 PDFs contained 6,612 readable pages and no clickable links to thomasmonroebooks.com. Physical print and phone scan checks remain open.

The Brevo handler and confirmation page matched production byte for byte. The confirmation redirect, consent disclosure and published manifest entries were present. The seven local newsletter-related paths remain preserved. Thomas already confirmed signup and email delivery.

[PR #159](https://github.com/Thomas3e123/books/pull/159) corrected the Testing Room manager controls that described record edits as filters. The save button now names the action, save feedback is announced as a status, and the selected tester stays highlighted after refresh. The keyboard tests cover the Inventory JSON and CSV pickers, group-message draft, manager access and a failed save followed by a successful retry using fictional data. All 234 browser tests and 132 Node tests passed. Netlify production deploy `6afee6bf241d746a7662f0af` published merge `bf89246e`. A read-only request on the canonical domain verified both visible labels, the save button and the status announcement markup. Individual spoken announcements inside the restricted rooms remain unverified.

## First-visit walkthrough, November 19

Started at the first-visit welcome and followed both the short diagnostic and a known restaurant problem. The local release candidate sends an undecided visitor directly to five questions. Each answer control now carries its question as its accessible name. The welcome moves keyboard focus inside on entry, wraps at both ends, and returns focus to the homepage heading on dismissal.

A single food-cost concern now opens the Food Cost, Inventory & Purchasing section. Leadership, training and guest-service recommendations open their respective sections. The Food-Cost Leak Finder and 30-Day Install Plan also link to the applicable resources. When the short check cannot identify a priority, the next link explicitly opens the full owner assessment.

The live sitemap contained 134 distinct public pages. All 134 loaded at the expected address with a page title. Work Study Lab renders its main heading through its application script. These HTTP checks establish reachability only.

The production build verified 674 source hashes. Its source sweep checked 156 pages, 7,180 link references and 1,057 asset references with zero flagged findings after building Handbook Creator. All 132 Node tests passed. A separate handler test exercised 734 answer combinations across the four diagnostics and resolved all eight distinct destinations, including fragments. The welcome's keyboard handler passed entry, wrapping and Escape checks. The desktop/mobile browser suite passed all 232 tests. The isolated Orca run stopped before it established a spoken result. Thomas confirmed the general screen-reader check passed after deployment. Individual restricted-control announcements remain open. [PR #157](https://github.com/Thomas3e123/books/pull/157) shipped in production deploy `6afedef71813b34130c438ca` at merge `81e8cee5`. On the canonical domain, the welcome linked directly to the assessment, both served scripts matched the tested build byte for byte, and the four operating-system sections resolved.

## November 19 closeout

[PR #152](https://github.com/Thomas3e123/books/pull/152) passed all five GitHub checks and shipped in production deploy `6afebd3bb4341b16f956ec93` at merge `532aae59`. SRC-01, SRC-05 and SRC-18–20 are closed on live verification. The public sitemap links 115 static URLs and 20 Report URLs through two child sitemaps. Five restricted or confirmation routes have noindex and are absent from the static list. All four guide pages have their expected sharing metadata. Live Numbers Lab returned 25.00% for $250 labor and 1,000 sales, prompted for missing actual sales, and returned a $125 difference for a zero forecast. The browser saved the CSV and the file contained the checked results. The production build verified 674 source hashes and generated 156 HTML pages. All 88 selected functional tests passed. Two test fixtures now correctly check fragment destinations and persist Foundry test state.

| Check | Latest evidence | Remaining work |
| --- | --- | --- |
| Report schedule (SRC-13) | On the canonical live site, 36 schedule records matched, 18 published numbered articles had the expected content and canonical addresses, RSS included 19 items and the Report sitemap contained 20 URLs. A future article returned 404. | The release checker now targets the canonical domain by default. Use --previews for the two preview aliases. |
| Header (SRC-04) | In Chrome, the Numbers Lab brand, room name, search and visible menu controls had no overlapping bounds at 320, 390 or 1280 pixels. | Physical phone and assistive-technology behavior remain open. |
| Foundry (QA-04) | The isolated November 6 preview passed synthetic manager save/sync, employee access, published SOP, recipe and poster access, quiz scoring and activity recording. | Current-release Foundry publication and revision passed in the November 19 hosted check below. Phone microphone capture remains open. |
| Guide, voice and books (QA-05) | The hosted Guide routed a calculator question to Numbers Lab. The live voice service generated a decodable 3.264-second MP3. All 15 production book text files matched source. | Verify listening, seeking and background/resume on a phone. |
| Downloads and QR (QA-03/07) | The exported Start Here QR image decoded to the correct Gravity Start Here URL. | Browser CSV verified after deployment. Phone camera scan and physical print remain open. |
| Account and device checks | Brevo is closed on the owner's successful signup. | Backup recovery/deletion needs isolated test accounts and storage. Square checkout/delivery/refund needs sandbox access. General screen-reader operation passed on owner confirmation. See SRC-09 for the restricted controls. Windows installer remains deferred (QA-08). |

## November 19 production verification after PR 153

Gravity deployed [PR #153](https://github.com/Thomas3e123/books/pull/153) at commit `076d4099` in Netlify deploy `6afec89c53d83b6aa6e2bcdd`. Both live Work Study recording scripts matched the tested versions. The hosted Guide sent “Where do I build an employee handbook?” to Handbook Creator after the fix. The local repair branch still preserves the seven outstanding newsletter-related paths.

| Area | What passed | What still needs proof |
| --- | --- | --- |
| Guide and search | All 216 Guide resources led to valid Gravity destinations across 197 paths. All referenced fragments resolved. Live searches for calculator, personalizer, QR, handbook and prompt returned the expected tools. The hosted Guide routed scheduling to Shift Lab and handbook creation to Handbook Creator. | Closed for these routes and questions. |
| Work Study | Web and Windows source now enforce the service's 4 MiB limit. Changing the recording clears consent to upload. Desktop and emulated mobile Chromium passed capture from a synthetic audio track, marker retention after reload, portable export/import, consent reset and oversized-file rejection. A synthetic WAV produced a timestamped draft from the live transcription service. One word was misheard. | Physical microphone capture and playback on a phone remain device checks. |
| Foundry and backups | Current source passed browser tests for draft save/reopen, cross-browser file transfer and damaged file rejection. Local cloud encryption restored a synthetic record in a separate crypto context and rejected the wrong passphrase. Seven focused rollback, upload-pause and recipe-import cases passed. | Current hosted Foundry publication and persistence passed in the isolated November 19 preview described below. Full cloud account recovery and deletion require disposable verified identities and isolated storage. |
| Accessibility and print | Keyboard Enter opened global search, focus moved to the input and Escape returned focus. The manager key had an accessible name and Tab moved focus to Open inbox. Measured Numbers Lab header colors provide at least 15.3:1 text contrast. All five Field Sheets fit one US Letter page with all extracted words inside its bounds. | Screen-reader announcements in restricted controls, phone QR scan, physical print and phone Reader seek/background resume remain open. |
| Recipe Works | The dated production verification recorded five passes, including cancelled restore, invalid backup and storage-quota feedback. The live save warning and storage handler matched the previously tested code in the compared sections. | Historical failures reconciled in this scope. |
| Other accounts and devices | All five PR checks passed, including both Windows build checks, in addition to 56 local Work Study suites, 674 manifest hashes and 230 browser tests. | Square checkout/delivery/refund requires sandbox access. Owner-device Windows installation remains deferred. |

### Current-release hosted and recovery checks, November 19

[Draft QA PR #155](https://github.com/Thomas3e123/books/pull/155) enabled one preview specifically for this audit. Netlify reports deploy `6afed1519caba1a86a30fae1` on its own database branch `audit/current-foundry-backup-nov19`. The deploy includes the current production application from `cfbcb589`; the preview opt-in changes only the build selection rule. Keep the QA branch out of production.

| Area | Verified | Remaining |
| --- | --- | --- |
| Foundry | In a new fictional restaurant on the isolated hosted database, the employee initially saw an empty published list. The manager published revision 1.0, which appeared on fresh sign-in. The manager then changed the title and published revision 2.0. Another fresh sign-in returned exactly one SOP with the updated revision and title. Draft save, reopen and revision were verified separately in the browser suite. | Closed for the tested persistence and publication paths. |
| Cloud backup | The hosted preview's database health check passed. In isolated Chromium with simulated identity and storage, five cases passed covering encrypted Shift Lab and Inventory uploads, a restore in a second browser context, wrong-phrase handling and deletion of the selected tool's backup. A separate test of the real server handler with in-memory storage confirmed a stale subsequent save returned 409 and left the deleted history empty. | A disposable email-confirmed Gravity customer account is still needed for the end-to-end hosted upload, recovery and deletion checks. |
| Book Reader | All 15 books opened on the current source. Using synthetic audio at phone width, Quiet Gravity paused, sought forward, and resumed after reload at Part 7, 0:17. Continuous playback advanced to the end. Single-part playback stopped for the user. | Background playback after physically locking a phone. |
| Recipe Works | Current Chromium run confirmed that cancelling restore preserved the recipe, a malformed backup left it intact, and a storage-quota failure produced an accessible save-failure warning. | Closed for these three cases. |

[Browser run](https://github.com/Thomas3e123/books/actions/runs/44507614260) completed with 234 passes. The four new wrappers ran once, with the duplicate project invocations skipped. Production did not need an application release. The remaining physical checks are below. Screen-reader announcements in restricted controls, Square sandbox transactions and owner-device Windows installation remain unverified.

### Short physical check

1. Open [Book Reader](https://gravityleadershipsystem.com/book-reader) on a phone. Play a public article, seek ahead, lock the screen briefly and resume. Record where playback resumes and which browser was used.
2. Open the [QR Code Maker](https://gravityleadershipsystem.com/qr-code-generator) on a second screen and generate a code for the Gravity Start Here page. Scan it with the phone camera and check the destination.
3. Print the [food-cost Field Sheet](https://gravityleadershipsystem.com/assets/downloads/gravity-field-sheet-02-food-cost.pdf). Check that the heading and footer both fit on one sheet.
4. If checking microphone behavior, use [Work Study Lab](https://gravityleadershipsystem.com/gravity-work-study-lab) and record a short practice sentence. Stop, reopen the recording, and listen back.

## Status rules

- **Confirmed defect — open:** A reproducible problem is evidenced in the current production version or an explicitly tested customer workflow, and the repair is not complete.
- **Fixed in source — live check needed:** The source repair is present in the audit branch, but the live deployment has not been verified to contain it.
- **Passed in stated scope:** Evidence shows the exact workflow passed in the stated environment. This does not certify other environments or devices.
- **Unverified workflow:** No defect is established; a real workflow still needs evidence.
- **Needs Thomas:** Requires a physical device, account-only action, DNS/account owner, or other access unavailable to the assistant.
- **Held:** Intentionally paused or excluded from the current repair release.

A source scan finding is not automatically a live customer defect. An old failed test is not considered open after a repair unless it is reproduced or current live source proves it remains.

## November 18 detailed live link pass

- 147 distinct page addresses and 232 same-site file endpoints returned HTTP 200 in a three-level crawl from the sitemaps and feed. File checks used HEAD. This pass covered links present in returned HTML and excluded query-string URLs. Of 301 distinct fragment destinations, one uses Foundry’s JavaScript handler for `#new-sop`.
- All 134 URLs advertised by either sitemap or the feed returned 200 with their expected canonical addresses. All 18 published numbered stories carried parseable Article structured data. All 18 future story URLs returned 404. RSS has 19 entries including the separate announcement. The dedicated Report sitemap has 20 including the Report home. The discovery gap is the missing connection from the main sitemap.
- Production overrides intended noindex on Testing Room, Pilot Room, Pilot Room Manager and the newsletter confirmation page. Registration correctly has noindex but appears in the old public sitemap.
- SRC-01 has a local production build repair. The root sitemap points to the canonical public pages and the existing date-aware Report sitemap. Static pages omit unverified modification dates. The production build from commit 8a0ab3c with the repair produced 156 HTML pages, verified 674 manifest entries, and produced 115 public static URLs. The new sitemap adds Handbook Creator and Guest Voices and drops Registration and Testing Room. Live publication and post-release verification remain open.

## Current position

- The local audit branch is `fix/report-glossary-published-coverage-20261115` and includes the source repairs recorded below.
- The verified repair batches were merged in PRs [#138](https://github.com/Thomas3e123/books/pull/138), [#139](https://github.com/Thomas3e123/books/pull/139), [#141](https://github.com/Thomas3e123/books/pull/141), and [#142](https://github.com/Thomas3e123/books/pull/142). Six bonus Gravity Report scenarios were added in PR [#143](https://github.com/Thomas3e123/books/pull/143); transparency wording was corrected in PRs [#144](https://github.com/Thomas3e123/books/pull/144) and [#145](https://github.com/Thomas3e123/books/pull/145). PR [#146](https://github.com/Thomas3e123/books/pull/146) removed a stale Report schedule sentence. Latest production deploy `6afd9455bfdb805adf31934b`, commit `fd630994376948d8cc2a93aff800babbbe62f0da`, is ready and serves `https://gravityleadershipsystem.com`. A live browser check confirmed the page says the editorial series publishes Tuesdays and Fridays and no longer says the new human-interest stories are in development.
- The post-deploy smoke check confirmed the deployed homepage and Gravity Report load; all 15 glossary links lead to permanent article routes; 11 unique published article targets and the report confirmation page return 200 with correct canonical metadata; Handbook Creator CSS/JS return 200; and no future issue was exposed. A live browser check on Nov 18 showed 12 published articles and confirmed that searching “labor” separated three published matches from one scheduled match. After PR #142, direct HTTP checks confirmed that the homepage, Books, Free Resources, and Toolkit return 200 with count-free copy and no stale five-article claim. These checks cover the named routes and search term, not every workflow or device.
- The production Report page now shows 36 catalog items: 18 published (the 12 original released issues plus bonus scenarios 31–36) and 18 scheduled. The existing issue dates 13–30 were not changed. The first five server-rendered cards remain a no-JavaScript fallback; after the catalog script loads, it replaces them with the live 18/18 split. RSS and sitemap counts have not yet been rechecked after this release.
- Follow-up live checks on Nov 18 confirmed all six pages in SRC-06 return 200 with no anchor destinations to the legacy Gravity Netlify host or Thomas Monroe Books. All five Gravity Field Sheet PDFs return 200 as one-page PDFs; each has one clickable Gravity Report destination that returns 200 (two link to the matching story and three to the Report home). Production `robots.txt`, `sitemap.xml`, homepage, Report home and a published article also returned 200; robots allows indexing, the sitemap uses the production domain without legacy-host URLs, and the checked canonical/OG URLs match their permanent routes.
- Navigation checks on Nov 18 confirmed production routes for Gravity Assist, Numbers Lab, SOP Library, SOP Library set, Handbook Creator, and Free Resources all return 200. Gravity Assist links directly to Numbers Lab and Handbook Creator; Standards Library links to the SOP Library set. This verifies route availability and visible destinations, not the JavaScript page-search behavior or all AI route-selection cases.
- A metadata spot-check on Nov 18 confirmed both sampled published Gravity Report articles and the Fulfillment Center return 200 with matching canonical and Open Graph URLs, titles, and JSON-LD present. This is representative coverage, not a complete schema validation of every article or guide.
- The production Windows Programs page returned 200 and showed the November preview disclosure, removal notice for older October downloads, and Google Analytics disclosure; no October-dated download links were present. This closes the public-copy check only; Windows installer execution remains held.
- Live HTML checks on Nov 18 found all eight repaired accessible names on the affected Testing Room, manager, SOP Foundry import, and Inventory Center pages. This confirms the deployed markup only; screen-reader announcements and keyboard behavior were not tested.
- The original local Brevo newsletter draft remains preserved in six changed or added paths (`site/_redirects`, `site/gravity-report-thanks.html`, `functions/gravity-report-brevo.mjs`, `site/gravity-report-confirmed.html`, `site/privacy.html`, and `source-manifest.json`). The focused release was made separately in PR [#141](https://github.com/Thomas3e123/books/pull/141), merged as `c5db3a1cffb2b73329352c58b4e281dc8524b58e`, and published by Netlify deploy `6afd630e346a88517bd0daa1` on Nov 18. No other local newsletter or repair-branch changes were discarded.
- Before release, the exact Netlify build sequence (`npm run build` followed by the production packager) verified all 664 source-manifest hashes, generated the Handbook Creator assets, built 153 production pages, and passed the strict internal-link scan, focused Gravity Report and Handbook Creator checks, and 67 integrated stability regressions. The comprehensive source sweep found zero high-, medium-, or low-severity source findings. The separate Brevo draft was excluded. These are source/build checks, not proof of hosted integrations or physical-device behavior.
- No signup, payment, or customer-data workflow was triggered during the Nov 18 live checks. The public page was inspected in the cloud browser because the web lookup path could not retrieve it; the browser view showed the homepage and Report page normally.
- Final second-pass HTTP inspection on Nov 18 confirmed SRC-01 is still defective: the production sitemap has 115 unique URLs, includes `/register` (live `noindex,nofollow`) and `/testing-room` (live `index,follow` despite source noindex), lists only the Report landing page rather than its 18 published article routes, and has no `lastmod` later than Oct 20. This is a production sitemap/packaging issue, not a robots.txt failure; robots allows crawling.
- The same second pass confirmed SRC-17: live `/start-here` said the AI workbook contains 350 prompts but linked its Word and PDF buttons to the archived 215-prompt files. PR [#151](https://github.com/Thomas3e123/books/pull/151) corrected both links and clarified the archive; all four CI checks passed; production deploy `6afdf695fc116d8a37cbe6a4` is ready on commit `8a0ab3c207c9360dfb83f7a99931f9d8931ff098`. Post-deploy checks found both 350-prompt links live and each download returned HTTP 200 with the expected PDF/DOCX content type.
- After PRs #143–#146, the production Report page shows 18 published stories and 18 scheduled issues. The bonus article sample is live with a clear fictional-scenario label. The schedule-copy correction is live. RSS and sitemap counts were not rechecked in this pass.
- PR #142 source verification/build, integrated stability, and Windows-candidate workflows passed. The broad browser suite reported eight failures in existing navigation/Start Here cases (a fixed nine-link count vs. ten observed, outdated CTA wording, and stale copy expectation); the affected paths were outside the Report story changes. Treat these as test-maintenance work until reproduced as live defects.

## Confirmed current-live findings

| ID | Area | Live behavior | Repair state | Next step |
|---|---|---|---|---|
| LIVE-01 | Gravity Report glossary | Its 15 “Read Issue” links pointed to issue-card fragments, which could fail when the catalog did not load. | **Fixed live.** All 15 glossary links now use permanent article routes; each unique published target returned 200 in the production smoke check. | Closed for checked routes. |
| LIVE-02 | Gravity Report confirmation metadata | `/gravity-report-thanks` lacked a canonical URL. | **Fixed live.** Canonical and Open Graph URLs match the confirmation route. | Closed for checked metadata. |
| LIVE-03 | Gravity Report article-count promotion | The homepage, Books, Free Resources, and Toolkit said five articles were available after the library had grown to 12 published stories. | **Fixed live.** PR #142 removed the obsolete count and October start date. Netlify deploy `6afd685737c8d3db95697f5b` is ready; all four pages returned 200 with the updated copy and no old claim. | Closed for checked pages. |
| LIVE-04 | Gravity Report bonus story release | Six requested business-focused human-interest stories were added without changing the numbered schedule or sending an email. | **Fixed live.** PR #143 added issues 31–36; PRs #144–#145 made their fictional, illustrative status explicit on each article page and in Gravity Reader. The production catalog shows 18 published and 18 scheduled; a sample bonus story returns 200 with its disclosure. No announcement or email was sent. | Closed for checked catalog and sampled article. RSS and sitemap counts remain to be rechecked. |

## Source repairs: status after the November 18 production deploy

| ID | Area | Repair recorded | Current status | Evidence / next check |
|---|---|---|---|---|
| SRC-01 | Production indexing and sitemap coverage | Production packaging must keep private/noindex routes out of the sitemap and preserve noindex on private routes; the sitemap should include canonical published Report article routes and current `lastmod` values. | **Fixed live in PR #152.** See the November 19 closeout for production results. | Closed. |
| SRC-02 | Search and navigation | Numbers Lab and several missing search destinations/keywords were added; SOP Library and Handbook routing were made explicit. | **Partially verified live.** Gravity Assist, Numbers Lab, Standards Library, SOP Library set, Handbook Creator, and Free Resources all return 200. Gravity Assist and Standards Library expose the expected direct links. The live Free Resources search showed the Quiet Gravity book result, accepted the result click and displayed “No matches on this page” for an unmatched query. | Verified after PR #153; see the production verification above. |
| SRC-03 | Download and tool feedback | Generated export and calculation record checks. | Live Numbers Lab displayed 25.00% for 250 / 1000. A repeat production check displayed 25.00% for 125 / 500. The subsequent production check saved the CSV and verified its contents. Local execution of the export handler produced the CSV with the labeled inputs and corrected result. See SRC-18. | Live five-question Gravity Aware assessment returned “Evidence is insufficient” for five Unknown answers and displayed “Copied” after Copy result. Saved CSV verified in PR #152 closeout. |
| SRC-04 | Responsive layout and accessible colors | Four formerly overflowing pages and a workspace checked again. | **Horizontal overflow check passed Nov 19.** Chrome rendered fresh production HTML, stylesheets and linked scripts for Home, Contact, Handbook App Privacy, AI Prompt Search and Numbers Lab in an isolated preview. At outer widths 320 and 390 px, scroll width equaled available width on all ten loads (305 and 375 px after scrollbars). | Header overlap and text contrast verified for Numbers Lab. Physical-device and assistive-technology checks remain open. |
| SRC-05 | Article and guide metadata | Checked all 48 static pages that declare Article structured data on the production branch. | **Fixed live in PR #152.** See the November 19 closeout for production results. | Closed. |
| SRC-06 | Gravity/TMB separation | Replaced 18 old-host destinations across six HTML pages. | **Passed for all 25 website ZIP packages, Nov 19.** Downloaded every archive on the production Gravity domain, checked ZIP integrity and matched every archive byte for byte against the reviewed repository copy. Checked all 277 members for the two old hostnames in PDF text, text files and Office XML/relationships. No matches. PDF annotation scan across 102 standalone and 147 packaged PDFs found no legacy Gravity or TMB web destinations. All 25 distinct Gravity URL strings from those annotations returned HTTP 200, including the employee-access shortcut. The six previously repaired HTML pages had already passed. | Website package check closed. Installed Windows binaries and physical-device behavior remain under QA-08. |
| SRC-07 | Gravity Report PDF Field Sheets | Rebuilt five one-page PDFs; each footer has a clickable Gravity Report destination. | **Verified live.** All five PDFs return 200 as one-page files. Each contains one clickable Gravity Report link and every destination returns 200; two link to their matching article and three to the Report home. | Closed for the five published Field Sheets. |
| SRC-08 | Windows preview claims | Removed stale October download links/claims, disclosed Google Analytics, and corrected parity records. | **Public copy verified live; device certification held.** The Windows Programs page returns 200, identifies November previews, says older October downloads were removed, includes the Google Analytics disclosure, and has no October-dated download links. Windows installer behavior remains unverified. | Copy check closed. Keep installer execution held per current direction. |
| SRC-09 | Accessibility labels | Named six visible testing/import controls and two hidden Inventory Center file pickers for assistive technology. | **Partially verified live.** All eight repaired `aria-label` values were found in the production HTML for the affected Testing Room, manager, SOP Foundry import, and Inventory Center pages. The manager key and its next keyboard focus target passed. Thomas confirmed general screen-reader operation. Additional keyboard checks and the corrected manager labels are recorded above. | Individual restricted-control announcements remain open. |
| SRC-10 | Cloud backup safeguards | Source fixes address rollback truthfulness and paused automatic/manual upload bypasses; current review confirms table health and describes cryptographic controls. | **Unverified workflow.** A ready deploy does not prove account ownership, upload, restore or deletion behavior. | Test only with a synthetic account and isolated data; never use customer backups. |
| SRC-11 | Production source manifest | Sixteen committed Gravity pages had hashes that no longer matched the reviewed source, which would make the source verification step reject this repair branch. | **Build verified.** The clean production sequence verified all 664 manifest entries before deployment. This is source integrity evidence, not a customer-facing live behavior check. | No additional live check needed unless the source changes. |
| SRC-12 | Gravity Report signup confirmation metadata | The production build stopped because the confirmation page’s Open Graph URL pointed to `/gravity-report` and the page had no matching canonical URL. | **Fixed live.** `/gravity-report-thanks` returned 200 with matching canonical and Open Graph URLs in the production smoke check. This does not verify the email signup/delivery flow. | Closed for metadata; keep signup/delivery under QA-02. |
| SRC-13 | Gravity Report release verification | The live QA script assumed only the first five issues would ever be released, so it no longer matched the active twice-weekly publication schedule. | **Canonical production checks passed November 19.** See the closeout for schedule, article, feed and sitemap results. | For preview parity, run the corrected script against the preview once it is available; do not treat the earlier count mismatch as a site defect. |
| SRC-14 | Gravity Report schedule copy | The landing page said new human-interest stories were still in development after the bonus scenarios were published. | **Fixed live.** PR #146 removed the stale sentence while keeping the Tuesday/Friday schedule statement. Netlify production deploy `6afd9455bfdb805adf31934b` is ready on commit `fd630994376948d8cc2a93aff800babbbe62f0da`; the live browser page shows the corrected copy. | Closed for checked landing-page text. |
| SRC-16 | Gravity Report publication coverage in Ask Gravity | Ask Gravity should report the current published catalog and pilot program accurately. | **Fixed live and verified in the follow-up check.** The answer reports 18 numbered published articles and identifies the separate site announcement; it also describes the 50-owner pilot and its access terms. | Closed for the tested questions. Keep knowledge current as articles and pilot terms change. |
| SRC-15 | Gravity Report A–Z catalog | The visitor-facing article list should include each article as it is released and support usable sorting. | **Fixed live and verified.** The Report catalog has 18 published and 18 scheduled entries; the A–Z option sorts the published set and scheduled issues stay separate. | Closed for verified catalog state. Recheck when future issues publish. |
| SRC-17 | AI workbook links on Start Here | The Start Here page describes the current 350-prompt edition but should link to that edition. | **Fixed live.** PR [#151](https://github.com/Thomas3e123/books/pull/151) changed both links to the 350-prompt Word/PDF files and clarified that the 215-prompt copies are archived. Deploy `6afdf695fc116d8a37cbe6a4` is ready on commit `8a0ab3c207c9360dfb83f7a99931f9d8931ff098`; the live page contains the current links, both files return 200 with expected content types. | Closed for current Start Here links/download endpoints. |
| SRC-18 | Numbers Lab formatted numbers | The deployed calculator code displays 25000.00% for 250 dollars of labor and 1,000 dollars of sales. | **Fixed live in PR #152.** See the November 19 closeout for production results. | Closed. |
| SRC-19 | Numbers Lab incomplete calculations | Current production code reports a $1,000 shortfall and −100% for a $1,000 forecast before actual sales are entered. | **Fixed live in PR #152.** See the November 19 closeout for production results. | Closed. |
| SRC-20 | Zero price, cost or forecast | Numbers Lab suppressed computable results whenever any of these values was zero. | **Fixed live in PR #152.** See the November 19 closeout for production results. | Closed. |

## Older failures to reconcile, not assume open

The November 4 functional audit explicitly listed the following as repaired in its candidate source but not deployed at that checkpoint: production SEO/indexing, Numbers Lab CSV, generated-download gating, four narrow-screen overflows, contrast/header layout, Copy Result feedback, prompt count, route ordering, and microphone policy. Later branch changes, merges, or deployments may have changed their status. Check current production commit and reproduce only the ones still relevant; avoid reopening each as a fresh issue without an ID.

The October 30 Recipe Works production safeguards report records five passing checks. The November 19 comparison above reconciles the earlier failures.

## Unverified workflows and customer-dependent checks

| ID | Area | What remains unverified | Owner |
|---|---|---|---|
| QA-01 | Cloud backup | Synthetic account signup, encrypted upload, restore on another browser/device, wrong recovery phrase, clear recovery error, and deletion while an app remains open. | Assistant can prepare/run only in an isolated authorized test namespace; never use customer backups. |
| QA-02 | Brevo signup and welcome | **Closed on owner confirmation.** Thomas confirmed the newsletter flow worked as planned after his live signup. | No further signup is needed for this check. |
| QA-03 | Downloads and print | Retrieved and opened the live Start Here PDF, 350-prompt Word workbook and HR release ZIP. All three matched the local files byte for byte. PDF text was readable, Word document XML parsed and ZIP integrity checks passed for all 12 HR package entries. | All 149 downloads linked from public HTML matched the reviewed release files on November 19. Thomas confirmed the phone QR scan. Physical print remains open. |
| QA-04 | Gravity tools and persistence | Foundry draft and backup transfer passed in Chromium. Current hosted manager publication and employee reopen passed for two revisions. Work Study recording/export passed with synthetic audio and live transcription returned a draft. Phone microphone capture remains open. | Assistant in isolated environment; Thomas only for account/device steps that cannot be delegated. |
| QA-05 | AI, voice and Book Reader | The hosted Guide and voice service passed the recorded checks. Thomas confirmed playback with the phone locked. Seeking and reload recovery passed with synthetic audio. Physical phone seek accuracy remains unverified. | Assistant in safe test mode where available; device-only checks need Thomas. |
| QA-06 | Payments | Sandbox checkout and protected file delivery, including failure/refund states; no live charge. | Assistant only after sandbox credentials/config are available. |
| QA-07 | Physical device coverage | Thomas confirmed the phone QR scan. Physical print output and the outstanding phone workflows in QA-04/05 remain open. | Thomas supplies observations; assistant prepares a short checklist and fixes reproducible issues. |
| QA-08 | Windows applications | Installer/ZIP install, update, printing and source parity. | Held per current direction until the rest of Gravity is reconciled. |
| QA-09 | Gravity browser regression suite | PRs #144 and #146 browser workflows reported stale menu count, Start Here CTA/copy, and download-copy expectations. | **Fixed and verified.** PR [#151](https://github.com/Thomas3e123/books/pull/151) updated the assertions to match current source and visitor flow; all four checks passed (browser suite run 359, integrated stability 257, SOP Foundry candidate 433, Document Studio/Handbook safety 203). PR merged and deployed in `6afdf695fc116d8a37cbe6a4` on Nov 18. | Closed for the covered browser suite. |

These entries mean “not yet proven,” not “confirmed broken.”

## Working repair timeline

Targets are based on the current known queue and assume no new production defect or access blocker. Device-only checks depend on Thomas being available; the source and browser work does not. If a dependency blocks a target, update the register with the blocker and the next date instead of labeling it a site defect.

| Target | Goal | What counts as complete |
|---|---|---|
| **Nov 15 — complete** | Publish the verified repair batch and confirm it is live | PRs #138–#145 are merged; PR #141 connected Gravity Report signup to Brevo, PR #142 removed obsolete article-count copy, and PRs #143–#145 added six quietly published, clearly fictional bonus scenarios. Latest Netlify deploy `6afd9158620f2a5816401263` is ready. Production check confirmed the 18/18 catalog split, sample story route, and fiction disclosure. |
| **Nov 18–19** | Reconcile remaining known repairs against the live version | Check prior source repairs (navigation/search, downloads, responsive layout, metadata, old-host links, accessible labels); update each register item to fixed-live, still-open, or unverified based on evidence. |
| **Nov 19–21** | Check highest-impact customer journeys in an isolated environment | Exercise Gravity Report discovery/search/article links, registration and downloads, Inventory/Recipe/Foundry save and recovery, and service-backed flows where safe credentials exist. Mark blocked integrations as unverified, not broken. |
| **Nov 21–22** | Complete short device-dependent checks | Phone layout and QR scan, plus one representative PDF/print check. Provide Thomas one compact checklist for only the steps that require his device or account. |
| **Nov 22–23** | Close the next repair batch and report the remaining queue | Fix any reproducible defects from journey checks, run focused regressions and the clean production build, then deploy only if the batch is verified. Record the live commit and update this register. |

**Current target (Nov 19):** The November 19 production verification table lists the remaining account, device and hosted checks. Brevo, site indexing, guide share previews and Numbers Lab are closed for the verified scopes.

## Release and reporting sequence

1. **Reconcile live version.** PRs #138–#145 are merged. Latest Netlify production deploy `6afd9455bfdb805adf31934b` serves commit `fd630994376948d8cc2a93aff800babbbe62f0da`. Verify the live commit before the next release.
2. **Dedupe and prioritize.** Keep one issue ID per defect family/affected path. Prioritize customer access/data loss, then core flows/downloads, navigation/search, then presentation/accessibility.
3. **Repair by batch.** Group related changes. Each confirmed defect gets reproduction, fix, focused regression evidence, and a production smoke step.
4. **Separate blockers from checks.** Never describe an unverified integration or physical-device task as a bug unless it fails.
5. **Release once a batch is reviewable.** Preserve the previous deploy for rollback; do not publish staging/noindex files or unrelated Brevo work.
6. **Close only with evidence.** Use `fixed in source` before release and `fixed live` only after the deployed route/workflow is checked.

## Audit references

This register consolidates status from `gravity-functional-audit-2026-11-04.md`, `gravity-followup-2026-11-05.md`, the October 30 critical-path/data-protection/operating-tools audits, and the dated November 14–15 repair notes in this directory, including `gravity-source-sweep-2026-11-15.md`. Those detailed files remain the evidence trail; this register is the single queue and status summary.
