/**
 * Mediator Automation Layer: Sensitive Information & Leak Detector
 * Scans public project summaries and details to prevent accidental exposure of
 * confidential credentials, database URLs, API tokens, passwords, and private contact info.
 * Enforces Section 20.3 of update.txt: "Public Discovery, Private Requirements".
 */

export interface LeakItem {
  type: 'api_key' | 'database_url' | 'password' | 'email' | 'phone';
  severity: 'critical' | 'warning';
  snippet: string;
  message: string;
}

export interface LeakDetectionResult {
  hasLeak: boolean;
  hasCriticalLeak: boolean;
  leaks: LeakItem[];
  recommendation: string;
}

const PATTERNS: Array<{
  type: LeakItem['type'];
  severity: LeakItem['severity'];
  regex: RegExp;
  message: string;
}> = [
  // API Keys & Tokens
  {
    type: 'api_key',
    severity: 'critical',
    regex: /(?:sk_live_[a-zA-Z0-9]{12,}|sk_test_[a-zA-Z0-9]{12,})/gi,
    message: 'Stripe / Secret API key detected. Keep API keys in private environment variables only.',
  },
  {
    type: 'api_key',
    severity: 'critical',
    regex: /(?:ghp_[a-zA-Z0-9]{30,}|github_pat_[a-zA-Z0-9_]{30,})/gi,
    message: 'GitHub personal access token detected. Never publish repository access tokens.',
  },
  {
    type: 'api_key',
    severity: 'critical',
    regex: /AIza[0-9A-Za-z-_]{35}/g,
    message: 'Google Cloud API key detected in public text.',
  },
  {
    type: 'api_key',
    severity: 'critical',
    regex: /AKIA[0-9A-Z]{16}/g,
    message: 'AWS Access Key ID detected in public text.',
  },
  // Database Connection Strings
  {
    type: 'database_url',
    severity: 'critical',
    regex: /(?:postgres(?:ql)?|mongodb(?:\+srv)?|mysql):\/\/[^\s]+/gi,
    message: 'Database connection string detected with credentials. Move to private requirements.',
  },
  // Password or Secret assignments
  {
    type: 'password',
    severity: 'critical',
    regex: /(?:password|passwd|api_secret|db_pass)\s*[:=]\s*['"]?[^\s'"]{4,}['"]?/gi,
    message: 'Hardcoded password or secret assignment detected.',
  },
  // Private Emails in Public Summary
  {
    type: 'email',
    severity: 'warning',
    regex: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    message: 'Personal email address detected. The platform provides private messaging; avoid public emails.',
  },
  // Phone numbers in Public Summary
  {
    type: 'phone',
    severity: 'warning',
    regex: /(?:\+91[\s-]?)?[6-9]\d{9}\b/g,
    message: 'Phone number detected. Avoid sharing phone numbers publicly on the discovery feed.',
  },
];

/**
 * Scan text for sensitive leaks.
 */
export function scanForSensitiveInfo(text: string): LeakDetectionResult {
  if (!text || text.trim().length === 0) {
    return {
      hasLeak: false,
      hasCriticalLeak: false,
      leaks: [],
      recommendation: 'Text is safe for public discovery.',
    };
  }

  const leaks: LeakItem[] = [];

  for (const { type, severity, regex, message } of PATTERNS) {
    const matches = text.match(regex);
    if (matches) {
      for (const match of matches) {
        // Redact match for display
        const snippet = match.length > 12 
          ? `${match.slice(0, 4)}...${match.slice(-4)}`
          : `${match.slice(0, 2)}***`;

        leaks.push({
          type,
          severity,
          snippet,
          message,
        });
      }
    }
  }

  const hasCriticalLeak = leaks.some(l => l.severity === 'critical');
  const hasLeak = leaks.length > 0;

  let recommendation = '✅ Public Discovery Safe: No sensitive information or leaked credentials detected.';
  if (hasCriticalLeak) {
    recommendation = '🚨 Critical Leak Warning: Remove credentials, database URLs, or API keys from the public summary before publishing. Move them to private requirements.';
  } else if (hasLeak) {
    recommendation = '⚠️ Privacy Advisory: Direct contact info detected. We recommend keeping communication inside the platform workspace.';
  }

  return {
    hasLeak,
    hasCriticalLeak,
    leaks,
    recommendation,
  };
}

/**
 * Scan text for leaks with formatted warnings and detected items.
 */
export function scanForSensitiveLeaks(text: string) {
  const res = scanForSensitiveInfo(text);
  return {
    hasLeaks: res.hasLeak,
    hasCriticalLeaks: res.hasCriticalLeak,
    detectedItems: res.leaks,
    warnings: res.leaks.map(l => l.message),
    recommendation: res.recommendation,
  };
}

/**
 * Redact sensitive patterns from text.
 */
export function redactSensitiveInfo(text: string): string {
  if (!text) return '';
  let result = text;
  for (const { type, regex } of PATTERNS) {
    const globalRegex = new RegExp(regex.source, 'gi');
    result = result.replace(globalRegex, `[REDACTED_${type.toUpperCase()}]`);
  }
  return result;
}
