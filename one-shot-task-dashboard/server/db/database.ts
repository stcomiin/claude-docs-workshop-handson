import BetterSqlite3 from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { IntelItem, Watchlist, CollectorConfig, DashboardStats } from '../../src/lib/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface ListItemsOptions {
  limit: number;
  offset: number;
  source_type?: string;
  severity?: string;
}

export class Database {
  private db: BetterSqlite3.Database;

  constructor(dbPath: string) {
    this.db = new BetterSqlite3(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.init();
  }

  private init() {
    const schemaPath = this.resolveSchemaPath();
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    this.db.exec(schema);
  }

  private resolveSchemaPath(): string {
    const candidates = [
      path.join(__dirname, 'schema.sql'),
      path.join(process.cwd(), 'server', 'db', 'schema.sql'),
      path.join(__dirname, '..', '..', 'server', 'db', 'schema.sql'),
    ];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate)) return candidate;
    }
    return candidates[0];
  }

  close() {
    this.db.close();
  }

  insertItem(item: IntelItem) {
    const stmt = this.db.prepare(`
      INSERT INTO intel_items (id, source_type, source_name, title, content, url, author, published_at, collected_at, severity, sentiment, tags, geo, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      item.id, item.source_type, item.source_name, item.title, item.content,
      item.url, item.author, item.published_at, item.collected_at, item.severity,
      item.sentiment, JSON.stringify(item.tags), item.geo ? JSON.stringify(item.geo) : null,
      item.raw_data
    );
  }

  getItem(id: string): IntelItem | null {
    const row = this.db.prepare('SELECT * FROM intel_items WHERE id = ?').get(id) as any;
    return row ? this.rowToItem(row) : null;
  }

  listItems(opts: ListItemsOptions): { items: IntelItem[]; total: number } {
    const conditions: string[] = [];
    const params: any[] = [];

    if (opts.source_type) {
      conditions.push('source_type = ?');
      params.push(opts.source_type);
    }
    if (opts.severity) {
      conditions.push('severity = ?');
      params.push(opts.severity);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const total = (this.db.prepare(`SELECT COUNT(*) as count FROM intel_items ${where}`).get(...params) as any).count;
    const rows = this.db.prepare(`SELECT * FROM intel_items ${where} ORDER BY collected_at DESC LIMIT ? OFFSET ?`).all(...params, opts.limit, opts.offset) as any[];

    return { items: rows.map(r => this.rowToItem(r)), total };
  }

  searchItems(query: string): IntelItem[] {
    const rows = this.db.prepare(`
      SELECT i.* FROM intel_items i
      JOIN intel_items_fts fts ON i.rowid = fts.rowid
      WHERE intel_items_fts MATCH ?
      ORDER BY rank
      LIMIT 100
    `).all(query) as any[];
    return rows.map(r => this.rowToItem(r));
  }

  createWatchlist(wl: Watchlist) {
    this.db.prepare(`
      INSERT INTO watchlists (id, name, keywords, sources, severity_override, active)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(wl.id, wl.name, JSON.stringify(wl.keywords), JSON.stringify(wl.sources), wl.severity_override, wl.active ? 1 : 0);
  }

  getWatchlist(id: string): Watchlist | null {
    const row = this.db.prepare('SELECT * FROM watchlists WHERE id = ?').get(id) as any;
    return row ? this.rowToWatchlist(row) : null;
  }

  listWatchlists(): Watchlist[] {
    const rows = this.db.prepare('SELECT * FROM watchlists ORDER BY name').all() as any[];
    return rows.map(r => this.rowToWatchlist(r));
  }

  updateWatchlist(id: string, updates: Partial<Omit<Watchlist, 'id'>>) {
    const current = this.getWatchlist(id);
    if (!current) return;
    const merged = { ...current, ...updates };
    this.db.prepare(`
      UPDATE watchlists SET name = ?, keywords = ?, sources = ?, severity_override = ?, active = ? WHERE id = ?
    `).run(merged.name, JSON.stringify(merged.keywords), JSON.stringify(merged.sources), merged.severity_override, merged.active ? 1 : 0, id);
  }

  deleteWatchlist(id: string) {
    this.db.prepare('DELETE FROM watchlists WHERE id = ?').run(id);
  }

  createCollector(col: CollectorConfig) {
    this.db.prepare(`
      INSERT INTO collectors (id, type, name, enabled, interval_seconds, config)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(col.id, col.type, col.name, col.enabled ? 1 : 0, col.interval_seconds, JSON.stringify(col.config));
  }

  getCollector(id: string): CollectorConfig | null {
    const row = this.db.prepare('SELECT * FROM collectors WHERE id = ?').get(id) as any;
    return row ? this.rowToCollector(row) : null;
  }

  listCollectors(opts?: { enabledOnly?: boolean }): CollectorConfig[] {
    const where = opts?.enabledOnly ? 'WHERE enabled = 1' : '';
    const rows = this.db.prepare(`SELECT * FROM collectors ${where} ORDER BY name`).all() as any[];
    return rows.map(r => this.rowToCollector(r));
  }

  updateCollector(id: string, updates: Partial<Omit<CollectorConfig, 'id'>>) {
    const current = this.getCollector(id);
    if (!current) return;
    const merged = { ...current, ...updates };
    this.db.prepare(`
      UPDATE collectors SET type = ?, name = ?, enabled = ?, interval_seconds = ?, config = ? WHERE id = ?
    `).run(merged.type, merged.name, merged.enabled ? 1 : 0, merged.interval_seconds, JSON.stringify(merged.config), id);
  }

  deleteCollector(id: string) {
    this.db.prepare('DELETE FROM collectors WHERE id = ?').run(id);
  }

  getStats(): DashboardStats {
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM intel_items').get() as any).count;
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const last24h = (this.db.prepare('SELECT COUNT(*) as count FROM intel_items WHERE collected_at >= ?').get(oneDayAgo) as any).count;

    const severityRows = this.db.prepare('SELECT severity, COUNT(*) as count FROM intel_items GROUP BY severity').all() as any[];
    const severity_counts: Record<string, number> = {};
    for (const r of severityRows) severity_counts[r.severity] = r.count;

    const sourceRows = this.db.prepare('SELECT source_type, COUNT(*) as count FROM intel_items GROUP BY source_type').all() as any[];
    const source_counts: Record<string, number> = {};
    for (const r of sourceRows) source_counts[r.source_type] = r.count;

    const tagRows = this.db.prepare(`SELECT tags FROM intel_items WHERE collected_at >= ?`).all(oneDayAgo) as any[];
    const tagCounts: Record<string, number> = {};
    for (const r of tagRows) {
      const tags: string[] = JSON.parse(r.tags);
      for (const t of tags) tagCounts[t] = (tagCounts[t] || 0) + 1;
    }
    const trending_keywords = Object.entries(tagCounts)
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    const hourlyRows = this.db.prepare(`
      SELECT collected_at FROM intel_items WHERE collected_at >= ?
    `).all(oneDayAgo) as any[];
    const hourlyMap: Record<string, number> = {};
    for (const r of hourlyRows) {
      const d = new Date(r.collected_at);
      const key = `${d.getDay()}-${d.getHours()}`;
      hourlyMap[key] = (hourlyMap[key] || 0) + 1;
    }
    const hourly_activity = Object.entries(hourlyMap).map(([key, count]) => {
      const [day, hour] = key.split('-').map(Number);
      return { hour, day, count };
    });

    return { total_items: total, items_last_24h: last24h, severity_counts, source_counts, trending_keywords, hourly_activity };
  }

  getActiveWatchlists(): Watchlist[] {
    const rows = this.db.prepare('SELECT * FROM watchlists WHERE active = 1').all() as any[];
    return rows.map(r => this.rowToWatchlist(r));
  }

  private rowToItem(row: any): IntelItem {
    return {
      ...row,
      tags: JSON.parse(row.tags),
      geo: row.geo ? JSON.parse(row.geo) : null,
    };
  }

  private rowToWatchlist(row: any): Watchlist {
    return {
      ...row,
      keywords: JSON.parse(row.keywords),
      sources: JSON.parse(row.sources),
      active: row.active === 1,
    };
  }

  private rowToCollector(row: any): CollectorConfig {
    return {
      ...row,
      enabled: row.enabled === 1,
      config: JSON.parse(row.config),
    };
  }
}
