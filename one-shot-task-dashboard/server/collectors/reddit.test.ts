import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RedditCollector } from './reddit.js';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('RedditCollector', () => {
  let collector: RedditCollector;

  beforeEach(() => {
    collector = new RedditCollector({
      id: 'reddit-test',
      name: 'Reddit Netsec',
      config: { subreddits: ['netsec'] },
    });
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          children: [
            {
              data: {
                id: 'abc123',
                title: 'New vulnerability in OpenSSL',
                selftext: 'Details about the vulnerability...',
                url: 'https://reddit.com/r/netsec/abc123',
                author: 'securityresearcher',
                created_utc: 1713600000,
                score: 150,
                permalink: '/r/netsec/comments/abc123',
              },
            },
          ],
        },
      }),
    });
  });

  it('fetches and normalizes Reddit posts', async () => {
    const items = await collector.collect();
    expect(items).toHaveLength(1);
    expect(items[0].source_type).toBe('social');
    expect(items[0].source_name).toBe('Reddit Netsec');
    expect(items[0].title).toBe('New vulnerability in OpenSSL');
  });

  it('sets default severity to low for social items', async () => {
    const items = await collector.collect();
    expect(items[0].severity).toBe('low');
  });

  it('calls correct Reddit URL', async () => {
    await collector.collect();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://www.reddit.com/r/netsec/new.json?limit=25',
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });
});
