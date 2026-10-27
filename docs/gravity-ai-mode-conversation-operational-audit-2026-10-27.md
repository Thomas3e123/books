# Gravity external AI conversation — audit and useful implementation backlog
**Reviewed:** 2026-10-27. **Source:** user-provided Google AI Mode conversation (535 lines). **Working branch:** `feature/gravity-migration-phase1-2026-10-22`. **Status:** research / product QA backlog — **not published, no settings or existing customer data changed**.

## Executive finding
Google AI Mode consistently recognized Gravity's intended **education → tools → recorded evidence → repeatable decisions → verification** architecture, with a pressure-point-first implementation and explicit manager follow-through. This is useful positioning feedback, **not evidence of independent performance**. Its directions contain erroneous domains, invented or unverified implementation details, unsafe cause attribution, and erroneous/incomplete financial assumptions. Preserve the full user-provided conversation separately; **do not republish it wholesale** or paste its embedded private Gmail URLs into public site or repository. This document intentionally summarizes findings only.

## External observations worth adopting (conceptual, not proof)
1. Position Gravity as the connection between managers' thinking and daily operating controls. Use selective attributed quotations and explicitly say Google's *AI-generated answer* is not an official endorsement or tested success claim.
2. Show a concrete "single pressure point" path: problem → first records → one baseline → accountable owner → correction → measured follow-up. Offer managers direct links to published Food Cost/Inventory, Labor/Workforce, Shift Lab, Inventory Center, and Work Study Lab.
3. Make cost-control onboarding explain the difference between a **form used to record an event** and a **control process that interprets results**. Neither waste entry nor an apparently good labor percentage guarantees an improvement.
4. Build sample worksheets/checklists using **fully labeled assumptions and correct calculations**, and test these against actual released features before publishing. Do not confuse proposals with current program capabilities.

## Important corrections to Google's claims
- **Domain:** `thegravitysystem.com` is **not** the verified canonical new Gravity domain. Use `https://gravityleadershipsystem.com/`. Google's directions to "Operator Atlas" are unsupported by this conversation's available Gravity routes. Do not refer customers to nonexistent labels.
- **Success estimates:** "Highly likely", "guaranteed", "90% manual work reduction", "immediate exact cause" are unevidenced. Do not repeat them in marketing/training.
- **Workbook formats:** AI Mode calls workbooks "macro-enabled". It did not inspect the actual workbook files; **macro support is unverified** and cannot be inferred from XLSX. Never promise macros without verifying actual formats/code.
- **Cause versus symptom:** A waste reason code or inventory variance establishes an observation, **not theft, individual fault, purchasing culpability or cause**. Spoilage, drops, preparation errors and incorrect orders can have several underlying causes. Investigate using evidence; never programmatically assign blame ("Chargeable to the Prep Lead", "Chargeable to FOH", etc.).
- **Inventory theory:** Purchase/count reconciliation and theoretical usage require consistent units, correct recipes/mix, beginning inventory, receipts/purchases, transfers, credits, inventory cutoffs, and physical counts. Theft is only one possible hypothesis. Yield-adjusted cost is valid only for an appropriately defined usable-output unit; avoid double-applying yield to counts already measured in usable units.
- **Waste handling:** Record quantity, UOM, item, reason, cost basis, extended cost, timestamp, reporter and reviewer, with corrective follow-up. Prompt recording is useful, but emergency food safety/disposal takes precedence over a clipboard. Keep logs hygienically located; use an accessible digital or printable format. Separate training/behavior feedback from accusations.
- **Labor budget:** AI Mode's `35,000 × 30% / 15 = 700 hours` incorrectly treats *a total labor target with employer payroll burden* as if it were available exclusively to base hourly pay. Use a consistent sales basis (define net sales/exclusions), deduct appropriate salaried manager and other fixed costs **once**, account for taxes/benefits if included in target definition, overtime premiums, paid breaks, tip-credit laws/positions if relevant, and actual wage mix. `($35,000 × .30 - $2,000) / ($15 × 1.15) ≈ 492.75` is **illustrative only**, not a universal or safe "exact cap". A manager may need service-driven minimum coverage greater than a target; surface the conflict rather than quietly understaff.
- **BOH vs FOH allocation:** Google's 55/45 hours, subsequent model's 60/40 steakhouse, 40/60 QSR and 75/25 buffet **dollar shares** are generic unsourced rules, not restaurant-specific operating standards. Do not hard-code into Gravity. Different pay structures mean hours and dollars cannot be interchanged.
- **Scheduling:** An 8.5-hour shift is NOT a safe universal overtime cutoff. Week-total overtime and applicable jurisdiction/agreements matter; the claimed "zero automatic daily overtime" is not proven. The six-person demo's `46.5 paid hours` is arithmetically consistent (5×8 + 6.5), but pay/break assumptions, dishroom evening coverage, station responsibilities and opening/closing overlap require operational review. The claimed 45–60 minute pre-peak setup buffer is an example, not a universal policy.
- **Staffing costs:** Do not assume every manager is hourly or salary belongs in the same target. Base rates must be kept privacy-protected; explicitly warn when hours/cost calculations omit relevant components.
- **Ethics & implementation:** Assign processes to managers; do not charge all losses to employees. Managers should respond to honest reporting as learning opportunities, while retaining fair misconduct/safety procedures.

