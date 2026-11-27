# Gravity Tool and Process Test Protocols

Version 1.4 · 25 guides · 141 individual checks

This catalog is limited to tools and processes linked from Gravity’s public pages at the time it was prepared. If a listed link no longer opens, record the failing URL and mark that case Blocked. Use fictional restaurant data. For every case, record Pass, Fail, Blocked, Not tested, or Not applicable. If the expected result is unclear, mark Blocked or Not tested and describe what needs clarification. Do not enter private employee, guest, payroll, payment, or exact financial records. Analytics and conversion checks require a manager with access to the live analytics account and production diagnostics.

## How to use these guides

1. Choose one guide for a tool or process linked from Gravity’s current public pages.
2. Read its purpose and sample setup. Open the listed page or follow the link from Gravity Assist.
3. Follow each case. Record Pass only when the expected result actually occurs; use Fail, Blocked, Not tested, or Not applicable honestly.
4. Use fictional data. Keep exact figures, employee data, guest details, payment information, and passwords out of these reports.
5. If a listed public link fails, record the URL and the action that failed. Do not infer that an unlisted tool is available.

## Test guides

### Website paths, links, and mobile use

**Purpose:** Make sure a first-time visitor can reach the right Gravity resource and continue on a phone or computer.
**Starting page:** `/`

#### NAV-01 — Primary navigation
**Do this:** Open Gravity on a computer. Use every main menu link once. Return Home after each page.
**Expected:** Each link opens the named Gravity page. The page title and content match the link. No link unexpectedly sends visitors to Thomas Monroe Books.

#### NAV-02 — Mobile menu
**Do this:** Open Gravity on a phone or narrow browser. Open and close the menu, then follow Start Here and Help Center.
**Expected:** The menu is usable without horizontal scrolling; each destination loads and has a clear way back.

#### NAV-03 — Buttons and page links
**Do this:** On the pages used in your test, click the main button, secondary links, downloads, and back links.
**Expected:** Each control has one clear outcome. No dead links, unexpected redirects, empty page, or wrong-site destination.

#### NAV-04 — Page search
**Do this:** On a page with Search This Page, search a visible heading and a word not on the page.
**Expected:** A matching result jumps to the right section. A no-match search explains that nothing was found.

#### NAV-05 — Keyboard access
**Do this:** Use Tab, Shift+Tab, Enter, and Escape to navigate a short visitor path.
**Expected:** Focus remains visible, controls work without a mouse, and focus does not disappear behind a menu or dialog.

### Start Here and installation path

**Purpose:** Verify the promised journey from one recurring problem to a manageable installation and review.
**Starting page:** `/start-here`

#### INS-01 — Choose one pressure point
**Do this:** Start at Start Here. Pick one repeated restaurant issue and follow the suggested route to its operating system.
**Expected:** The route identifies a relevant system and explains the next step without requiring the full catalog.

#### INS-02 — Build the first toolset
**Do this:** Use the installation package to record one owner, three to five tools, a baseline measure, and either a 30-day or 60-day pace.
**Expected:** The plan fields are understandable, the selected tools fit the issue, and the pace dates are usable.

#### INS-03 — Training before enforcement
**Do this:** Find the training or SOP resource for one chosen tool. Follow how a manager would demonstrate, practice, and verify it.
**Expected:** The instructions identify what to teach and how to verify it. Missing rules are flagged instead of invented.

#### INS-04 — Weekly and midpoint review
**Do this:** Use the workbook or forms to record a weekly check, then a midpoint decision to continue, correct, or stop and investigate.
**Expected:** The review captures evidence, blocker, owner, and next due date. The midpoint decision is recorded with a reason.

#### INS-05 — Final verification and next step
**Do this:** Complete a sample final review against the baseline and decide whether to hold, correct, or choose a next issue.
**Expected:** The materials separate completed work from verified results and do not claim an outcome without evidence.

### Gravity Aware assessment

**Purpose:** Check assessment completion, result routing, and the published privacy behavior.
**Starting page:** `/gravity-aware`

#### AWR-01 — Complete an assessment
**Do this:** Use fictional restaurant answers and complete the short assessment from its first question to the result.
**Expected:** Every question can be answered, progress is clear, and a result appears without a broken step.

#### AWR-02 — Missing answer handling
**Do this:** Leave one required question unanswered and try to continue, then return and answer it.
**Expected:** The page identifies the unanswered item and allows completion after it is answered.

#### AWR-03 — Recommendation route
**Do this:** Follow each recommended next step and check whether it leads to the named Gravity resource.
**Expected:** The recommendation and destination match. No recommendation promises an automatic financial result.

#### AWR-04 — Answer privacy and restart
**Do this:** Use fictional answers, close/reopen the page, and use its clear/restart option if offered. Check the current privacy notice.
**Expected:** Observed storage and submission behavior match the page's privacy explanation. Record any mismatch as a privacy issue.


