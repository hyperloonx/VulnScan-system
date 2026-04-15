import { useEffect, useMemo, useState } from 'react'
import './App.css'

const OWASP_TOP_10 = [
  { id: 'A01:2021', name: 'Broken Access Control' },
  { id: 'A02:2021', name: 'Cryptographic Failures' },
  { id: 'A03:2021', name: 'Injection' },
  { id: 'A04:2021', name: 'Insecure Design' },
  { id: 'A05:2021', name: 'Security Misconfiguration' },
  { id: 'A06:2021', name: 'Vulnerable and Outdated Components' },
  { id: 'A07:2021', name: 'Identification and Authentication Failures' },
  { id: 'A08:2021', name: 'Software and Data Integrity Failures' },
  { id: 'A09:2021', name: 'Security Logging and Monitoring Failures' },
  { id: 'A10:2021', name: 'Server-Side Request Forgery' },
]

const SCAN_PHASES = [
  { name: 'Target discovery', detail: 'Validating domain and DNS posture', durationMs: 900 },
  { name: 'Transport review', detail: 'Reviewing HTTPS and transport controls', durationMs: 1000 },
  { name: 'Application checks', detail: 'Simulating OWASP Top 10 control checks', durationMs: 1100 },
  { name: 'Dependency posture', detail: 'Evaluating package and framework hygiene', durationMs: 900 },
  { name: 'AI analysis', detail: 'Claude AI is drafting remediation guidance', durationMs: 1200 },
]

