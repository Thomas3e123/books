'use strict';
// Netlify: exit 0 means skip the build; exit 1 means perform the build.
// Normal PR previews and audit branch builds are unnecessary: GitHub CI tests
// the source and production publishes the verified result after merge.
// An explicit non-secret Netlify environment flag can opt in to a preview.
const context=process.env.CONTEXT||'';
const branch=process.env.BRANCH||'';
const isPreview=context==='deploy-preview'||(context==='branch-deploy'&&/^audit\//.test(branch));
const optedIn=process.env.GRAVITY_ENABLE_PREVIEW_BUILD==='1';
if(isPreview&&!optedIn){
  console.log('Gravity: skipping automatic Netlify preview build; GitHub CI remains active.');
  process.exit(0);
}
console.log('Gravity: continuing Netlify build for '+(context||'unspecified')+' context.');
process.exit(1);
