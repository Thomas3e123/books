(function () {
  'use strict';

  // Gravity GA4 property. Measurement is disabled for visitors using Do Not Track.
  var GA4_MEASUREMENT_ID = 'G-M98MZFED33';
  var RESPECT_DO_NOT_TRACK = true;
  var SITE_NAME = 'The Gravity Restaurant Leadership System';

  var menuToggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-menu]');

  // One complete public-site menu, regardless of the page's original HTML.
  // Only normalize the main site-header navigation. App workrooms, private
  // manager screens, and their own internal controls are intentionally excluded.
  var primaryMenu = [
    ['/', 'Home'],
    ['/gravity-report', 'Gravity Report'],
    ['/gravity-assist', 'Gravity Assist'],
    ['/operating-systems', 'Operating Systems'],
    ['/gravity-aware', 'Gravity Aware'],
    ['/books', 'Books'],
    ['/book-reader', 'Gravity Reader'],
    ['/restaurant-management-forms-checklists', 'Forms & Tools'],
    ['/gravity-fulfillment-center', 'Fulfillment Center'],
    ['/standards-library', 'SOP Library'],
    ['/gravity-sop-foundry', 'SOP Foundry'],
    ['/knowledge-center', 'Knowledge Center'],
    ['/help-center', 'Help Center'],
    ['/windows-programs', 'Windows Programs'],
    ['/testing-room', 'Testing Room'],
    ['/contact', 'Contact'],
    ['/start-here', 'Start Here']
  ];
  if (nav && nav.id === 'site-nav' && nav.closest('header.site-header')) {
    var fragment = document.createDocumentFragment();
    primaryMenu.forEach(function (item) {
      var link = document.createElement('a');
      link.setAttribute('href', item[0]);
      link.textContent = item[1];
      if (item[0] === '/start-here') link.className = 'btn btn-red';
      fragment.appendChild(link);
    });
    nav.replaceChildren(fragment);
    // Keep the button in the existing header and let the shared toggle handle it.
  }

  function setMenu(open) {
    if (!menuToggle || !nav) return;
    nav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    var label = menuToggle.querySelector('span');
    if (label) label.textContent = open ? 'Close' : 'Menu';
  }

  // The Gravity Report link belongs in every standard website menu.
  // Most pages share this script even though their HTML menus are embedded.
  if (nav && !nav.querySelector('a[href="/gravity-report"]')) {
    var reportLink = document.createElement('a');
    reportLink.id = 'gravity-report-nav-link';
    reportLink.href = '/gravity-report';
    reportLink.textContent = 'Gravity Report';
    var knowledgeLink = nav.querySelector('a[href="/knowledge-center"]');
    if (knowledgeLink) knowledgeLink.insertAdjacentElement('afterend', reportLink);
    else {
      var contactLink = nav.querySelector('a[href="/contact"]');
      if (contactLink) contactLink.insertAdjacentElement('beforebegin', reportLink);
      else nav.appendChild(reportLink);
    }
    if (location.pathname.replace(/\\.html$/, '') === '/gravity-report' || location.pathname.indexOf('/gravity-report/') === 0) {
      reportLink.classList.add('active');
      reportLink.setAttribute('aria-current', 'page');
    }
  }

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu(!nav.classList.contains('open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !menuToggle.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1180) setMenu(false); });
  }

  document.querySelectorAll('[data-path-filter]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var filter = btn.dataset.pathFilter;
      document.querySelectorAll('[data-path-target]').forEach(function (card) {
        var targets = (card.dataset.pathTarget || '').split(/\s+/);
        card.classList.toggle('hide', !(filter === 'all' || targets.indexOf(filter) >= 0));
      });
      document.querySelectorAll('[data-path-filter]').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var sectionTarget = page;
  if (/^restaurant-bar-beverage-/.test(page) || page === 'toolkit.html') {
    sectionTarget = 'books.html';
  } else if (/^gravity-sop-library-/.test(page) || page === 'standards.html') {
    sectionTarget = 'standards-library.html';
  } else if (/^restaurant-/.test(page)) {
    sectionTarget = 'knowledge-center.html';
  } else if (page === 'system.html' || page === 'sales-intelligence-forecasting.html' || page === 'installation-improvement.html') {
    sectionTarget = 'operating-systems.html';
  }
  if (nav) {
    var activePath = (location.pathname || '/').toLowerCase();
    if (activePath.slice(-5) === '.html') activePath = activePath.slice(0, -5);
    while (activePath.length > 1 && activePath.endsWith('/')) activePath = activePath.slice(0, -1);
    nav.querySelectorAll('a').forEach(function (link) {
      var target = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
      // Keep a single meaningful active link; never mark unrelated pages active.
      var selected = target === activePath || (activePath === '/index' && target === '/');
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  var reviewProduct = document.getElementById('review-product');
  if (reviewProduct) {
    try {
      var value = new URLSearchParams(window.location.search).get('product');
      if (value) reviewProduct.value = value;
    } catch (_) {}
  }

  // Analytics loads only when a valid GA4 Measurement ID is intentionally added.
  var validGa4 = /^G-[A-Z0-9]+$/i.test(GA4_MEASUREMENT_ID);
  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1';
  var analyticsEnabled = validGa4 && !(RESPECT_DO_NOT_TRACK && dnt);
  var downloadExt = /\.(pdf|docx?|xlsx?|pptx?|zip|txt|rtf|csv|7z|rar|gz)(?:$|[?#])/i;

  function pageCategory() {
    var p = (location.pathname || '').toLowerCase();
    if (p.indexOf('testing-room') >= 0) return 'Testing Room';
    if (p.indexOf('start-here') >= 0) return 'Start Here';
    if (p.indexOf('register') >= 0 || p.indexOf('registration-thanks') >= 0) return 'Registration';
    if (p.indexOf('operating-system') >= 0 || p.indexOf('sales-intelligence') >= 0) return 'Operating Systems';
    if (p.indexOf('free-resources') >= 0 || p.indexOf('improvement-plans') >= 0) return 'Free Resources';
    if (p.indexOf('customer-resources') >= 0) return 'Customer Resources';
    if (p.indexOf('review') >= 0) return 'Reviews';
    if (p.indexOf('toolkit') >= 0) return 'Toolkit';
    if (p.indexOf('book') >= 0) return 'Books';
    if (p.indexOf('standards') >= 0 || p.indexOf('sop-library') >= 0) return 'Standards / SOP Library';
    if (p === '/' || /\/index\.html$/.test(p)) return 'Homepage';
    return 'Other';
  }
  function cleanText(v) { return (v || '').replace(/\s+/g, ' ').trim().slice(0, 120); }
  function cleanSlug(v) { return (v || '').replace(/^#/, '').replace(/[^a-z0-9_-]/gi, '').toLowerCase().slice(0, 80); }
  function fileName(href) {
    try { return decodeURIComponent((new URL(href, location.href).pathname.split('/').pop() || '')).slice(0,180); }
    catch (_) { return ''; }
  }
  function fileExt(name) { var m=(name||'').match(/\.([a-z0-9]+)$/i); return m ? m[1].toLowerCase() : ''; }
  function analyticsPageLocation() {
    try {
      var u=new URL(location.href), keep=new URLSearchParams();
      ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'].forEach(function(k){var v=u.searchParams.get(k);if(v)keep.set(k,v);});
      var q=keep.toString(); return u.origin+u.pathname+(q?'?'+q:'');
    } catch (_) { return location.origin+(location.pathname||'/'); }
  }
  function safeReferrer(v) {
    if(!v)return '';
    try { var u=new URL(v); ['t','token','key','access_token','auth'].forEach(function(k){u.searchParams.delete(k);}); return u.origin+u.pathname+(u.searchParams.toString()?'?'+u.searchParams.toString():''); }
    catch (_) { return ''; }
  }
  function send(name, params) {
    if (!analyticsEnabled || typeof window.gtag !== 'function') return;
    var base = { page_category: pageCategory(), page_path_clean: location.pathname || '/', gravity_site: SITE_NAME };
    Object.keys(params || {}).forEach(function (k) { base[k] = params[k]; });
    window.gtag('event', name, base);
  }

  // Safe public hook for first-party pages that need to report non-PII product events.
  window.gravityAnalyticsEvent = function (name, params) { send(name, params || {}); };

  if (analyticsEnabled) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, {
      send_page_view: true,
      page_location: analyticsPageLocation(),
      content_group: pageCategory(),
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_MEASUREMENT_ID);
    document.head.appendChild(tag);
    if ((location.pathname || '').toLowerCase().indexOf('/start-here') >= 0) {
      send('start_here_view', {entry_method: 'page'});
    }
    if ((location.pathname || '').toLowerCase().indexOf('/review-thanks') >= 0) {
      send('feedback_complete', {feedback_type: 'customer_experience'});
    }
  }

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var abs = a.href || href;
    var text = cleanText(a.textContent || a.getAttribute('aria-label') || '');
    var fname = fileName(abs);
    var lower = (fname + ' ' + href + ' ' + text).toLowerCase();
    var url;
    try { url = new URL(abs, location.href); } catch (_) { url = null; }
    var path = url ? url.pathname.toLowerCase().replace(/\.html$/, '') : '';
    var hash = url ? cleanSlug(url.hash) : '';
    var systemCard = a.closest ? a.closest('.system-card') : null;
    var systemName = '';
    if (systemCard) {
      var systemHeading = systemCard.querySelector('h3');
      systemName = cleanText(systemHeading ? systemHeading.textContent : systemCard.id);
    }

    if (path === '/start-here') {
      send('start_here_open', {link_text_clean:text, source_page:location.pathname || '/'});
    }

    if (a.classList.contains('need-item') && hash) {
      var needName = a.querySelector('strong');
      send('system_selection', {
        system_name:cleanText(needName ? needName.textContent : hash),
        system_slug:hash,
        selection_action:'problem_finder'
      });
    } else if (systemCard && systemName) {
      var action = 'system_resource';
      if (/download complete system/i.test(text)) action = 'download_system';
      else if (/preview/i.test(text) || a.classList.contains('system-cover-link')) action = 'preview_tools';
      else if (/read the manual/i.test(text)) action = 'read_manual';
      else if (/review/i.test(text)) action = 'open_review';
      send('system_selection', {
        system_name:systemName,
        system_slug:cleanSlug(systemCard.id),
        selection_action:action
      });
    }
    if (downloadExt.test(abs)) {
      send('gravity_file_download', {resource_name:fname, resource_format:fileExt(fname), link_text_clean:text});
      if (lower.indexOf('installation') >= 0 && lower.indexOf('package') >= 0) send('installation_package_download',{resource_name:fname});
      if (lower.indexOf('prompt') >= 0 && (lower.indexOf('ai') >= 0 || lower.indexOf('50') >= 0 || lower.indexOf('124') >= 0)) send('ai_prompts_download',{resource_name:fname});
      if (lower.indexOf('start_here') >= 0 || lower.indexOf('start-here') >= 0 || lower.indexOf('start here') >= 0) send('start_here_guide_download',{resource_name:fname});
      if (/download complete system/i.test(text)) send('operating_system_download',{resource_name:fname, system_name:systemName});
    }
    if (/review|share your experience/i.test(text)) send('review_open',{link_text_clean:text});
    if (/donat|optional support|support the founding year/i.test(text) || /square\.link/i.test(abs)) send('optional_support_click',{link_text_clean:text});
  }, true);

  document.addEventListener('submit', function (ev) {
    var f=ev.target;
    if (!f || !f.tagName || f.tagName.toLowerCase() !== 'form') return;
    var formName = cleanText(f.getAttribute('name') || f.id || 'unnamed');
    send('gravity_form_submit',{form_name_clean:formName});
    if (formName === 'gravity-customer-experience') {
      send('feedback_submit',{feedback_type:'customer_experience'});
    } else if (formName === 'gravity-registration') {
      var regMethod=f.querySelector('[name="registration_method"]');
      send('registration_submit',{registration_type:'gravity_updates',registration_method:cleanSlug(regMethod ? regMethod.value : 'email_form')});
    } else if ((location.pathname || '').toLowerCase().indexOf('/contact') >= 0) {
      send('contact_request_prepare',{contact_method:'email'});
    }
  }, true);

  // First-touch context used for optional registration and anonymous visit-funnel analytics.
  var FIRST_TOUCH_KEY = 'gravity_first_touch_v1';
  var WELCOME_KEY = 'gravity_welcome_complete_v1';
  function storageGet(key) { try { return window.localStorage.getItem(key); } catch (_) { return null; } }
  function storageSet(key, value) { try { window.localStorage.setItem(key, value); return true; } catch (_) { return false; } }
  function sessionGet(key) { try { return window.sessionStorage.getItem(key); } catch (_) { return null; } }
  function sessionSet(key, value) { try { window.sessionStorage.setItem(key, value); return true; } catch (_) { return false; } }
  function queryValue(name) { try { return new URLSearchParams(location.search).get(name) || ''; } catch (_) { return ''; } }
  function captureFirstTouch() {
    var existing = storageGet(FIRST_TOUCH_KEY);
    if (existing) { try { return JSON.parse(existing); } catch (_) {} }
    var data = {
      landing_path: location.pathname || '/',
      referrer: safeReferrer(document.referrer || ''),
      utm_source: queryValue('utm_source'),
      utm_medium: queryValue('utm_medium'),
      utm_campaign: queryValue('utm_campaign'),
      first_seen_at: new Date().toISOString()
    };
    storageSet(FIRST_TOUCH_KEY, JSON.stringify(data));
    return data;
  }
  var gravityFirstTouch = captureFirstTouch();
  var gravityIsKnownBrowser = !!storageGet(WELCOME_KEY);

  var welcome = document.getElementById('gravity-first-visit');
  var isHome = (location.pathname === '/' || /\/index\.html$/i.test(location.pathname));
  var forceWelcome = queryValue('welcome') === '1';
  function closeWelcome(reason) {
    if (!welcome) return;
    storageSet(WELCOME_KEY, '1');
    welcome.hidden = true;
    document.body.classList.remove('gravity-welcome-open');
    send('first_visit_welcome_complete', { completion_action: reason || 'enter_site' });
  }
  if (welcome && isHome) {
    if (!gravityIsKnownBrowser || forceWelcome) {
      if (!gravityIsKnownBrowser) sessionSet('gravity_first_visit_flow_v1', '1');
      welcome.hidden = false;
      document.body.classList.add('gravity-welcome-open');
      send('first_visit_welcome_view', { visit_type: gravityIsKnownBrowser ? 'reopened' : 'first_browser_visit' });
    } else {
      send('returning_home_view', { visit_type: 'returning_browser' });
    }
    welcome.querySelectorAll('[data-welcome-enter]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (el.tagName && el.tagName.toLowerCase() === 'button') e.preventDefault();
        closeWelcome('enter_full_site');
      });
    });
    welcome.querySelectorAll('[data-welcome-path]').forEach(function (a) {
      a.addEventListener('click', function () {
        storageSet(WELCOME_KEY, '1');
        send('first_visit_path_selection', { welcome_destination: cleanSlug(a.getAttribute('data-welcome-path') || ''), link_text_clean: cleanText(a.textContent) });
      });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !welcome.hidden) closeWelcome('escape'); });
  }

  // Registration attribution fields: capture source without placing email or form text in analytics.
  var registrationForm = document.querySelector('form[name="gravity-registration"]');
  if (registrationForm) {
    var map = {
      'registration-landing-path': gravityFirstTouch.landing_path || '',
      'registration-referrer': gravityFirstTouch.referrer || '',
      'registration-utm-source': gravityFirstTouch.utm_source || '',
      'registration-utm-medium': gravityFirstTouch.utm_medium || '',
      'registration-utm-campaign': gravityFirstTouch.utm_campaign || '',
      'registration-visit-type': sessionGet('gravity_first_visit_flow_v1') === '1' ? 'first_visit_flow' : (gravityIsKnownBrowser ? 'returning_browser' : 'first_browser_visit'),
      'registration-source-page': safeReferrer(document.referrer || ''),
      'registration-registered-at': new Date().toISOString()
    };
    Object.keys(map).forEach(function (id) { var el=document.getElementById(id); if (el) el.value=map[id]; });
    send('registration_view', { visit_type: gravityIsKnownBrowser ? 'returning_browser' : 'first_browser_visit' });
  }
  // Founding Year registration gate for downloadable digital products.
  var REG_ACCESS_KEY = 'gravity_founding_year_download_access_v1';
  var PENDING_DOWNLOAD_KEY = 'gravity_pending_download_v1';
  // Accept current and future official Gravity Windows releases without opening
  // the handoff to arbitrary third-party URLs or other GitHub repositories.
  function isOfficialWindowsBetaDownload(url) {
    return url.origin === 'https://github.com' && !url.search && !url.hash &&
      /^\/Thomas3e123\/books\/releases\/download\/[^/]+\/Gravity_(SOP_Foundry|Shift_Lab|Inventory_Center|Work_Study_Lab)_[A-Za-z0-9._-]+\.(?:zip|exe)$/i.test(url.pathname);
  }
  // Founding Year lightweight form: grant browser-local download convenience only
  // after Netlify accepts a real submission. This is not user authentication.
  if (registrationForm) {
    registrationForm.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!registrationForm.reportValidity() || registrationForm.dataset.submitting === '1') return;
      var submit = registrationForm.querySelector('[type="submit"]');
      var originalLabel = submit ? submit.textContent : '';
      var notice = registrationForm.querySelector('[data-registration-feedback]');
      if (!notice) {
        notice = document.createElement('p');
        notice.setAttribute('data-registration-feedback', '');
        notice.setAttribute('role', 'status');
        notice.setAttribute('aria-live', 'polite');
        registrationForm.appendChild(notice);
      }
      registrationForm.dataset.submitting = '1';
      if (submit) { submit.disabled = true; submit.textContent = 'Submitting registration…'; }
      notice.textContent = '';
      try {
        var payload = new URLSearchParams(new FormData(registrationForm));
        payload.set('form-name', 'gravity-registration');
        var response = await fetch('/', {
          method: 'POST',
          body: payload.toString(),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'same-origin'
        });
        if (!response.ok) throw new Error('Registration was not accepted (' + response.status + ').');
        storageSet(REG_ACCESS_KEY, 'registered');
        location.assign('/registration-thanks');
      } catch (error) {
        notice.textContent = 'Registration could not be confirmed. Please try again. Your details remain in the form.';
      } finally {
        registrationForm.dataset.submitting = '';
        if (submit) { submit.disabled = false; submit.textContent = originalLabel; }
      }
    });
  }
  var isRegistrationThanks = (location.pathname || '').toLowerCase().indexOf('/registration-thanks') >= 0;
  if (isRegistrationThanks) {
    storageSet(WELCOME_KEY, '1');
    // A direct visit to this page is not proof of a submitted registration.
    // Registration access is granted only after a successful Netlify Forms POST.
    if (storageGet(REG_ACCESS_KEY) === 'registered') send('registration_complete', { registration_type: 'founding_year_download_access' });
    var continueDownload = document.querySelector('[data-gravity-continue-download]');
    var pendingDownload = storageGet(PENDING_DOWNLOAD_KEY);
    if (continueDownload && pendingDownload) {
      try {
        var pendingUrl = new URL(pendingDownload, location.origin);
        if (pendingUrl.origin === location.origin || isOfficialWindowsBetaDownload(pendingUrl)) {
          continueDownload.href = pendingUrl.href;
          continueDownload.setAttribute('download', '');
          continueDownload.textContent = 'Continue to My Download';
        }
      } catch (_) {}
    }
  }

  function isGravityDownloadLink(a) {
    if (!a || !a.getAttribute) return false;
    var raw = a.getAttribute('href') || '';
    if (!raw || raw.charAt(0) === '#') return false;
    if (a.hasAttribute('data-no-registration-gate')) return false;
    var clean = raw.split('#')[0].split('?')[0].toLowerCase();
    return a.hasAttribute('download') || /\.(pdf|zip|docx|xlsx|pptx|txt|csv)$/i.test(clean);
  }

  // Make the Founding Year promise visible at the point of download.
  document.querySelectorAll('a').forEach(function (a) {
    if (!isGravityDownloadLink(a)) return;
    var registered = storageGet(REG_ACCESS_KEY) === 'registered';
    if (!registered) {
      var t = (a.textContent || '').trim();
      if (/^Download\b/i.test(t)) a.textContent = 'Register & ' + t;
      else if (!/^Register\s*&/i.test(t)) a.setAttribute('title', 'Registration required to download — Founding Year price $0; no credit card required');
    }
    if (!a.nextElementSibling || !a.nextElementSibling.classList || !a.nextElementSibling.classList.contains('gravity-download-trust')) {
      var note = document.createElement('span');
      note.className = 'gravity-download-trust';
      note.innerHTML = '<strong>$0 TODAY</strong><br><span>Included with Founding Year Access</span><br><span>Full digital product — not a trial or limited version</span><br><span>No credit card · No subscription · No automatic billing</span>';
      a.insertAdjacentElement('afterend', note);
    }
  });

  document.addEventListener('click', function (ev) {
    var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
    if (!isGravityDownloadLink(a)) return;
    if (storageGet(REG_ACCESS_KEY) === 'registered') {
      send('registered_download_start', { link_text_clean: cleanText(a.textContent) });
      return;
    }
    ev.preventDefault();
    var raw = a.getAttribute('href') || '';
    try {
      var target = new URL(raw, location.href);
      if (target.origin === location.origin || isOfficialWindowsBetaDownload(target)) storageSet(PENDING_DOWNLOAD_KEY, target.href);
    } catch (_) { storageSet(PENDING_DOWNLOAD_KEY, raw); }
    send('download_registration_gate', { link_text_clean: cleanText(a.textContent) });
    location.href = '/register?download=1';
  }, true);

  // Registration page context for users arriving from a download button.
  if (registrationForm && queryValue('download') === '1') {
    var heading = document.querySelector('.register-hero h1');
    if (heading) heading.textContent = 'Register Once. Then Continue Your $0 Download.';
  }

})();