const FINDING_LIBRARY = [
  {
    owaspId: 'A01:2021',
    category: 'Broken Access Control',
    title: 'Administrative actions appear exposed without strict server-side policy checks',
    severity: 'high',
    description:
      'Route behavior suggests some high-privilege operations could be reached before a deny-by-default authorization decision is enforced.',
    signal: 'Role-restricted workflows are inconsistently blocked at server boundaries.',
    remediationSteps: [
      'Enforce centralized authorization middleware for every privileged route.',
      'Adopt deny-by-default access policies and explicit permission mapping.',
      'Add integration tests that assert unauthorized requests always return 403.',
    ],
    validationChecks: [
      'Replay role-based test suites for every protected route.',
      'Confirm access logs include denied attempts for audit visibility.',
    ],
    owner: 'Application Security',
  },
  {
    owaspId: 'A02:2021',
    category: 'Cryptographic Failures',
    title: 'TLS and cookie controls need stronger transport-hardening defaults',
    severity: 'medium',
    description:
      'Observed configuration patterns indicate sensitive session data may not always enforce strict transport and storage protections.',
    signal: 'Security headers and session cookie flags are inconsistently present.',
    remediationSteps: [
      'Require HTTPS redirection and enforce HSTS at the edge.',
      'Set Secure, HttpOnly, and SameSite=strict on all session cookies.',
      'Review key rotation cadence for secrets and certificates.',
    ],
    validationChecks: [
      'Verify all app paths redirect HTTP to HTTPS.',
      'Run header checks to confirm cookie and HSTS controls in all environments.',
    ],
    owner: 'Platform Engineering',
  },
  {
    owaspId: 'A03:2021',
    category: 'Injection',
    title: 'Input handling patterns indicate possible unsanitized parameter processing',
    severity: 'high',
    description:
      'A subset of query and form handlers appears to rely on ad-hoc validation rules rather than standardized schema validation and parameterized operations.',
    signal: 'Multiple user-controlled fields are processed by custom logic with partial validation.',
    remediationSteps: [
      'Use strict schema validation for every external input boundary.',
      'Adopt parameterized data access in all data-layer interactions.',
      'Introduce centralized input normalization and escaping utilities.',
    ],
    validationChecks: [
      'Add regression tests for malformed and boundary-case inputs.',
      'Review logs for blocked invalid input attempts after remediation.',
    ],
    owner: 'Backend Engineering',
  },
  {
    owaspId: 'A04:2021',
    category: 'Insecure Design',
    title: 'Business logic flow lacks abuse-case controls for sensitive workflows',
    severity: 'medium',
    description:
      'Critical user journeys indicate missing defensive checks against automation, replay, and high-risk action chaining.',
    signal: 'Sensitive flows complete without adaptive risk or step-up verification controls.',
    remediationSteps: [
      'Define abuse-case scenarios in threat models for critical flows.',
      'Add step-up verification for high-impact user actions.',
      'Implement rate limits and replay protections on sensitive endpoints.',
    ],
    validationChecks: [
      'Run architecture review focused on abuse-case coverage.',
      'Validate step-up controls trigger for risky operation patterns.',
    ],
    owner: 'Security Architecture',
  },
  {
    owaspId: 'A05:2021',
    category: 'Security Misconfiguration',
    title: 'Production hardening baseline is incomplete across exposed services',
    severity: 'critical',
    description:
      'Configuration review signals broad attack-surface exposure due to non-uniform defaults across runtime, reverse proxy, and framework settings.',
    signal: 'Multiple environments diverge from baseline hardening templates.',
    remediationSteps: [
      'Codify secure defaults in infrastructure-as-code templates.',
      'Enforce configuration drift detection in CI/CD gates.',
      'Disable unnecessary endpoints and verbose runtime disclosures.',
    ],
    validationChecks: [
      'Perform configuration diff checks against approved baseline.',
      'Confirm hardening controls in staging and production deployments.',
    ],
    owner: 'Cloud Security',
  },
  {
    owaspId: 'A06:2021',
    category: 'Vulnerable and Outdated Components',
    title: 'Dependency hygiene reveals outdated libraries beyond policy threshold',
    severity: 'high',
    description:
      'Dependency telemetry suggests components with known risk advisories may still be present in active deployment artifacts.',
    signal: 'Dependency inventory contains versions outside approved patch windows.',
    remediationSteps: [
      'Adopt automated dependency update pipelines with security approvals.',
      'Define version age policies for direct and transitive dependencies.',
      'Generate signed SBOMs per build for auditability.',
    ],
    validationChecks: [
      'Re-run dependency scanner and verify no policy violations remain.',
      'Track patch SLA compliance in release dashboards.',
    ],
    owner: 'DevSecOps',
  },
  {
    owaspId: 'A07:2021',
    category: 'Identification and Authentication Failures',
    title: 'Session lifecycle controls need stronger authentication resilience',
    severity: 'high',
    description:
      'Authentication and session handling patterns suggest opportunities for stronger anti-automation and token lifecycle controls.',
    signal: 'Session invalidation and lockout thresholds vary across auth flows.',
    remediationSteps: [
      'Implement consistent session timeout and revocation policies.',
      'Apply adaptive MFA for high-risk logins and account changes.',
      'Standardize account lockout and anomaly detection thresholds.',
    ],
    validationChecks: [
      'Verify token invalidation on logout, password reset, and privilege change.',
      'Confirm authentication telemetry feeds central monitoring.',
    ],
    owner: 'Identity Engineering',
  },
  {
    owaspId: 'A08:2021',
    category: 'Software and Data Integrity Failures',
    title: 'Build artifact trust chain lacks end-to-end integrity verification',
    severity: 'medium',
    description:
      'Release pipeline signals indicate incomplete integrity controls for third-party artifacts and deployment bundles.',
    signal: 'Not all build artifacts are signed and verified at deploy time.',
    remediationSteps: [
      'Sign build artifacts and verify signatures before deployment.',
      'Pin and verify trusted upstream packages in CI pipelines.',
      'Require provenance attestations for release artifacts.',
    ],
    validationChecks: [
      'Validate artifact signature checks are blocking in deployment stages.',
      'Run supply-chain review on external package sources.',
    ],
    owner: 'Release Engineering',
  },
  {
    owaspId: 'A09:2021',
    category: 'Security Logging and Monitoring Failures',
    title: 'Security event telemetry is insufficient for rapid incident response',
    severity: 'medium',
    description:
      'Monitoring coverage appears fragmented, reducing detection speed for suspicious behavior and failed control events.',
    signal: 'High-risk security events are not consistently mapped to alert rules.',
    remediationSteps: [
      'Define a minimum security event schema for all services.',
      'Forward auth, access-control, and configuration events to SIEM.',
      'Create on-call alerts for high-severity security signal patterns.',
    ],
    validationChecks: [
      'Test alert routing and escalation paths in tabletop drills.',
      'Confirm retention policies meet compliance and forensic needs.',
    ],
    owner: 'Security Operations',
  },
  {
    owaspId: 'A10:2021',
    category: 'Server-Side Request Forgery',
    title: 'Server-side integrations need stricter outbound request controls',
    severity: 'high',
    description:
      'External-integration patterns indicate missing safeguards around outbound request destinations and metadata access boundaries.',
    signal: 'Outbound connectors do not uniformly enforce destination allowlists.',
    remediationSteps: [
      'Enforce strict allowlists for outbound destinations.',
      'Block direct access to internal metadata and control-plane endpoints.',
      'Implement egress proxy policies with DNS and IP validation.',
    ],
    validationChecks: [
      'Review outbound traffic logs for blocked unapproved destinations.',
      'Confirm internal service and metadata ranges are unreachable.',
    ],
    owner: 'Network Security',
  },
]

