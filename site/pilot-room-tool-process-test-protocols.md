# Gravity Tool and Process Test Protocols

Version 1.2 · 33 guides · 159 individual checks

Use fictional restaurant data. For every case, record Pass, Fail, Blocked, or Not tested. If the expected result is unclear, mark Blocked or Not tested and describe what needs clarification. Do not enter private employee, guest, payroll, payment, or exact financial records. For tool names in the readiness catalog, first check whether the tool is currently available in Gravity Assist. If not, mark Blocked and stop; do not assume a feature or invent a route. Analytics and conversion measurement checks require manager access to the live analytics account and production browser diagnostics.

## How to use these guides

1. Choose one guide that matches the tool or process you are working on.
2. Read its purpose and sample setup. Open the listed page or use Gravity Assist to find the tool.
3. Follow each case in order. Record Pass only when the expected result actually occurs; use Fail, Blocked, Not tested, or Not applicable honestly.
4. Use fictional data unless a restaurant pilot explicitly asks you to compare a measure in your own records. Keep exact figures, employee data, guest details, payment information, and passwords out of these reports.
5. If a tool is not available, mark Blocked and stop. Do not invent features or routes.

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
**Sample setup:** Use a disposable fictional restaurant named Pilot Kitchen. Create these sample items only if the tool offers item setup: Canola Oil (base unit bottle; purchase unit case of 12; fictional cost $36 per case; starting count 2 cases/24 bottles), Mozzarella (base unit pound; case of 10 pounds; fictional cost $42 per case; starting count 30 pounds), and Tomato Sauce (base unit can; case of 6; fictional cost $24 per case; starting count 3 cases/18 cans). Test receiving one oil case (+12 bottles), wasting two bottles (-2 bottles), and counting the remaining 34 bottles. Do not require the system to use these exact fields if its documented setup differs; record an unavailable feature as Blocked or Not applicable, not as a guessed failure. Use an available reset, disposable workspace, or export backup before testing destructive edits.

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
**Do this:** After the one-case receipt, the sample oil total is 36 bottles. Record a count of 34 bottles and review the variance from the expected quantity. Then change the count by one bottle and review whether the history shows the change.
**Expected:** The variance uses the entered units and count date. A missing count is not presented as a zero count.

#### INV-05 — Waste or spoilage
**Do this:** Record two bottles of fictional Canola Oil as waste/spoilage with a reason. Starting from 36 bottles after receipt, the expected remaining quantity is 34 bottles if waste is recorded as an on-hand reduction. If the tool defines waste differently, follow its published instructions and record the difference.
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

### Numbers Lab and calculators

**Purpose:** Check calculator inputs, units, formula boundaries, explanations, and output consistency.
**Starting page:** `/gravity-assist`

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
**Starting page:** `/gravity-assist`

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

### Forms Personalizer and Document Studio

**Purpose:** Test guided document creation, required fields, preview, editable outputs, and official-form boundaries.
**Starting page:** `/gravity-assist`

#### DOC-01 — Complete one guided builder
**Do this:** Choose a sample builder, enter fictional values, save, and continue to the next section.
**Expected:** Progress is clear; saved answers remain after moving between sections.

#### DOC-02 — Required and optional fields
**Do this:** Leave one required field blank and skip one optional field.
**Expected:** The missing required item is named. Optional fields can be skipped without blocking completion.

#### DOC-03 — Preview and output
**Do this:** Review the full preview, then download or print the generated document if offered.
**Expected:** The preview matches the entered data and the exported document is readable and complete.

#### DOC-04 — Edit and restart
**Do this:** Return to an earlier section, change one answer, and start a new document.
**Expected:** The revised answer appears in the preview. Starting over does not mix the prior sample into the new file.

#### DOC-05 — Official forms and source links
**Do this:** Follow any links for official legal or government forms and inspect their destination.
**Expected:** Official forms remain linked to their issuing agency and are not misrepresented as Gravity-created legal forms.

### Quick Tools and QR Code Maker

**Purpose:** Test quick calculators and scannable links from creation through phone use.
**Starting page:** `/qr-code-generator`

#### QR-01 — Create a QR code
**Do this:** Generate a QR for a harmless public Gravity page and download the result.
**Expected:** The code downloads in the offered format and encodes the exact intended URL.

#### QR-02 — Scan on a phone
**Do this:** Scan the downloaded code on a phone camera and follow the destination.
**Expected:** The code scans at normal print size and opens the intended page without changing domains unexpectedly.

#### QR-03 — Input validation
**Do this:** Try a blank destination, malformed URL, and a valid URL.
**Expected:** The tool explains invalid entries and does not silently create a misleading code.

#### QR-04 — Print and readability
**Do this:** Place the code on a sample page and test print/scan at its intended size.
**Expected:** The printed code remains readable and has a plain-text destination or label where appropriate.

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
**Do this:** Join with fictional test details, save the private return link, close/reopen the browser, and return.
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

### People Planner

**Purpose:** Check whether People Planner is available and whether a manager can understand its intended people-planning workflow without entering employee personal data.
**Starting page:** `/gravity-assist`

