(function () {
  'use strict';
  var name = 'gravity_analytics_choice';
  var disabled = 'ga-disable-G-M98MZFED33';
  function choice() {
    try {
      var match = document.cookie.match(/(?:^|;\s*)gravity_analytics_choice=(allow|decline)(?:;|$)/);
      return match ? match[1] : '';
    } catch (_) { return ''; }
  }
  function allowed() {
    return choice() === 'allow' && navigator.doNotTrack !== '1' && window.doNotTrack !== '1' && !navigator.globalPrivacyControl;
  }
  window.gravityAllowsAnalytics = allowed;
  function sync() { window[disabled] = !allowed(); }
  sync();
  window.addEventListener('focus', sync);
  function clearAnalytics() {
    document.cookie.split(';').forEach(function (pair) {
      var key = pair.trim().split('=')[0];
      if (key !== '_ga' && !/^_ga_[A-Za-z0-9]+$/.test(key)) return;
      ['', '; Domain=' + location.hostname, '; Domain=gravityleadershipsystem.com'].forEach(function (domain) {
        document.cookie = key + '=; Max-Age=0; Path=/' + domain;
      });
    });
  }
  function render() {
    var settings = document.getElementById('analytics-settings');
    if (choice() && !settings) return;
    var panel = document.createElement('section');
    panel.setAttribute('aria-label', 'Analytics cookies');
    panel.className = 'gravity-cookie-choice';
    panel.innerHTML = '<p>Allow Gravity to use Google Analytics to count visits and learn which resources people use? <a href="/cookies">Cookie policy</a></p><button type="button" value="allow">Allow analytics</button> <button type="button" value="decline">Decline analytics</button><p role="status"></p>';
    var status = panel.querySelector('[role="status"]');
    if (settings) settings.appendChild(panel);
    else {
      var header = document.querySelector('header');
      if (header) header.after(panel);
      else document.body.prepend(panel);
    }
    function describe() { status.textContent = 'Analytics is ' + (allowed() ? 'on.' : 'off.'); }
    if (settings) describe();
    panel.addEventListener('click', function (e) {
      var value = e.target.value;
      if (value !== 'allow' && value !== 'decline') return;
      try { document.cookie = name + '=' + value + '; Max-Age=15552000; Path=/; SameSite=Lax; Secure'; } catch (_) {}
      sync();
      if (!allowed()) clearAnalytics();
      if (allowed()) window.dispatchEvent(new Event('gravity-analytics-allowed'));
      describe();
      if (!settings && choice()) panel.remove();
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, {once:true});
  else render();
})();
