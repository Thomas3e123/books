GRAVITY WORK STUDY LAB — WINDOWS BETA
Thomas Monroe Books
Version 0.2.0-beta.1

PURPOSE
Gravity Work Study Lab is a standalone restaurant work-study system. This Windows beta now packages the same controlled Work Study expert source used by thomasmonroebooks.com, synchronized at build time through Gravity Expert Triage v61.

CURRENT BETA CAPABILITIES
- Guided, Assisted, Independent, and Passive Gravity modes
- First-time-manager guided study flow
- Problem vs suspected-cause separation
- Demand evidence and representative-demand checks
- Explicit process boundaries and editable work elements
- Quality and safety guardrails
- Live timing with active-segment evidence protection
- Natural-language Clock Control and Hybrid timing
- Production-safe multi-run studies
- Recipe/process observation maps
- Parallel machine/process clocks and labor occupancy
- Run comparability and unit-aware normalization
- Standard-minute validity and fixed/variable batch scaling
- Baseline provenance and revalidation holds
- Staffing allowance controls with no invented universal allowance
- Observer agreement and boundary calibration
- Proficiency and learning-curve representativeness
- Observation-effect review
- Statistical precision and Work Sampling treatment
- Demand/product-mix coverage
- Shared setup/cleanup allocation
- Crew labor accounting
- Yield/waste and incomplete-cycle protection
- Queue/recovery analysis
- Short-element measurement adequacy
- Shift-position and operating-context representativeness
- Sequence-dependent changeovers
- Ergonomic / physical-demand screening
- Sustainable-pace validation
- Gravity Expert Triage v61: identifies the highest-value unresolved issue next
- Complete .gravity-study.json evidence packages with expert sidecars
- Premium gold-trimmed Gravity visual package
- PDF / Windows printing support from the Electron shell

ONE GRAVITY BRAIN
The Windows build does not maintain a separate copy of Gravity's expert reasoning. Before packaging, sync-expert-stack.cjs reads the controlled website Work Study installer, copies the same expert JavaScript and CSS into the Windows package, and fails the build if required layers through v61 are missing.

LOCAL DATA
The expert engine is local-first and runs inside Electron using the same browser-storage study model as the website. Complete evidence packages can be exported/imported for portability.

DOCX / WRITTEN PROCESS FILES
TXT, MD, CSV, and pasted directions are handled locally. DOCX text extraction uses the Thomas Monroe Books hosted process-file reader and therefore requires internet access for that specific action.

CURRENT LIMITATIONS
- This is a beta build.
- Automatic hosted cross-device synchronization is not yet implemented.
- The beta is not digitally code-signed and Windows SmartScreen may warn during installation.
- The Windows package currently uses the default Electron application icon.

BUILD
Run BUILD_WINDOWS.cmd on a Windows computer with Node.js 22 or later.
The builder installs dependencies, synchronizes and verifies the full expert stack, then produces installer/ZIP output in dist.

THE CODE
Gravity records, calculates, organizes, verifies, connects, preserves, and presents proven knowledge while keeping measured evidence separate from interpretation. Quality and safety remain above speed.
