# Gravity operating tools and persistence QA — October 30, 2026

Test scope: real Gravity production pages in fresh isolated headless Chrome contexts; deliberately synthetic browser-local data only. No live customer records, tester submissions, emails, charges, paid speech requests or Netlify database mutations.

| Test | Result | Evidence |
| --- | --- | --- |
| Shift Lab — Create synthetic employee, save schedule and survive reload | PASS | Browser-local data retained on reload; employee, wage, weekly sales, Monday shift verified; no server writes. |
| Inventory Center — Create synthetic location and item, verify value and reload | PASS | Synthetic profile, location, item, count and $25 valuation persisted after reload; browser-only, no customer data. |
| Gravity Reader — Registration gate and synthetic registered book loading | FAIL | Registered book catalog is not populated |
| Service endpoints — Read-only TTS health and protected manager endpoint | PASS | Voice configuration healthy and Cedar offered; anonymous manager data denied (401). No paid audio synthesis or sign-in performed. |
| Downloads — Read-only check for five PDFs and a Windows manual | PASS | Five genuine PDF files and current Shift Lab Windows manual delivered successfully. Windows executable not launched. |

## Coverage limitations

The in-browser Founding Year registration marker is simulated for Reader UI testing; it is not proof of the real registration or delivery process.
Inventory and Shift Lab persistence are local to one browser/device. A successful reload does not establish cloud backup, cross-device synchronization or customer account recovery.
Voice health GET proves configuration only, not audible synthesis latency, quality, or mobile microphone permissions.
Windows ZIP installation and remote updates require an actual Windows virtual machine and are not tested by Chrome.
Email form delivery and authenticated back-end persistent records require separate tests with an isolated test account or staging database.

Critical failures: 1.
