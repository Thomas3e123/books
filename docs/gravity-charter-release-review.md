# Gravity Charter Review — Release and Decision Gate
**Policy reference:** The Gravity Foundational Charter, Version 1.1 (October 28, 2026)  
**Status:** Internal operating procedure / review template.  
**Scope:** Gravity products, software releases, AI capabilities, SOP and training changes, data collection, public claims, official Gravity publications, and material partnerships. Thomas Monroe Books' independent publishing business should use its own publishing standards; official Gravity-branded material remains subject to this review.

## Why this exists
A successful build or deployment is not evidence that a feature is appropriate, safe, accurate, understandable, or useful. The charter applies to real release decisions, not merely positioning. A release cannot be expected to be perfect at first contact with real restaurants. **Customer participation is an essential part of completing and sustaining Gravity's improvements.** Responsible release means the product is safe and sufficiently reliable for its stated stage, its limitations are clearly described, and a functioning path exists to hear, investigate, correct, retest, and learn from customers.

## When a review is required
Perform a documented review before:
- A major new product or substantially changed workflow.
- Introducing automated decisions, AI recommendations, or signals affecting people.
- Changing personal-data collection, retention, access, or disclosure.
- A major claim about accuracy, results, savings, safety, or compliance.
- Official Gravity books, editorial positions, or partnerships.
- A new monetization or access model that materially changes customer control.

Routine copy fixes and defect corrections may receive expedited review unless their effects touch safety, privacy, claims, or material customer commitments.

## Record (copy and complete for the release or decision)
**Product or decision:**  
**Version / branch / commit:**  
**Review date:**  
**Accountable owner:**  
**Reviewer (person):**  
**Related evidence, tests, reports, or demos:**  
**Prior version / backup / rollback plan:**  
**Release stage (internal / invited beta / public beta / general release):**  
**Known limitations, risks, and customer-facing disclosures:**  
**Customer testing and feedback channel:**  
**Support and correction owner:**  

| Charter gate | Required review and evidence | Result (Pass / Needs work / Not applicable) |
|---|---|---|
| 1. Purpose | What genuine restaurant problem does this solve? | |
| 2. Evidence | What is verified, estimated, assumed, or unknown? | |
| 3. People | Impact on employees, managers, owners, and guests? | |
| 4. Control | Human oversight, appropriate access, privacy, security, and appeal/correction? | |
| 5. Simplicity | Is this practical, proportionate, and independently useful? | |
| 6. Integrity | Are math, warnings, limits, and claims clear and honest? | |
| 7. Verification | What tests prove it works, and how will we know it holds? | |
| 8. Boundaries | Does it conflict with what Gravity explicitly rejects? | |
| 9. Alternatives | Is a simpler or safer path available? | |
| 10. Decision | Approve, revise, defer, or reject, with reason and accountable sign-off. | |
| 11. Customer evidence | Which real customers or restaurant users tested realistic tasks; what did they find and what remains unresolved? | |
| 12. Learning loop | Can customers easily report problems and suggestions, and can we acknowledge, classify, act, and follow up? | |

## Customer-assisted improvement — a required part of Gravity

**The customer is not an obstacle to a perfect release; the customer is a partner in making Gravity better.** We cannot fully learn how tools perform in the variety of real restaurants without actual owners, managers, and employees using them and telling us where they fail or confuse people.

The standard is **responsible readiness, not an unrealistic guarantee of perfection**:

- **Internal test:** Complete fundamental functional, calculations, data-integrity, and privacy checks before any external trial.
- **Invited/public beta:** May contain clearly documented noncritical defects and incomplete refinements. Tell customers what is being tested, what may be unreliable, how their data is handled, and how to send feedback. Never mislabel a beta as fully validated.
- **General release:** Require demonstrated reliability of key workflows, clear instructions, appropriate privacy/security protections, a correction/rollback path, and recorded customer testing for the product's core tasks. Minor imperfections can remain if disclosed or tracked and do not defeat its purpose.
- **Do not release:** Known data-loss, unsafe calculations or recommendations, serious access-control/privacy failures, legally dangerous instructions, or defects that defeat the tool's primary purpose. Customer testing must not be used as a substitute for basic safety and integrity work.

**Customer feedback cycle:** INVITE → OBSERVE → RECORD → TRIAGE → INVESTIGATE → CORRECT → RETEST WITH CUSTOMER → VERIFY → DOCUMENT → IMPROVE.

Use Gravity's existing **Testing Room** (`/testing-room`) for opt-in feedback where it is available, and offer a contact route if the Testing Room itself fails. The review owner must check the manager-side inbox, acknowledge useful reports, classify severity and reproducibility, assign ownership, protect personal information, and record follow-up. Avoid soliciting confidential employee/payroll data or customer personal data in public reports. Do not claim customers' tests passed unless they actually occurred.

**Customer review measures** may include successful completion of key workflows, confusing steps, repeated defects, fix verification, accessibility issues, and whether the change made day-to-day work easier. Do not treat popularity, praise, or raw message counts as proof of product quality. Customers should be free to report criticism without pressure.

**Accountability:** Gravity remains responsible for verifying and repairing its products. A customer does not assume responsibility for the correctness, security, or safety of a beta merely by providing feedback.

### Mandatory special checks
- **Labor / inventory:** No unannounced default burden assumption; distinguish inventory variance from theft; protect the manager's control over decisions.
- **Employee learning / Gravity Signals:** Manager-only access controls, appropriate employee privacy, and no automatic punitive conclusion from viewing patterns.
- **AI / automation:** Human review for material decisions; identify uncertain outputs; avoid fabricated precision or claims of guaranteed outcomes.
- **Access / pricing:** Each tool provides standalone value; no manipulative lock-in; clearly communicate conditions.
- **Publication:** Distinguish official Gravity guidance from independently authored views; verify sources and claims.
- **Website / migration:** Confirm correct domain, site ID, preserved data, rollback path, critical routes and links; do not overwrite Thomas Monroe Books when deploying Gravity.

### Decision
**Disposition:** APPROVE / APPROVE WITH CONDITIONS / REVISE / DEFER / REJECT  
**Reason and outstanding conditions:**  
**Accountable reviewer and approval date:**  
**Evidence of verification after release:**  
**Follow-up owner / due date:**  
**Customer feedback reviewed (date, channel, findings):**  
**Open customer-reported issues and severity:**  
**Customer retest and disposition:**  

## Non-negotiables
- A checklist is not proof: attach actual test evidence and articulate remaining uncertainty.
- A product need not be flawless to be useful, but its release stage and known limitations must be honest, with an operational feedback and correction path.
- Customers' real-world reviews are integral to improving Gravity, but cannot waive hard safety, privacy, financial integrity, or data-preservation requirements.
- Failing a charter gate is not cured by a green build, popularity, or potential revenue.
- Specialized security, legal, employment, or financial review remains separately necessary where applicable.
- A Charter Review does **not** amend the charter. Charter changes require the separate founder/successor approval and change record specified in Section XIV.
- This form supports human governance; **no automated PASS is equivalent to accountable human approval**.

## Charter custody
Keep the complete signed or founder-approved current charter and superseded versions in an access-controlled location with backups. The public GitHub repository is not a private archive. Do not publish the full internal charter there merely to make this checklist available. If its full text is made public, do so as an explicit publication decision.
