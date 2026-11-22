const description = 'Choose the restaurant problem you want to solve, from filling shifts to handling guest complaints. Gravity’s welcome guide points you to a practical first step.';

export default async function homeWelcomeDescription(request, context) {
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.searchParams.get('welcome') !== '1') return;

  const page = await context.next();
  if (page.status !== 200 || !page.headers.get('content-type')?.includes('text/html')) return page;
  const html = await page.text();
  const body = html.replace(
    /<meta\b(?=[^>]*\b(?:name|property)=["'](?:description|og:description|twitter:description)["'])[^>]*>/gi,
    tag => tag.replace(/\bcontent="[^"]*"/i, 'content="' + description + '"')
  );
  const headers = new Headers(page.headers);
  for (const key of ['etag', 'content-length', 'content-encoding', 'last-modified']) headers.delete(key);
  headers.set('Cache-Control', 'no-store');
  return new Response(body, { status: page.status, headers });
}

export const config = { path: '/', onError: 'bypass' };
