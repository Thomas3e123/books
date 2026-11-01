# Gravity Employee Handbook Creator — Foundation

Status: architecture and starter interview data only. Not a functioning website or Windows application. Not deployed.

## Agreed workflow
1. Collect business identity, state, city and all operating jurisdictions.
2. Guide owner sequentially through a comprehensive restaurant-policy interview. Conditional questions follow relevant answers.
3. Save each answer using stable question IDs. Never infer missing owner decisions.
4. Draft completed sections for preview, clearly distinguishing approved text from sections needing reconciliation.
5. Permit reopening completed sections, preserve change history and mark dependent sections pending.
6. Run final deterministic validations and AI-assisted cross-policy review after the interview; present proposed changes for owner approval, never silently alter policy.
7. Publish versioned approved handbook and acknowledgment forms.

## Storage and portability
Use one versioned .gravityhandbook JSON project schema across website and Windows. Website should use IndexedDB and explicit backup import/export; Windows should use local Save As / Open and recovery snapshots. Neither is implemented yet.

## Exports
Planned: DOCX, PDF, HTML, EPUB, RTF, ODT, TXT, MD, plus ZIP bundle. Export engines not implemented.

## Legal integrity
The interview must identify location and relevant workforce factors. Legal requirements need maintained authoritative sources, effective dates and human review. No guarantee of legal compliance.

## Implementation boundaries
This starter schema and dependency map are illustrative, not a complete question library or verified legal guidance. Do not expose as a completed product.
