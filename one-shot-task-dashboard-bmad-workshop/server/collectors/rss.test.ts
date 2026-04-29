import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RssCollector } from './rss.js';

vi.mock('rss-parser', () => {
  return {
    default: class MockParser {
      async parseURL(url: string) {
        return {
          items: [
            {
              title: 'Test RSS Article',
              link: 'https://example.com/article-1',
              contentSnippet: 'This is the content of the first article.',
              creator: 'John Doe',
              isoDate: '2026-04-20T12:00:00Z',
            },
            {
              title: 'Second Article',
              link: 'https://example.com/article-2',
              contentSnippet: 'Content of article two.',
              creator: null,
              isoDate: '2026-04-20T13:00:00Z',
            },
          ],
        };
      }
    },
  };
});

describe('RssCollector', () => {
  let collector: RssCollector;

  beforeEach(() => {
    collector = new RssCollector({
      id: 'rss-test',
      name: 'Test Feed',
      config: { urls: ['https://example.com/feed.xml'] },
    });
  });

  it('returns normalized IntelItems from RSS feed', async () => {
    const items = await collector.collect();
    expect(items).toHaveLength(2);
    expect(items[0].source_type).toBe('news');
    expect(items[0].source_name).toBe('Test Feed');
    expect(items[0].title).toBe('Test RSS Article');
    expect(items[0].url).toBe('https://example.com/article-1');
    expect(items[0].author).toBe('John Doe');
  });

  it('sets correct default severity for news items', async () => {
    const items = await collector.collect();
    expect(items[0].severity).toBe('info');
  });

  it('generates unique IDs for each item', async () => {
    const items = await collector.collect();
    expect(items[0].id).not.toBe(items[1].id);
  });

  it('handles null author gracefully', async () => {
    const items = await collector.collect();
    expect(items[1].author).toBeNull();
  });
});
