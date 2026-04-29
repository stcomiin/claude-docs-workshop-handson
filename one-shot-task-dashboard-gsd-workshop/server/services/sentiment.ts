const POSITIVE: Record<string, number> = {
  good: 3, great: 3, excellent: 3, amazing: 4, wonderful: 4, fantastic: 4,
  love: 3, like: 2, best: 3, awesome: 4, outstanding: 5, superb: 5,
  happy: 3, brilliant: 4, perfect: 3, impressive: 3, secure: 2, safe: 1,
  resolved: 2, fixed: 1, improved: 2, success: 2, breakthrough: 3,
  protect: 1, defend: 1, mitigate: 2, patch: 1, update: 1,
};

const NEGATIVE: Record<string, number> = {
  bad: -3, terrible: -3, awful: -3, horrible: -3, worst: -3, hate: -3,
  poor: -2, disaster: -4, fail: -2, failure: -2, broken: -2, ugly: -3,
  sad: -2, angry: -2, attack: -2, breach: -3, exploit: -2, malware: -3,
  ransomware: -3, phishing: -2, vulnerability: -2, threat: -2, risk: -1,
  compromise: -3, leak: -2, stolen: -3, hack: -2, critical: -2,
  severe: -2, dangerous: -3, warning: -1, alert: -1, incident: -2,
};

export function analyzeSentiment(text: string): number {
  if (!text) return 0;
  const words = text.toLowerCase().split(/\s+/);
  if (words.length === 0) return 0;

  let score = 0;
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, '');
    if (POSITIVE[clean]) score += POSITIVE[clean];
    if (NEGATIVE[clean]) score += NEGATIVE[clean];
  }

  const normalized = score / words.length;
  return Math.max(-1, Math.min(1, normalized));
}
