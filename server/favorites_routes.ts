import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { requireAuth } from './auth.routes';
import pool from './db';

const router = Router();

// POST /api/favorites → Add a favorite
router.post(
  '/favorites',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { neighborhoodName, zipcode } = req.body;

    if (!neighborhoodName || !zipcode) {
      res.status(400).json({ message: 'Neighborhood name and zipcode are required' });
      return;
    }

    await pool.query(
      `INSERT IGNORE INTO favorites (user_id, neighborhood_name, zipcode) VALUES (?, ?, ?)`,
      [req.user!.uid, neighborhoodName, zipcode]
    );

    res.status(200).json({ message: 'Favorite added' });
  })
);

// GET /api/favorites → Fetch all favorites for the logged-in user
router.get(
  '/favorites',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const [favorites]: any = await pool.query(
      `SELECT neighborhood_name, zipcode FROM favorites WHERE user_id = ?`,
      [req.user!.uid]
    );

    res.status(200).json(favorites);
  })
);

export default router;
// DELETE /api/favorites → Remove a favorite
router.delete(
    '/favorites',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
      const { neighborhoodName, zipcode } = req.body;
  
      if (!neighborhoodName || !zipcode) {
        res.status(400).json({ message: 'Neighborhood name and zipcode are required' });
        return;
      }
  
      await pool.query(
        `DELETE FROM favorites WHERE user_id = ? AND neighborhood_name = ? AND zipcode = ?`,
        [req.user!.uid, neighborhoodName, zipcode]
      );
  
      res.status(200).json({ message: 'Favorite removed' });
    })
  );
  