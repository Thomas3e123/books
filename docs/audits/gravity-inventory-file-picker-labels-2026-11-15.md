# Gravity Inventory Center file-picker labels — November 15, 2026

A source accessibility sweep found two hidden file inputs in Inventory Center without accessible names: the JSON backup restore picker and CSV item import picker. Added explicit `aria-label` text to identify each purpose to assistive technology. The visible buttons and file handling remain unchanged.

Updated the Inventory Center HTML hash in `source-manifest.json`. This source repair is not deployed. No browser or screen-reader verification was performed.
