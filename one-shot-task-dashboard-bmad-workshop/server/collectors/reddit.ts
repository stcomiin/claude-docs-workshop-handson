import { v4 as uuidv4 } from 'uuid';
import type { IntelItem } from '../../src/lib/types.js';
import type { Collector, CollectorConstructorOpts } from './base.js';

export class RedditCollector implements Collector {
  id: string;
  type = 'reddit';
  private name: string;
  private subreddits: string[];

  constructor(opts: CollectorConstructorOpts) {
    this.id = opts.id;
    this.name = opts.name;
    this.subreddits = (opts.config.subreddits as string[]) || [];
  }

  async collect(): Promise<IntelItem[]> {
    const items: IntelItem[] = [];
    for (const sub of this.subreddits) {
      const res = await fetch(`https://www.reddit.com/r/${sub}/new.json?limit=25`, {
        headers: { 'User-Agent': 'OSINTDashboard/1.0' },
      });
      if (!res.ok) continue;
      const data = await res.json();
      for (const child of data.data.children) {
        const post = child.data;
        items.push({
          id: uuidv4(),
          source_type: 'social',
          source_name: this.name,
          title: post.title,
          content: post.selftext || '',
          url: `https://reddit.com${post.permalink}`,
          author: post.author || null,
          published_at: new Date(post.created_utc * 1000).toISOString(),
          collected_at: new Date().toISOString(),
          severity: 'low',
          sentiment: 0,
          tags: [],
          geo: null,
          raw_data: JSON.stringify(post),
        });
      }
    }
    return items;
  }
}
