const FORM_NAME = 'gravity-report-opt-in';
const BREVO_DOI_URL = 'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';
const CONFIRMED_URL = 'https://gravityleadershipsystem.com/gravity-report-confirmed';

function getSecret(name) {
  try {
    return Netlify.env.get(name);
  } catch {
    return undefined;
  }
}

export default {
  async formSubmitted(event) {
    const data = event?.data || {};
    if (data['form-name'] !== FORM_NAME) return;
    if (data['newsletter-consent'] !== 'yes') return;
    if (data['bot-field']) return;

    const email = String(data.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      console.warn('Gravity Report signup skipped: invalid email field.');
      return;
    }

    const apiKey = getSecret('BREVO_API_KEY');
    const listId = Number(getSecret('BREVO_REPORT_LIST_ID'));
    const templateId = Number(getSecret('BREVO_DOI_TEMPLATE_ID'));
    if (!apiKey || !Number.isSafeInteger(listId) || listId <= 0 || !Number.isSafeInteger(templateId) || templateId <= 0) {
      console.error('Gravity Report signup could not reach Brevo: required server settings are missing.');
      return;
    }

    try {
      const response = await fetch(BREVO_DOI_URL, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          email,
          includeListIds: [listId],
          redirectionUrl: CONFIRMED_URL,
          templateId,
          // The form asks for newsletter delivery consent, not open/click tracking.
          contactPixelTrackingConsent: false,
        }),
      });

      if (!response.ok) {
        console.error(`Gravity Report signup could not reach Brevo: HTTP ${response.status}.`);
      }
    } catch {
      console.error('Gravity Report signup could not reach Brevo: network request failed.');
    }
  },
};
