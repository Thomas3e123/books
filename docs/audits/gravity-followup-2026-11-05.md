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
