import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Database } from './db/database.js';
import { WsHub } from './ws/hub.js';
import { Scheduler } from './services/scheduler.js';
import { RssCollector } from './collectors/rss.js';
import { RedditCollector } from './collectors/reddit.js';
import { CveCollector } from './collectors/cve.js';
import { normalizeWebhookPayload } from './collectors/webhook.js';
import { createItemsRouter } from './routes/items.js';
import { createWatchlistsRouter } from './routes/watchlists.js';
import { createCollectorsRouter } from './routes/collectors.js';
import { createStatsRouter } from './routes/stats.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '3001');

const db = new Database(path.join(__dirname, '..', 'data', 'osint.db'));
const wsHub = new WsHub();
const scheduler = new Scheduler(db, wsHub);

const app = express();
app.use(express.json());

app.use('/api/items', createItemsRouter(db));
app.use('/api/watchlists', createWatchlistsRouter(db));
app.use('/api/collectors', createCollectorsRouter(db));
app.use('/api/stats', createStatsRouter(db));

app.post('/api/webhook', (req, res) => {
  const item = normalizeWebhookPayload(req.body);
  db.insertItem(item);
  wsHub.broadcast({ type: 'new_item', data: item });
  res.status(201).json(item);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  wsHub.addClient(ws);
  ws.on('close', () => wsHub.removeClient(ws));
});

function initCollectors() {
  const collectors = db.listCollectors({ enabledOnly: true });
  const collectorMap: Record<string, (c: any) => any> = {
    rss: (c) => new RssCollector({ id: c.id, name: c.name, config: c.config }),
    reddit: (c) => new RedditCollector({ id: c.id, name: c.name, config: c.config }),
    cve: (c) => new CveCollector({ id: c.id, name: c.name, config: c.config }),
  };

  for (const col of collectors) {
    const factory = collectorMap[col.type];
    if (factory) {
      const instance = factory(col);
      scheduler.schedule(instance, col.interval_seconds);
      scheduler.runCollector(instance).catch(() => {});
    }
  }
}

server.listen(PORT, () => {
  console.log(`OSINT Dashboard API running on http://localhost:${PORT}`);
  initCollectors();
});