#### AWR-05 — Test the quick diagnostics
**Do this:** Run the five-question system check, Food-Cost Leak Finder, Which SOP First, and 30-Day Install Plan with fictional answers. Follow each result link or next step. Do not enter actual food-cost values or private restaurant data.
**Expected:** Each diagnostic completes, gives a usable next step, and remains clearly labeled as a structured starting point rather than a verified diagnosis. Links reach the named resource; answers remain in the browser as the privacy notice says.

### Gravity Assist and profile handoff

**Purpose:** Check the central tool entry point, restaurant profile, and handoffs between supported workspaces.
**Starting page:** `/gravity-assist`

#### AST-01 — Open each workspace
**Do this:** Open every workspace link from Gravity Assist and return to Assist.
**Expected:** The selected workspace opens and the room name and purpose are clear.

#### AST-02 — Save restaurant profile
**Do this:** Enter fictional restaurant and location details, save, reload, and clear the profile.
**Expected:** The profile saves where the page says it saves, can be cleared, and does not expose another restaurant's information.

#### AST-03 — Apply profile to a workspace
**Do this:** Use Apply to this workspace where available and inspect the destination before saving work.
**Expected:** Only supported profile fields arrive in the intended workspace and can be reviewed before use.

#### AST-04 — Continue in another workspace
**Do this:** Send a small fictional example from one supported tool to another, then inspect the receiving tool.
**Expected:** The intended information arrives once, in the right fields, and the receiving tool shows what arrived before use.

### Inventory Center

**Purpose:** Test setup, counts, receiving, movement, waste, costing, history, export, and recovery with sample inventory only.
**Starting page:** `/gravity-inventory-center`
**Sample setup:** Use a disposable fictional restaurant named Pilot Kitchen. Create these sample items only if the tool offers item setup: Canola Oil (base unit bottle; purchase unit case of 12; fictional cost $36 per case; starting count 2 cases/24 bottles), Mozzarella (base unit pound; case of 10 pounds; fictional cost $42 per case; starting count 30 pounds), and Tomato Sauce (base unit can; case of 6; fictional cost $24 per case; starting count 3 cases/18 cans). The intended oil sequence is: receive one case (+12 bottles), record two bottles as waste (-2 bottles), then count the remaining 34 bottles. INV-04 and INV-05 use separate sample states; reset the oil count to 36 bottles or use a fresh disposable copy before INV-05. Do not require the system to use these exact fields if its documented setup differs; record an unavailable feature as Blocked or Not applicable, not as a guessed failure. Use an available reset, disposable workspace, or export backup before testing destructive edits.

#### INV-01 — Set up sample items
**Do this:** Create the fictional Pilot Kitchen workspace if needed. Add Canola Oil (bottle; case of 12), Mozzarella (pound; case of 10 pounds), and Tomato Sauce (can; case of 6). Set the sample starting counts listed in this guide if those fields are available. Then search for each item.
**Expected:** The item list saves, required fields are clear, and search or filtering finds each item.

#### INV-02 — Unit conversion
**Do this:** For Canola Oil, set one purchase case equal to 12 base bottles. Receive one case. Compare the displayed purchase and base-unit quantities before and after the receipt.
**Expected:** The conversion is consistent in the item, receiving, and count views. Invalid or missing conversions are flagged.

#### INV-03 — Receive a delivery
**Do this:** Receive one fictional Canola Oil case. Confirm the expected increase is 12 bottles. If the tool supports editing before save, change the quantity and verify the saved record uses the final quantity.
**Expected:** The final saved quantity and cost match the sample entry, and the system shows what was changed.

#### INV-04 — Count and variance
**Do this:** After the one-case receipt, the sample oil total is 36 bottles. Record a count of 34 bottles and review the variance from the expected quantity. Then change the count to 35 bottles and review whether the history shows the change. Reset to 36 bottles or use a fresh disposable copy before the waste test in INV-05.
**Expected:** The variance uses the entered units and count date. A missing count is not presented as a zero count.

#### INV-05 — Waste or spoilage
**Do this:** Start from a fresh/reset sample state with 36 Canola Oil bottles after the one-case receipt; do not reuse the 34-bottle count from INV-04. Record two bottles as waste/spoilage with a reason. The expected remaining quantity is 34 bottles if waste is recorded as an on-hand reduction. If the tool defines waste differently, follow its published instructions and record the difference.
**Expected:** On-hand quantity and cost movement reflect the sample entry, and the record is visible in history.

#### INV-06 — Cost or source update
**Do this:** Change a sample item's cost or supplier/source, then inspect current and historical views.
**Expected:** The new value is visible in the current item record and the history makes the change understandable.

#### INV-07 — Save, export, and restore
**Do this:** Save the sample inventory, close/reopen it, use the documented export or backup, and restore in a clean test copy.
**Expected:** The restored sample contains the expected items and movements. The original sample remains recoverable until the restore is verified.

#### INV-08 — Input boundaries
**Do this:** Try a blank required quantity, negative quantity where disallowed, an unusually large quantity, and a valid zero where appropriate.
**Expected:** Invalid values receive clear prompts; valid zero and missing data are treated differently.

#### INV-09 — Phone and scan flow
**Do this:** Open the inventory workflow on a phone. If barcode or QR scanning is supported, scan a test code; otherwise record the gap.
**Expected:** Controls fit the screen and scanning opens the intended item or records a clear unsupported/failed result.

