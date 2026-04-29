import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Database } from './database.js';
import { v4 as uuidv4 } from 'uuid';

describe('Database', () => {
  let db: Database;

  beforeEach(() => {
    db = new Database(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  describe('intel items', () => {
    const makeItem = (overrides = {}) => ({
      id: uuidv4(),
      source_type: 'news' as const,
      source_name: 'test-rss',
      title: 'Test Article',
      content: 'This is test content about cybersecurity.',
      url: 'https://example.com/article',
      author: 'Test Author',
      published_at: new Date().toISOString(),
      collected_at: new Date().toISOString(),
      severity: 'info' as const,
      sentiment: 0.5,
      tags: ['cybersecurity'],
      geo: null,
      raw_data: '{}',
      ...overrides,
    });

    it('inserts and retrieves an item', () => {
      const item = makeItem();
      db.insertItem(item);
      const result = db.getItem(item.id);
      expect(result).not.toBeNull();
      expect(result!.title).toBe('Test Article');
      expect(result!.tags).toEqual(['cybersecurity']);
    });

    it('lists items with pagination', () => {
      for (let i = 0; i < 5; i++) {
        db.insertItem(makeItem({ id: uuidv4(), title: `Article ${i}` }));
      }
      const page = db.listItems({ limit: 3, offset: 0 });
      expect(page.items).toHaveLength(3);
      expect(page.total).toBe(5);
    });

    it('filters items by source_type', () => {
      db.insertItem(makeItem({ id: uuidv4(), source_type: 'news' }));
      db.insertItem(makeItem({ id: uuidv4(), source_type: 'social' }));
      const page = db.listItems({ limit: 10, offset: 0, source_type: 'news' });
      expect(page.items).toHaveLength(1);
      expect(page.items[0].source_type).toBe('news');
    });

    it('filters items by severity', () => {
      db.insertItem(makeItem({ id: uuidv4(), severity: 'critical' }));
      db.insertItem(makeItem({ id: uuidv4(), severity: 'info' }));
      const page = db.listItems({ limit: 10, offset: 0, severity: 'critical' });
      expect(page.items).toHaveLength(1);
      expect(page.items[0].severity).toBe('critical');
    });

    it('searches items with FTS5', () => {
      db.insertItem(makeItem({ id: uuidv4(), title: 'Zero day exploit found', content: 'Critical vulnerability discovered' }));
      db.insertItem(makeItem({ id: uuidv4(), title: 'Weather report', content: 'Sunny day ahead' }));
      const results = db.searchItems('exploit');
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain('exploit');
    });
  });

  describe('watchlists', () => {
    const makeWatchlist = (overrides = {}) => ({
      id: uuidv4(),
      name: 'Test Watchlist',
      keywords: ['malware', 'ransomware'],
      sources: ['all'],
      severity_override: null,
      active: true,
      ...overrides,
    });

    it('creates and retrieves a watchlist', () => {
      const wl = makeWatchlist();
      db.createWatchlist(wl);
      const result = db.getWatchlist(wl.id);
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Test Watchlist');
      expect(result!.keywords).toEqual(['malware', 'ransomware']);
    });

    it('updates a watchlist', () => {
      const wl = makeWatchlist();
      db.createWatchlist(wl);
      db.updateWatchlist(wl.id, { name: 'Updated', keywords: ['phishing'] });
      const result = db.getWatchlist(wl.id);
      expect(result!.name).toBe('Updated');
      expect(result!.keywords).toEqual(['phishing']);
    });

    it('deletes a watchlist', () => {
      const wl = makeWatchlist();
      db.createWatchlist(wl);
      db.deleteWatchlist(wl.id);
      expect(db.getWatchlist(wl.id)).toBeNull();
    });

    it('lists all watchlists', () => {
      db.createWatchlist(makeWatchlist({ id: uuidv4() }));
      db.createWatchlist(makeWatchlist({ id: uuidv4(), name: 'Second' }));
      const list = db.listWatchlists();
      expect(list).toHaveLength(2);
    });
  });

  describe('collectors', () => {
    const makeCollector = (overrides = {}) => ({
      id: uuidv4(),
      type: 'rss' as const,
      name: 'Test RSS',
      enabled: true,
      interval_seconds: 300,
      config: { url: 'https://example.com/feed' },
      ...overrides,
    });

    it('creates and retrieves a collector', () => {
      const col = makeCollector();
      db.createCollector(col);
      const result = db.getCollector(col.id);
      expect(result).not.toBeNull();
      expect(result!.name).toBe('Test RSS');
      expect(result!.config).toEqual({ url: 'https://example.com/feed' });
    });

    it('updates a collector', () => {
      const col = makeCollector();
      db.createCollector(col);
      db.updateCollector(col.id, { enabled: false });
      const result = db.getCollector(col.id);
      expect(result!.enabled).toBe(false);
    });

    it('deletes a collector', () => {
      const col = makeCollector();
      db.createCollector(col);
      db.deleteCollector(col.id);
      expect(db.getCollector(col.id)).toBeNull();
    });

    it('lists enabled collectors', () => {
      db.createCollector(makeCollector({ id: uuidv4(), enabled: true }));
      db.createCollector(makeCollector({ id: uuidv4(), enabled: false }));
      const enabled = db.listCollectors({ enabledOnly: true });
      expect(enabled).toHaveLength(1);
    });
  });

  describe('stats', () => {
    it('returns aggregated dashboard stats', () => {
      const now = new Date();
      db.insertItem({
        id: uuidv4(),
        source_type: 'news',
        source_name: 'test',
        title: 'Test',
        content: 'cybersecurity threat malware',
        url: 'https://example.com',
        author: null,
        published_at: now.toISOString(),
        collected_at: now.toISOString(),
        severity: 'high',
        sentiment: -0.3,
        tags: ['malware', 'cybersecurity'],
        geo: null,
        raw_data: '{}',
      });
      const stats = db.getStats();
      expect(stats.total_items).toBe(1);
      expect(stats.items_last_24h).toBe(1);
      expect(stats.severity_counts.high).toBe(1);
      expect(stats.source_counts.news).toBe(1);
    });
  });
});
