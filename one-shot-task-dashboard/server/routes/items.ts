import { Router } from 'express';
import type { Database } from '../db/database.js';

export function createItemsRouter(db: Database): Router {
  const router = Router();

  router.get('/', (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const source_type = req.query.source_type as string | undefined;
    const severity = req.query.severity as string | undefined;
    const result = db.listItems({ limit, offset, source_type, severity });
    res.json(result);
  });

  router.get('/search', (req, res) => {
    const q = req.query.q as string;
    if (!q) return res.json([]);
    const results = db.searchItems(q);
    res.json(results);
  });

  router.get('/:id', (req, res) => {
    const item = db.getItem(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  });

  return router;
}
