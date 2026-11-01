# Commercial release gates — not yet cleared

The Windows shell is development-only. It is NOT a finished handbook generator and is NOT ready to sell.

## Square integration
- Existing Square donation link is for voluntary contributions, **not** a product checkout. Never reuse it as a product purchase.
- Create a dedicated $29.99 Square product/payment link and configure GRAVITY_HANDBOOK_SQUARE_PRODUCT_URL.
- Create a secure server-side payment verification and license issuance service. Verify Square order/payment status, product identity, exact amount, refund status, and license binding. Configure GRAVITY_HANDBOOK_LICENSE_VERIFY_URL. Never embed Square access tokens in Electron or browser files.
- Deliver license after verified payment and support license recovery/refunds; prevent replay, duplicate claims, and forged confirmations.
- License verification currently requires online access; persistent signed offline licenses and machine transfer are not implemented.
- Electron client restrictions deter casual copying only. They cannot prevent screenshots, OCR, accessibility extraction, developer instrumentation, or binary patching. Do not claim absolute DRM.
- Do not accept purchases until payment, fulfillment, refund, and recovery tests pass.

## Handbook engine
- Integrate complete structured interview, templates, dependency reconciliation, legally reviewed jurisdiction rules, acknowledgments and real multi-format exports.
- Currently Windows shell has basic text notes, project save/open, license UI, and text export gate only. The browser interview prototype is separate and not yet wired into this shell.
- Verify Windows build, installer, auto-update policy, data preservation, licensing, security, accessibility, and visual QA.

## Publishing
- Keep isolated branch off production. Do not add public Gravity navigation or expose the web tool until approved after Founding Year.
