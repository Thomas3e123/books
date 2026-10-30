# Gravity conversation — invited prototype review

Requested by Thomas Butler: build the conversation demonstrated in the October 28–30 discussion. Preview only; not general release or owner reporting.

## Final behavior

- `/gravity-conversation` accepts a free-text problem and follow-up findings. AI receives the full bounded conversation and six controlled public-source excerpts plus explicit investigation principles. No forced topic or 30/60-day pacing.
- Responses ask at most one useful question or give up to four plain-English next steps with who, when/event and findings to return. The supplied busy-night comps example starts with available records rather than a presumed cause.
- New working-record entries are attributed to exact user-message IDs. Reported accounts, hypotheses, evidence described and corrections stay distinct. A model cannot create an independently verified fact/status.
- Corrections preserve earlier accounts. New follow-up findings reopen the manager verification record and retain the previous record in history. Verification requires a person, before/after results, how checked under relevant conditions and a follow-up/prevention check. This is manager-recorded evidence, not independent authentication or an approval guarantee.
- Explicit device save/load, JSON backup/restore and readable text history. No cloud/team access, accounts, cross-customer learning or automatic reporting. Same-browser storage is shared with anyone using that profile.
- Existing Document Studio structures are reused: Guest Recovery Record, Waste / Spill / Comp Log and Manager Handoff Form. Source hash is recorded and tested. No automatic full-library search or transfer is claimed. Unknown fields stay blank; only an attributed account and selected tasks may be prefilled. CSV export neutralizes formula cells. Text/CSV report import stays in the composer until explicit Send.
- Earlier Action Plan remains intact and links to the test. This branch is isolated from the migration/public production branch.

## Boundaries and configuration

The new endpoint refuses non-preview deployments even when enabled. Default invited-preview model matches the existing site's guide (`gpt-5.6-luna`) and can be overridden with `GRAVITY_CONVERSATION_MODEL`. `GRAVITY_CONVERSATION_AI_ENABLED=false` disables it. Existing server OpenAI SDK credentials are reused; none are shipped to the browser. Provider behavior must be live-verified. Netlify environment-write tools returned 403; no environment values were changed. Preview-only defaults are declared in function code.

Global per-domain rate rule: 3 requests/minute. Input body bounded to 100 KB, 40 messages and 22,000 text characters; each new message at most 6,000 characters. No silent history truncation. Output max 2,200 tokens and validated structured schema. Requests have a 45s provider timeout, periodic progress and no retention request. Failures preserve the old record and new composer text. No absolute billing cap is claimed; keep this an invited preview, monitor provider usage and configure a production budget before broader release.

## Charter review

Purpose: short reliable investigation path, not administrative completion. Evidence: source-attributed records and qualified verification. People: no automatic discipline or personality scoring; choose independent leadership when own-work checks failed. Control: explicit send/save/import and visible limitations. Simplicity: conversation and numbered steps; details collapsed. Integrity: no claims of proof from confidence or checklist completion. Boundaries: no private source publication, manager notification or confidential-record guarantees. Alternatives: earlier action-list builder remains available. Learning loop: Testing Room/Contact.

Disposition: prepared invited prototype at Thomas's request. Thomas's usability review and broader representative-case acceptance remain outstanding; no general-release approval is claimed.

## Validation

13 conversation tests plus 12 existing action-plan tests pass. Includes correction history, verification reopening, no automatic resolution, source attribution, backup validation, real Document Studio hashes, spreadsheet formula escaping, request bounds, preview-only gate and mocked provider failure behavior. JavaScript syntax, source manifest and build verified.

Live-provider/browser results will be appended after deployment. Mobile, print pagination, hostile-input model behavior and independent specialist review remain unverified. Do not describe mocked AI tests as real-provider validation.