### Shift Lab

**Purpose:** Test staffing inputs, schedule rules, labor calculations, saving, employee view, printing, and privacy with fictional data.
**Starting page:** `/gravity-shift-lab`

#### SHF-01 — Build a sample week
**Do this:** Create a fictional seven-day schedule with hourly and salaried roles.
**Expected:** The schedule shows the right dates, roles, and people, and all entered shifts can be reviewed.

#### SHF-02 — Availability and coverage
**Do this:** Add availability, a requested day off, and a deliberately uncovered shift.
**Expected:** The tool surfaces the conflict or coverage gap clearly and does not silently assign unavailable staff.

#### SHF-03 — Time and break boundaries
**Do this:** Enter a normal shift, an overnight shift if supported, a long shift, and a break.
**Expected:** Start/end times, date rollover, and break handling follow the displayed rules. Ambiguous time entries are flagged.

#### SHF-04 — Labor estimate
**Do this:** Enter fictional wage and sales assumptions. Compare the tool's labor estimate with an independent hand calculation.
**Expected:** The estimate uses the displayed assumptions. Employer burden remains optional if the interface says it is optional.

#### SHF-05 — Overtime and budget warnings
**Do this:** Create sample hours that cross the displayed overtime or budget threshold.
**Expected:** Warnings identify the affected person/shift and explain the threshold. A valid schedule is not blocked without reason.

#### SHF-06 — Save, revise, and employee view
**Do this:** Save, reopen, revise one shift, then inspect the employee-safe schedule view and print/export.
**Expected:** Saved changes persist; private pay information stays manager-only; employee view shows the intended schedule.

#### SHF-07 — Invalid inputs and recovery
**Do this:** Test blank staff, invalid times, negative wage, and a browser reload before saving.
**Expected:** Invalid input is identified, and unsaved work is either preserved or clearly identified as lost before leaving.

### SOP Foundry and hosted employee materials

**Purpose:** Test the full controlled SOP lifecycle from draft through employee reading and manager verification.
**Starting page:** `/gravity-sop-foundry`

#### SOP-01 — Create and revise a draft
**Do this:** Start from a Gravity master and separately start a blank sample SOP. Save both as drafts.
**Expected:** The master is preserved, drafts are clearly labeled, and required fields are explained.

#### SOP-02 — Import existing procedures
**Do this:** Import one fictional sample procedure using an available import route and review duplicate handling.
**Expected:** The imported procedure is a draft until approved. Duplicate choices and any import errors are clear.

#### SOP-03 — Review and approve
**Do this:** Edit one field, record the reason, save a revision, and inspect the review/approval step.
**Expected:** The saved revision shows what changed and why. Approval reflects the complete saved copy.

#### SOP-04 — Publish employee version
**Do this:** Publish an approved sample SOP to the Employee Library and open it using a test employee link/PIN.
**Expected:** Only the deliberately published copy is visible to employees; a draft does not appear as current.

#### SOP-05 — Training and sign-off
**Do this:** Set a sample training requirement, complete the employee learning path, and inspect the manager sign-off record.
**Expected:** Acknowledgment, quiz completion, and manager sign-off remain distinct records.

#### SOP-06 — Search, station access, and question
**Do this:** Search for the sample procedure, explore another station, and submit a sample question or error report.
**Expected:** Search finds the current published version. Exploring another station does not grant work permission or certification.

#### SOP-07 — Poster and QR links
**Do this:** Create a sample poster and QR link to the published procedure. Scan it with a phone.
**Expected:** The poster and QR open the intended current employee copy and remain readable on a phone.

#### SOP-08 — Revision history and backup
**Do this:** Publish a second revision, inspect prior history, export/backup, and restore in a copy.
**Expected:** Earlier approved versions remain identifiable, and the restored copy matches the exported sample.

#### SOP-09 — Gravity Signals boundary
**Do this:** Enable a test signal with fictional employee learning data, inspect manager view, and check employee view.
**Expected:** Signals remain manager-only and are described as an indicator for investigation, not a conclusion.

### Work Study Lab

**Purpose:** Test study setup, observations, calculations, imports, exports, and clear explanation using a fictional task.
**Starting page:** `/gravity-work-study-lab`

#### WST-01 — Create a study
**Do this:** Start a sample study for a simple repeatable task and define the work elements.
**Expected:** The task, units, observed work, and study purpose are labeled clearly.

#### WST-02 — Record repeated observations
**Do this:** Enter multiple fictional observations including one obvious outlier.
**Expected:** Observations save accurately, and the tool makes unusual values visible without silently removing them.

#### WST-03 — Review calculated results
**Do this:** Compare calculated averages or time results with an independent hand calculation using the same observations.
**Expected:** The math uses the stated observations and units, and the result can be explained from the inputs.

#### WST-04 — Import and export
**Do this:** Try the documented import route with a sample file, then export the completed fictional study.
**Expected:** Errors identify the affected rows or fields. The export opens with readable labels and units.

#### WST-05 — Save and recover
**Do this:** Save, close/reopen, and use the documented backup/recovery route.
**Expected:** The study is retained and a restored copy contains the same observation set.


