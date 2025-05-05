import {
  Router,
  Request,
  Response,
  NextFunction,
  CookieOptions
} from 'express';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import pool from './db';  // mysql2/promise pool

const { JWT_SECRET = '' } = process.env;
if (!JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');

const cookieOpts: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

declare global {
  namespace Express {
    interface Request {
      user?: { uid: string };
    }
  }
}

const router = Router();

/* --------- REGISTER --------- */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ msg: 'Email & password required' });
      return;
    }

    const [dup] = (await pool.query(
      'SELECT 1 FROM users WHERE email=? LIMIT 1',
      [email]
    )) as any;
    if (dup.length) {
      res.status(409).json({ msg: 'Email already registered' });
      return;
    }

    const userId = randomUUID();
    const hash   = await bcrypt.hash(password, 12);
    await pool.query(
      `INSERT INTO users
         (user_id,email,password_hash,creation_date)
       VALUES (?,?,?,CURDATE())`,
      [userId, email, hash]
    );

    res.sendStatus(201);
  })
);

/* --------- LOGIN --------- */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) {
      res.status(400).json({ msg: 'Email & password required' });
      return;
    }

    const [rows] = (await pool.query(
      'SELECT user_id,password_hash FROM users WHERE email=?',
      [email]
    )) as any;

    if (!rows.length) {
      res.status(401).json({ msg: 'Invalid credentials' });
      return;
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ msg: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ uid: user.user_id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('dwellx_token', token, cookieOpts).sendStatus(200);
  })
);

/* --------- DELETE ACCOUNT --------- */
router.delete(
  '/delete',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.dwellx_token;
    if (!token) return next(new Error('Unauthenticated'));

    let payload: { uid: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return next(new Error('Unauthenticated'));
    }

    await pool.query('DELETE FROM users WHERE user_id=?', [payload.uid]);
    res.clearCookie('dwellx_token').sendStatus(204);
  })
);

/* --------- AUTH GUARD --------- */
export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.dwellx_token;
    if (!token) return next(new Error('Unauthenticated'));

    try {
      req.user = jwt.verify(token, JWT_SECRET) as { uid: string };
      return next();
    } catch {
      return next(new Error('Unauthenticated'));
    }
  }
);

export default router;
