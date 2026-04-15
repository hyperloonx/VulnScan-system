import { OWASP_CATEGORIES, SEVERITY_LEVELS } from './owasp.js';

/**
 * Deterministically derives a pseudo-random float in [0, 1) from a seed string and a salt.
 * This keeps results consistent for the same domain across re-scans.
 */
function seededRandom(seed, salt = '') {
  const str = seed + salt;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32-bit integer
  }
  // Bring into [0, 1)
  return Math.abs(hash % 1000) / 1000;
}

/**
 * Assign a severity level based on the OWASP category and a random factor.
 */
function assignSeverity(categoryId, checkIndex, rand) {
  // Some categories are inherently higher risk
  const highRiskCategories = ['A01', 'A02', 'A03', 'A07'];
  const medRiskCategories = ['A04', 'A05', 'A06'];

  if (highRiskCategories.includes(categoryId)) {
    if (rand < 0.25) return 'CRITICAL';
    if (rand < 0.55) return 'HIGH';
    if (rand < 0.8) return 'MEDIUM';
    return 'LOW';
  }
  if (medRiskCategories.includes(categoryId)) {
    if (rand < 0.1) return 'CRITICAL';
    if (rand < 0.4) return 'HIGH';
    if (rand < 0.7) return 'MEDIUM';
    return 'LOW';
  }
  // Lower risk categories
  if (rand < 0.05) return 'CRITICAL';
  if (rand < 0.25) return 'HIGH';
  if (rand < 0.6) return 'MEDIUM';
  if (rand < 0.85) return 'LOW';
  return 'INFO';
}

/**
 * Decide whether a particular check is "found" for the given domain.
 * Uses seeded randomness so results are reproducible.
 */
function isCheckFound(domain, categoryId, checkIndex) {
  const rand = seededRandom(domain, `${categoryId}-${checkIndex}-found`);
  // ~40% chance any given check fires
  return rand < 0.4;
}

/**
 * Calculate a composite security score (0-100, higher = more secure).
 */
function calculateScore(findings) {
  if (findings.length === 0) return 98;

  const severityWeights = {
    CRITICAL: 25,
    HIGH: 15,
    MEDIUM: 7,
    LOW: 3,
    INFO: 1,
  };

  const totalDeduction = findings.reduce((sum, f) => {
    return sum + (severityWeights[f.severity] || 0);
  }, 0);

  return Math.max(0, Math.min(100, 100 - totalDeduction));
}

/**
 * Simulate a realistic scan of the target domain.
 * Returns a promise that resolves to the full scan result after a realistic delay.
 *
 * @param {string} domain - The target domain to scan.
 * @param {function} onProgress - Callback called with (step, totalSteps, message) during scan.
 * @returns {Promise<ScanResult>}
 */
export async function runScan(domain, onProgress) {
  const findings = [];
  const totalSteps = OWASP_CATEGORIES.length + 3; // +3 for init, header check, summary
  let currentStep = 0;

  const advance = async (message, delay = 400) => {
    currentStep++;
    onProgress(currentStep, totalSteps, message);
    await new Promise((r) => setTimeout(r, delay));
  };

  // Initialization
  await advance(`Initializing scan for ${domain}...`, 600);
  await advance('Performing DNS enumeration and host discovery...', 700);

  // Scan each OWASP category
  for (const category of OWASP_CATEGORIES) {
    await advance(`Checking ${category.id}: ${category.name}...`, 300 + seededRandom(domain, category.id) * 400);

    category.checks.forEach((check, idx) => {
      if (isCheckFound(domain, category.id, idx)) {
        const rand = seededRandom(domain, `${category.id}-${idx}-severity`);
        const severity = assignSeverity(category.id, idx, rand);
        findings.push({
          id: `${category.id}-${idx}`,
          category: category.name,
          categoryId: category.id,
          title: check,
          severity,
          severityMeta: SEVERITY_LEVELS[severity],
          description: buildDescription(check, severity),
          remediation: buildRemediation(check, category.id),
          cvssScore: buildCvssScore(severity, rand),
          references: buildReferences(category.id),
        });
      }
    });
  }

  await advance('Consolidating results and generating report...', 500);

  const score = calculateScore(findings);
  const severityCounts = findings.reduce(
    (acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    },
    { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 }
  );

  return {
    domain,
    scannedAt: new Date().toISOString(),
    score,
    grade: scoreToGrade(score),
    findings,
    severityCounts,
    totalFindings: findings.length,
    scanDuration: `${(2 + seededRandom(domain, 'duration') * 3).toFixed(1)}s`,
  };
}

function scoreToGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
}

function buildCvssScore(severity, rand) {
  const ranges = {
    CRITICAL: [9.0, 10.0],
    HIGH: [7.0, 8.9],
    MEDIUM: [4.0, 6.9],
    LOW: [0.1, 3.9],
    INFO: [0.0, 0.0],
  };
  const [min, max] = ranges[severity] || [0, 0];
  return (min + rand * (max - min)).toFixed(1);
}

function buildDescription(check, severity) {
  const descriptions = {
    'HTTP used instead of HTTPS':
      'The target serves content over unencrypted HTTP, exposing all data in transit to eavesdropping and man-in-the-middle attacks.',
    'Missing HSTS header':
      'HTTP Strict Transport Security (HSTS) is not set, allowing browsers to connect over HTTP and enabling SSL-stripping attacks.',
    'SQL injection in query parameters':
      'User-supplied input in URL query parameters is not properly sanitized, potentially allowing attackers to manipulate database queries.',
    'Cross-Site Scripting (XSS) in form inputs':
      'Form fields reflect user input without proper encoding, enabling injection of malicious scripts into pages viewed by other users.',
    'Missing security headers (CSP, X-Frame-Options, etc.)':
      'Critical HTTP security headers are absent, leaving the application vulnerable to clickjacking, MIME sniffing, and content injection attacks.',
    'Weak password policy':
      'The application accepts short or simple passwords, making brute-force attacks significantly more feasible.',
    'Missing multi-factor authentication':
      'Authentication relies solely on passwords without a second factor, increasing the impact of credential compromise.',
  };
  return (
    descriptions[check] ||
    `The "${check}" check detected a potential ${severity.toLowerCase()} security issue that should be reviewed and addressed by the development team.`
  );
}

function buildRemediation(check, categoryId) {
  const remediations = {
    A01: 'Implement strict access control lists. Deny access by default and grant only the minimum required permissions. Use server-side authorization checks for every sensitive operation.',
    A02: 'Enforce HTTPS site-wide with HSTS. Disable TLS 1.0/1.1 and weak cipher suites. Never transmit sensitive data in URLs.',
    A03: 'Use parameterized queries and prepared statements. Encode all output appropriately for its context. Apply input validation with an allowlist approach.',
    A04: 'Implement rate limiting, CAPTCHA, and account lockout. Design workflows assuming attackers will try to bypass business logic.',
    A05: 'Follow CIS Benchmarks for your platform. Remove default credentials. Enable only necessary features. Deploy comprehensive security headers.',
    A06: 'Maintain a software bill of materials (SBOM). Subscribe to vulnerability feeds. Automate dependency updates with tools like Dependabot.',
    A07: 'Enforce strong password policies and MFA. Use secure, random session identifiers. Implement account lockout and brute-force protection.',
    A08: 'Use digital signatures for software integrity checks. Apply Subresource Integrity (SRI) tags on external scripts. Harden CI/CD pipelines.',
    A09: 'Log all authentication events, access control failures, and server-side validation failures. Set up real-time alerting. Never log sensitive data.',
    A10: 'Validate and sanitize all user-supplied URLs. Use a strict allowlist for permitted destinations. Disable unnecessary URL-fetching features.',
  };
  return (
    remediations[categoryId] ||
    'Review the OWASP Top 10 guidelines and apply security best practices relevant to this finding.'
  );
}

function buildReferences(categoryId) {
  // Map category IDs to their OWASP Top 10 2021 URL slugs
  const slugs = {
    A01: 'A01_2021-Broken_Access_Control',
    A02: 'A02_2021-Cryptographic_Failures',
    A03: 'A03_2021-Injection',
    A04: 'A04_2021-Insecure_Design',
    A05: 'A05_2021-Security_Misconfiguration',
    A06: 'A06_2021-Vulnerable_and_Outdated_Components',
    A07: 'A07_2021-Identification_and_Authentication_Failures',
    A08: 'A08_2021-Software_and_Data_Integrity_Failures',
    A09: 'A09_2021-Security_Logging_and_Monitoring_Failures',
    A10: 'A10_2021-Server-Side_Request_Forgery_(SSRF)',
  };
  const slug = slugs[categoryId] || categoryId;
  return [
    `https://owasp.org/Top10/2021/${slug}/`,
    'https://cheatsheetseries.owasp.org/',
    'https://cwe.mitre.org/',
  ];
}
