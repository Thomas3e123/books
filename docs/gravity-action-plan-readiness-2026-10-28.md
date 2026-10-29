# Gravity Action Plan: first version and next needs

October 28, 2026 · Working review beta

## What is built

A dedicated `/gravity-action-plan` page, linked from Gravity Assist, prepares a manager-editable plan for closing, handoffs, training, inventory differences, or labor coverage. It produces three suggested working aids, implementation steps, a checklist, short training aid, open-item handoff, and dated reviews. The 60-day path treats Day 30 as midpoint correction and Day 60 as the final decision.

Managers can record checklist completion, review notes, and a keep/change/retire/expand decision; save on this browser profile; download and restore a JSON backup; export a text working plan; or print/save PDF. Saving is explicit. Device storage is not private from other users of the same browser profile. There is no cloud synchronization or automatic reminder.

Guided plans work without AI. The optional server-side AI drafter uses controlled reference excerpts, validates the response structure, limits requests, and reports unavailable/failed requests honestly. It does not silently substitute a template for an AI result. All output remains a draft requiring manager review.

## Prioritized needs

| Priority | What would help | Why / current status |
|---|---|---|
| Before AI activation | Verify runtime AI access, choose a currently available model, and set an acceptable usage budget | The existing site already contains an AI guide. This new endpoint is disabled by default until its configuration and costs are reviewed. No new key needs to be sent in chat. |
| Before public AI release | Thomas reviews representative outputs against the Gravity charter and approved procedures | AI structure tests are not evidence of sound restaurant advice. The repository requires an accountable human release review. |
| Highest content improvement | A controlled source index for approved SOPs, forms, operating-system instructions, and installation materials, with revision, approval status, and source links | The first version uses six exact public-page snapshots. It does not claim to have searched all 525 SOPs or the full paid/registered library. Private materials must not be copied into the public repository. |
| Highest quality improvement | 10–15 fictional or sanitized restaurant problems, with examples of what a useful answer should contain | Test closing failures, unclear standards, training versus discipline, inventory variance, workload, and both installation paces. Real manager review is still needed; no customer testing is claimed. |
| Better personalization | Restaurant profile: service style, roles, operating constraints, approved procedures, goals, and chosen installation pace | Avoid repeatedly asking for context. Store only what is useful, with explicit controls for viewing, changing, and deleting it. No payroll, medical, guest identity, alarm details, or employee ranking is needed. |
| Better execution | Explicit transfer into the existing Forms Personalizer, Document Studio, and SOP Foundry | The first version links to the right workspace but does not transfer data or publish an SOP. Add only supported import/save interfaces and retain manager review. |
| Better follow-through | Account-based plan saving, restaurant access controls, revision history, and recovery | Needed for reliable multi-device/team work. Browser storage alone cannot provide restaurant/team privacy. This is a separate feature, not an existing capability. |
| Better follow-through | Opt-in reminders and scheduled reviews | Dates currently appear in the plan; no email or calendar event is created. Choose recipient, timing, and reminder service before connecting them. |
| Ongoing quality | Source refresh owner and regular review of wrong/confusing output | Testing Room feedback is linked, with Contact as fallback. Someone must investigate, correct, and retest reports. Source changes require a reviewed snapshot update. |
| Later, only if useful | Read-only operational integrations with POS, inventory, scheduling, or logs | Not necessary for the first useful version. Add after the plan workflow proves useful and access/data boundaries are defined. |

## Technical activation and release

- Existing Netlify target: `gravity-leadership-system`, site ID `fa5d39a0-bef9-4ff1-9c28-57d585d741d7`, primary domain `gravityleadershipsystem.com`. Do not deploy this work over Thomas Monroe Books.
- Set `GRAVITY_ACTION_AI_ENABLED=true` and `GRAVITY_ACTION_MODEL` to a model verified against the runtime provider. Existing OpenAI SDK credentials are consumed on the server; do not add secrets to repository files or client code. The official SDK supports Netlify-injected `OPENAI_API_KEY` / `OPENAI_BASE_URL`.
- Run `npm ci`, `npm run test:action-plan`, `npm run manifest`, and `npm run build`. Bundle the Netlify function and check actual request rate limiting on a preview deployment.
- Verify a real AI request, upstream failure recovery, mobile use, editing, save/reload, backup restore, print/export, and links on the Netlify preview before public release.
- Human acceptance: review at least one realistic case in each supported problem area and both installation paces. Verify uncertain facts remain uncertain and no draft is presented as an approved procedure.
- Capture test results and Thomas's release decision in the charter review record. Fix forward if released behavior needs correction.
