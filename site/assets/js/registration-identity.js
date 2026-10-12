// Gravity social registration — provider-aware Netlify Identity integration.
// Providers are read at runtime from Netlify Identity settings; no fake/dead provider buttons are shown.
import { getSettings, getUser, oauthLogin, handleAuthCallback, logout } from 'https://cdn.jsdelivr.net/npm/@netlify/identity@2.0.0/+esm';

const section = document.getElementById('gravity-social-registration');
const buttons = document.getElementById('gravity-social-buttons');
const status = document.getElementById('gravity-social-status');
const useEmail = document.getElementById('gravity-social-use-email');
const form = document.querySelector('form[name="gravity-registration"]');
if (!section || !buttons || !form) {
  // Registration markup is not present on this page.
} else {
  const firstName = document.getElementById('reg-first-name');
  const email = document.getElementById('reg-email');
  const method = document.getElementById('registration-method');
  const providerField = document.getElementById('registration-auth-provider');
  const pendingKey = 'gravity_social_registration_provider_v1';

  const providerOrder = ['google', 'facebook', 'github', 'gitlab', 'bitbucket'];
  const providerLabels = {
    google: 'Google',
    facebook: 'Facebook',
    github: 'GitHub',
    gitlab: 'GitLab',
    bitbucket: 'Bitbucket'
  };

  function analytics(eventName, params = {}) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', eventName, params);
    } catch (_) {}
  }

  function safeStorageGet(key) {
    try { return window.sessionStorage.getItem(key) || ''; } catch (_) { return ''; }
  }
  function safeStorageSet(key, value) {
    try { window.sessionStorage.setItem(key, value); } catch (_) {}
  }
  function safeStorageRemove(key) {
    try { window.sessionStorage.removeItem(key); } catch (_) {}
  }

  function userName(user) {
    const md = (user && (user.userMetadata || user.user_metadata)) || {};
    return (user && user.name) || md.full_name || md.name || '';
  }

  function applyUser(user, providerHint) {
    if (!user) return;
    const provider = (user.provider || providerHint || safeStorageGet(pendingKey) || 'social').toLowerCase();
    const full = userName(user).trim();
    if (firstName && !firstName.value && full) firstName.value = full.split(/\s+/)[0];
    if (email && user.email) {
      email.value = user.email;
      email.readOnly = true;
      email.setAttribute('aria-describedby', 'gravity-social-status');
    }
    if (method) method.value = `social_${provider}`;
    if (providerField) providerField.value = provider;
    if (status) {
      const label = providerLabels[provider] || provider.replace(/^./, c => c.toUpperCase());
      status.textContent = user.email ? `Connected with ${label}. Your email is prefilled. Finish the short restaurant questions below.` : `Connected with ${label}. Finish the short restaurant questions below.`;
      status.hidden = false;
    }
    if (useEmail) useEmail.hidden = false;
    section.hidden = false;
    safeStorageRemove(pendingKey);
    analytics('registration_social_return', { auth_provider: provider });
  }

  function addProviderButton(provider) {
    const label = providerLabels[provider] || provider.replace(/^./, c => c.toUpperCase());
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `gravity-social-btn gravity-social-${provider}`;
    button.setAttribute('data-provider', provider);
    button.innerHTML = `<span class="gravity-social-badge" aria-hidden="true">${label.charAt(0)}</span><span>Continue with ${label}</span>`;
    button.addEventListener('click', () => {
      safeStorageSet(pendingKey, provider);
      analytics('registration_social_start', { auth_provider: provider });
      try {
        oauthLogin(provider);
      } catch (error) {
        if (status) {
          status.textContent = 'That sign-in option is not available right now. You can still register with your email below.';
          status.hidden = false;
        }
        analytics('registration_social_error', { auth_provider: provider });
      }
    });
    buttons.appendChild(button);
  }

  async function start() {
    let callbackResult = null;
    try {
      callbackResult = await handleAuthCallback();
    } catch (_) {
      // No usable callback. The standard email form remains available.
    }

    let user = null;
    try { user = (callbackResult && callbackResult.user) || await getUser(); } catch (_) {}
    if (user) applyUser(user, safeStorageGet(pendingKey));

    try {
      const settings = await getSettings();
      const providers = settings && settings.providers ? settings.providers : {};
      const enabled = providerOrder.filter(p => providers[p] === true);
      if (enabled.length) {
        buttons.textContent = '';
        enabled.forEach(addProviderButton);
        section.hidden = false;
        analytics('registration_social_options_view', { provider_count: enabled.length });
      }
    } catch (_) {
      // Identity is not enabled/configured yet. Keep social area hidden and preserve email registration.
      if (!user) section.hidden = true;
    }
  }

  if (useEmail) {
    useEmail.addEventListener('click', async () => {
      try { await logout(); } catch (_) {}
      if (email) { email.readOnly = false; email.value = ''; email.removeAttribute('aria-describedby'); }
      if (firstName) firstName.value = '';
      if (method) method.value = 'email_form';
      if (providerField) providerField.value = 'email';
      if (status) status.hidden = true;
      useEmail.hidden = true;
      safeStorageRemove(pendingKey);
      analytics('registration_switch_to_email', {});
      if (email) email.focus();
    });
  }

  start();
}
