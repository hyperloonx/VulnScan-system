import { useState, useMemo } from 'react';
import VulnerabilityCard from './VulnerabilityCard.jsx';

const SEVERITY_ORDER = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

const GRADE_COLORS = {
  A: 'text-green-400',
  B: 'text-lime-400',
  C: 'text-yellow-400',
  D: 'text-orange-400',
  F: 'text-red-400',
};

const SEVERITY_BAR_COLORS = {
  CRITICAL: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500',
  INFO: 'bg-gray-500',
};

function ScoreGauge({ score, grade }) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;
  const gradeColor = GRADE_COLORS[grade] || 'text-gray-400';

  const strokeColor =
    score >= 75 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          {/* Background track */}
          <circle cx="50" cy="50" r="44" fill="none" stroke="#374151" strokeWidth="8" />
          {/* Score arc */}
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className={`text-3xl font-black ${gradeColor}`}>{grade}</span>
        <p className="text-gray-500 text-xs mt-0.5">Security Grade</p>
      </div>
    </div>
  );
}

function SeveritySummary({ counts, total }) {
  return (
    <div className="space-y-2">
      {SEVERITY_ORDER.map((sev) => {
        const count = counts[sev] || 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={sev} className="flex items-center gap-3">
            <span className="text-gray-400 text-xs w-16 shrink-0">{sev}</span>
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${SEVERITY_BAR_COLORS[sev]} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-gray-300 text-xs font-mono w-6 text-right">{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function ScanResults({ result, onRescan }) {
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('severity');

  const filteredFindings = useMemo(() => {
    let findings = result.findings;

    if (filter !== 'ALL') {
      findings = findings.filter((f) => f.severity === filter);
    }

    return [...findings].sort((a, b) => {
      if (sortBy === 'severity') {
        return SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
      }
      if (sortBy === 'cvss') {
        return parseFloat(b.cvssScore) - parseFloat(a.cvssScore);
      }
      return a.category.localeCompare(b.category);
    });
  }, [result.findings, filter, sortBy]);

  const handleExport = () => {
    const report = {
      domain: result.domain,
      scannedAt: result.scannedAt,
      score: result.score,
      grade: result.grade,
      totalFindings: result.totalFindings,
      severityCounts: result.severityCounts,
      findings: result.findings.map((f) => ({
        id: f.id,
        severity: f.severity,
        cvssScore: f.cvssScore,
        category: f.category,
        title: f.title,
        description: f.description,
        remediation: f.remediation,
      })),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnscan-${result.domain}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <ScoreGauge score={result.score} grade={result.grade} />

          <div className="flex-1 space-y-3">
            <div>
              <h2 className="text-lg font-bold text-white">{result.domain}</h2>
              <p className="text-gray-500 text-xs mt-0.5">
                Scanned {new Date(result.scannedAt).toLocaleString()} · {result.scanDuration} scan duration
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SEVERITY_ORDER.filter((s) => s !== 'INFO').map((sev) => (
                <div key={sev} className="bg-gray-900/50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xl font-bold text-white">{result.severityCounts[sev] || 0}</p>
                  <p className="text-xs text-gray-500">{sev}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {result.totalFindings > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <SeveritySummary counts={result.severityCounts} total={result.totalFindings} />
          </div>
        )}
      </div>

      {/* Actions + filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['ALL', ...SEVERITY_ORDER].map((sev) => {
            const count = sev === 'ALL' ? result.totalFindings : (result.severityCounts[sev] || 0);
            return (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
                  ${filter === sev
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-gray-300 text-xs rounded-lg px-3 py-1.5
                       focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="severity">Sort: Severity</option>
            <option value="cvss">Sort: CVSS Score</option>
            <option value="category">Sort: Category</option>
          </select>

          <button
            onClick={onRescan}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 border border-gray-600
                       text-gray-300 text-xs rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Scan
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 border border-green-600
                       text-white text-xs rounded-lg hover:bg-green-600 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      {/* Findings list */}
      {filteredFindings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">No findings for the selected filter.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFindings.map((finding) => (
            <VulnerabilityCard key={finding.id} finding={finding} />
          ))}
        </div>
      )}
    </div>
  );
}
