import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '../db/database.js';

export function createCollectorsRouter(db: Database): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(db.listCollectors());
  });

  router.post('/', (req, res) => {
    const col = { id: uuidv4(), ...req.body, enabled: true };
    db.createCollector(col);
    res.status(201).json(col);
  });

  router.put('/:id', (req, res) => {
    db.updateCollector(req.params.id, req.body);
    const updated = db.getCollector(req.params.id);
    res.json(updated);
  });

  router.delete('/:id', (req, res) => {
    db.deleteCollector(req.params.id);
    res.status(204).end();
  });

  router.post('/:id/test', (req, res) => {
    const col = db.getCollector(req.params.id);
    if (!col) return res.status(404).json({ error: 'Not found' });
    res.json({ status: 'ok', message: `Collector ${col.name} config is valid` });
  });

  return router;
}
