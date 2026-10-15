GRAVITY WORK STUDY LAB — WINDOWS BETA
Thomas Monroe Books

PURPOSE
Gravity Work Study Lab is a standalone restaurant work-study system. It is designed to remain useful even when no other Gravity program is installed.

CURRENT BETA CAPABILITIES
- Guided and Quick Study entry paths
- Guided, Assisted, Independent, and Passive Gravity modes
- Problem vs suspected-cause separation
- Demand source and raw-value calculation
- Observed role / optional employee context
- Study-method recommendation and override
- Explicit process boundaries
- Editable work elements
- Quality and safety guardrails
- Live observation timing for work, walking, waiting, searching, replenishment, rework, required waiting, and delay
- Completed-unit capture and measured throughput comparison
- Abnormal event notes
- Facts-before-conclusions results
- Manager conclusion stored separately from Gravity conclusion
- Mandatory Gravity Results Review
- Management decision
- Automatic SOP contribution draft
- Local study history
- JSON import/export
- PDF and Windows printing

LOCAL DATA
Study data is stored in the application's Windows user-data folder. Use the Home screen's Open Local Data Folder button to locate it.

DATA PRINCIPLES
Raw measured evidence is preserved. Gravity conclusions and management decisions are stored separately. SOP contributions remain traceable to their source study. A measured sample meeting demand is not automatically treated as a permanent verified standard; additional representative verification remains required. Demand evidence remains preliminary until its representativeness and conditions have been reviewed; a fixed count alone does not make evidence strong.

CURRENT LIMITATIONS
- This is a beta build.
- Ask Gravity is rule-based/offline in this first standalone build; full contextual AI actions are a later integration layer.
- Advanced Continuous Gravitation comparisons, role-restricted leadership development views, glossary, movement map, and multi-person workload analysis are not complete yet.
- The beta is not digitally code-signed and may produce a Windows SmartScreen warning.
- The first beta build currently uses the default Electron application icon; Gravity-specific Windows icon packaging remains a branding polish item.

BUILD
Run BUILD_WINDOWS.cmd on a Windows computer with Node.js 22 or later.
The builder installs the pinned Electron/electron-builder versions and produces installer/ZIP output in dist.

THE CODE
All future features must preserve the core rule: Gravity records, calculates, organizes, verifies, connects, preserves, and presents proven knowledge while keeping the simple study path simple.

PRE-BETA QA
Final source validation pass 2 applied before this rebuild.
