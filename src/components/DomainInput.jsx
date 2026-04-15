import { useState } from 'react';

const DOMAIN_PATTERN = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

function normalizeDomain(input) {
  // Strip protocol and trailing path/query
  return input
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '')
    .toLowerCase();
}

export default function DomainInput({ onScan, isScanning }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const domain = normalizeDomain(value);
    if (!domain) {
      setError('Please enter a domain name.');
      return;
    }
    if (!DOMAIN_PATTERN.test(domain)) {
      setError('Please enter a valid domain (e.g., example.com).');
      return;
    }

    onScan(domain);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input wrapper */}
        <div className="relative flex-1">
          {/* Lock icon */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            placeholder="Enter domain to scan (e.g., example.com)"
            disabled={isScanning}
            className="w-full pl-12 pr-4 py-3.5 bg-gray-800 border border-gray-600 rounded-lg
                       text-gray-100 placeholder-gray-500 text-sm
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
          />
        </div>

        {/* Scan button */}
        <button
          type="submit"
          disabled={isScanning || !value.trim()}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm
                     bg-green-600 hover:bg-green-500 text-white
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200 min-w-[140px]"
        >
          {isScanning ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Scanning…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Start Scan
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-red-400 text-sm flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      <p className="mt-2 text-gray-500 text-xs">
        Tip: You can paste a full URL — the scanner will extract the domain automatically.
      </p>
    </form>
  );
}
