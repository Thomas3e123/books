(function () {
  'use strict';
  var form = document.getElementById('gravity-support-request');
  if (!form) return;
  var button = document.getElementById('support-submit');
  var status = document.getElementById('support-submission-status');
  var refInput = document.getElementById('support-case-reference');
  var timestampInput = document.getElementById('support-submitted-at');
  var busy = false;
  var LAST_REF = 'gravity_support_last_accepted_reference_v1';

  // A client-created tracking reference permits deduplication and follow-up.
  // It is NOT a server-assigned case number or a promise of staff handling.
  function reference() {
    if (!window.crypto || !window.crypto.getRandomValues) {
      throw new Error('This browser cannot create a safe support reference.');
    }
    var random = new Uint8Array(8);
    window.crypto.getRandomValues(random);
    var suffix = Array.from(random, function (n) { return n.toString(16).padStart(2, '0'); }).join('').toUpperCase();
    var day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return 'GRV-SUP-' + day + '-' + suffix;
  }

  try {
    var last = window.sessionStorage.getItem(LAST_REF);
    if (last && /^GRV-SUP-\d{8}-[A-F0-9]{16}$/.test(last)) {
      status.textContent = 'Last support reference from this browser tab: ' + last + '. Save it for follow-up.';
    }
  } catch (_) {}

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (busy || !form.reportValidity()) return;
    busy = true;
    button.disabled = true;
    var previousLabel = button.textContent;
    button.textContent = 'Sending Request…';
    status.textContent = 'Submitting securely to Gravity…';

    try {
      // Keep the same reference on a retry when a prior response was uncertain.
      if (!refInput.value) refInput.value = reference();
      if (!timestampInput.value) timestampInput.value = new Date().toISOString();
      var payload = new URLSearchParams(new FormData(form));
      payload.set('form-name', 'gravity-support-request');
      var controller = new AbortController();
      var timeout = window.setTimeout(function () { controller.abort(); }, 20000);
      var response;
      try {
        response = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          credentials: 'same-origin',
          body: payload.toString(),
          signal: controller.signal
        });
      } finally {
        window.clearTimeout(timeout);
      }
      if (!response.ok) throw new Error('The website returned HTTP ' + response.status + '.');

      var acceptedReference = refInput.value;
      form.reset();
      // A successful response means the website accepted the POST; it does not
      // independently verify staff routing, a notification or an SLA.
      status.textContent = 'Your support request was accepted by the website. Reference: ' +
        acceptedReference + '. Save this reference for follow-up. This is not an assigned Control Room case or a guaranteed response time.';
      try { window.sessionStorage.setItem(LAST_REF, acceptedReference); } catch (_) {}
      if (typeof window.gravityAnalyticsEvent === 'function') {
        window.gravityAnalyticsEvent('gravity_support_request_accepted', { source: 'help_center' });
      }
    } catch (error) {
      console.error('Gravity support request not confirmed:', error);
      status.textContent = 'Your support request could not be confirmed. Your answers are still here. Check your connection and try again, or select Use Email Instead. Do not assume it was received.';
    } finally {
      busy = false;
      button.disabled = false;
      button.textContent = previousLabel;
    }
  });
})();
