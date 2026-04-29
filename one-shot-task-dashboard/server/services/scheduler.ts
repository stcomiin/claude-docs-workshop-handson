import cron from 'node-cron';
import type { Database } from '../db/database.js';
import type { WsHub } from '../ws/hub.js';
import type { Collector } from '../collectors/base.js';
import { analyzeSentiment } from './sentiment.js';
import { matchWatchlists } from './matcher.js';
import type { IntelItem } from '../../src/lib/types.js';

export class Scheduler {
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  constructor(
    private db: Database,
    private wsHub: WsHub
  ) {}

  async runCollector(collector: Collector) {
    const items = await collector.collect();
    const watchlists = this.db.getActiveWatchlists();

    for (const item of items) {
      item.sentiment = analyzeSentiment(`${item.title} ${item.content}`);
      const match = matchWatchlists(item, watchlists);
      item.tags = match.tags;
      item.severity = match.severity;

      this.db.insertItem(item);
      this.wsHub.broadcast({ type: 'new_item', data: item });
    }
  }

  schedule(collector: Collector, intervalSeconds: number) {
    const cronExpr = intervalSeconds < 60
      ? `*/${intervalSeconds} * * * * *`
      : `*/${Math.ceil(intervalSeconds / 60)} * * * *`;

    const task = cron.schedule(cronExpr, () => {
      this.runCollector(collector).catch(err => {
        console.error(`Collector ${collector.id} failed:`, err.message);
      });
    });

    this.jobs.set(collector.id, task);
  }

  stop(collectorId: string) {
    const job = this.jobs.get(collectorId);
    if (job) {
      job.stop();
      this.jobs.delete(collectorId);
    }
  }

  stopAll() {
    for (const [id, job] of this.jobs) {
      job.stop();
    }
    this.jobs.clear();
  }
}
