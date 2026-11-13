(function () {
  'use strict';

  var path = (location.pathname || '/').toLowerCase();
  var product = '';
  if (path === '/handbook-creator' || path.indexOf('/handbook-creator/') === 0) {
    product = 'employee-handbook-creator';
  } else if (path === '/apps/inventory-center' || path.indexOf('/apps/inventory-center/') === 0) {
    product = 'inventory-center-app';
  } else if (path === '/apps/sop-foundry' || path.indexOf('/apps/sop-foundry/') === 0) {
    product = 'sop-foundry-hosted';
  }
  if (!product || (location.protocol !== 'https:' && location.protocol !== 'http:')) return;

  var doNotTrack = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  if (doNotTrack) return;

  var measurementId = 'G-M98MZFED33';
  var pathOnly = location.pathname || '/';
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    page_location: location.origin + pathOnly,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  function send(name, interactionType) {
    window.gtag('event', name, {
      page_category: 'Gravity Product',
      page_path_clean: pathOnly,
      gravity_site: 'The Gravity Restaurant Leadership System',
      product_slug: product,
      product_surface: 'web',
      interaction_type: interactionType || 'open'
    });
  }

  send('gravity_product_open', 'open');

  document.addEventListener('click', function (ev) {
    if (!ev.target || !ev.target.closest) return;
    if (!ev.target.closest('button,[role="button"]')) return;
    send('gravity_product_interaction', 'button');
  }, true);

  document.addEventListener('submit', function () {
    send('gravity_product_interaction', 'form_submit');
  }, true);

  var tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(tag);
})();
