// Keep the static magazine layout and add the current index before sending the page.
export default async function reportIndex(request, context) {
  if (request.method !== 'GET') return context.next();
  const [page, index] = await Promise.all([
    context.next(),
    fetch(new URL('/gravity-report/articles.json?view=links', request.url))
      .then(response => response.ok && response.headers.get('content-type')?.startsWith('text/html') ? response.text() : null)
      .catch(() => null)
  ]);
  if (!page.ok || !index?.startsWith('<ol data-report-article-index>') || !page.headers.get('content-type')?.includes('text/html')) return page;
  const markup = await page.text();
  const headers = new Headers(page.headers);
  for (const key of ['etag', 'content-length', 'content-encoding', 'last-modified']) headers.delete(key);
  headers.set('cache-control', 'no-store');
  return new Response(markup.replace('<ol data-report-article-index></ol>', () => index), {
    status: page.status,
    headers
  });
}

export const config = { path: ['/gravity-report', '/gravity-report/'], onError: 'bypass' };