/* Gravity contextual field help — 2026-09-17
   High-friction terms only. Help is available by hover/focus and by tap on the info button. */
(function () {
  'use strict';
  var HELP = {
    'Gravity Forms Personalizer': 'Use this when you already have a Gravity form, poster, checklist, or resource and want to add your restaurant name, logo, location, QR code, or local details without weakening the underlying standard.',
    'Gravity Document Studio': 'Use this to build a new restaurant document from guided fields—such as a policy, checklist, notice, form, or management document—then review it before issuing it.',
    'Gravity Shift Lab': 'Use this to build and control schedules, labor targets, availability, coverage, sections, manager labor settings, and employee schedule sharing.',
    'Gravity SOP Foundry': 'Use this to build, customize, approve, version, and export restaurant SOPs and SOP binders from the Gravity source library.',

    'Store / unit number': 'Use the internal location number or code your company uses to distinguish this restaurant from other locations. Leave blank if you operate only one location and do not use store numbers.',
    'Default approved by': 'The person or role authorized to approve the SOP for local use, such as Owner, General Manager, Director of Operations, or Department Head.',
    'Default SOP owner': 'The role accountable for keeping the SOP current, training against it, and starting a review when the procedure changes.',
    'Default revision / version': 'The local version identifier for controlled documents. Example: 1.0 for the first approved version, then 1.1 or 2.0 after meaningful revisions.',
    'Default review cycle': 'How often the restaurant should formally re-check the SOP even if no problem has been reported. Example: every 12 months.',
    'Default language / locale': 'The language and regional setting used for the document. Example: English — United States.',
    'Default jurisdiction / authority': 'The government, code, regulator, franchisor, company policy, or other authority whose requirements should be checked before local approval.',
    'Default record retention': 'How long completed logs, acknowledgments, inspections, or other records created by this SOP should be kept under your company and legal requirements.',
    'Default escalation role': 'Who employees should contact when the normal SOP cannot safely or correctly resolve the situation.',
    'Controlled-copy footer note': 'A footer reminder that identifies the document as a controlled local copy and helps employees avoid using an outdated printout.',
    'Carry default owner': 'When enabled, the saved SOP owner is automatically carried into SOPs you add to the current pack so you do not re-enter it repeatedly.',
    'Carry approver': 'When enabled, the saved approver is carried into SOPs in the current pack.',
    'Carry revision number': 'When enabled, the saved local revision/version is copied into SOPs in the current pack.',
    'Auto-calculate next review': 'Uses the review cycle you selected to calculate a suggested next review date automatically.',
    'Carry retention rule': 'Copies the saved record-retention rule into SOPs in the current pack.',
    'Carry escalation role': 'Copies the saved escalation role into SOPs in the current pack.',
    'Carry language': 'Copies the saved language/locale into SOPs in the current pack.',
    'Carry jurisdiction': 'Copies the saved jurisdiction/authority into SOPs in the current pack.',
    'Operational tag': 'A filter that groups SOPs by practical purpose or risk so you can narrow a large library quickly.',
    'Output format': 'Choose the format you want to build or export. Use PDF for controlled printing and Word-compatible output when the local copy still needs editing.',
    'Restore Backup': 'Loads a previously saved Foundry workspace backup. Restoring can replace the current browser workspace, so save a backup first if you need to preserve it.',

    'Target labor %': 'The labor-cost percentage your restaurant is trying to operate at for this schedule. Shift Lab compares schedule decisions against this target.',
    'Target labor hours': 'The total labor hours you intend to schedule for the week. Use this when hours—not only labor dollars—are part of your staffing control.',
    'Availability conflict mode': 'Controls how Shift Lab responds when a scheduled shift conflicts with an employee’s saved availability or time-off rules.',
    'Management labor in labor %': 'Choose whether manager labor should be included in the labor percentage Shift Lab uses for schedule control.',
    'Weekly salaried-management allocation ($)': 'The weekly dollar amount of salaried management cost you want included when management labor is part of the labor calculation.',
    'Employee phone numbers in Find Coverage': 'Controls whether saved employee phone numbers are shown to managers while looking for qualified coverage. Use the most restrictive setting your operation needs.',
    'Home section / station': 'The employee’s primary working area. Qualified sections can include additional areas where the employee is trained to work.',
    'Qualified sections': 'All sections or stations where this employee has been trained and may be considered for scheduling or coverage.',
    'Maximum weekly hours (optional)': 'A local scheduling guardrail. Shift Lab can use it to flag or avoid schedules that would push the employee beyond this amount.',
    'Required certification / permit (optional)': 'A certification, permit, card, or license the employee must hold for certain work. Add an expiration date when one applies.',
    'Minor employee — show review reminder': 'Turns on an extra reminder to review applicable youth-employment scheduling restrictions before finalizing shifts.',
    'Schedule cycle': 'The date range or posting cycle employees should understand this published schedule belongs to.',
    'Current schedule': 'The schedule version employees will see when they open the shared link or QR code.',

    'Effective date': 'The date this handbook version becomes the active employee policy document for this restaurant or location.',
    'Last reviewed': 'The most recent date an authorized reviewer checked this handbook for current company practice and applicable requirements.',
    'Approved by': 'The owner, authorized HR reviewer, or other person with authority to approve the handbook before employees receive it.',
    'Legal entity / DBA': 'Enter the legal employer name and, when different, the restaurant name used with employees and guests.',
    'Payday / pay schedule': 'State the normal payday or payroll cycle employees should expect. Verify that it matches the restaurant’s actual payroll practice.',
    'Schedule posting / call-off method': 'Explain where schedules are posted and exactly how an employee must report an absence or late arrival.',
    'Tips / tip pool / service charge practice': 'Describe the restaurant’s reviewed practice. Tip-credit, tip-pool, and service-charge rules can vary and should be checked before issue.',
    'Primary concern-reporting contact': 'The first person or role employees may contact about harassment, discrimination, pay, safety, retaliation, or another workplace concern.',
    'Alternate reporting contact': 'A second practical reporting route so an employee is not forced to report a concern only to the person involved.',
    'Emergency / after-hours contact': 'The manager, owner, security, or other approved contact employees should use for urgent after-hours restaurant matters.',
    'State / local law review': 'Record the state and local jurisdiction reviewed and the review date. This helps prevent a generic handbook from being mistaken for a locally complete one.',
    'Multi-location use': 'Choose whether this handbook is for one restaurant, a company-wide handbook with location supplements, or separate handbooks by location.',

    'Print standard': 'The intended production quality for the finished piece. Choose a higher standard when the item will be posted, handled often, or used long term.',
    'Finish': 'The physical finishing treatment requested for the printed item, such as lamination or another protective option.',
    'QR destination or text': 'The web address or text the QR code should open or display when scanned. Test it before printing.',
    'Supporting / reference files': 'Optional files that help explain the order or provide source material. They do not automatically become part of the final design.',

    'Overall rating *': 'Rate the resource based on your real experience. Feedback does not need to be positive; honest results are what make Founding Year feedback useful.',
    'How should we identify you if quoted?': 'Choose the name or attribution you are comfortable having displayed if you separately authorize your review for public use.',

    'Number of locations': 'This helps Gravity understand whether you are using the system in one restaurant or across multiple locations. It does not change the $0 Founding Year access.',
    'Biggest need right now *': 'Choose the restaurant pressure you most want help solving. This helps us understand how managers are entering the Gravity System and improve what we build next.'
  };

  var BUTTON_HELP = {
    'Fast Build': 'Choose Fast Build when you want the shortest path to a usable result with fewer fields and less setup.',
    'Full Control': 'Choose Full Control when you need the additional ownership, approval, risk, revision, training, exception, and document-control fields.',
    'Save Workspace': 'Saves the current Foundry work in this browser so you can return without rebuilding the pack from the beginning.',
    'Restore': 'Restores a previously saved Foundry workspace. Save the current workspace first if you might need it later.',
    'Apply to Current Pack': 'Applies the saved restaurant defaults and enabled carry-forward controls to SOPs already loaded in the current working pack.',
    'Mark Local Copy Approved': 'Marks the local version as reviewed and approved for your restaurant. Use only after the responsible approver has actually reviewed it.',
    'Backup Workspace': 'Downloads a backup of the current Foundry workspace so it can be restored later or moved to another browser/device.',
    'Copy Previous Week': 'Copies the prior week as a starting point. Review sales, availability, requests, staffing, and labor before publishing the new week.',
    'Set Manager Pay Lock': 'Creates or changes the PIN/password used to protect manager-pay and privacy settings from casual access in this browser.',
    'Manager Labor & Privacy Settings': 'Controls whether management labor is included in labor calculations and how employee contact information is exposed in coverage tools.',
    'Publish / Preview Employee QR': 'Creates the employee-facing schedule link and QR code. Preview it before posting so employees see the intended schedule.',
    'Download Workspace Backup': 'Downloads Shift Lab data stored in this browser so you can keep a separate recovery copy.',
    'Restore Workspace Backup': 'Restores Shift Lab from a backup file and may replace the current browser workspace. Back up the current workspace first if needed.',
    'Export Schedule Data (.CSV)': 'Exports schedule data as a CSV file for spreadsheet analysis or recordkeeping. It is not the employee-facing posted schedule.',
    'Install Full Gravity Shift Lab App — Same Interface': 'Installs Shift Lab as an app-like experience on a supported device. Your interface stays the same; installation mainly improves access and app-style launching.',
    'Download Proof PNG': 'Downloads an image proof for review. A proof is for checking the design and content before final production.',
    'Download Order Package ZIP': 'Packages the proof and order/reference information together so the fulfillment request can be reviewed as one set.'
  };

  function textOf(el) { return (el.textContent || '').replace(/\s+/g, ' ').trim(); }
  function makeTip(help) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'gravity-help-tip';
    b.setAttribute('aria-label', 'Help: ' + help);
    b.setAttribute('aria-expanded', 'false');
    b.setAttribute('data-help', help);
    b.innerHTML = '<span aria-hidden="true">i</span>';
    b.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var willOpen = !b.classList.contains('is-open');
      document.querySelectorAll('.gravity-help-tip.is-open').forEach(function (x) { x.classList.remove('is-open'); x.setAttribute('aria-expanded','false'); });
      if (willOpen) { b.classList.add('is-open'); b.setAttribute('aria-expanded','true'); }
    });
    return b;
  }

  document.querySelectorAll('label').forEach(function (label) {
    var key = textOf(label);
    var help = HELP[key];
    if (!help || label.querySelector('.gravity-help-tip')) return;
    label.appendChild(document.createTextNode(' '));
    label.appendChild(makeTip(help));
  });

  document.querySelectorAll('h2,h3,h4').forEach(function (heading) {
    var key = textOf(heading);
    var help = HELP[key];
    if (!help || heading.querySelector('.gravity-help-tip')) return;
    heading.appendChild(document.createTextNode(' '));
    heading.appendChild(makeTip(help));
  });

  document.querySelectorAll('.status,.page-status').forEach(function (status) {
    if (status.querySelector('.gravity-help-tip')) return;
    var t = textOf(status);
    var help = '';
    if (/In Development/i.test(t)) help = 'This item is still being built, refined, or prepared for print/retail. If a current digital download is shown, that digital edition remains available during Founding Year Access.';
    else if (/Founding Year Access/i.test(t)) help = 'This completed digital resource is $0 through October 1, 2027. Registration is required for download, but no credit card, subscription, or automatic billing is required.';
    if (!help) return;
    status.appendChild(document.createTextNode(' '));
    status.appendChild(makeTip(help));
  });

  document.querySelectorAll('button').forEach(function (btn) {
    if (btn.classList.contains('gravity-help-tip')) return;
    var key = textOf(btn);
    var help = BUTTON_HELP[key];
    if (!help) return;
    var tip = makeTip(help);
    tip.classList.add('gravity-help-tip-after');
    btn.insertAdjacentElement('afterend', tip);
  });

  document.addEventListener('click', function (ev) {
    if (ev.target && ev.target.closest && ev.target.closest('.gravity-help-tip')) return;
    document.querySelectorAll('.gravity-help-tip.is-open').forEach(function (x) { x.classList.remove('is-open'); x.setAttribute('aria-expanded','false'); });
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key !== 'Escape') return;
    document.querySelectorAll('.gravity-help-tip.is-open').forEach(function (x) { x.classList.remove('is-open'); x.setAttribute('aria-expanded','false'); });
  });
})();

