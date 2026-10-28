import assert from 'node:assert/strict';
import fs from 'node:fs';

const page=fs.readFileSync('site/gravity-report-guests.html','utf8');
const home=fs.readFileSync('site/gravity-report.html','utf8');
const redirects=fs.readFileSync('site/_redirects','utf8');
const policy=fs.readFileSync('docs/gravity-report-guest-voices-program-2026-10-28.md','utf8');
const charter=fs.readFileSync('docs/gravity-charter-release-review.md','utf8');

assert(redirects.includes('/gravity-report-guests /gravity-report-guests.html 200'),'Guest contributor URL missing');
assert(home.includes('href="/gravity-report-guests"'),'No guest participation link from Report homepage');
assert(page.includes('href="mailto:thomas.butler@gravityleadershipsystem.com'),'Guest proposal route unavailable');
assert(page.includes('sending')===false,'False submission claim in contributor page');
assert(page.includes('does not guarantee acceptance or publication'),'Contributor review gate must be explicit');
assert(page.includes('will discuss byline')&&page.includes('publication rights'),'Contributor rights must be negotiated');
assert(page.includes('independently attributed'),'Guest voice editorial independence unclear');
assert(page.includes('confidential restaurant'),'Sensitive content warning missing');
assert(page.includes('Guest Voices'),'Guest page branding absent');
assert.equal((home.match(/<article class="report-card"/g)||[]).length,30,'Original 30-article schedule changed');
assert(home.includes('one useful weekly digest'),'Email cadence promise missing');
assert(policy.includes('three articles per week total')&&policy.includes('one optional weekly digest'),'Guest slot must not mean a fourth article or multiple weekly emails');
assert(policy.includes('No invitations sent'),'Unsent invitations misrepresented');
assert(charter.includes('official Gravity publications'),'Charter guest-review policy must remain applicable');
console.log('GRAVITY_GUEST_VOICES_QA PASS — editorial standards, independent guests, contributor email, 3/week and 1 digest, no false guest claims');
