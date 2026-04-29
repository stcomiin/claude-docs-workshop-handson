import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { Database } from '../db/database.js';

export function createWatchlistsRouter(db: Database): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(db.listWatchlists());
  });

  router.post('/', (req, res) => {
    const wl = { id: uuidv4(), ...req.body, active: true };
    db.createWatchlist(wl);
    res.status(201).json(wl);
  });

  router.put('/:id', (req, res) => {
    db.updateWatchlist(req.params.id, req.body);
    const updated = db.getWatchlist(req.params.id);
    res.json(updated);
  });

  router.delete('/:id', (req, res) => {
    db.deleteWatchlist(req.params.id);
    res.status(204).end();
  });

  return router;
}
