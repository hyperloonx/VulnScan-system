# VulnScan-system

A defensive web application vulnerability scanner built with React, featuring OWASP Top 10 analysis, AI-powered remediation guidance via Claude, and a security-themed dashboard UI.

---

## Features

- **Domain Input** — Enter any domain (full URLs are automatically parsed); input is validated before scanning begins.
- **Realistic Scanning UI** — Animated progress bar, percentage tracker, and a live terminal-style log.
- **OWASP Top 10 (2021)** — Simulates checks across all ten OWASP vulnerability categories, including Injection, Broken Access Control, Cryptographic Failures, and more.
- **CVSS Scoring** — Each finding is assigned a CVSS score and severity level (Critical / High / Medium / Low / Info).
- **Security Grade** — Overall A–F security grade with a graphical score gauge.
- **AI-Powered Fix Recommendations** — Expand any finding to request targeted, step-by-step remediation guidance from Claude (Anthropic API key required).
- **Filter & Sort** — Filter findings by severity; sort by CVSS score, severity, or OWASP category.
- **Export** — Download a full JSON report of the scan.

> **Defensive use only.** No actual exploit code or attack payloads are used. Only scan domains you own or have explicit written permission to test.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| AI integration | Anthropic Claude API (`claude-opus-4-5`) |
| Vulnerability categories | OWASP Top 10 (2021) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment (optional — needed for AI recommendations)

```bash
cp .env.example .env
# Edit .env and add your Anthropic API key
```

### 3. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── DomainInput.jsx       # Domain entry form with validation
│   ├── ScanProgress.jsx      # Animated scan progress + terminal log
│   ├── ScanResults.jsx       # Results dashboard (score, filters, export)
│   └── VulnerabilityCard.jsx # Individual finding with AI remediation panel
├── utils/
│   ├── owasp.js              # OWASP Top 10 category definitions
│   ├── scanner.js            # Deterministic scan simulation engine
│   └── claudeApi.js          # Anthropic Claude API integration
├── App.jsx                   # Root application component
└── index.css                 # Tailwind + custom animation utilities
```

---

## AI Remediation

When an Anthropic API key is configured, expanding any vulnerability card fetches targeted remediation guidance from Claude, including:

- Why the vulnerability is dangerous
- Numbered remediation steps
- Code or configuration snippets
- A recommended security tool or library

Without the key, built-in static remediation guidance is shown instead.
