/**
 * OWASP Top 10 (2021) vulnerability definitions.
 * Used to categorize and describe potential security issues found during scanning.
 */

export const OWASP_CATEGORIES = [
  {
    id: 'A01',
    name: 'Broken Access Control',
    description:
      'Access control enforces policy such that users cannot act outside of their intended permissions.',
    checks: [
      'Directory traversal exposure',
      'Admin panel accessible without authentication',
      'Insecure direct object references (IDOR)',
      'CORS misconfiguration allowing unauthorized origins',
      'Missing function-level access control',
    ],
  },
  {
    id: 'A02',
    name: 'Cryptographic Failures',
    description:
      'Failures related to cryptography that often lead to sensitive data exposure.',
    checks: [
      'HTTP used instead of HTTPS',
      'Weak TLS/SSL configuration (TLS 1.0/1.1 supported)',
      'Sensitive data in URL parameters',
      'Weak cipher suites enabled',
      'Missing HSTS header',
    ],
  },
  {
    id: 'A03',
    name: 'Injection',
    description:
      'Injection flaws occur when untrusted data is sent to an interpreter as part of a command or query.',
    checks: [
      'SQL injection in query parameters',
      'Cross-Site Scripting (XSS) in form inputs',
      'Command injection via file upload',
      'LDAP injection in authentication fields',
      'XML/JSON injection in API endpoints',
    ],
  },
  {
    id: 'A04',
    name: 'Insecure Design',
    description:
      'Risks related to design and architectural flaws, distinct from implementation defects.',
    checks: [
      'Missing rate limiting on authentication endpoints',
      'Predictable resource identifiers',
      'Business logic bypass opportunities',
      'Lack of anti-automation controls',
      'Missing defense-in-depth mechanisms',
    ],
  },
  {
    id: 'A05',
    name: 'Security Misconfiguration',
    description:
      'Security misconfiguration is the most commonly seen issue, often due to default configurations.',
    checks: [
      'Default credentials on admin interfaces',
      'Verbose error messages exposing stack traces',
      'Unnecessary features/services enabled',
      'Missing security headers (CSP, X-Frame-Options, etc.)',
      'Open cloud storage buckets',
    ],
  },
  {
    id: 'A06',
    name: 'Vulnerable Components',
    description:
      'Components with known vulnerabilities may undermine application defenses.',
    checks: [
      'Outdated JavaScript libraries (jQuery, React, etc.)',
      'Server software with known CVEs',
      'Unpatched CMS plugins/themes',
      'End-of-life framework versions in use',
      'Missing software composition analysis',
    ],
  },
  {
    id: 'A07',
    name: 'Identification & Authentication Failures',
    description:
      'Confirmation of the user\'s identity, authentication, and session management is critical.',
    checks: [
      'Weak password policy',
      'Missing multi-factor authentication',
      'Session tokens in URL',
      'Predictable session identifiers',
      'Missing account lockout after failed attempts',
    ],
  },
  {
    id: 'A08',
    name: 'Software & Data Integrity Failures',
    description:
      'Code and infrastructure that does not protect against integrity violations.',
    checks: [
      'Unverified software update mechanism',
      'Insecure deserialization',
      'Missing Subresource Integrity (SRI) on CDN assets',
      'CI/CD pipeline without integrity checks',
      'Auto-update from untrusted sources',
    ],
  },
  {
    id: 'A09',
    name: 'Security Logging & Monitoring Failures',
    description:
      'Insufficient logging and monitoring allows attackers to further attack systems.',
    checks: [
      'No audit logging for authentication events',
      'Logs containing sensitive data',
      'Missing alerting on suspicious activity',
      'Log files publicly accessible',
      'Insufficient log retention period',
    ],
  },
  {
    id: 'A10',
    name: 'Server-Side Request Forgery (SSRF)',
    description:
      'SSRF flaws occur when a web application fetches a remote resource without validating the user-supplied URL.',
    checks: [
      'URL parameters used in server-side fetch calls',
      'Webhooks without URL allowlist',
      'PDF/image generators accepting external URLs',
      'Import/export features with external URL support',
      'Blind SSRF via out-of-band interactions',
    ],
  },
];

export const SEVERITY_LEVELS = {
  CRITICAL: { label: 'Critical', color: 'red', weight: 40 },
  HIGH: { label: 'High', color: 'orange', weight: 30 },
  MEDIUM: { label: 'Medium', color: 'yellow', weight: 20 },
  LOW: { label: 'Low', color: 'blue', weight: 10 },
  INFO: { label: 'Info', color: 'gray', weight: 0 },
};
