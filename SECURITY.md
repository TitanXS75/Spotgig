# Security Policy — Aaspass

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.x     | ✅ Yes    |
| < 1.0   | ❌ No     |

---

## Reporting a Vulnerability

If you discover a security vulnerability in Aaspass, please report it
**responsibly**. Do NOT create a public GitHub issue.

### How to Report

1. **Email**: Send details to `security@aaspass.in` (or the repo owner's email)
2. **Include**:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

### Response Timeline

| Stage | Timeline |
|-------|----------|
| Acknowledgment | Within 48 hours |
| Initial Assessment | Within 5 business days |
| Fix Released | Within 30 days (critical: 7 days) |

---

## Security Architecture

### Client-Side Security

- **No secrets in client code** — All `VITE_*` variables are public by design.
  The Supabase anon key cannot bypass RLS policies.
- **Input validation** — All forms validated with Zod schemas before submission.
- **XSS prevention** — React's JSX auto-escapes output. No `dangerouslySetInnerHTML`.
- **CSRF protection** — Supabase uses JWT tokens (not cookies) for auth.

### Server-Side Security

- **Row Level Security (RLS)** — Every Supabase table has RLS policies.
  Users can only access their own data. Live listings are publicly readable.
- **Edge Functions** — Secret operations (payment verification, image deletion)
  run server-side in Supabase Edge Functions (Deno).
- **HMAC Verification** — Razorpay webhook signatures verified server-side.

### Data Privacy

- **Location** — Exact GPS coordinates are never shown publicly.
  Only the area/neighborhood name is displayed to other users.
- **Passwords** — Handled entirely by Supabase Auth (bcrypt hashing).
  We never store or handle raw passwords.
- **Payment Data** — Card numbers and UPI details are handled by Razorpay.
  We only store transaction IDs and payment status.

---

## Known Security Boundaries

1. **Supabase Anon Key is Public** — This is by design. All data access
   is protected by RLS policies, not by key secrecy.
2. **Cloudinary Unsigned Uploads** — Uploads use an unsigned preset.
   This means anyone with the preset name could upload images. Mitigated
   by periodic cleanup and upload size limits.
3. **Admin Route** — `/adminauth75` is obscured but not cryptographically
   protected. Admin access is enforced by the `is_admin` flag in the
   `profiles` table (checked via RLS).

---

## Dependencies

We monitor dependencies for known vulnerabilities:

```bash
npm audit              # Check for known CVEs
npm audit fix          # Auto-fix compatible updates
```

### Key Dependencies Audited

| Package | Risk | Notes |
|---------|------|-------|
| `@supabase/supabase-js` | Low | Maintained by Supabase team |
| `react` | Low | Facebook/Meta maintained |
| `zod` | Low | Input validation library |
| `framer-motion` | Low | Animation library (no network access) |
| `leaflet` | Medium | Map library (loads external tiles) |
| `razorpay` | N/A | Loaded via CDN script tag |

---

## Best Practices for Contributors

1. **Never** commit `.env.local` or any file with real credentials
2. **Never** use `service_role` key in client-side code
3. **Always** add RLS policies when creating new tables
4. **Always** validate input with Zod before database operations
5. **Always** use Edge Functions for operations requiring secrets
6. **Never** log sensitive data (tokens, passwords, payment info)
7. **Always** run `npm audit` before submitting PRs
