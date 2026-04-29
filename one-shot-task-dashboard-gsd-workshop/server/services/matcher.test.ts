import { describe, it, expect } from 'vitest';
import { matchWatchlists } from './matcher.js';
import type { Watchlist, IntelItem } from '../../src/lib/types.js';

describe('matchWatchlists', () => {
  const makeItem = (overrides: Partial<IntelItem> = {}): IntelItem => ({
    id: 'test-id',
    source_type: 'news',
    source_name: 'test',
    title: 'Ransomware attack on hospital network',
    content: 'A new ransomware strain has been discovered targeting healthcare.',
    url: 'https://example.com',
    author: null,
    published_at: new Date().toISOString(),
    collected_at: new Date().toISOString(),
    severity: 'info',
    sentiment: 0,
    tags: [],
    geo: null,
    raw_data: '{}',
    ...overrides,
  });

  const makeWatchlist = (overrides: Partial<Watchlist> = {}): Watchlist => ({
    id: 'wl-1',
    name: 'Healthcare Threats',
    keywords: ['ransomware', 'healthcare'],
    sources: ['all'],
    severity_override: null,
    active: true,
    ...overrides,
  });

  it('matches keywords in title and content', () => {
    const item = makeItem();
    const result = matchWatchlists(item, [makeWatchlist()]);
    expect(result.tags).toContain('ransomware');
    expect(result.tags).toContain('healthcare');
  });

  it('applies severity override from watchlist', () => {
    const item = makeItem();
    const wl = makeWatchlist({ severity_override: 'critical' });
    const result = matchWatchlists(item, [wl]);
    expect(result.severity).toBe('critical');
  });

  it('uses highest severity when multiple watchlists match', () => {
    const item = makeItem();
    const wl1 = makeWatchlist({ id: 'wl-1', severity_override: 'low' });
    const wl2 = makeWatchlist({ id: 'wl-2', keywords: ['ransomware'], severity_override: 'high' });
    const result = matchWatchlists(item, [wl1, wl2]);
    expect(result.severity).toBe('high');
  });

  it('does not match inactive watchlists', () => {
    const item = makeItem();
    const wl = makeWatchlist({ active: false });
    const result = matchWatchlists(item, [wl]);
    expect(result.tags).toHaveLength(0);
  });

  it('filters by source when watchlist specifies sources', () => {
    const item = makeItem({ source_name: 'twitter' });
    const wl = makeWatchlist({ sources: ['reddit'] });
    const result = matchWatchlists(item, [wl]);
    expect(result.tags).toHaveLength(0);
  });

  it('matches when source is "all"', () => {
    const item = makeItem({ source_name: 'twitter' });
    const wl = makeWatchlist({ sources: ['all'] });
    const result = matchWatchlists(item, [wl]);
    expect(result.tags.length).toBeGreaterThan(0);
  });
});
