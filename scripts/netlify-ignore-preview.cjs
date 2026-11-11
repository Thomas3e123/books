'use strict';
// Netlify: exit 0 means skip the build; exit 1 means perform the build.
// Normal PR previews and audit branch builds are unnecessary: GitHub CI tests
// the source and production publishes the verified result after merge.
// An explicit non-secret Netlify environment flag can opt in to a preview.
const context=process.env.CONTEXT||'';
const branch=process.env.BRANCH||'';
const isPreview=context==='deploy-preview'||(context==='branch-deploy'&&/^audit\//.test(branch));
const optedIn=process.env.GRAVITY_ENABLE_PREVIEW_BUILD==='1';
// Limited, one-branch exception for real browser QA of the reported Edge defect.
// All unrelated previews remain skipped to control build usage.
const allowedReview=branch==='fix/gravity-high-zoom-navigation-2026-11-10' || process.env.REVIEW_ID==='60';
if(isPreview&&!optedIn&&!allowedReview){
  console.log('Gravity: skipping automatic Netlify preview build; GitHub CI remains active.');
  process.exit(0);
}
console.log('Gravity: continuing Netlify build for '+(context||'unspecified')+' context.');
process.exit(1);
