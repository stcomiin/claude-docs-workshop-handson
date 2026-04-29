import { Router } from 'express';
import type { Database } from '../db/database.js';

export function createStatsRouter(db: Database): Router {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json(db.getStats());
  });

  return router;
}
