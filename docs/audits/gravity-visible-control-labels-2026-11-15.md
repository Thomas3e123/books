# Gravity visible-control labeling repair — 2026-11-15

A static accessibility pass over 154 site HTML pages found five visible controls without an accessible name: the Testing Room manager key, two tester filters, the manager reply box, and group message box. The SOP Foundry Import / Export paste box also relied on placeholder text alone.

Added descriptive `aria-label` values to all six controls across three pages. The labels do not change visual layout. Refreshed the three source-manifest hashes.

A follow-up source scan found no missing `alt` attributes on images and no `target="_blank"` links lacking `rel="noopener"`. This is a source-level check; no screen reader or browser accessibility run was performed.
