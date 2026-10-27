# The Gravity Report — Email launch workroom
**Prepared:** October 27, 2026. **Status:** Editorial and newsletter drafts ready; **no emails sent; no automated list delivery configured.**
**Brand:** The Gravity Report · The Gravity Restaurant Leadership System · Publisher Thomas Monroe Books · By Thomas Butler.

## Verified state
- **Proposed new sender and reply-to:** `The Gravity Report <thomas.butler@gravityleadershipsystem.com>`. Google Workspace mailbox exists, but the currently connected Gmail account available to the assistant is `thomas3e@gmail.com`, **not the new Workspace mailbox**; do not send any Report email from the personal account or imply Workspace sending has been tested.
- **Subscriber capture:** Netlify project's existing `gravity-report-opt-in` form is active with **one submission** as of this audit. It includes a required explicit `newsletter-consent=yes` checkbox, Netlify honeypot and a request-received thank-you page. A captured submission is **not proof** of double-opt-in or an active newsletter subscription. Confirm actual consent details and email ownership before adding someone to a sending list.
- **Editorial inventory:** 30 issues prepared. Five original issues published October 20; issue 6 scheduled Tuesday October 27, 2026 at 09:00 America/Chicago, issue 7 Friday October 30 at 09:00. Remaining issues publish Tuesdays and Fridays.
- **Weekly email cadence proposed:** one Saturday morning recap containing the **two articles actually published during the previous week**; the website releases articles twice weekly. First email may be prepared for Saturday October 31 **only if** sending infrastructure, permissions, and QA are complete. Do not send earlier than the Friday article's scheduled release.
- **No newsletter email sending integration is currently configured in Netlify's inspected site-level environment variables.** Netlify Forms saves submissions, but does not automatically email an editorial newsletter to subscribers.
- **Existing original TMB site, customer forms, and Gravity main site must not be changed as part of email setup without separately reviewed release approval.**

## DNS deliverability preflight
Workflow `40455225740`, script `scripts/audit-gravity-report-email-dns.cjs`, verified via public DNS read-only:
- Google Workspace MX `smtp.google.com`: present.
- One apex SPF record: present and includes `include:_spf.google.com`.
- Google Workspace DKIM public key at `google._domainkey.gravityleadershipsystem.com`: present.
- **DMARC at `_dmarc.gravityleadershipsystem.com`: missing — address before starting newsletter distribution.**
- Suggested initial monitoring policy (proposal only, **NOT applied**): TXT **name** `_dmarc`, **value** `v=DMARC1; p=none; pct=100`. Confirm in Google Admin and with the actual email marketing provider before applying; ideally configure a secure aggregate-report destination when available.
- If MailerLite issues sender-domain DKIM/SPF verification records, use **only its actual displayed unique values**. Do not overwrite the existing Google DKIM key, MX, or create a second SPF record: **merge/maintain a single SPF TXT** following provider recommendations. Do not change `@` A or `www` CNAME.

## Recommended delivery design
A dedicated consent-based email service is recommended rather than scripting sends from the Workspace mailbox: it provides subscriber confirmations, segmentation, suppression lists, unsubscribe links and delivery analytics. MailerLite is one option. Its **June 2026** free plan permits up to **250 active subscribers and 2,500 monthly messages**, subject to provider approval/conditions. This is enough for an early pilot and is separate from Google Workspace billing. Source: https://www.mailerlite.com/help/free-plan-update-faq
- Set sender/display name to `The Gravity Report`, sender/reply-to `thomas.butler@gravityleadershipsystem.com`.
- Verify sending address ownership by signing into **that** Google Workspace mailbox and confirming the provider's sender verification email.
- Authenticate the domain per the provider's actual DNS records; maintain Workspace SPF/DKIM/MX.
- Create a clearly named list or group: `Gravity Report — Email Updates` and enable **double opt-in** / confirmation.
- Configure a verifiable physical mailing address and unsubscribes; sending without these should remain blocked.
- Integrate the existing Netlify form only once a secure subscriber-sync path is defined (direct hosted subscription form, approved webhook/function, or opt-in-only manually verified import). Preserve consent checkbox/time/origin evidence and never import general Gravity registrations by default.
- Netlify new project > **Forms > Submission notifications** can send a notification about new `gravity-report-opt-in` submissions to the business mailbox; this does **not** distribute the actual newsletter and should not be confused with the sending provider. Netlify notifications default to `formresponses@netlify.com`, not the Gravity sender.
- Verify branded welcome email, deliverability to at least Gmail and non-Gmail recipients, SPF/DKIM/DMARC headers, visible unsubscribe and one-click handling, duplicate signups, suppression and privacy policy.
- After a final review, activate a **weekly Saturday email campaign**, leaving the Tuesday/Friday on-site publication independent.

## Finished, review-only newsletter drafts
- `scripts/build-gravity-report-email.cjs --week=2026-10-26` prepares matching **HTML email**, **plain-text email** and machine-readable campaign manifest, without reading contacts or sending.
- GitHub Actions workflow `.github/workflows/gravity-report-email-prelaunch-qa.yml`, successful run `40455225740`. Artifact: **Gravity-Report-EMAIL-DRAFT-NOT-SENT**, containing `2026-10-26/weekly.html`, `weekly.txt` and `campaign.json`. The first weekly issue contains approved article **6** (labor control) and **7** (procedures), with links to the permanent domain. Titles and summaries come directly from source files.
- Built-in `{$unsubscribe}` merge tag is intended for MailerLite; confirm the editor renders it as a real unsubscribe link. **Address placeholder `[[ADD BUSINESS MAILING ADDRESS BEFORE SENDING]]` must be replaced** using the business mailing address and/or provider sender-footer configuration before sending.
- **Nothing is automatically distributed** from the files. Do not download or use a list of prospective contacts until opt-in data is verified and unsubscribe management exists.

## Final decision gates before first email
1. Owner authorizes and connects **Google Workspace business mailbox** to their chosen marketing provider, confirms sender verification and physical mailing address.
2. Confirm DMARC exists and third-party sender DKIM/SPF is authenticated.
3. Connect consented website signup form to provider; test double-opt-in and unsubscribes. Do not email the lone Netlify subscriber without checking their consent details.
4. Approve newsletter body and weekly Saturday send window; test receive/deliverability and render on phone and desktop.
5. Explicit approval to **send the first real email** and to enable recurring campaigns. No such approval has been granted in this task.