#### WST-06 — Recorded observation and transcription consent
**Do this:** Use only a short non-identifying test clip or your own neutral test recording. Add an event marker, stop and save, then inspect the recording list and export/import a portable copy. Do not record employees, guests, live service, payroll, payment, or confidential workplace audio for this pilot. Check whether Analyze Recording is blocked or clearly requests the separate upload consent when that box is unchecked; do not upload unless you deliberately accept the on-screen notice.
**Expected:** Local capture and export do not silently upload audio; markers remain aligned with the saved recording. Cloud transcription happens only after the separate explicit consent and Analyze action, is identified as a draft, and does not replace a verified study. If a safe test recording is unavailable, mark this case Not tested or Blocked.

### Numbers Lab and calculators

**Purpose:** Check calculator inputs, units, formula boundaries, explanations, and output consistency.
**Starting page:** `/gravity-numbers-lab`

#### NUM-01 — Known-answer calculation
**Do this:** Choose a calculator with a simple formula. Enter fictional values with a result you calculate separately.
**Expected:** The displayed answer matches the hand calculation and the units are labeled.

#### NUM-02 — Boundary values
**Do this:** Test values at and just above/below any displayed threshold or category break.
**Expected:** The correct band or warning appears at each boundary, with no gap or overlap.

#### NUM-03 — Missing and invalid input
**Do this:** Try blank, letters in numeric fields, negative values where prohibited, and zero where valid.
**Expected:** The tool distinguishes missing, invalid, and genuine zero values and explains how to correct the input.

#### NUM-04 — Change and recalculate
**Do this:** Change one input after a result appears, then reset and repeat with a second set.
**Expected:** The answer updates from the new inputs and reset clears the previous sample.

#### NUM-05 — Output and explanation
**Do this:** Print, copy, or export the result if offered and compare the explanation to the inputs.
**Expected:** The output includes the result and enough context to understand the formula and units.

### Recipe Works

**Purpose:** Test recipe entry, yield, unit conversions, portion scaling, costing, fractions, and printable output with a fictional recipe.
**Starting page:** `/gravity-recipe-works`

#### REC-01 — Create a sample recipe
**Do this:** Enter a fictional recipe with ingredients, amounts, units, yield, and portion size.
**Expected:** Required fields are clear and the recipe saves with the entered quantities.

#### REC-02 — Scale the yield
**Do this:** Scale the recipe up and down by a known factor and compare ingredient amounts by hand.
**Expected:** Scaled amounts match the factor and preserve readable fractions or decimals.

#### REC-03 — Unit conversion
**Do this:** Use a supported conversion such as ounces to pounds or fluid ounces to cups.
**Expected:** The conversion follows the displayed unit type and avoids mixing weight and volume without an explicit density.

#### REC-04 — Cost and missing costs
**Do this:** Enter fictional ingredient costs, change one cost, then leave another cost blank.
**Expected:** The recipe cost updates from available inputs and does not treat missing cost as zero without explanation.

#### REC-05 — Save and print
**Do this:** Save, reopen, and print/export the sample recipe.
**Expected:** The saved version remains intact and print output shows ingredients, quantities, units, and yield.


#### REC-06 — Revision governance and location adoption
**Do this:** With a fictional recipe, submit a revision for review, inspect the approval controls, approve a test version if the interface allows it, then check Revision History and Location Adoption. Do not treat a saved or submitted draft as approved; do not use a live restaurant recipe.
**Expected:** The status distinguishes draft, submitted, approved, and adopted states as the page describes. Prior revisions remain identifiable, and location adoption shows which version is in effect without silently replacing another location’s recipe.

### Quick Tools and QR Code Maker

**Purpose:** Test the twelve quick utilities currently listed from Gravity Assist using simple fictional inputs; never use live payroll, tips, food-safety decisions, or private restaurant records.
**Starting page:** `/gravity-quick-tools`
**Sample setup:** Use the sample values in each case. These checks verify arithmetic and output behavior; the Use-By Date Helper does not determine safe storage time. Use your approved recipe, food-safety plan, manufacturer instructions, and local requirements for real operations.

#### QCK-01 — Recipe Scaler
**Do this:** Enter original yield 4, new yield 8, and one ingredient line “1 lb cheese”. Select Scale recipe.
**Expected:** The scaled yield is 8 and the ingredient quantity doubles to 2 lb; item and unit stay intact.

#### QCK-02 — Label Maker
**Do this:** Enter fictional item “Pilot Test Sauce”, a prepared/opened time, an arbitrary sample use-by date, and initials “PT”. Use Print.
**Expected:** The preview/print contains the entered label fields. The tool does not present the entered date as an approved safety limit.

#### QCK-03 — Unit Conversion
**Do this:** Choose a listed conversion that converts 1 US gallon to quarts and enter 1.
**Expected:** The result is 4 quarts, with the selected units shown clearly.

#### QCK-04 — Shift Duration
**Do this:** Enter clock-in 10:00 AM, clock-out 6:30 PM, and an unpaid break of 30 minutes.
**Expected:** The result is 8.00 paid hours (or an equivalent clear display).

