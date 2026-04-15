import { useEffect, useRef } from 'react';

const TERMINAL_CHARS = '0123456789ABCDEF';

function randomHex() {
  return Array.from({ length: 8 }, () =>
    TERMINAL_CHARS[Math.floor(Math.random() * TERMINAL_CHARS.length)]
  ).join('');
}

export default function ScanProgress({ domain, step, totalSteps, message, logs }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const percent = totalSteps > 0 ? Math.round((step / totalSteps) * 100) : 0;

  return (
    <div className="w-full space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-green-400 text-sm font-mono font-semibold">
            Scanning {domain}
          </span>
          <span className="text-green-400 text-sm font-mono">{percent}%</span>
        </div>
        <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Status message */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 pulse-ring shrink-0" />
        <span className="text-gray-300 text-sm font-mono truncate">{message}</span>
      </div>

      {/* Terminal log */}
      <div className="bg-gray-950 border border-gray-700 rounded-lg p-4 h-48 overflow-y-auto font-mono text-xs">
        {/* Terminal header dots */}
        <div className="flex gap-1.5 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
        </div>

        {logs.map((log, i) => (
          <div key={i} className="flex gap-2 text-gray-400 mb-0.5">
            <span className="text-green-600 shrink-0">[{randomHex()}]</span>
            <span className={log.type === 'success' ? 'text-green-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-gray-400'}>
              {log.message}
            </span>
          </div>
        ))}

        {/* Blinking cursor */}
        <span className="text-green-400 animate-pulse">▮</span>
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
