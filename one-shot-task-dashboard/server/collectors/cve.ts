import { v4 as uuidv4 } from 'uuid';
import type { IntelItem, Severity } from '../../src/lib/types.js';
import type { Collector, CollectorConstructorOpts } from './base.js';

function cvssToSeverity(score: number): Severity {
  if (score >= 9.0) return 'critical';
  if (score >= 7.0) return 'high';
  if (score >= 4.0) return 'medium';
  return 'low';
}

export class CveCollector implements Collector {
  id: string;
  type = 'cve';
  private name: string;
  private apiKey: string | null;

  constructor(opts: CollectorConstructorOpts) {
    this.id = opts.id;
    this.name = opts.name;
    this.apiKey = (opts.config.apiKey as string) || null;
  }

  async collect(): Promise<IntelItem[]> {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const params = new URLSearchParams({
      pubStartDate: twoHoursAgo.toISOString(),
      pubEndDate: now.toISOString(),
    });

    const headers: Record<string, string> = {};
    if (this.apiKey) headers['apiKey'] = this.apiKey;

    const res = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?${params}`, { headers });
    if (!res.ok) return [];
    const data = await res.json();

    return (data.vulnerabilities || []).map((vuln: any) => {
      const cve = vuln.cve;
      const desc = cve.descriptions?.find((d: any) => d.lang === 'en')?.value || '';
      const cvss = cve.metrics?.cvssMetricV31?.[0]?.cvssData?.baseScore || 0;
      const ref = cve.references?.[0]?.url || '';

      return {
        id: uuidv4(),
        source_type: 'technical' as const,
        source_name: this.name,
        title: cve.id,
        content: desc,
        url: ref,
        author: null,
        published_at: cve.published || new Date().toISOString(),
        collected_at: new Date().toISOString(),
        severity: cvssToSeverity(cvss),
        sentiment: 0,
        tags: [],
        geo: null,
        raw_data: JSON.stringify(vuln),
      };
    });
  }
}
