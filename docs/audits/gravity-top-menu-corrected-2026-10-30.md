# Gravity menu corrective QA — 2026-10-30

This test used real headless Chrome against every top-level Gravity HTML page in a local HTTP serving of the isolated production source, plus eight low-volume smoke checks against the actual published host. App subpages, manuals and manager-only pages were inventoried separately.

| Measure | Result |
| --- | ---: |
| Root HTML files | 122 |
| Standard public-header pages | 121 |
| Regular full top menus | 117 |
| Focused workspaces with separate Site Menu | 4 |
| Nonstandard root documents | 1 |
| Planned desktop/mobile checks | 242 |
| Completed browser checks | 242 |
| Mobile menus opened successfully | 121 |
| Local menu problems | 0 |

## Problems

No problems identified in local production-source browser checks.

## Live published-host sampling

- /: HTTP 200; {"links":17,"opens":true,"systems":true}
- /gravity-report: HTTP 200; {"links":17,"opens":true,"systems":true}
- /gravity-report/why-do-my-restaurant-managers-keep-making-excuses: HTTP 200; {"links":17,"opens":true,"systems":true}
- /gravity-report-guests: HTTP 200; {"links":17,"opens":true,"systems":true}
- /windows-programs: HTTP 200; {"links":17,"opens":true,"systems":true}
- /gravity-shift-lab: HTTP 200; {"links":11,"opens":true}
- /apps/sop-foundry/access: HTTP 200; {"links":11,"opens":true}
- /apps/inventory-center/index: HTTP 200; {"links":11,"opens":true}

## Scope exclusions

Custom SOP Foundry employee/manager rooms and downloadable manuals retain their own navigation. Their lack of a full public top menu is intentional; the public header is not imposed inside workrooms.
Manager-only root document(s): testing-room-manager.html.

No files on the Thomas Monroe Books site are modified by this audit.