#### QCK-05 — Time to Decimal Hours
**Do this:** Enter 7 hours and 30 minutes.
**Expected:** The result is 7.50 decimal hours.

#### QCK-06 — Tip Splitter
**Do this:** Enter a fictional $120 pool and three lines: Ava, 1 point; Ben, 1 point; Chris, 2 points.
**Expected:** The split is $30, $30, and $60 respectively; the shares total $120.

#### QCK-07 — Cash Drawer Counter
**Do this:** Enter three $10 bills, two $5 bills, five $1 bills, and $1.00 in coins. Leave other denominations at zero.
**Expected:** The total is $46.00 and changing a denomination updates the total.

#### QCK-08 — Case / Each Converter
**Do this:** Enter 3 cases, 12 each per case, and 4 loose each.
**Expected:** The result is 40 each.

#### QCK-09 — Use-By Date Helper
**Do this:** Enter a fictional start date of November 1, 2026 and an interval of 7 days. Compare the displayed date with adding seven calendar days.
**Expected:** The date calculation is consistent and easy to read. The page’s warning makes clear the tool does not set an approved food-safety interval.

#### QCK-10 — Percent Change
**Do this:** Calculate old value 80 to new value 100, then old value 100 to new value 80.
**Expected:** The results show a 25% increase and a 20% decrease with direction clear.

#### QCK-11 — Section Rotation Maker
**Do this:** Enter three fictional servers/stations, choose a starting position, and build a rotation.
**Expected:** Every entered name/station appears once in a clear rotation; no entry is silently dropped or duplicated.

#### QCK-12 — Gravity QR Code Maker
**Do this:** Create a QR code for https://gravityleadershipsystem.com/start-here, download it, and scan it with a phone.
**Expected:** The code is readable and opens the exact intended Gravity URL.

### Books, registration, downloads, and Reader

**Purpose:** Test the published learning path, access steps, downloads, and reader behavior.
**Starting page:** `/books`

#### BOK-01 — Find a book and sample
**Do this:** Find one book, open its sample, then return to the book listing.
**Expected:** Cover, title, description, sample, and action button refer to the same book.

#### BOK-02 — Register and return
**Do this:** Use a permitted test account or test details to complete registration and return to the requested resource.
**Expected:** The success page explains next steps and the return route opens the requested book or download.

#### BOK-03 — Download and open
**Do this:** Download a sample or allowed digital file, check the file name, and open it.
**Expected:** The file opens, matches its title, and is not an empty or mismatched download.

#### BOK-04 — Reader selection and progress
**Do this:** Open Book Reader, choose a book, move between sections, and return later.
**Expected:** The book list is populated for the account, navigation works, and progress behavior matches the explanation.

#### BOK-05 — Phone reading and recovery
**Do this:** Repeat selection and reading on a phone. Test a failed load or reload.
**Expected:** Text remains readable and an error has a clear retry or help route.

### Windows program delivery and use

**Purpose:** Test download instructions and Windows workflows without using a live restaurant data file.
**Starting page:** `/windows-programs`

#### WIN-01 — Download package instructions
**Do this:** Follow the Windows download page and save one current program package.
**Expected:** The current file, edition, date, and install/portable instructions are clearly distinguished.

#### WIN-02 — Extract and launch
**Do this:** Extract the package to a test folder and follow the displayed launch steps.
**Expected:** The named program opens from the expected location and does not require unexplained extra files.

#### WIN-03 — Save and reopen sample work
**Do this:** Create fictional work, save, close the program, reopen it, and inspect the saved data.
**Expected:** The sample work persists in the documented location and a backup route is clear.

#### WIN-04 — Portable and installer paths
**Do this:** If both installer and portable editions are offered, follow each in a separate test folder.
**Expected:** Each path is clearly labeled, does not overwrite the other unexpectedly, and gives a safe uninstall/cleanup route.

#### WIN-05 — Update and version clarity
**Do this:** Compare the installed version with the website release note and update instructions.
**Expected:** The version is identifiable, update steps do not imply automatic upgrade if none exists, and data migration warnings are visible.

### Data saving, export, backup, and recovery

**Purpose:** Confirm that users can protect and recover work across browser and desktop tools.
**Starting page:** `/help-center`

#### DAT-01 — Find storage location
**Do this:** Save fictional work in each environment and read its storage explanation.
**Expected:** The user can tell whether work stays in the browser, on the computer, or in a hosted employee area.

#### DAT-02 — Export a backup
**Do this:** Use the documented export or backup function on a sample record set.
**Expected:** A backup file is created, named clearly, and can be found without searching hidden folders.

#### DAT-03 — Restore into a clean copy
**Do this:** Restore the backup into a separate test profile or folder.
**Expected:** The restored copy has the expected record count and content without overwriting the source sample.

#### DAT-04 — Partial failure and duplicate restore
**Do this:** Repeat restore, cancel midway if safe, and check duplicate handling.
**Expected:** The tool explains what happened and avoids silent duplicate records or silent data loss.

