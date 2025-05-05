import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { requireAuth } from './auth.routes';
import pool from './db';
import { getHousesByPreferences } from './housing';
import { fetchRecommendedHousing } from './transaction'

const router = Router();

router.get(
  '/houses/match',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const [prefs] = (await pool.query(
      `SELECT zipcode, school, safety_level, hospital_proximity, recreation_proximity 
       FROM preferences WHERE user_id = ?`,
      [req.user!.uid]
    )) as any;

    if (!prefs.length) {
      res.status(404).json({ message: 'No preferences found' });
      return;
    }

    const preferences = prefs[0];

    // Call the stored procedure now
    const houses = await getHousesByPreferences(preferences);

    res.status(200).json(houses);
  })
);

router.get(
  '/houses/popular',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    try {
      const popularHouses = await fetchRecommendedHousing();
      res.status(200).json(popularHouses);
    } catch (error) {
      console.error('Error fetching popular houses:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  })
);

export default router;