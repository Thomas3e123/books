# Gravity Inventory Center — reproducible Windows candidate

This build copies the **current Inventory Center web business logic and validation** from `site/apps/inventory-center` into a local Electron Windows application. Do not claim feature parity with the original published October 12 Windows ZIP: its independent desktop source is not available in this repository.

Build: `npm install && npm run build:win`.

Only desktop-specific interfaces differ: local data is stored under Electron's computer-specific application profile, and JSON/CSV backup/import uses native Windows file dialogs. Use **Create Backup** regularly. No automatic migration of data from the older beta is assumed.

The candidate is not public. GitHub CI must complete actual Windows runtime checks, an NSIS installation smoke and native PDF generation. A customer must also verify a physical printer, barcode scanning, backup recovery and normal Windows installation before promoting it. Old beta links remain untouched.
