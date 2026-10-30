# Gravity live critical-path browser QA — 2026-10-30

All navigation was against the real Gravity production hostname in Chrome, using read-only paths and no test registrations or submissions. External third-party calls were disabled for repeatability. This does not prove database persistence or actual delivery of email/voice.

| Metric | Result |
| --- | ---: |
| Pages chosen | 18 |
| Desktop and mobile checks planned | 36 |
| HTTP 200 pages inspected | 36 |
| Critical failures | 0 |
| Warnings | 0 |
| Founder shortcut | 2-tap shortcut opens protected key form |

## Critical issues

None recorded.

## Warnings requiring interpretation

None recorded.

## Route inventory

| Route | Device | Status | Buttons | Links | JS exceptions |
| --- | --- | ---: | ---: | ---: | ---: |
| /gravity-report | 1366px desktop | 200 | 14 | 85 | 0 |
| /start-here | 1366px desktop | 200 | 13 | 62 | 0 |
| / | 1366px desktop | 200 | 14 | 79 | 0 |
| /register | 1366px desktop | 200 | 17 | 47 | 0 |
| /book-reader | 1366px desktop | 200 | 24 | 35 | 0 |
| /windows-programs | 1366px desktop | 200 | 3 | 80 | 0 |
| /gravity-report/why-do-my-restaurant-managers-keep-making-excuses | 1366px desktop | 200 | 13 | 48 | 0 |
| /gravity-assist | 1366px desktop | 200 | 30 | 71 | 0 |
| /gravity-inventory-center | 1366px desktop | 200 | 23 | 83 | 0 |
| /gravity-sop-foundry | 1366px desktop | 200 | 23 | 86 | 0 |
| /gravity-shift-lab | 1366px desktop | 200 | 120 | 81 | 0 |
| /knowledge-center | 1366px desktop | 200 | 18 | 111 | 0 |
| /gravity-work-study-lab | 1366px desktop | 200 | 43 | 73 | 0 |
| /restaurant-management-forms-checklists | 1366px desktop | 200 | 16 | 69 | 0 |
| /testing-room | 1366px desktop | 200 | 21 | 31 | 0 |
| /testing-room-manager | 1366px desktop | 200 | 5 | 12 | 0 |
| /apps/sop-foundry/access | 1366px desktop | 200 | 3 | 12 | 0 |
| /apps/inventory-center/index | 1366px desktop | 200 | 54 | 23 | 0 |
| /start-here | 390px mobile | 200 | 13 | 62 | 0 |
| / | 390px mobile | 200 | 14 | 79 | 0 |
| /gravity-report | 390px mobile | 200 | 14 | 85 | 0 |
| /book-reader | 390px mobile | 200 | 24 | 35 | 0 |
| /register | 390px mobile | 200 | 17 | 47 | 0 |
| /gravity-report/why-do-my-restaurant-managers-keep-making-excuses | 390px mobile | 200 | 13 | 48 | 0 |
| /windows-programs | 390px mobile | 200 | 3 | 80 | 0 |
| /gravity-assist | 390px mobile | 200 | 30 | 71 | 0 |
| /gravity-sop-foundry | 390px mobile | 200 | 23 | 86 | 0 |
| /gravity-shift-lab | 390px mobile | 200 | 120 | 81 | 0 |
| /gravity-inventory-center | 390px mobile | 200 | 23 | 83 | 0 |
| /gravity-work-study-lab | 390px mobile | 200 | 43 | 73 | 0 |
| /knowledge-center | 390px mobile | 200 | 18 | 111 | 0 |
| /restaurant-management-forms-checklists | 390px mobile | 200 | 16 | 69 | 0 |
| /testing-room | 390px mobile | 200 | 21 | 31 | 0 |
| /testing-room-manager | 390px mobile | 200 | 5 | 12 | 0 |
| /apps/sop-foundry/access | 390px mobile | 200 | 3 | 12 | 0 |
| /apps/inventory-center/index | 390px mobile | 200 | 54 | 23 | 0 |

## Limitations

No private account was created, existing user data was not altered, and manager authentication was not bypassed. Tool save/persist workflows, mobile PDF rendering, real email and voice delivery require separate authenticated end-to-end QA.