#### PEOPLE-PLANNER-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### PEOPLE-PLANNER-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### PEOPLE-PLANNER-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### PEOPLE-PLANNER-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Service Shaper

**Purpose:** Check availability and the visible service-design workflow using a fictional guest-service example only.
**Starting page:** `/gravity-assist`

#### SERVICE-SHAPER-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### SERVICE-SHAPER-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### SERVICE-SHAPER-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### SERVICE-SHAPER-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Maintenance Center

**Purpose:** Check availability and visible maintenance-reporting workflow with a fictional piece of equipment; do not enter real vendor or safety incident details.
**Starting page:** `/gravity-assist`

#### MAINTENANCE-CENTER-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### MAINTENANCE-CENTER-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### MAINTENANCE-CENTER-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### MAINTENANCE-CENTER-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Guest Recovery & Retention

**Purpose:** Check availability and the visible guest-recovery workflow with a fictional guest and issue; never enter real guest information.
**Starting page:** `/gravity-assist`

#### GUEST-RECOVERY-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### GUEST-RECOVERY-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### GUEST-RECOVERY-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### GUEST-RECOVERY-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Purchase & Vendor Insights

**Purpose:** Check availability and visible purchase/vendor workflow using fictional items and prices only.
**Starting page:** `/gravity-assist`

#### PURCHASE-VENDOR-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### PURCHASE-VENDOR-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### PURCHASE-VENDOR-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### PURCHASE-VENDOR-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Safety & Inspection

**Purpose:** Check availability and visible inspection workflow with a fictional checklist; do not record an actual safety event as test data.
**Starting page:** `/gravity-assist`

#### SAFETY-INSPECTION-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### SAFETY-INSPECTION-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### SAFETY-INSPECTION-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### SAFETY-INSPECTION-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Growth Training Center

**Purpose:** Check availability and visible training workflow using fictional roles or sample material; do not enter real employee records.
**Starting page:** `/gravity-assist`

#### GROWTH-TRAINING-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### GROWTH-TRAINING-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### GROWTH-TRAINING-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### GROWTH-TRAINING-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Menu Creation & Control

**Purpose:** Check availability and visible menu workflow using fictional item names and sample prices only.
**Starting page:** `/gravity-assist`

#### MENU-CONTROL-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### MENU-CONTROL-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### MENU-CONTROL-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### MENU-CONTROL-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Sales Forecaster

**Purpose:** Check availability and visible forecasting workflow using invented example inputs only.
**Starting page:** `/gravity-assist`

#### SALES-FORECASTER-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### SALES-FORECASTER-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### SALES-FORECASTER-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### SALES-FORECASTER-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Risk & Continuity

**Purpose:** Check availability and visible risk or continuity workflow using a fictional scenario; do not enter sensitive security or emergency details.
**Starting page:** `/gravity-assist`

#### RISK-CONTINUITY-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### RISK-CONTINUITY-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### RISK-CONTINUITY-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### RISK-CONTINUITY-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Quality Assurance

**Purpose:** Check availability and visible quality review workflow using fictional observations only.
**Starting page:** `/gravity-assist`

#### QUALITY-ASSURANCE-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### QUALITY-ASSURANCE-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### QUALITY-ASSURANCE-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### QUALITY-ASSURANCE-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

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
**Starting page:** `/gravity-assist`

#### PILOT-RECRUITMENT-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### PILOT-RECRUITMENT-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### PILOT-RECRUITMENT-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### PILOT-RECRUITMENT-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

### Pilot review and manager follow-up

**Purpose:** Check that weekly, midpoint, final, and issue entries reach the manager, receive a response, and produce an accurate final record.
**Starting page:** `/gravity-assist`

#### PILOT-FOLLOWUP-01 — Check whether it is available
**Do this:** Open Gravity Assist and look for this named tool. If it is listed, open it. If it is missing or unavailable, stop and record Blocked; do not substitute a different tool or guess its address.
**Expected:** The tool opens from its published Gravity entry point, or its absence is recorded as Blocked with the date and device.

#### PILOT-FOLLOWUP-02 — Read the first-use instructions
**Do this:** If the tool opens, read its visible purpose, instructions, and any sample. Note any word or step that is unclear before entering information.
**Expected:** A first-time tester can explain what the tool is for, what to enter, and what it will produce. Missing instructions are reported as a usability gap.

#### PILOT-FOLLOWUP-03 — Complete one fictional task
**Do this:** Use fictional restaurant information only. Follow the task the tool itself presents. If there is no usable task or a required feature is not present, mark Blocked or Not applicable and explain.
**Expected:** The tool completes the task it actually offers, and its result matches the on-screen instructions. Do not treat an undocumented feature as a failure.

#### PILOT-FOLLOWUP-04 — Check save, export, and recovery
**Do this:** If the tool offers save, export, print, or backup, use one offered control. Refresh or reopen only if the instructions say work should persist. If no such control is offered, mark Not applicable.
**Expected:** The offered control behaves as described and the resulting copy can be found. A missing or misleading control is recorded with the exact screen and action.

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