## Code-verified current web implementation (migration branch, 2026-10-27)
**Shift Lab:** `site/assets/js/gravity-shift-lab.js` and `site/assets/js/gravity-shift-first-schedule-tour-v1.js`
- Pay rates are entered for employees. In `recalc()`, estimated wages are computed with **straight-time up to 40 hours and 1.5× for hours above 40 in the selected week**. This is a simplified scheduling estimate; it does not demonstrate applicable local overtime compliance.
- Profile already includes `managementLaborMode` ("include"/"exclude") and protected `managerSalaryAllocation`. **Do not reinvent salaried management support or assume it is missing.** Need test combinations and default double-count risks.
- `recalc()` compares estimated payroll dollars to forecast sales and warns when percentage exceeds target. There was **no employer taxes/benefits burden multiplier evident in reviewed calculation or profile fields**, and no documented auto-calculated "fully burdened allowable-hour pool". The product's tour explicitly warns the estimate does **not** equal actual payroll/taxes/benefits.
- Weekly `shiftHours()` computes end-start for one continuous entry. Test whether entered schedules subtract unpaid breaks at all, and validate overnight/off-marker rules; do not claim break compliance.
- Follow-up test matrix: 0/positive wages; salaried manager inclusion/exclusion; 40/41+ hours; split departments; gross/net sales definition; non-wage costs; paid vs unpaid breaks; missing forecasts; wage privacy; safe migration of saved records.

**Inventory Center:** `site/apps/inventory-center/index.html` and `site/apps/inventory-center/assets/js/inventory-center.js`
- Supports item/location masters, cost/unit tracking, receipts, transfers, waste-type stock reductions, physical counts, variances and reason/reference text; posted movement history stores `qty` and `unitCost`.
- Reviewed movement handler **requires a free-text reason/reference**, rather than an enforced coded waste taxonomy. Existing history displays per-unit cost; **verify/possibly add extended waste value = qty × appropriate item unit cost** and consistent reason groups for reporting. Preserve real posted history and units (count vs usable yield).
- Test log completeness, cost-at-event snapshots, UOM conversions, frozen/post-approval records, vendor defects separated from prep/cook waste, and usable vs raw yield inputs.

**Gravity Numbers Lab and Work Study Lab:** Current page shows generic waste/portion/yield arithmetic in Numbers Lab, and a **separate** Work Study Lab tool. Do not imply Work Study is built into the scheduling workbook; do not add Work Study calculations to Shift Lab without cross-system design review.

**Existing public educational guide:** `site/restaurant-inventory-waste-control.html` already correctly urges investigation of variances rather than assumptions of theft; preserve this language.

## Prioritized backlog, with acceptance criteria
### P1 — Labor-cost definition and engine correctness, before presenting a numeric "allowable hours" target
- Audit Shift Lab, desktop Windows build and Labor & Workforce downloadable Excel workbook **separately**. Confirm what each actually computes.
- Define `scheduled base wage cost`, `projected premium/overtime cost`, `salaried allocation`, `estimated burden` (optional configurable by restaurant), and `total estimated cost`, including whether employer benefits are represented.
- Keep current profiles and data compatible; ensure managers can opt for **base-wage-only view** without mistaking it for a fully burdened target.
- Avoid dual-counting salaried management or payroll burden already baked into an entered wage/target. Explain target sales basis and when estimates are incomplete. Add worked examples and edge-case tests. **Do not implement unreviewed percentage constants**.
- Confirm scheduling/manager wage privacy, break representation, weekly hour warnings, local legal caveats, service minimums, split shift practicality. Retest web and Windows separately.

### P1 — Waste accounting, reason taxonomy, and non-punitive controls
- Audit Inventory Center, Food Cost & Inventory operating-system workbook, and SOP/recipe interfaces for existing actual workflows. Prepare a printable/mobile Daily Waste Log with quantity/UOM, reason (generic selectable + note), unit cost and extended value, responsible manager review, and follow-up. Make reason reporting **non-accusatory** and distinguish vendor/receiving discrepancies.
- Validate cost snapshots, fractional/mixed units, yield handling, reason→aggregated reports, and existing-history compatibility. Avoid hard blocking disposal of potentially unsafe food.

### P2 — Site clarity and guided use
- Check all website buttons, article references, FAQ and Ask Gravity answers for correct canonical domain, actual navigation and feature claims. No false claims of guaranteed food waste savings, "90%" development reduction, true cause detection, automatic POS sync, or macro-enabled workbook where unverified.
- Add a practical downloadable example cost review only after the worked math and program calculations are tested.
- Keep Google AI attribution balanced and disclose independent field outcomes are **not yet available**; do not convert generated estimates to testimonials.

## Publication safety
This is a **review record**, not an authorization to deploy or modify payroll logic, Netlify, DNS, registrations, or any customer records. Keep original Thomas Monroe Books untouched; preserve current Gravity **noindex** posture until separate public launch approval. QA and migration candidate changes stay on `feature/gravity-migration-phase1-2026-10-22`.
