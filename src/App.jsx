import { useState, useCallback } from 'react';
import DomainInput from './components/DomainInput.jsx';
import ScanProgress from './components/ScanProgress.jsx';
import ScanResults from './components/ScanResults.jsx';
import { runScan } from './utils/scanner.js';

const APP_STATES = {
  IDLE: 'idle',
  SCANNING: 'scanning',
  RESULTS: 'results',
};

const LOG_TEMPLATES = [
  { type: 'info', message: (d) => `Initiating passive reconnaissance on ${d}...` },
  { type: 'info', message: () => 'Resolving DNS records (A, AAAA, MX, TXT, CNAME)...' },
  { type: 'info', message: () => 'Probing HTTP/HTTPS service availability...' },
  { type: 'info', message: () => 'Enumerating response headers...' },
  { type: 'warn', message: () => 'Checking TLS certificate chain...' },
  { type: 'info', message: (d) => `Running OWASP Top 10 checks against ${d}...` },
  { type: 'info', message: () => 'Testing for insecure direct object references...' },
  { type: 'warn', message: () => 'Scanning for common misconfiguration patterns...' },
  { type: 'info', message: () => 'Analyzing authentication and session management...' },
  { type: 'info', message: () => 'Checking software component versions...' },
  { type: 'warn', message: () => 'Evaluating injection attack surface...' },
  { type: 'info', message: () => 'Inspecting CORS and CSP policies...' },
  { type: 'success', message: () => 'Scan complete. Aggregating findings...' },
];

export default function App() {
  const [appState, setAppState] = useState(APP_STATES.IDLE);
  const [scanTarget, setScanTarget] = useState('');
  const [progress, setProgress] = useState({ step: 0, total: 0, message: '' });
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = useCallback(async (domain) => {
    setAppState(APP_STATES.SCANNING);
    setScanTarget(domain);
    setError('');
    setResult(null);
    setLogs([]);

    // Pre-seed the terminal log with realistic messages
    LOG_TEMPLATES.forEach((tpl, i) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, { type: tpl.type, message: tpl.message(domain) }]);
      }, i * 350);
    });

    try {
      const scanResult = await runScan(domain, (step, total, message) => {
        setProgress({ step, total, message });
      });
      setResult(scanResult);
      setAppState(APP_STATES.RESULTS);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during scanning.');
      setAppState(APP_STATES.IDLE);
    }
  }, []);

  const handleRescan = useCallback(() => {
    setAppState(APP_STATES.IDLE);
    setScanTarget('');
    setResult(null);
    setProgress({ step: 0, total: 0, message: '' });
    setLogs([]);
    setError('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Subtle grid background */}
      <div
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-glow">
                VulnScan
                <span className="ml-2 text-xs font-mono bg-green-900/50 text-green-400 border border-green-700 px-2 py-0.5 rounded-full align-middle">
                  OWASP Top 10
                </span>
              </h1>
              <p className="text-gray-500 text-xs">Defensive Security Scanner · Powered by Claude AI</p>
            </div>
          </div>

          {/* Disclaimer banner */}
          <div className="mt-4 bg-blue-950/40 border border-blue-900/50 rounded-lg px-4 py-2.5 flex gap-3 items-start">
            <svg className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd" />
            </svg>
            <p className="text-blue-300 text-xs">
              <strong>Defensive use only.</strong> VulnScan simulates OWASP Top 10 checks to help security
              teams identify and remediate vulnerabilities. No actual exploit code or attack payloads are
              used. Only scan domains you own or have explicit written permission to test.
            </p>
          </div>
        </header>

        {/* Main content */}
        <main className="space-y-6">
          {appState === APP_STATES.IDLE && (
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 shadow-xl">
              <h2 className="text-base font-semibold text-gray-200 mb-1">Target Domain</h2>
              <p className="text-gray-500 text-sm mb-4">
                Enter a domain to analyze against the OWASP Top 10 vulnerability categories.
              </p>
              <DomainInput onScan={handleScan} isScanning={false} />

              {error && (
                <div className="mt-4 bg-red-900/30 border border-red-800 rounded-lg px-4 py-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              {/* Feature highlights */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    icon: '🛡️',
                    title: 'OWASP Top 10',
                    desc: 'Checks across all 10 categories from the latest 2021 edition.',
                  },
                  {
                    icon: '✦',
                    title: 'AI Remediation',
                    desc: 'Claude AI generates targeted fix recommendations for each finding.',
                  },
                  {
                    icon: '📊',
                    title: 'Security Scoring',
                    desc: 'CVSS-based scoring with A–F grade and severity breakdown.',
                  },
                ].map((f) => (
                  <div key={f.title} className="bg-gray-800/40 border border-gray-700/60 rounded-lg p-4">
                    <p className="text-2xl mb-2">{f.icon}</p>
                    <h3 className="text-sm font-semibold text-gray-200">{f.title}</h3>
                    <p className="text-gray-500 text-xs mt-1">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {appState === APP_STATES.SCANNING && (
            <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-200">Scanning in progress</h2>
                <span className="text-xs text-gray-500 font-mono">passive · non-intrusive</span>
              </div>
              <ScanProgress
                domain={scanTarget}
                step={progress.step}
                totalSteps={progress.total}
                message={progress.message}
                logs={logs}
              />
            </div>
          )}

          {appState === APP_STATES.RESULTS && result && (
            <ScanResults result={result} onRescan={handleRescan} />
          )}
        </main>

        {/* Footer */}
        <footer className="mt-12 text-center text-gray-600 text-xs space-y-1">
          <p>VulnScan · Defensive Security · OWASP Top 10 (2021)</p>
          <p>
            Built for security awareness and education. Results are simulated for demonstration.{' '}
            <a
              href="https://owasp.org/www-project-top-ten/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:text-green-600 underline"
            >
              Learn more about OWASP
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