#### DAT-05 — Cross-device behavior
**Do this:** Open the same workflow on a second browser or device and check the site's sync statement.
**Expected:** Observed sync behavior matches the page's statement. Local-only drafts are not described as cloud-synchronized.

### Help, contact, registration, and support

**Purpose:** Test that users can request help, understand response limits, and avoid sending private data.
**Starting page:** `/help-center`

#### HLP-01 — Find the right support route
**Do this:** From a broken or confusing step, find Help Center and choose technical help or a general inquiry.
**Expected:** The route matches the issue and asks for useful reproduction details.

#### HLP-02 — Submit a sample issue
**Do this:** Use fictional details to complete a support form and inspect the confirmation.
**Expected:** Required fields are explained, the form submits once, and confirmation does not promise an unsupported response time.

#### HLP-03 — Privacy reminder
**Do this:** Inspect form warnings and try to attach or type sensitive data only in a safe fictional test.
**Expected:** The page discourages passwords and private records and does not request unnecessary sensitive fields.

#### HLP-04 — Failed send and retry
**Do this:** Simulate a disconnected page or use the browser's offline mode before submitting a test form.
**Expected:** A failed send is visible, entered text is recoverable where possible, and retry instructions are clear.

### Privacy, permissions, accessibility, and security

**Purpose:** Check that site behavior matches its explanations and that core routes work for users with different access needs.
**Starting page:** `/privacy`

#### SAFE-01 — Privacy claim comparison
**Do this:** For each assessment, form, pilot, and hosted employee feature, compare observed data collection with its privacy explanation.
**Expected:** No page claims local-only storage when answers are sent to a server. Any mismatch is treated as a blocking issue.

#### SAFE-02 — No sensitive sample data
**Do this:** Use fictional employee, wage, guest, and inventory data in every tool test.
**Expected:** Testers do not expose real people or financial records in screenshots, messages, or attachments.

#### SAFE-03 — Participant and manager access
**Do this:** Open a participant return link and the manager area from separate browser profiles. Try an invalid passkey and another participant token.
**Expected:** Participants can see only their own record. Manager tools reject invalid keys. No participant can open manager data.

#### SAFE-04 — Keyboard and zoom
**Do this:** Navigate major forms using keyboard only and zoom to 200 percent.
**Expected:** Labels, focus, validation errors, and buttons remain usable without clipped or hidden controls.

#### SAFE-05 — Screen reader labels
**Do this:** Use a screen reader or accessibility tree to inspect form fields, headings, and success/error messages.
**Expected:** Fields have meaningful labels, headings follow an order, and status changes are announced.

#### SAFE-06 — Permission and private data boundary
**Do this:** Try an unauthorized route or missing token and inspect the response.
**Expected:** Private data is not returned. Access denial does not reveal another participant's existence or content.

### Pilot Room and participation workflow

**Purpose:** Confirm the room supports an invited tester or operator from enrollment through final review.
**Starting page:** `/pilot-room`

#### PIL-01 — Create and preserve a pilot record
**Do this:** Only in an authorized disposable environment, enroll with fictional test details, save the private return link, close/reopen the browser, and return. Do not create fictional participants in production.
**Expected:** The participant can reopen only their own workspace. The manager can identify the participant and selected track.

#### PIL-02 — Run a tool protocol
**Do this:** Choose one test suite, follow each case, record pass/fail/blocked/not tested, and submit the results.
**Expected:** The saved report identifies the suite and case, records observations, and appears in the manager view.

#### PIL-03 — Run a restaurant improvement plan
**Do this:** Create a plan with one issue, one owner, a baseline, three to five resources, and a 30/60-day pace.
**Expected:** The room shows first review, midpoint, and end dates in order and stores no exact restaurant metric value.

#### PIL-04 — Weekly, midpoint, and final review
**Do this:** Submit one weekly review, a midpoint decision, and a final verification using fictional details.
**Expected:** Each review is timestamped; the midpoint records a decision; final review records whether the standard held.

#### PIL-05 — Report an issue and receive a reply
**Do this:** Submit a sample confusing or broken step and send a private message. Reply from the manager dashboard.
**Expected:** The issue and reply stay in the correct participant record and do not appear in another participant's view.

#### PIL-06 — Reward decision record
**Do this:** Mark a sample material contribution and record the reward decision in manager view.
**Expected:** The reward record is attributable to the contribution and cannot be confused with sign-up or praise alone.

### Analytics and conversion measurement

**Purpose:** Verify whether production analytics tags, consent behavior, and the key conversion actions are actually configured. This requires a Gravity manager or someone with access to GA4/Tag Assistant; a public tester alone cannot confirm event receipt.
**Starting page:** `/gravity-assist`
**Sample setup:** This is a manager-only verification. You need access to the live Gravity site, a browser Network panel or Google Tag Assistant, and the GA4 property/DebugView. Do not submit a real order, donation, or personal details. If the vendor/property or consent setting is unavailable, mark the relevant case Blocked; a page view alone does not prove measurement is working.

