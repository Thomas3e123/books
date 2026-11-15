# Gravity article metadata build guard — November 15, 2026

The page-level metadata audit found five additional Article records with missing or stale headline/description fields. Their Article metadata now matches each page's visible H1 and meta description.

The Gravity production builder now rejects an Article record when:

- its `mainEntityOfPage` or Open Graph share URL does not match the page's canonical URL;
- its description is empty or differs from the page description; or
- its headline no longer matches the visible H1 text (allowing a longer schema headline that begins with the H1).

A source-level review compared all 48 Article objects against their page canonical URL, H1, and description: zero mismatches remain. The changed builder file passed Node's syntax check. The production build and deployment were not run.
