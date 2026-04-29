import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CveCollector } from './cve.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('CveCollector', () => {
  let collector: CveCollector;

  beforeEach(() => {
    collector = new CveCollector({
      id: 'cve-test',
      name: 'NVD',
      config: {},
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        vulnerabilities: [
          {
            cve: {
              id: 'CVE-2026-12345',
              descriptions: [{ lang: 'en', value: 'A critical buffer overflow in ExampleLib' }],
              published: '2026-04-20T10:00:00Z',
              metrics: {
                cvssMetricV31: [{ cvssData: { baseScore: 9.1 } }],
              },
              references: [{ url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-12345' }],
            },
          },
          {
            cve: {
              id: 'CVE-2026-54321',
              descriptions: [{ lang: 'en', value: 'Minor info disclosure in FooBar' }],
              published: '2026-04-20T11:00:00Z',
              metrics: {
                cvssMetricV31: [{ cvssData: { baseScore: 3.5 } }],
              },
              references: [{ url: 'https://nvd.nist.gov/vuln/detail/CVE-2026-54321' }],
            },
          },
        ],
      }),
    });
  });

  it('fetches and normalizes CVE entries', async () => {
    const items = await collector.collect();
    expect(items).toHaveLength(2);
    expect(items[0].source_type).toBe('technical');
    expect(items[0].title).toBe('CVE-2026-12345');
  });

  it('maps CVSS score to severity correctly', async () => {
    const items = await collector.collect();
    expect(items[0].severity).toBe('critical');
    expect(items[1].severity).toBe('low');
  });
});
