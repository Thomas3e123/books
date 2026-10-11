# Thomas Monroe Books / Gravity repository

Prepared October 11, 2026 for `thomas3e123/books`.

This is a recovered website baseline for the existing Thomas Monroe Books Netlify project. It is NOT the unfinished three-application Windows Beta release. It does not add the proposed Windows Beta downloads or the unpublished Overview v1.9.

## Contents

- `site/`: public website, tools, images, books, and downloadable resources.
- `functions/`: hosted employee connection, Gravity Guide, and Gravity TTS source.
- `netlify/`: saved database migration source.
- `netlify.toml`: build command, public folder, Node version, and functions folder.
- `package-lock.json`: pinned dependency installation.
- `source-manifest.json`: integrity record checked at every build.

The recovered base and V15.3/V15.4/V17/V18 patches were reconciled with public production content. All 230 text/code assets checked returned HTTP 200. Seventeen files were reconciled with production. Other HTML differences were whitespace surrounding Netlify's injected monitoring script. The injected script is not committed. Binary resources were recovered from saved packages; this is not a claim that every production binary was downloaded and compared.

## Put the source into GitHub

1. Extract this ZIP with Windows **Extract All**.
2. In GitHub Desktop, sign in to the account that owns `thomas3e123/books` and clone that empty repository onto your computer.
3. Copy the CONTENTS of this `Gravity_TMB` folder into the cloned `books` folder. `netlify.toml`, `package.json`, and `site` must be at the repository root. Do not copy the enclosing folder as an extra level, and do not upload the ZIP as the website.
4. In GitHub Desktop, review the changes, commit with a message such as `Import recovered Gravity website baseline`, then push to GitHub.
5. Send the repository URL back for the next verification step. Keep the existing Netlify site unlinked until the release and first-build plan are checked.

This package does not supply this chat with GitHub write access. Signing in on your computer authorizes GitHub Desktop on that computer.

## Netlify configuration for the later connection

Use the EXISTING project `thomasmonroebooks` (site ID `1548e212-4cfe-4751-ab81-f46936249304`). Do not create a replacement site or change the domain.

- Repository root/base: leave blank.
- Publish directory: `site`.
- Build command: `npm run build`.
- Functions directory: `functions` (configured in `netlify.toml`).
- Production branch: select the branch containing the reviewed source; check the actual branch name in GitHub.

Linking a repository can start a build and enable automatic publishing. The first Git build still needs an actual Netlify preview and verification before publishing it over the current site. Dashboard-installed plugins may run during Git builds, unlike earlier no-build CLI deployments. The 21YunBox, Chromium, and Emails plugins have not been removed or declared safe here; their installed settings and build behavior need review.

Keep existing Netlify server-side credentials, environment variables, and database provisioning in place. No credential belongs in this repository. The saved database migration is retained; no new schema changes are introduced here. `.netlify`, environment files, restaurant databases, and local backups are ignored by Git.

Once continuous deployment is active, a later push to the production branch can replace a manual deploy. Use a review branch and preview for future grouped updates.

## Local verification and future edits

Install Node.js 22 or newer. Run `npm ci`, then `npm run build` from this folder. The local build checks file integrity; it does not contact or modify the production database. Netlify bundles the three functions during deployment.

After intentionally editing and reviewing source, run `npm run manifest`, then `npm run build`, and commit the updated manifest with the changes. Do not regenerate the manifest merely to conceal an unexplained mismatch.

Automated recovery checks: syntax of inline scripts/structured data, local link targets, function packaging, eight mocked Guide/TTS checks, and eighteen isolated hosted-employee workflow checks. These do not substitute for a real Netlify preview, provider-backed speech tests, native Windows testing, or the unfinished Windows Beta release checks.
