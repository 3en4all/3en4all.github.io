# Security Policy

## Scope

This repository hosts a static personal portfolio site (TechM8) served via
GitHub Pages, backed by a Supabase project for form submissions and content.
There are no versioned releases — the `main` branch is always the live,
currently deployed version.

## Reporting a Vulnerability

If you discover a security issue (e.g. exposed credentials, an XSS vector,
a misconfigured Supabase policy, or anything that could expose visitor
data), please report it privately rather than opening a public issue:

- **Preferred:** open a [private security advisory](../../security/advisories/new)
  on this repository (GitHub Security tab → "Report a vulnerability").
- **Alternative:** email jacekgrodnicki@[YOUR_DOMAIN] — replace with a real
  contact address you check.

Please include steps to reproduce and, if relevant, which endpoint or file
is affected. I aim to acknowledge reports within a few days and to fix
confirmed issues promptly, since this is a single-maintainer project run in
my spare time — response times won't match a commercial SLA.

## Notes

- This site does not process payments or store highly sensitive personal
  data. Contact form submissions (name, email, message) are stored in
  Supabase; access is restricted via Row Level Security policies.
- API keys visible in client-side code (e.g. the Supabase anon key) are
  intentionally public and are not, by themselves, a vulnerability — please
  check whether the underlying RLS policy is actually misconfigured before
  reporting a key as "exposed."
