// Keep existing welcome bookmarks working without serving a second homepage.
export default function homeWelcomeRedirect(request) {
  const url = new URL(request.url);
  if (!['GET', 'HEAD'].includes(request.method) || url.searchParams.get('welcome') !== '1') return;
  url.searchParams.delete('welcome');
  url.hash = 'welcome';
  return Response.redirect(url.href, 301);
}
export const config = { path: '/', onError: 'bypass' };
