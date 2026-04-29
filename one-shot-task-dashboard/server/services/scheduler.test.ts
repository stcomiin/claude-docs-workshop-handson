import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scheduler } from './scheduler.js';
import type { Database } from '../db/database.js';
import type { WsHub } from '../ws/hub.js';
import type { Collector } from '../collectors/base.js';

function mockDb(): Partial<Database> {
  return {
    insertItem: vi.fn(),
    getActiveWatchlists: vi.fn().mockReturnValue([]),
    listCollectors: vi.fn().mockReturnValue([]),
  };
}

function mockHub(): Partial<WsHub> {
  return {
    broadcast: vi.fn(),
  };
}

describe('Scheduler', () => {
  it('runs a collector and stores items', async () => {
    const db = mockDb();
    const hub = mockHub();
    const scheduler = new Scheduler(db as Database, hub as WsHub);

    const mockCollector: Collector = {
      id: 'test-col',
      type: 'rss',
      collect: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          source_type: 'news',
          source_name: 'test',
          title: 'Test',
          content: 'Content',
          url: 'https://example.com',
          author: null,
          published_at: new Date().toISOString(),
          collected_at: new Date().toISOString(),
          severity: 'info',
          sentiment: 0,
          tags: [],
          geo: null,
          raw_data: '{}',
        },
      ]),
    };

    await scheduler.runCollector(mockCollector);
    expect(db.insertItem).toHaveBeenCalledTimes(1);
    expect(hub.broadcast).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'new_item' })
    );
  });

  it('applies sentiment and watchlist matching to collected items', async () => {
    const db = mockDb();
    (db.getActiveWatchlists as any).mockReturnValue([
      { id: 'wl-1', name: 'Test', keywords: ['content'], sources: ['all'], severity_override: 'high', active: true },
    ]);
    const hub = mockHub();
    const scheduler = new Scheduler(db as Database, hub as WsHub);

    const mockCollector: Collector = {
      id: 'test-col',
      type: 'rss',
      collect: vi.fn().mockResolvedValue([
        {
          id: 'item-1',
          source_type: 'news',
          source_name: 'test',
          title: 'Test',
          content: 'Content to match',
          url: 'https://example.com',
          author: null,
          published_at: new Date().toISOString(),
          collected_at: new Date().toISOString(),
          severity: 'info',
          sentiment: 0,
          tags: [],
          geo: null,
          raw_data: '{}',
        },
      ]),
    };

    await scheduler.runCollector(mockCollector);
    const insertedItem = (db.insertItem as any).mock.calls[0][0];
    expect(insertedItem.severity).toBe('high');
    expect(insertedItem.tags).toContain('content');
  });
});