#### ANA-01 — Confirm a vendor actually loads
**Do this:** Open the production home page and one conversion page. Use Google Tag Assistant or the browser Network panel to identify whether GA4, Google Tag Manager, or Netlify Analytics actually loads. Record the vendor and property/container name without copying secrets.
**Expected:** Pass only when the expected production vendor is visibly connected and receives the visit. A policy mention, code comment, CTA attribute, or network request to a library by itself is not proof of reporting.

#### ANA-02 — Check the consent choice
**Do this:** If a consent layer is present, test Reject/necessary-only, then Accept/analytics. Use the Network panel to compare analytics requests. If there is no consent layer, record that as a gap for policy/legal review rather than assuming consent behavior.
**Expected:** Requests follow the published consent choice. No analytics identifier or event is stored/sent before permitted consent where required. The choice is clear and can be changed.

#### ANA-03 — Verify each important conversion
**Do this:** With a safe test account or sandbox only, follow the primary visitor actions: pilot enrollment, book/sample registration, download or reader access, and any enabled purchase/donation flow. Inspect GA4 DebugView or the equivalent event receiver after each completed step.
**Expected:** Each completed action produces one named event at the actual success point. Button clicks, failed submits, and page views are not counted as completed conversions.

#### ANA-04 — Check event details and duplicates
**Do this:** Review the received event names and parameters for one path on desktop and phone. Reload once, use browser Back/Forward, and check for repeat submissions. Confirm that event data does not contain names, email addresses, payment data, passwords, or exact private restaurant figures.
**Expected:** Events use consistent names, avoid personal data, and do not duplicate from one completed action. Record the event name and non-sensitive parameter names only.

#### ANA-05 — Separate production from preview traffic
**Do this:** Repeat one safe path on the production site and, if available, a deploy preview. Check which property receives each visit and confirm that internal test traffic can be identified or excluded from product decision reports.
**Expected:** Production events reach the production property once. Preview/internal testing is clearly separated or excluded; testers’ activity is not mistaken for customer behavior.

### Pilot invitation and enrollment process

**Purpose:** Check that an invited operator can understand the offer, reach the Pilot Room, enroll, and get a usable private return link.
**Starting page:** `/pilot-room`

#### PILOT-RECRUITMENT-01 — Open the participant entry page
**Do this:** Follow the public invitation to the Pilot Room. Read both participation choices and the reward information.
**Expected:** The invitation opens the correct room and explains the choices and rewards.

#### PILOT-RECRUITMENT-02 — Review enrollment instructions
**Do this:** Inspect the name, email, role, track and consent fields. Do not submit fictional details on production.
**Expected:** The required information and the difference between tracks are clear.

#### PILOT-RECRUITMENT-03 — Enroll in an isolated test environment
**Do this:** Only in an authorized disposable environment, enroll a fictional participant and confirm the private workspace opens.
**Expected:** The saved record appears in the manager dashboard with the correct details.

#### PILOT-RECRUITMENT-04 — Preserve return access
**Do this:** In the isolated environment copy the private return link, reopen it in a fresh session and confirm the same record.
**Expected:** The original record reopens without duplicate enrollment.

### Pilot review and manager follow-up

**Purpose:** Check that weekly, midpoint, final, and issue entries reach the manager, receive a response, and produce an accurate final record.
**Starting page:** `/pilot-room-manager`

#### PILOT-FOLLOWUP-01 — Open the manager dashboard
**Do this:** Use authorized manager access in a disposable test environment. Do not modify real records.
**Expected:** The manager dashboard shows the test participant and correct plan.

#### PILOT-FOLLOWUP-02 — Review saved records
**Do this:** In the disposable environment submit weekly, midpoint and final reviews in order and check the manager view.
**Expected:** The reviews are present and progress reflects completed milestones.

#### PILOT-FOLLOWUP-03 — Check issue and message follow-up
**Do this:** Submit a fictional issue and message in the isolated environment. Reply from the manager dashboard.
**Expected:** The issue and reply appear in the correct test record.

#### PILOT-FOLLOWUP-04 — Verify final record
**Do this:** Review the final result, contribution evidence and reward decision in the disposable manager workspace.
**Expected:** The final record reflects the verified contribution and actual reward decision.

### Visitor-to-pilot conversion journey

**Purpose:** Find out whether someone invited to learn about Gravity can understand the offer, take the next step, and return later. Track only the journey stage; do not claim success from a button click alone.
**Starting page:** `/pilot-room`

#### CVJ-01 — Find the primary next step
**Do this:** Open the page from a shared invitation on a phone. Without coaching, say what Gravity offers and what the page asks you to do next.
**Expected:** The offer and one next action are clear. If the person is unsure, record the words or screen that caused confusion.

#### CVJ-02 — Follow the call to action
**Do this:** Click the invitation link and complete the intended low-risk action with fictional or tester-approved contact details.
**Expected:** The destination matches the invitation, the form explains required information, and completion has a clear confirmation.

#### CVJ-03 — Return to the journey
**Do this:** Close the page, then use the saved return link or invitation to return and continue.
**Expected:** The person can resume or clearly understand how to re-enter. Do not count a page view as a completed pilot.

