import Parser from 'rss-parser';
import { v4 as uuidv4 } from 'uuid';
import type { IntelItem } from '../../src/lib/types.js';
import type { Collector, CollectorConstructorOpts } from './base.js';

export class RssCollector implements Collector {
  id: string;
  type = 'rss';
  private name: string;
  private urls: string[];
  private parser: Parser;

  constructor(opts: CollectorConstructorOpts) {
    this.id = opts.id;
    this.name = opts.name;
    this.urls = (opts.config.urls as string[]) || [];
    this.parser = new Parser();
  }

  async collect(): Promise<IntelItem[]> {
    const items: IntelItem[] = [];
    for (const url of this.urls) {
      const feed = await this.parser.parseURL(url);
      for (const entry of feed.items) {
        items.push({
          id: uuidv4(),
          source_type: 'news',
          source_name: this.name,
          title: entry.title || 'Untitled',
          content: entry.contentSnippet || entry.content || '',
          url: entry.link || '',
          author: entry.creator || entry.author || null,
          published_at: entry.isoDate || new Date().toISOString(),
          collected_at: new Date().toISOString(),
          severity: 'info',
          sentiment: 0,
          tags: [],
          geo: null,
          raw_data: JSON.stringify(entry),
        });
      }
    }
    return items;
  }
}
