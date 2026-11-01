# Optional-by-default interview and legal essentials

## Product rule
Every interview entry is optional by default, including business name, logo, branding, and operating preferences. Users may skip, return, edit, and complete a draft without filling every optional entry. The system must never invent an owner's policy decision or present a blank as a settled policy.

## Narrow legal exceptions
Only ask for information that is genuinely necessary to determine applicable legal requirements or to prevent a materially misleading legal statement. Do not classify a question as mandatory simply because it is convenient for a template.

Legal-critical prompts are conditional and jurisdiction-dependent. Examples: employment location/jurisdiction and other legally material workforce factors **when needed for a particular compliance claim**. The exact set must be validated against maintained authoritative legal sources and reviewed by qualified counsel; the software must not imply a blanket compliance guarantee.

When a user skips legal-critical information:
- Permit saving, editing, and viewing the draft, but clearly label affected policies **Legal details needed — not ready for finalization**.
- Explain plainly what is needed and why, with a link back to the question.
- Never silently fill missing answers with guesses, defaults, or legal assertions.
- Gate finalization of **affected legally sensitive content** until the required information is provided and validated; permit exporting unaffected content only when it is clearly labeled incomplete and after purchase.
- Keep payment independent from legal completeness: a customer should never have to pay to discover missing legal inputs.
- Legal review warnings are not a substitute for legal advice.

## UX
- Every optional question includes **Skip for now**.
- Sections may be marked reviewed even with optional unanswered questions.
- Progressive full-color handbook preview displays completed sections and marks omitted material appropriately; no placeholders in customer-facing final text.
- For a missing company name, use a neutral preview title such as **Employee Handbook** rather than inventing a company identity.
- Show a concise completion summary distinguishing **Ready**, **Optional details omitted**, and **Legal details required**.
- Company logo remains optional and can be added later.

## Implementation requirements
- Update existing interview.starter.json required flags to optional by default; add explicit legal-critical metadata only after legal review.
- Update existing browser and Windows interfaces so required validation applies only to reviewed legal-critical questions, not every question.
- Keep the website tool private and Windows app unreleased while this change is implemented and tested.

Status: governing design contract; code changes and jurisdiction review still outstanding.