#### CVJ-04 — Record the outcome stage
**Do this:** Manager records invitation sent, room visit, enrollment, plan saved, first test/review, and completed pilot as separate stages.
**Expected:** The record does not infer later stages from earlier clicks, and there is a date and source for each observed stage.

### Forms Personalizer

**Purpose:** Test the live path for customizing an existing Gravity form with fictional restaurant details.
**Starting page:** `/gravity-forms-personalizer`

#### FPR-01 — Open a Gravity master
**Do this:** Open Forms Personalizer from Gravity Assist and choose one available Gravity form or approved sample.
**Expected:** The selected form is identified and the tool explains what can be changed.

#### FPR-02 — Personalize restaurant details
**Do this:** Enter a fictional restaurant name, location, and manager role. Change one allowed field or instruction.
**Expected:** The preview shows only the intended changes; the source master remains identifiable and is not silently overwritten.

#### FPR-03 — Review and produce the form
**Do this:** Review every page, then use the available print, save, or download action.
**Expected:** The output is complete, readable, and contains the entered sample details without missing sections.

#### FPR-04 — Change, reset, and repeat
**Do this:** Return to the editor, revise one answer, then start a new sample if offered.
**Expected:** The changed output reflects the revision, and a new sample does not carry forward unintended information.

### Document Studio

**Purpose:** Test the live guided builder for creating a new restaurant form or document using fictional data.
**Starting page:** `/gravity-document-studio`

#### DST-01 — Start a new document
**Do this:** Open Document Studio from Gravity Assist and choose a document type offered by the page.
**Expected:** The selected document type and purpose are clear before entering information.

#### DST-02 — Complete and skip fields
**Do this:** Enter fictional restaurant details, leave one required field blank, and skip one optional field.
**Expected:** The tool identifies a missing required item; optional information can be skipped where the page allows it.

#### DST-03 — Preview and produce output
**Do this:** Review the completed document and use the available print, save, or download action.
**Expected:** The result matches the entries, is readable, and includes all expected sections.

#### DST-04 — Revise and start clean
**Do this:** Edit an earlier answer and inspect the output; then use the offered new-document/reset action.
**Expected:** The preview updates and the new document does not contain data from the prior sample.

#### DST-05 — Check source and legal links
**Do this:** If the document links to an official or legal source, follow the link and confirm its publisher.
**Expected:** Official source materials remain clearly identified and are not presented as Gravity-created legal advice.

### Employee Handbook Creator

**Purpose:** Test the accessible web handbook builder from Gravity Assist with fictional company information.
**Starting page:** `/handbook-creator/`

#### HBC-01 — Open and check access
**Do this:** Open Handbook Creator from Gravity Assist, wait for its access check, then create a new sample handbook.
**Expected:** The access state resolves, a new project can be started, and the page explains where projects are saved.

#### HBC-02 — Choose interview level
**Do this:** Select Basic, Extended, and Full in turn. Check that the displayed question set changes and previously entered sample answers remain.
**Expected:** The level and topic choices behave as the on-screen guide describes without deleting saved answers.

#### HBC-03 — Answer, skip, and review
**Do this:** Answer one fictional policy question, postpone one, skip one altogether, then open Review & postponed questions.
**Expected:** Answers and skip choices are distinguishable and can be reviewed or restored as the guide explains.

#### HBC-04 — Choose and preview a design
**Do this:** Set a fictional company name, choose a design, and open Preview only.
**Expected:** The preview reflects the selected design and sample company details without starting a download.

#### HBC-05 — Save and restore a project backup
**Do this:** Save a project backup, open it as a restored copy, and verify the original sample remains.
**Expected:** The backup reopens as a separate project with its sample answers and design; the original is not overwritten.

#### HBC-06 — Download PDF and editable Word
**Do this:** Use Preview & download and save both offered formats. Open each file.
**Expected:** Both files open, contain the sample handbook, and are clearly distinguishable from the editable project backup.

#### HBC-07 — Repeat on a phone
**Do this:** Open the page on a phone, navigate a few questions, and locate the backup and download controls.
**Expected:** The controls remain usable on a small screen; the page makes clear that projects are stored on that device/browser.

### Ask Gravity Guide

**Purpose:** Check whether Ask Gravity helps visitors find published material and keeps answers grounded in the current Gravity site.
**Starting page:** `/gravity-assist`

#### ASK-01 — Open the guide
**Do this:** Open Ask Gravity from a live Gravity page and ask a simple question about a published resource.
**Expected:** The guide opens, accepts the question, and provides a clear response or route.

#### ASK-02 — Check linked answers
**Do this:** Follow one answer link, then return and try a question whose answer is not clearly present on the page.
**Expected:** Links open the named resource; unsupported answers are identified as unknown or directed to help rather than invented.

#### ASK-03 — Test phone and keyboard use
**Do this:** Repeat a short question on a phone and navigate the guide with keyboard controls.
**Expected:** The text, close/reopen controls, and input are usable without losing the current page.

#### ASK-04 — Protect private information
**Do this:** Use only a public, non-sensitive question. Review the privacy notice and do not enter employee, guest, payroll, payment, or confidential restaurant details.
**Expected:** The guide’s stated data handling is understandable and no private test information is required.