/* Gravity contextual Ask Gravity prompt — shared next-value promotion across all customer pages. */
(function(){
  'use strict';
  function path(){return (location.pathname||'/').toLowerCase().replace(/\/$/,'')||'/';}
  function nextValuePrompt(){
    var p=path();
    if(p==='/') return {kicker:'Start with your restaurant',label:'Ask Gravity how it can help your restaurant',q:'How can Gravity help my restaurant, and what is the best first problem for me to work on?'};
    if(p==='/start-here') return {kicker:'Turn the first step into a useful connection',label:'Ask Gravity how starting here could also help identify your biggest operating problem',q:'Based on this Start Here page, how could Gravity help me identify the first restaurant problem worth solving and what could that connect to next?'};
    if(p==='/book-reader') return readerPrompt();
    if(/shift-lab|staff-scheduling|labor-control-scheduling/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this schedule could also help control labor cost',q:'How could the schedule or staffing work on this page also help me control labor cost, and what should I use next?'};
    if(/work-study/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this study could also help determine staffing needs',q:'How could this work study also help me determine staffing needs or improve the schedule in Gravity Shift Lab?'};
    if(/numbers-lab/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how these numbers could also help improve your schedule',q:'How could the numbers I calculate here also help me make better scheduling or staffing decisions?'};
    if(/sales-intelligence|sales-forecasting/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this forecast could also improve staffing and purchasing',q:'How could this sales forecast also help me plan staffing and purchasing more accurately?'};
    if(/food-cost|percentage-formula/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this food-cost work could also improve inventory and recipes',q:'How could this food-cost work also help me improve inventory control, recipe costing, or purchasing?'};
    if(/recipe-works|recipe-costing|portion-control/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this recipe could also help control inventory and food cost',q:'How could this recipe work also help me control inventory, food cost, purchasing, or portion consistency?'};
    if(/inventory|receiving/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this inventory could also help with recipe costing and purchasing',q:'How could this inventory work also help with recipe costing, purchasing, pars, or food-cost control?'};
    if(/sop-foundry|sop-library|standards-library|sop-template|sop-station/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this SOP could also strengthen employee training',q:'How could the SOP or standard on this page also strengthen employee training, verification, or manager follow-through?'};
    if(/forms-personalizer|document-studio|forms-checklists|checklist|log|worksheet|prep-sheet/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this form could also support manager control and follow-through',q:'How could this form or document also support manager control, training, accountability, or shift follow-through?'};
    if(/guest|complaint|recovery/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this guest-recovery work could also improve training and service standards',q:'How could this guest-recovery work also improve employee training, service standards, or manager coaching?'};
    if(/manager|leadership|handoff|weekly-business-review/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this management work could also improve shift execution',q:'How could the management work on this page also improve shift execution, handoffs, accountability, or training?'};
    if(/hiring|retention|onboarding/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this could also improve onboarding and retention',q:'How could this hiring or onboarding work also improve training, retention, and early employee performance?'};
    if(/training|employee-training|station-training|training-sign-off/.test(p)) return {kicker:'Another way this could help',label:'Ask Gravity how this training could also strengthen SOP execution',q:'How could this training work also strengthen SOP execution, manager verification, and consistency?'};
    if(/quick-tools|qr-code/.test(p)) return {kicker:'Use this result again',label:'Ask Gravity where this result could also create value',q:'How could the result from this tool also be useful in another Gravity workspace or restaurant process?'};
    if(/gravity-assist/.test(p)) return {kicker:'Connect the work',label:'Ask Gravity how one tool here could also solve another restaurant problem',q:'Which Gravity Assist tool should I use first, and how could the result also help with another restaurant problem?'};
    if(p==='/books'||/quiet-gravity|the-owners-chair|systems-of-service/.test(p)) return {kicker:'Put the idea to work',label:'Ask Gravity how this book could also help solve an operating problem',q:'How could the ideas in this book also help me solve a practical operating or management problem in my restaurant?'};
    var h=document.querySelector('main h1');
    var t=h&&h.textContent?h.textContent.trim():'';
    return {kicker:'Another way this could help',label:'Ask Gravity how this could also be useful somewhere else in your restaurant',q:t?('How could the work on '+t+' also be useful somewhere else in my restaurant, and what is the most likely next connection?'):'How could this part of Gravity also be useful somewhere else in my restaurant?'};
  }
  function readerPrompt(){
    var sel=document.getElementById('reader-book');
    var id=sel&&sel.value?sel.value:'';
    var map={
      'quiet-gravity':{label:'Ask Gravity how Quiet Gravity could also help develop your managers',q:'How could Quiet Gravity also help me develop stronger restaurant managers and leadership habits?'},
      'owners-chair':{label:'Ask Gravity how The Owner’s Chair could also clarify management responsibility',q:'How could The Owner’s Chair also help me clarify owner, GM, and manager responsibilities in my restaurant?'},
      'systems-of-service':{label:'Ask Gravity how Systems of Service could also improve your next shift plan',q:'How could Systems of Service also help me improve planning and execution for my next shift?'},
      'employee-training-sop-tracker':{label:'Ask Gravity how this training system could also strengthen SOP follow-through',q:'How could the Employee Training & SOP Tracker also strengthen SOP follow-through and manager verification?'},
      'labor-control-scheduling-planner':{label:'Ask Gravity how this planner could also improve labor-cost control',q:'How could the Labor Control & Scheduling Planner also help me improve labor-cost control and staffing decisions?'},
      'sop-station-operations-builder':{label:'Ask Gravity how this SOP work could also improve employee training',q:'How could the SOP & Station Operations Builder also improve employee training and station consistency?'},
      'food-cost-waste-inventory':{label:'Ask Gravity how this could also improve purchasing and inventory',q:'How could the Food Cost, Waste & Inventory work also improve purchasing, pars, and recipe decisions?'},
      'hiring-retention':{label:'Ask Gravity how this could also improve onboarding and retention',q:'How could the Hiring, Interviewing & Retention system also improve onboarding, training, and early retention?'},
      'guest-recovery':{label:'Ask Gravity how this could also strengthen service standards and coaching',q:'How could the Guest Recovery workbook also strengthen service standards, employee coaching, and manager follow-up?'},
      'ai-prompts':{label:'Ask Gravity how these prompts could also solve a current operating problem',q:'How could these AI prompts also help me solve a current operating problem in my restaurant?'},
      'sop-library-v1':{label:'Ask Gravity how this SOP library could also strengthen training and inspections',q:'How could SOP Library Volume 1 also strengthen training, inspections, and manager verification?'},
      'sop-library-v2':{label:'Ask Gravity how this SOP library could also strengthen training and inspections',q:'How could SOP Library Volume 2 also strengthen training, inspections, and manager verification?'},
      'sop-library-v3':{label:'Ask Gravity how this SOP library could also strengthen specialty training and controls',q:'How could SOP Library Volume 3 also strengthen specialty training, controls, and verification?'}
    };
    return Object.assign({kicker:'Put what you read to work'},map[id]||{label:'Ask Gravity how what you read could also help solve a restaurant problem',q:'How could what I am reading in the Gravity Book Reader also help me solve a practical restaurant problem?'});
  }
  function openGuide(q){
    var launch=document.getElementById('gravity-guide-launcher');
    var panel=document.getElementById('gravity-guide-panel');
    if(launch) launch.click(); else if(panel) panel.hidden=false;
    setTimeout(function(){
      var input=document.getElementById('gravity-guide-input');
      var form=document.getElementById('gravity-guide-form');
      if(input){input.value=q;input.focus();}
      if(form&&input){try{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));}catch(_){}}
    },40);
    return true;
  }
  function applyPrompt(bar){
    var x=nextValuePrompt();
    var k=bar.querySelector('.gravity-context-ask-kicker');
    var a=bar.querySelector('.gravity-context-ask-link');
    if(k) k.textContent=x.kicker;
    if(a){a.textContent=x.label;a.dataset.gravityQuestion=x.q;}
  }
  function install(){
    if(!['/gravity-assist','/book-reader'].includes(path().replace(/\.html$/,''))) return;
    if(document.querySelector('.gravity-context-ask')) return;
    var main=document.querySelector('main'); if(!main) return;
    var bar=document.createElement('div');bar.className='gravity-context-ask';
    bar.innerHTML='<div class="gravity-context-ask-inner"><span class="gravity-context-ask-kicker"></span><a href="#gravity-guide-root" class="gravity-context-ask-link"></a></div>';
    var a=bar.querySelector('a');
    a.addEventListener('click',function(e){e.preventDefault();openGuide(a.dataset.gravityQuestion||'How could this also help somewhere else in my restaurant?');});
    main.appendChild(bar);
    applyPrompt(bar);
    if(path()==='/book-reader'){
      var sel=document.getElementById('reader-book');
      if(sel) sel.addEventListener('change',function(){applyPrompt(bar);});
      window.addEventListener('gravity-reader-book-changed',function(){applyPrompt(bar);});
    }
    if(!document.getElementById('gravity-context-ask-style')){
      var s=document.createElement('style');s.id='gravity-context-ask-style';
      s.textContent='.gravity-context-ask{border-bottom:1px solid #d8c59a;background:#fbf7ee}.gravity-context-ask-inner{max-width:1180px;margin:0 auto;padding:11px 22px;display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;text-align:center}.gravity-context-ask-kicker{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#655a49;font-weight:700}.gravity-context-ask-link{display:inline-block;font-weight:800;color:#7b1e1e;text-decoration:none;border-bottom:1px solid currentColor;padding:2px 0}.gravity-context-ask-link:hover,.gravity-context-ask-link:focus{color:#421111}.gravity-context-ask-link:focus-visible{outline:2px solid #7b1e1e;outline-offset:4px}@media(max-width:600px){.gravity-context-ask-inner{padding:10px 16px;gap:6px}.gravity-context-ask-kicker{width:100%;font-size:11px}.gravity-context-ask-link{font-size:14px}}';
      document.head.appendChild(s);
    }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install); else install();
})();

/* Consistent page and section entry, without replacing Back/Forward restoration. */
(()=>{'use strict';
 const navEntry=performance.getEntriesByType?.('navigation')?.[0],backForward=navEntry?.type==='back_forward';
 let userMoved=false;
 ['wheel','touchstart','pointerdown','keydown'].forEach(type=>window.addEventListener(type,()=>{userMoved=true},{passive:true,once:true}));
 const header=document.querySelector('.site-header');
 function setOffset(){const style=header?getComputedStyle(header):null;const height=style&&['sticky','fixed'].includes(style.position)?header.getBoundingClientRect().height:0;document.documentElement.style.setProperty('--gravity-anchor-offset',(Math.ceil(height)+18)+'px');const menu=document.querySelector('[data-menu]');if(menu&&window.innerWidth<=1180){const top=Math.max(0,menu.getBoundingClientRect().top||header?.getBoundingClientRect().bottom||0);menu.style.maxHeight=Math.max(120,window.innerHeight-top-16)+'px';menu.style.overflowY='auto'}else if(menu){menu.style.removeProperty('max-height');menu.style.removeProperty('overflow-y')}}
 const style=document.createElement('style');style.textContent='[id]{scroll-margin-top:var(--gravity-anchor-offset,100px)}';document.head.appendChild(style);
 function guide(){document.querySelector('#gravity-guide-launcher')?.click();}
 function land(){setOffset();if(location.hash==='#gravity-guide-root'){guide();return}if(location.hash){let id;try{id=decodeURIComponent(location.hash.slice(1))}catch(e){return}const target=document.getElementById(id);if(target){let node=target;while(node){if(node.tagName==='DETAILS')node.open=true;node=node.parentElement;}target.querySelector(':scope > .container > details.gravity-more')?.setAttribute('open','');target.scrollIntoView({block:'start',behavior:'instant'});}}else window.scrollTo({top:0,left:0,behavior:'instant'});}
 window.addEventListener('pageshow',e=>{if(!e.persisted&&!backForward&&!userMoved)requestAnimationFrame(land)});
 window.addEventListener('hashchange',()=>requestAnimationFrame(land));
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const url=new URL(a.href,location.href);if(url.origin===location.origin&&url.pathname===location.pathname&&url.hash==='#gravity-guide-root'){e.preventDefault();guide();return}if(url.origin===location.origin&&url.pathname===location.pathname&&url.hash&&url.hash===location.hash){e.preventDefault();land();}});
 window.addEventListener('resize',setOffset);document.querySelector('[data-menu-toggle]')?.addEventListener('click',()=>requestAnimationFrame(setOffset));
 if(header&&window.ResizeObserver)new ResizeObserver(setOffset).observe(header);setOffset();
})();

/* Reveal optional detail for printing, then restore the visitor's view. */
(()=>{let opened=[];window.addEventListener('beforeprint',()=>{opened=[...document.querySelectorAll('details:not([open])')];opened.forEach(d=>d.open=true)});window.addEventListener('afterprint',()=>{opened.forEach(d=>d.open=false);opened=[]})})();

/* GRAVITY FINAL POLISH 2026-10-14 */
(function(){
'use strict';
function p(){return(location.pathname||'/').replace(/\.html$/i,'')||'/'}
function nav(){document.querySelectorAll('#site-nav,nav[data-menu]').forEach(function(n){if(n.querySelector('a[href="/windows-programs"]'))return;var a=document.createElement('a');a.href='/windows-programs';a.textContent='Windows Programs';var s=n.querySelector('a[href="/start-here"]');n.insertBefore(a,s||null)})}
function sec(id,cls,html){var s=document.createElement('section');s.id=id;s.className=cls;s.innerHTML='<div class="container">'+html+'</div>';return s}
function invites(){var x=p();if((x==='/'||x==='/index')&&!document.getElementById('gravity-beta-test-invite')){var h=document.querySelector('main .hero');if(h)h.insertAdjacentElement('afterend',sec('gravity-beta-test-invite','gravity-beta-invite','<div class="gravity-beta-invite-card"><div class="eyebrow">A personal request from Thomas Butler</div><h2>Help me test the Gravity Windows programs.</h2><p>I have spent a lot of time building these tools for real restaurant work. Before I call them finished, I need restaurant owners and managers to use them the way you actually work and tell me where they help, where they slow you down, and what breaks.</p><p><strong>Four Windows Betas are available for testing:</strong> Gravity SOP Foundry, Gravity Shift Lab, Gravity Inventory Center, and Gravity Work Study Lab. Founding Year access is $0 through October 1, 2027.</p><div class="gravity-beta-actions"><a class="btn btn-primary" href="/windows-programs">Help Test the Windows Betas</a><a class="btn btn-outline light" href="/contact">Tell Thomas What You Find</a></div></div>'))}
if(x==='/gravity-assist'&&!document.getElementById('gravity-assist-windows-invite')){var a=document.querySelector('.ga-hero');if(a)a.insertAdjacentElement('afterend',sec('gravity-assist-windows-invite','gravity-beta-compact','<div class="gravity-beta-compact-card"><div><strong>Want the desktop versions?</strong><p>SOP Foundry, Shift Lab, Inventory Center, and Work Study Lab also have Windows x64 Betas. I am actively looking for restaurant operators to test them.</p></div><a class="btn btn-primary" href="/windows-programs">Windows Programs</a></div>'))}
if(x==='/windows-programs'&&!document.getElementById('gravity-windows-test-request')){var w=document.querySelector('.nl-hero,.page-hero');if(w)w.insertAdjacentElement('afterend',sec('gravity-windows-test-request','gravity-beta-invite gravity-beta-invite-windows','<div class="gravity-beta-invite-card"><div class="eyebrow">Beta testing matters</div><h2>Please put one of these programs through a real restaurant workflow.</h2><p>Try a small, real task first. If something is confusing, takes too many steps, displays incorrectly, or fails, I want to know about it. Your testing will help decide what gets corrected before these programs move beyond Beta.</p><div class="gravity-beta-actions"><a class="btn btn-primary" href="#main">Choose a Program Below</a><a class="btn btn-outline light" href="/contact">Report a Test Result</a></div></div>'))}
if(/^\/gravity-(sop-foundry|shift-lab|inventory-center)$/.test(x)){var c=document.querySelector('#windows-beta .content-card');if(c&&!c.querySelector('.gravity-beta-test-note')){var n=document.createElement('div');n.className='gravity-beta-test-note';n.innerHTML='<strong>Help test this Windows Beta.</strong><p>Use a small real workflow, note anything confusing or broken, and tell me what happened. Restaurant testing is what I need most before this moves beyond Beta.</p><a href="/contact">Send testing feedback →</a>';var q=c.querySelector('h2,h3');if(q)q.insertAdjacentElement('afterend',n);else c.insertBefore(n,c.firstChild)}}}
var o=document.createElement('div');o.className='gravity-help-overlay';o.setAttribute('role','tooltip');o.hidden=true;document.body.appendChild(o);var t=null;
function pos(){if(!t||o.hidden)return;var r=t.getBoundingClientRect(),m=12;o.style.maxWidth=Math.min(360,innerWidth-m*2)+'px';o.style.width='max-content';var b=o.getBoundingClientRect(),l=r.left+r.width/2-b.width/2;l=Math.max(m,Math.min(l,innerWidth-b.width-m));var y=r.top-b.height-10;if(y<m)y=r.bottom+10;if(y+b.height>innerHeight-m)y=Math.max(m,innerHeight-b.height-m);o.style.left=Math.round(l)+'px';o.style.top=Math.round(y)+'px'}
function show(e){if(!e)return;var h=e.getAttribute('data-help');if(!h)return;t=e;o.textContent=h;o.hidden=false;requestAnimationFrame(pos)}
function hide(force){if(!t)return;if(!force&&t.classList.contains('is-open'))return;o.hidden=true;t=null}
document.addEventListener('mouseover',function(e){var a=e.target&&e.target.closest?e.target.closest('.gravity-help-tip'):null;if(a)show(a)});document.addEventListener('mouseout',function(e){var a=e.target&&e.target.closest?e.target.closest('.gravity-help-tip'):null;if(a&&(!e.relatedTarget||!a.contains(e.relatedTarget)))hide(false)});document.addEventListener('focusin',function(e){var a=e.target&&e.target.closest?e.target.closest('.gravity-help-tip'):null;if(a)show(a)});document.addEventListener('focusout',function(e){if(e.target&&e.target.closest&&e.target.closest('.gravity-help-tip'))hide(false)});document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('.gravity-help-tip'):null;if(a)setTimeout(function(){a.classList.contains('is-open')?show(a):hide(true)},0);else hide(true)});document.addEventListener('keydown',function(e){if(e.key==='Escape')hide(true)});addEventListener('resize',pos);addEventListener('scroll',pos,true);nav();invites();
})();


/* GRAVITY TESTING ROOM NAV 2026-10-14 */
(function(){function add(){document.querySelectorAll('#site-nav,nav[data-menu]').forEach(function(nav){if(nav.querySelector('a[href="/testing-room"]'))return;var a=document.createElement('a');a.href='/testing-room';a.textContent='Testing Room';var win=nav.querySelector('a[href="/windows-programs"]');if(win&&win.nextSibling)nav.insertBefore(a,win.nextSibling);else{var start=nav.querySelector('a[href="/start-here"]');nav.insertBefore(a,start||null)}});var invite=document.getElementById('gravity-beta-test-invite');if(invite&&!invite.querySelector('a[href="/testing-room"]')){var acts=invite.querySelector('.gravity-beta-actions');if(acts){var a=document.createElement('a');a.className='btn btn-outline light';a.href='/testing-room';a.textContent='Join the Testing Room';acts.insertBefore(a,acts.lastElementChild)}}if(location.pathname.replace(/\.html$/,'')==='/windows-programs'&&!document.getElementById('gravity-testing-room-link')){var hero=document.querySelector('.nl-hero,.page-hero');if(hero){var s=document.createElement('section');s.id='gravity-testing-room-link';s.className='gravity-beta-compact';s.innerHTML='<div class="container"><div class="gravity-beta-compact-card"><div><strong>Want to help shape Gravity?</strong><p>Open the Testing Room to message Thomas, report a problem or idea, schedule a chat, or collaborate with other testers.</p></div><a class="btn btn-primary" href="/testing-room">Open Testing Room</a></div></div>';hero.insertAdjacentElement('afterend',s)}}document.querySelectorAll('.gravity-beta-test-note').forEach(function(n){if(!n.querySelector('a[href="/testing-room"]')){var a=document.createElement('a');a.href='/testing-room';a.textContent=' Open the Testing Room →';a.style.marginLeft='8px';n.appendChild(a)}})}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',add);else add()})();

/* Open the actual SOP Foundry room chooser from the main website menu.
   Preserve /gravity-sop-foundry as the information, manuals, and downloads page. */
(function(){function apply(){document.querySelectorAll('#site-nav a[href="/gravity-sop-foundry"],nav[data-menu] a[href="/gravity-sop-foundry"]').forEach(function(a){a.href='/apps/sop-foundry/access';});}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();})();


/* Show the current Gravity room in the shared top banner. */
(function () {
  function addRoomLabel() {
    var header = document.querySelector('.site-header');
    if (!header || header.querySelector('.gravity-current-room')) return;
    var path = location.pathname.replace(/\\/$/, '').replace(/\\.html$/, '');
    if (!path || path === '/' || path === '/index') return;
    var workspace = document.body.getAttribute('data-workspace');
    var isRoom = !!workspace || /^\\/apps\\//.test(path) || /(?:room|lab|studio|center|foundry|gravity-aware|gravity-assist|inventory|shift-lab|work-study)/.test(path);
    if (!isRoom) return;
    var heading = document.querySelector('main h1, #main h1, .page-hero h1');
    var current = document.querySelector('#site-nav a[aria-current="page"]');
    var label = current ? current.textContent.trim() : (heading ? heading.textContent.trim() : '');
    if (!label) {
      label = path.split('/').filter(Boolean).pop().replace(/[-_]/g, ' ').replace(/\\b\\w/g, function(c){ return c.toUpperCase(); });
    }
    label = label.replace(/\\s+/g, ' ').trim().slice(0, 90);
    if (!label) return;
    var banner = document.createElement('div');
    banner.className = 'gravity-current-room';
    banner.setAttribute('aria-label', 'Current room');
    banner.style.cssText = 'background:#253c35;color:#fff;text-align:center;padding:8px 16px;font:600 14px/1.4 system-ui,Arial,sans-serif;letter-spacing:.02em;';
    var prefix = document.createElement('span');
    prefix.textContent = 'YOU ARE IN: ';
    prefix.style.cssText = 'opacity:.8;font-size:11px;letter-spacing:.09em;margin-right:7px;';
    banner.appendChild(prefix);
    banner.appendChild(document.createTextNode(label));
    header.appendChild(banner);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addRoomLabel, {once:true});
  else addRoomLabel();
})();