const SEVERITY_ORDER = ['low', 'medium', 'high', 'critical']
const SEVERITY_WEIGHTS = {
  low: 2,
  medium: 5,
  high: 8,
  critical: 10,
}

function normalizeDomain(rawDomain) {
  const cleanedInput = rawDomain.trim().toLowerCase()

  if (!cleanedInput) {
    return { domain: '', error: 'Enter a domain to start a defensive scan.' }
  }

  const withoutProtocol = cleanedInput.replace(/^https?:\/\//, '')
  const onlyHost = withoutProtocol.split('/')[0]
  const validDomainPattern =
    /^(?=.{4,253}$)(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/i

  if (!validDomainPattern.test(onlyHost)) {
    return {
      domain: '',
      error: 'Use a valid domain like example.com (no paths or query strings).',
    }
  }

  return { domain: onlyHost, error: '' }
}

function shiftSeverity(baseSeverity, shift) {
  const startIndex = SEVERITY_ORDER.indexOf(baseSeverity)
  const nextIndex = Math.min(
    SEVERITY_ORDER.length - 1,
    Math.max(0, startIndex + shift),
  )
  return SEVERITY_ORDER[nextIndex]
}

function seedFromString(value) {
  return [...value].reduce(
    (accumulator, character) => accumulator + character.charCodeAt(0),
    0,
  )
}

function getRiskLevel(score) {
  if (score >= 76) return 'Elevated'
  if (score >= 56) return 'Guarded'
  if (score >= 36) return 'Controlled'
  return 'Hardened'
}

function priorityWindowForSeverity(severity) {
  if (severity === 'critical') return 'Immediate (0-24h)'
  if (severity === 'high') return 'High priority (1-3d)'
  if (severity === 'medium') return 'Planned (1-2w)'
  return 'Backlog hardening'
}

function createClaudeAssessment(finding, domain) {
  return {
    summary: `Claude AI categorizes this issue under ${finding.owaspId} (${finding.category}) and recommends prioritizing ${finding.owner.toLowerCase()} ownership for ${domain}.`,
    businessImpact:
      finding.severity === 'critical'
        ? 'Control gaps could materially increase organizational risk if left unresolved.'
        : finding.severity === 'high'
          ? 'The issue may significantly expand exposure during common attacker workflows.'
          : 'The issue contributes to cumulative security debt and should be remediated to strengthen baseline resilience.',
    priorityWindow: priorityWindowForSeverity(finding.severity),
  }
}

function generateFindings(domain) {
  const seed = seedFromString(domain)
  let rolling = seed || 17
  const findingCount = 5 + (seed % 4)
  const usedIndexes = new Set()
  const findings = []

  while (findings.length < findingCount) {
    rolling = (rolling * 9301 + 49297) % 233280
    const libraryIndex = rolling % FINDING_LIBRARY.length

    if (usedIndexes.has(libraryIndex)) {
      continue
    }

    usedIndexes.add(libraryIndex)
    const source = FINDING_LIBRARY[libraryIndex]
    const confidence = 72 + (rolling % 27)
    const severityShift = rolling % 5 === 0 ? 1 : rolling % 4 === 0 ? -1 : 0
    const severity = shiftSeverity(source.severity, severityShift)

    findings.push({
      ...source,
      id: `${source.owaspId}-${findings.length + 1}`,
      severity,
      confidence,
      ai: createClaudeAssessment({ ...source, severity }, domain),
    })
  }

  return findings.sort(
    (a, b) => SEVERITY_WEIGHTS[b.severity] - SEVERITY_WEIGHTS[a.severity],
  )
}

function calculateRiskScore(findings) {
  if (!findings.length) return 0

  const totalWeight = findings.reduce(
    (sum, finding) => sum + SEVERITY_WEIGHTS[finding.severity],
    0,
  )
  return Math.round((totalWeight / (findings.length * SEVERITY_WEIGHTS.critical)) * 100)
}

function severityLabel(severity) {
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}

function createMarkdownReport(scanResult) {
  const lines = [
    `# Defensive Vulnerability Assessment - ${scanResult.domain}`,
    '',
    '> This report is generated from a simulated defensive scanner workflow. No exploit payloads or offensive execution steps are included.',
    '',
    '## Executive summary',
    `- Scan target: **${scanResult.domain}**`,
    `- Generated at: **${new Date(scanResult.finishedAt).toISOString()}**`,
    `- Overall risk score: **${scanResult.riskScore}/100 (${scanResult.riskLevel})**`,
    `- Findings identified: **${scanResult.findings.length}**`,
    `- OWASP coverage: **${scanResult.coveragePercent}%**`,
    '',
    '## Findings and remediation guidance',
    '',
  ]

  scanResult.findings.forEach((finding, index) => {
    lines.push(`### ${index + 1}. [${severityLabel(finding.severity)}] ${finding.title}`)
    lines.push(`- OWASP category: ${finding.owaspId} ${finding.category}`)
    lines.push(`- Detection confidence: ${finding.confidence}%`)
    lines.push(`- Defensive signal: ${finding.signal}`)
    lines.push(`- Claude AI summary: ${finding.ai.summary}`)
    lines.push(`- Business impact: ${finding.ai.businessImpact}`)
    lines.push(`- Remediation SLA: ${finding.ai.priorityWindow}`)
    lines.push('- Recommended actions:')
    finding.remediationSteps.forEach((step) => {
      lines.push(`  - ${step}`)
    })
    lines.push('- Validation checklist:')
    finding.validationChecks.forEach((step) => {
      lines.push(`  - ${step}`)
    })
    lines.push('')
  })

  return lines.join('\n')
}

function App() {
  const [domainInput, setDomainInput] = useState('')
  const [activeDomain, setActiveDomain] = useState('')
  const [validationError, setValidationError] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const [activePhaseIndex, setActivePhaseIndex] = useState(-1)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanResult, setScanResult] = useState(null)
  const [selectedFindingId, setSelectedFindingId] = useState('')

  useEffect(() => {
    if (!isScanning) return undefined

    const phase = SCAN_PHASES[activePhaseIndex]
    if (!phase) return undefined

    const timer = window.setTimeout(() => {
      const nextPhaseIndex = activePhaseIndex + 1
      if (nextPhaseIndex >= SCAN_PHASES.length) {
        const findings = generateFindings(activeDomain)
        const riskScore = calculateRiskScore(findings)
        const categoriesCovered = new Set(findings.map((finding) => finding.owaspId)).size
        const coveragePercent = Math.round((categoriesCovered / OWASP_TOP_10.length) * 100)
        const completedResult = {
          domain: activeDomain,
          findings,
          riskScore,
          riskLevel: getRiskLevel(riskScore),
          coveragePercent,
          categoriesCovered,
          finishedAt: Date.now(),
        }

        setScanResult(completedResult)
        setSelectedFindingId(completedResult.findings[0]?.id ?? '')
        setIsScanning(false)
        setActivePhaseIndex(nextPhaseIndex)
        setScanProgress(100)
        return
      }

      setActivePhaseIndex(nextPhaseIndex)
      setScanProgress(
        Math.min(100, Math.round((nextPhaseIndex / SCAN_PHASES.length) * 100)),
      )
    }, phase.durationMs)

    return () => window.clearTimeout(timer)
  }, [activeDomain, activePhaseIndex, isScanning])

  const selectedFinding = useMemo(() => {
    if (!scanResult) return null
    return (
      scanResult.findings.find((finding) => finding.id === selectedFindingId) ??
      scanResult.findings[0] ??
      null
    )
  }, [scanResult, selectedFindingId])

  const criticalCount = useMemo(
    () =>
      scanResult
        ? scanResult.findings.filter((finding) => finding.severity === 'critical').length
        : 0,
    [scanResult],
  )

  const highCount = useMemo(
    () =>
      scanResult
        ? scanResult.findings.filter((finding) => finding.severity === 'high').length
        : 0,
    [scanResult],
  )

  const runDefensiveScan = () => {
    const { domain, error } = normalizeDomain(domainInput)

    if (error) {
      setValidationError(error)
      return
    }

    setValidationError('')
    setActiveDomain(domain)
    setScanResult(null)
    setSelectedFindingId('')
    setScanProgress(5)
    setActivePhaseIndex(0)
    setIsScanning(true)
  }

  const exportReport = () => {
    if (!scanResult) return

    const reportBody = createMarkdownReport(scanResult)
    const fileBlob = new Blob([reportBody], { type: 'text/markdown;charset=utf-8' })
    const blobUrl = URL.createObjectURL(fileBlob)
    const anchor = document.createElement('a')
    anchor.href = blobUrl
    anchor.download = `${scanResult.domain}-defensive-security-report.md`
    anchor.click()
    URL.revokeObjectURL(blobUrl)
  }

  const activePhase =
    isScanning && activePhaseIndex >= 0 && activePhaseIndex < SCAN_PHASES.length
      ? SCAN_PHASES[activePhaseIndex]
      : null

  return (
    <main className="app-shell">
      <header className="card hero-panel">
        <div>
          <p className="eyebrow">Defensive Security Workspace</p>
          <h1>VulnScan AI Dashboard</h1>
          <p className="hero-copy">
            Scan authorized domains with a realistic UI workflow mapped to OWASP Top 10
            categories. Findings are simulated and paired with Claude AI remediation
            guidance, focused on fixing risk instead of exploiting systems.
          </p>
        </div>
        <ul className="hero-meta" aria-label="Scanner mode metadata">
          <li>Mode: Defensive simulation</li>
          <li>Taxonomy: OWASP Top 10 (2021)</li>
          <li>AI assistant: Claude analysis layer</li>
        </ul>
      </header>

      <section className="card scan-control">
        <label htmlFor="domain-input" className="input-label">
          Target domain
        </label>
        <div className="scan-form-row">
          <input
            id="domain-input"
            className="scan-input"
            type="text"
            value={domainInput}
            onChange={(event) => setDomainInput(event.target.value)}
            placeholder="example.com"
            autoComplete="off"
            disabled={isScanning}
          />
          <button type="button" className="scan-button" disabled={isScanning} onClick={runDefensiveScan}>
            {isScanning ? 'Scanning...' : 'Start Defensive Scan'}
          </button>
        </div>
        {validationError && <p className="form-error">{validationError}</p>}
        <p className="disclaimer">
          Only scan assets you own or are explicitly authorized to assess.
        </p>
        {activeDomain && (
          <p className="scan-target">
            Current target: <strong>{activeDomain}</strong>
          </p>
        )}

        {isScanning && activePhase && (
          <div className="progress-wrapper" aria-live="polite">
            <div className="progress-header">
              <p>{activePhase.name}</p>
              <p>{scanProgress}%</p>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${scanProgress}%` }} />
            </div>
            <p className="phase-detail">{activePhase.detail}</p>
            <div className="phase-grid">
              {SCAN_PHASES.map((phase, index) => {
                const state =
                  index < activePhaseIndex
                    ? 'complete'
                    : index === activePhaseIndex
                      ? 'active'
                      : 'pending'
                return (
                  <span key={phase.name} className={`phase-chip ${state}`}>
                    {phase.name}
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {scanResult ? (
        <>
          <section className="metrics-grid" aria-label="scan summary metrics">
            <article className="card metric-card">
              <p className="metric-label">Risk score</p>
              <p className="metric-value">{scanResult.riskScore}/100</p>
              <p className="metric-subtle">{scanResult.riskLevel} posture</p>
            </article>
            <article className="card metric-card">
              <p className="metric-label">Findings</p>
              <p className="metric-value">{scanResult.findings.length}</p>
              <p className="metric-subtle">{criticalCount} critical</p>
            </article>
            <article className="card metric-card">
              <p className="metric-label">High severity</p>
              <p className="metric-value">{highCount}</p>
              <p className="metric-subtle">Prioritize this sprint</p>
            </article>
            <article className="card metric-card">
              <p className="metric-label">OWASP coverage</p>
              <p className="metric-value">{scanResult.coveragePercent}%</p>
              <p className="metric-subtle">
                {scanResult.categoriesCovered} of {OWASP_TOP_10.length} categories
              </p>
            </article>
          </section>

          <section className="analysis-grid">
            <article className="card findings-panel">
              <div className="panel-header">
                <h2>Simulated findings</h2>
                <button type="button" className="ghost-button" onClick={exportReport}>
                  Export report
                </button>
              </div>
              <p className="panel-copy">
                Results are generated from defensive templates for demonstration and triage
                workflow practice.
              </p>
              <div className="findings-list">
                {scanResult.findings.map((finding) => (
                  <button
                    key={finding.id}
                    type="button"
                    className={`finding-item ${selectedFinding?.id === finding.id ? 'active' : ''}`}
                    onClick={() => setSelectedFindingId(finding.id)}
                  >
                    <div className="finding-heading">
                      <span className={`severity-pill ${finding.severity}`}>
                        {severityLabel(finding.severity)}
                      </span>
                      <span className="owasp-id">{finding.owaspId}</span>
                    </div>
                    <h3>{finding.title}</h3>
                    <p>{finding.description}</p>
                    <div className="finding-meta">
                      <span>{finding.category}</span>
                      <span>{finding.confidence}% confidence</span>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="card detail-panel">
              {selectedFinding ? (
                <>
                  <div className="panel-header">
                    <h2>Claude AI remediation brief</h2>
                    <span className={`severity-pill ${selectedFinding.severity}`}>
                      {severityLabel(selectedFinding.severity)}
                    </span>
                  </div>
                  <h3 className="detail-title">{selectedFinding.title}</h3>
                  <p className="detail-description">{selectedFinding.description}</p>

                  <section className="detail-block">
                    <h4>AI categorization</h4>
                    <p>{selectedFinding.ai.summary}</p>
                    <p>{selectedFinding.ai.businessImpact}</p>
                  </section>

                  <section className="detail-block">
                    <h4>Defensive signal observed</h4>
                    <p>{selectedFinding.signal}</p>
                    <p className="detail-owner">
                      Suggested owner: <strong>{selectedFinding.owner}</strong>
                    </p>
                  </section>

                  <section className="detail-block">
                    <h4>Remediation actions</h4>
                    <ul>
                      {selectedFinding.remediationSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="detail-block">
                    <h4>Verification checklist</h4>
                    <ul>
                      {selectedFinding.validationChecks.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ul>
                    <p className="detail-sla">
                      Recommended remediation window: {selectedFinding.ai.priorityWindow}
                    </p>
                  </section>
                </>
              ) : (
                <p>Select a finding to review remediation guidance.</p>
              )}
            </article>
          </section>
        </>
      ) : (
        <section className="card empty-state">
          <h2>OWASP-aligned defensive scanner preview</h2>
          <p>
            Start a scan to simulate findings, severity classification, and AI-assisted
            remediation planning.
          </p>
          <div className="owasp-grid">
            {OWASP_TOP_10.map((category) => (
              <span key={category.id} className="owasp-chip">
                {category.id} {category.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}

export default App
