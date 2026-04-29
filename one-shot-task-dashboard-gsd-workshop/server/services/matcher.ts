import type { IntelItem, Watchlist, Severity } from '../../src/lib/types.js';

const SEVERITY_RANK: Record<Severity, number> = {
  info: 0, low: 1, medium: 2, high: 3, critical: 4,
};

export function matchWatchlists(
  item: IntelItem,
  watchlists: Watchlist[]
): { tags: string[]; severity: Severity } {
  const tags = new Set<string>();
  let maxSeverity: Severity = item.severity;

  const searchText = `${item.title} ${item.content}`.toLowerCase();

  for (const wl of watchlists) {
    if (!wl.active) continue;

    if (!wl.sources.includes('all') && !wl.sources.includes(item.source_name)) {
      continue;
    }

    let matched = false;
    for (const keyword of wl.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        tags.add(keyword.toLowerCase());
        matched = true;
      }
    }

    if (matched && wl.severity_override) {
      const overrideSev = wl.severity_override as Severity;
      if (SEVERITY_RANK[overrideSev] > SEVERITY_RANK[maxSeverity]) {
        maxSeverity = overrideSev;
      }
    }
  }

  return { tags: Array.from(tags), severity: maxSeverity };
}
