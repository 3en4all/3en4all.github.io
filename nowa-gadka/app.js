const form = document.querySelector('#feedback-form');
const emailInput = document.querySelector('#email');
const emailError = document.querySelector('#email-error');
const ratingError = document.querySelector('#rating-error');
const formStatus = document.querySelector('#form-status');

const allowedTlds = new Set([
  'pl', 'com', 'org', 'net', 'eu', 'info', 'io', 'me', 'de', 'uk', 'fr', 'cz',
  'sk', 'nl', 'dev', 'app', 'online', 'site', 'pro', 'biz', 'cloud', 'tech'
]);

const disposableDomains = new Set([
  '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.com',
  'temp-mail.org', 'yopmail.com', 'sharklasers.com', 'throwawaymail.com'
]);

function basicEmailCheck(value) {
  const normalized = value.trim().toLowerCase();
  if (!/^[^\s@]+@([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(normalized)) {
    return { ok: false, message: 'Wpisz poprawny adres e-mail.' };
  }

  const domain = normalized.split('@')[1];
  const tld = domain.split('.').at(-1);
  if (!allowedTlds.has(tld)) {
    return { ok: false, message: 'Nie rozpoznajemy tej końcówki domeny.' };
  }
  if (disposableDomains.has(domain)) {
    return { ok: false, message: 'Adresy tymczasowe nie są akceptowane.' };
  }
  return { ok: true, domain };
}

async function domainHasMailServer(domain) {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`;
  const response = await fetch(url, { headers: { accept: 'application/dns-json' } });
  if (!response.ok) throw new Error('dns-unavailable');
  const result = await response.json();
  return result.Status === 0 && Array.isArray(result.Answer) && result.Answer.length > 0;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  emailError.textContent = '';
  ratingError.textContent = '';
  formStatus.textContent = '';

  const emailCheck = basicEmailCheck(emailInput.value);
  const rating = form.querySelector('input[name="rating"]:checked');
  let valid = true;

  if (!emailCheck.ok) {
    emailError.textContent = emailCheck.message;
    valid = false;
  }
  if (!rating) {
    ratingError.textContent = 'Wybierz ocenę od 1 do 5.';
    valid = false;
  }
  if (!valid) return;

  const button = form.querySelector('button');
  button.disabled = true;
  button.querySelector('span:first-child').textContent = 'Sprawdzam domenę…';

  try {
    const domainWorks = await domainHasMailServer(emailCheck.domain);
    if (!domainWorks) {
      emailError.textContent = 'Ta domena nie ma serwera pocztowego.';
      return;
    }
    formStatus.textContent = 'Adres i ocena są poprawne. W wersji docelowej dane zostaną teraz wysłane.';
    form.reset();
  } catch {
    formStatus.textContent = 'Format adresu jest poprawny, ale chwilowo nie udało się sprawdzić domeny DNS.';
  } finally {
    button.disabled = false;
    button.querySelector('span:first-child').textContent = 'Wyślij ocenę';
  }
});
