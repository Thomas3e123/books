# Cover page and logo upload — implementation contract

## Customer workflow
1. During the Business Identity section, ask for company name and optional logo upload.
2. Accept PNG, JPG/JPEG, and WebP. Offer a simple image preview, replacement, removal, and optional crop/fit adjustment.
3. Do not require a logo: a premium typography-only cover is the fallback.
4. Show the finished cover in the full-color progressive handbook preview after the first section, then retain it in all subsequent previews.
5. Use company name prominently; optional subtitle "Employee Handbook", effective date, and optional location.
6. Allow owner to edit company name and replace logo later without redoing the interview.

## Data and security
- Validate file type by decoded content, not just extension. Enforce size and dimension limits; reject SVG or executable formats.
- Resize/re-encode to a safe raster format. Strip metadata. Preserve aspect ratio; never stretch or crop without user choice.
- Embed the sanitized logo in the versioned .gravityhandbook project so it survives save, reopen, backup, and transfer between Windows and web.
- Keep project data private and local by default; any cloud upload must require clear consent.

## Output
- Full-color preview always displays the logo in color.
- Color PDF/print uses color logo; B&W PDF/print converts logo to grayscale with sufficient contrast.
- Include logo on cover only by default; optional small header mark if selected.
- Print cover should be elegant but ink-conscious; no mandatory full-page solid backgrounds.
- Copy, print, and export remain payment-locked; full cover preview remains visible before payment.
- Do not claim all image assets are DRM-proof once displayed.

## Tests
- Upload PNG, JPG, WebP; replace, remove; invalid file rejected.
- Logo persists across saved project and re-open.
- Tall, wide, square, transparent logos all fit without distortion.
- Cover shows correct name and logo after each section.
- Color preview remains color when B&W print is chosen.
- Grayscale print output retains logo legibility.

Status: specification only; upload UI and cover renderer not yet implemented.
