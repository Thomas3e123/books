# Gravity Action Plan — Charter review record

Policy: `docs/gravity-charter-release-review.md`, Foundational Charter v1.1.

Stage: prepared review beta; **not a human approval or a public AI release**.
Accountable owner/reviewer: Thomas Butler (sign-off pending).
Feedback: Testing Room, with Contact as fallback. No real customer acceptance testing is claimed.

| Gate | Evidence and remaining work |
|---|---|
| Purpose | Converts one repeated restaurant problem into editable working aids and a review plan. |
| Evidence | Six versioned public-page snapshots with exact file hashes; source links appear in output. AI structure validation does not verify factual or operational soundness. |
| People | No employee ranking, automatic discipline, pay decisions, or theft conclusions. Prompt requires contextual investigation. Manager reviews material decisions. |
| Control | Explicit AI submission, local save/delete, portable backup, editable output, and review acknowledgment that clears on edits. No automatic publication or workspace write. Shared-device limits disclosed. |
| Simplicity | Five supported problem areas, three aids per plan. Guided version works without AI. |
| Integrity | No claimed savings or fabricated baseline. Explicit template versus AI mode. Drafts are not certification or approved SOPs. |
| Verification | Twelve automated tests pass: five-topic drafts, dates/paces, validation, source hashes, request limits/origins, disabled AI, successful mocked AI, invalid/upstream errors. Actual provider behavior, deployed rate limits, and customer acceptance remain unverified. Browser results recorded below when available. |
| Boundaries | Private full charter/SOP library not copied into public source. No cloud-sync or reminder claim. No regulatory guarantees. |
| Alternatives | Guided templates remain usable when AI is disabled or unavailable. |
| Customer evidence | None yet. Use sanitized scenarios; invite realistic manager feedback after readiness review. |
| Learning loop | Existing Testing Room and Contact routes linked. Thomas to review feedback and assign correction/retest work. |
| Decision | Prepared for human review. Public AI activation and general release require accountable sign-off, a verified model/configuration, and representative output testing. |

The branch isolates this change from the existing live site. Publication is intentionally pending the repository's required human governance decision, not a technical assertion that automated checks constitute approval.

## Browser evidence — October 28, 2026

Verified in the managed browser preview using a fictional closing example:

- 60-day plan generation displayed Day 30 midpoint and Day 60 final decision with the calculated dates.
- Edited plan title and review notes persisted after explicit save, full page reload, and Load saved plan.
- Review acknowledgment was cleared after edits.
- JSON backup downloaded and restored successfully through the file chooser.
- Working-plan text downloaded; its contents were checked for line breaks, review notes, and honest incomplete-checklist states. UI-only Add open item control was excluded.
- Draft with AI returned the explicit not-enabled message and retained the existing plan.
- Desktop screenshot inspected; two-column layout and editable plan were readable.

Remaining verification: real-provider AI output, Netlify production/preview bundling and rate limiting, narrow-screen device testing, printed/PDF pagination, multi-manager/customer acceptance, and specialist review where applicable. Browser extension telemetry errors were observed; no application failure was identified from them.
