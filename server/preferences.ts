import { Router, Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import pool from './db';
import { requireAuth } from './auth.routes';

const router = Router();

/* --------- Preferences CRUD --------- */

// Create or Update
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const { zipcode, school, safety_level, hospital_proximity, recreation_proximity } = req.body;

    if (!zipcode || !school || !safety_level || !hospital_proximity || !recreation_proximity) {
      res.status(400).json({ msg: 'All fields are required' });
      return;
    }

    await pool.query(
      `INSERT INTO preferences (user_id, zipcode, school, safety_level, hospital_proximity, recreation_proximity)
       VALUES (?,?,?,?,?,?)
       ON DUPLICATE KEY UPDATE
         zipcode=VALUES(zipcode),
         school=VALUES(school),
         safety_level=VALUES(safety_level),
         hospital_proximity=VALUES(hospital_proximity),
         recreation_proximity=VALUES(recreation_proximity)`,
      [
        req.user!.uid,
        zipcode,
        school,
        safety_level,
        hospital_proximity,
        recreation_proximity
      ]
    );

    res.sendStatus(200);
  })
);

// Read
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    const [rows] = (await pool.query(
      'SELECT zipcode, school, safety_level, hospital_proximity, recreation_proximity FROM preferences WHERE user_id=?',
      [req.user!.uid]
    )) as any;

    if (!rows.length) {
      res.status(404).json({ msg: 'No preferences found' });
      return;
    }

    res.status(200).json(rows[0]);
  })
);

// Delete
router.delete(
  '/',
  requireAuth,
  asyncHandler(async (req: Request, res: Response) => {
    await pool.query('DELETE FROM preferences WHERE user_id=?', [req.user!.uid]);
    res.sendStatus(204);
  })
);

export default router;
