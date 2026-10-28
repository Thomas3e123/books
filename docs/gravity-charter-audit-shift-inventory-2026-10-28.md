# Gravity Charter Review — Shift Lab and Inventory Center
**Initial assessment:** October 28, 2026  
**Charter:** Foundational Charter v1.1, customer-feedback operating review  
**Status:** Evidence inventory and testing plan — **not** a declaration of general-release readiness or full customer acceptance  
**Source:** `feature/gravity-migration-phase1-2026-10-22`  
**Scope:** Shift Lab and Inventory Center web applications; Windows versions must be reviewed independently.

## Verified in source / automated tests

**Shift Lab**
- `site/assets/js/gravity-labor-cost-engine.js` provides optional user-entered employer burden; blank is explicitly **not** automatically set to a fixed percentage.
- The engine separates hourly wages, hourly burden estimate, salary allocation, labor budget, and variance; illustrative hours require inputs and are explicitly limited as one blended-rate example.
- Main Shift Lab file includes manager pay-lock controls, saved schedule state, week selection, and publish/revision state in source.
- `scripts/test-gravity-labor-cost-engine.cjs` and `.github/workflows/gravity-labor-inventory-qa-2026-10-27.yml` provide programmatic checks.

**Inventory Center**
- `site/apps/inventory-center/assets/js/inventory-outflow-cost.js` categorizes waste, spill, spoilage, damage, and comp, with optional reason codes and logged historical unit-cost estimates.
- Code explicitly states outflow values are estimates **not** proof of theft or a definite cause.
- The validation helper and `scripts/test-gravity-inventory-outflow.cjs` are included in the non-deploy QA workflow.

**Review limitation:** Code presence, string assertions, and unit tests are useful evidence, not proof that a customer can successfully complete the workflow, recover data after a failure, or interpret results correctly. A previous QA run passed, but this record does not claim a new full-browser, customer, security, or Windows acceptance pass.

## Initial charter fit and open questions

| Charter theme | Initial evidence | Status |
|---|---|---|
| Truth before assumptions | Calculations use explicit inputs; inventory loss not labeled theft | Promising — real-case interpretation testing needed |
| Standards before accountability | Calculation descriptions and schedule states exist | Needs usability review by working managers |
| Verification before claims | Unit checks and page wiring checks exist | Automated partial coverage only |
| People and control | Shift Lab manager pay lock present in source | Privacy and access controls require manual/browser tests |
| Customer involvement | Existing `/testing-room` interface supports problem, confusing, worked-fine, idea reports | Need actual tester participation and feedback review; do not invent testers |
| Sustainable improvement | Revisions and record state are represented in code | Data preservation, failure recovery and corrections need real scenarios |

## Customer-assisted acceptance — Shift Lab

Ask consenting restaurant owners or managers to attempt these realistic tasks using **fictional or sanitized employee/pay data**:

1. Create a realistic week with salaried managers, hourly workers, varying wages, shifts and coverage requirements.
2. Enter a payroll burden of their own choosing; verify no fixed rate is silently assumed; check effect on labor budget.
3. Use salary-only / exclude choices and confirm their intent matches the projected cost.
4. Compare forecast against their independent hand calculation; record any rounding or interpretation confusion.
5. Save, close, reopen, revise and republish a week; verify the correct period and revision appears.
6. Test pay lock and employee-facing/export views so restricted costs do not appear.
7. Observe practical schedule constraints and overstaffing/understaffing warnings; investigate any misleading recommendations.
8. Ask whether the tool saved time, caused confusion, or created unnecessary work.

**Do not claim acceptance** until actual scenario results, customer feedback, corrected defects, and retest evidence are recorded.

## Customer-assisted acceptance — Inventory Center

Ask consenting owners or inventory managers to use **fictional or sanitized inventory and pricing data**:

1. Set up products and units with different costs and movement histories.
2. Post waste, spills, spoilage, damage, and comps; compare resulting outflow amounts with independent calculations.
3. Change a product price after an earlier movement; check that historical outflow keeps its proper cost basis.
4. Record a stock-count difference and see whether the interface avoids suggesting theft without supporting evidence.
5. Test correction of mistaken entries, duplicate inputs, unusual quantities, zero/blank values, and unit mismatches.
6. Save, reopen, export/backup and recover when possible; verify no silent loss or corruption.
7. Check whether a working manager understands what is known versus estimated, and what action to take next.
8. Ask whether the terminology and reports support real kitchen and receiving workflows.

## Defect and feedback handling

Use Gravity's existing `/testing-room` as the preferred opt-in channel when functioning. Provide a fallback via the website contact page. Accept constructive criticism. Track severity separately from how many people mention an issue.

- **Stop / block release:** Unsafe recommendation, incorrect core totals, loss or exposure of sensitive data, unrecoverable data corruption, broken primary workflow.
- **Correct before general release:** Confusing labor calculation basis, misleading losses/variance labels, inconsistent schedule save behavior, repeatable user-blocking issues.
- **Can be beta follow-up if disclosed:** Cosmetic polish, noncritical convenience features, minor instructions, optional reporting refinements.

For every issue record: version, steps, expected/observed result, affected data (sanitized), severity, owner, fix, test result, customer confirmation where possible, and closure date.

## Release assessment

**Current recommendation:** Continue controlled, clearly labeled beta evaluation after minimum safety and data-integrity testing. Do not declare perfect, fully customer-validated, or general release solely from automated checks. Bring in actual restaurant users as partners in improving the product.

**Next evidence required:** current completed automated QA against source, separate browser and Windows persistence/privacy tests, actual customer tests, priority defect list, recorded fixes and retests, owner release sign-off. No site or Windows production asset is deployed by this documentation-only audit.
